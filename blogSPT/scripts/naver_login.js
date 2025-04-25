/* naver_login.js - 네이버 로그인 연동 */

// 네이버 로그인 관련 설정
const NAVER_CLIENT_ID = 'YOUR_NAVER_CLIENT_ID'; // 실제 서비스시 네이버 개발자 센터에서 발급받은 ID로 변경 필요
const NAVER_REDIRECT_URI = encodeURIComponent(chrome.identity.getRedirectURL());
const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${NAVER_CLIENT_ID}&redirect_uri=${NAVER_REDIRECT_URI}&state=${generateState()}`;

// 상태 토큰 생성 (CSRF 방지)
function generateState() {
  return Math.random().toString(36).substring(2, 15);
}

// 네이버 로그인 프로세스 시작
function startNaverLogin() {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: NAVER_AUTH_URL,
        interactive: true
      },
      function(redirectUrl) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        
        // 리다이렉트 URL에서 액세스 토큰 추출
        const accessToken = extractAccessToken(redirectUrl);
        if (accessToken) {
          // 네이버 프로필 정보 가져오기
          getNaverUserProfile(accessToken)
            .then(profileData => resolve(profileData))
            .catch(error => reject(error));
        } else {
          reject(new Error('액세스 토큰을 가져오는데 실패했습니다.'));
        }
      }
    );
  });
}

// URL에서 액세스 토큰 추출
function extractAccessToken(redirectUrl) {
  if (!redirectUrl) return null;
  
  const hashFragment = redirectUrl.split('#')[1];
  if (!hashFragment) return null;
  
  const params = new URLSearchParams(hashFragment);
  return params.get('access_token');
}

// 네이버 사용자 프로필 정보 가져오기
function getNaverUserProfile(accessToken) {
  return new Promise((resolve, reject) => {
    fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('프로필 정보를 가져오는데 실패했습니다.');
      }
      return response.json();
    })
    .then(data => {
      if (data.resultcode === '00' && data.message === 'success') {
        const userProfile = {
          id: data.response.id,
          name: data.response.name,
          nickname: data.response.nickname || data.response.name,
          email: data.response.email,
          profileImage: data.response.profile_image,
          isNaverUser: true,
          accessToken: accessToken
        };
        resolve(userProfile);
      } else {
        reject(new Error(data.message || '프로필 정보를 가져오는데 실패했습니다.'));
      }
    })
    .catch(error => reject(error));
  });
}

// 네이버 로그인 상태 확인
function checkNaverLoginStatus() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['naverUserData'], function(result) {
      if (result.naverUserData && result.naverUserData.isNaverUser && result.naverUserData.accessToken) {
        // 액세스 토큰으로 사용자 프로필 재확인
        getNaverUserProfile(result.naverUserData.accessToken)
          .then(profileData => resolve(profileData))
          .catch(error => {
            // 토큰이 만료되었거나 오류 발생, 저장된 프로필 사용
            if (result.naverUserData.id) {
              resolve(result.naverUserData);
            } else {
              reject(error);
            }
          });
      } else {
        reject(new Error('네이버 로그인 정보가 없습니다.'));
      }
    });
  });
}

// 네이버 로그아웃
function naverLogout() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['naverUserData'], function() {
      resolve();
    });
  });
}

// 외부에서 사용할 수 있도록 export
window.naverLogin = {
  startLogin: startNaverLogin,
  checkLoginStatus: checkNaverLoginStatus,
  logout: naverLogout
};
