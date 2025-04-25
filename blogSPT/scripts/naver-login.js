// 네이버 로그인 관련 기능

// 네이버 로그인 정보 (실제 서비스에서는 환경변수로 관리해야 함)
const NAVER_CLIENT_ID = 'your_naver_client_id';
const NAVER_CALLBACK_URL = chrome.runtime.getURL('naver_callback.html');
const NAVER_LOGIN_STATE = 'blogSPT_naver_login';

// 네이버 로그인 URL 생성
function generateNaverLoginUrl() {
  const state = encodeURIComponent(NAVER_LOGIN_STATE);
  return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_CALLBACK_URL)}&state=${state}`;
}

// 네이버 로그인 팝업 열기
function openNaverLoginPopup() {
  const loginUrl = generateNaverLoginUrl();
  window.open(loginUrl, 'naverLogin', 'width=500,height=700');
}

// 네이버 프로필 정보 가져오기 (실제로는 서버를 통해 처리해야 함)
function getNaverProfile(accessToken) {
  return new Promise((resolve, reject) => {
    // 시연용으로 가상의 네이버 프로필 반환
    // 실제로는 네이버 API를 호출해야 함
    const fakeNaverProfiles = [
      { id: 'naver_12345', nickname: '네이버유저', email: 'user@naver.com', profile_image: '' },
      { id: 'naver_67890', nickname: '블로그꿈나무', email: 'blogger@naver.com', profile_image: '' },
      { id: 'naver_54321', nickname: '체험단리뷰어', email: 'reviewer@naver.com', profile_image: '' }
    ];
    
    // 랜덤 프로필 선택 (데모용)
    const randomProfile = fakeNaverProfiles[Math.floor(Math.random() * fakeNaverProfiles.length)];
    resolve(randomProfile);
  });
}

// 네이버 사용자 정보로 로그인 처리
function loginWithNaverProfile(naverProfile) {
  const userData = {
    id: naverProfile.id,
    name: naverProfile.nickname,
    email: naverProfile.email,
    profileImage: naverProfile.profile_image,
    isLoggedIn: true,
    autoLogin: true,
    loginType: 'naver'
  };

  // 로그인 정보 저장
  chrome.storage.local.set({ userData: userData }, function() {
    console.log('네이버 로그인 성공');
    // 로그인 성공 UI 표시
    showLoggedInUI(userData);
  });
}

// 네이버 로그인 처리 (액세스 토큰을 받았을 때)
function handleNaverLogin(accessToken) {
  getNaverProfile(accessToken)
    .then(profile => {
      loginWithNaverProfile(profile);
    })
    .catch(error => {
      console.error('네이버 프로필 조회 실패:', error);
      alert('네이버 로그인에 실패했습니다.');
    });
}

// 네이버 콜백 처리 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'NAVER_LOGIN_SUCCESS' && request.accessToken) {
    handleNaverLogin(request.accessToken);
    sendResponse({ success: true });
    return true;
  }
});

// 시연용 함수 - 실제 네이버 로그인 없이 테스트
function demoNaverLogin() {
  // 랜덤 네이버 프로필 가져오기
  getNaverProfile()
    .then(profile => {
      loginWithNaverProfile(profile);
    })
    .catch(error => {
      console.error('네이버 프로필 조회 실패:', error);
      alert('네이버 로그인에 실패했습니다.');
    });
}
