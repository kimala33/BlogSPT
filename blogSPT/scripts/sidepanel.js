/* sidepanel.js – 기존 함수 + Settings 연동 */

document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  initializeBanner();
  initializeLogin();
  initializeSearch();
  initializeCalendar();
  initializeLogoutButton();
  // initializeSettings(); → 별도 settings.js 로 이동
  checkLoginStatus();
});

function initializeNavigation() {
  const sidebarIcons = document.querySelectorAll('.sidebar-icon');
  const pages = document.querySelectorAll('.page');

  sidebarIcons.forEach((icon) => {
    icon.addEventListener('click', (e) => {
      e.preventDefault();

      // 모든 아이콘/페이지 비활성화
      sidebarIcons.forEach((ic) => ic.classList.remove('active'));
      pages.forEach((pg) => pg.classList.remove('active'));

      // 이번 아이콘/페이지 활성화
      icon.classList.add('active');
      const targetId = icon.getAttribute('href').substring(1);
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// 로그아웃 버튼 초기화
function initializeLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      logoutUser();
    });
  }
}

function initializeBanner() {
    const bannerAd = document.getElementById('bannerAd');
    if (!bannerAd) return;

    // Load banner settings from storage
    chrome.storage.local.get(['bannerConfig'], function(result) {
        if (result.bannerConfig) {
            updateBannerUI(result.bannerConfig);
        }
    });

    // Add click handler
    bannerAd.addEventListener('click', handleBannerClick);
}

function updateBannerUI(config) {
    if (!config) return;

    const textElement = document.getElementById('bannerAdText');
    const dateElement = document.getElementById('bannerAdDate');

    if (textElement && config.text) {
        textElement.textContent = config.text;
    }
    if (dateElement && config.date) {
        dateElement.textContent = config.date;
    }
}

function handleBannerClick() {
    chrome.storage.local.get(['bannerConfig'], function(result) {
        if (result.bannerConfig && result.bannerConfig.url) {
            window.open(result.bannerConfig.url, '_blank');
        }
    });
}

// Mock data for development - Remove in production
const mockCampaigns = [
    { name: "신역사", date: "2025-04-11" },
    { name: "코우부스콜", date: "2025-04-11" },
    { name: "모두의연구소", date: "2025-04-11" },
    { name: "신용회복위원회", date: "2025-04-11" }
];

async function initializeStats() {
    try {
        // TODO: Fetch actual stats from storage/backend
        const stats = {
            activeCampaigns: 0,
            pendingAnnouncements: 0
        };

        // Update UI
        document.querySelectorAll('.stat-number').forEach((stat, index) => {
            stat.textContent = index === 0 ? stats.activeCampaigns : stats.pendingAnnouncements;
        });
    } catch (error) {
        console.error('Failed to initialize stats:', error);
    }
}

// Chrome extension message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'UPDATE_STATS') {
        initializeStats();
    }
    return true;
});

// 관리자 상태 확인
async function checkAdminStatus() {
    try {
        const userStatus = await chrome.storage.local.get('userStatus');
        const adminMenu = document.querySelector('.admin-only');
        
        if (userStatus.userStatus === 'admin') {
            adminMenu.style.display = 'block';
        } else {
            adminMenu.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to check admin status:', error);
    }
}

// 테스트 사용자 정보
const TEST_USER = {
    id: 'test@test.com',
    password: '1234',
    name: '테스트 사용자'
};

function loginUser(userId, userPassword, autoLogin) {
    // 테스트 로그인 검증
    if (userId === TEST_USER.id && userPassword === TEST_USER.password) {
        // 로그인 성공 처리
        const userData = {
            id: TEST_USER.id,
            name: TEST_USER.name,
            isLoggedIn: true,
            autoLogin: autoLogin
        };

        // 로그인 정보 저장
        chrome.storage.local.set({ userData: userData }, function() {
            console.log('로그인 성공');
            showLoggedInUI(userData);
        });
        
        return true;
    } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        return false;
    }
}

function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    // 자동 로그인 확인
    chrome.storage.local.get(['userData', 'naverUserData'], function(result) {
        if (result.userData && result.userData.id) {
            // 저장된 아이디 표시
            const userIdField = document.getElementById('userId');
            if (userIdField) {
                userIdField.value = result.userData.id;
            }
            
            // 저장된 자동 로그인 상태 체크
            const autoLoginCheckbox = document.getElementById('autoLogin');
            if (autoLoginCheckbox && result.userData.autoLogin) {
                autoLoginCheckbox.checked = true;
            }
        }
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value;
        const userPassword = document.getElementById('userPassword').value;
        const autoLogin = document.getElementById('autoLogin').checked;

        loginUser(userId, userPassword, autoLogin);
    });

    // 아이디/비밀번호 찾기 및 회원가입 링크 이벤트
    document.getElementById('findId').addEventListener('click', function(e) {
        e.preventDefault();
        alert('아이디 찾기 기능은 현재 개발 중입니다.');
    });

    document.getElementById('findPassword').addEventListener('click', function(e) {
        e.preventDefault();
        alert('비밀번호 찾기 기능은 현재 개발 중입니다.');
    });

    document.getElementById('register').addEventListener('click', function(e) {
        e.preventDefault();
        alert('회원가입 기능은 현재 개발 중입니다.');
    });

    // 네이버 로그인 버튼
    const naverLoginBtn = document.getElementById('naverLoginBtn');
    if (naverLoginBtn) {
        naverLoginBtn.addEventListener('click', function() {
            // 네이버 로그인 수행
            if (window.naverLogin && window.naverLogin.startLogin) {
                naverLoginBtn.disabled = true;
                naverLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 로그인 중...';
                
                window.naverLogin.startLogin()
                    .then(profileData => {
                        // 네이버 유저 데이터 저장
                        chrome.storage.local.set({ naverUserData: profileData }, function() {
                            console.log('네이버 로그인 성공');
                            showLoggedInUI(profileData);
                        });
                    })
                    .catch(error => {
                        console.error('네이버 로그인 오류:', error);
                        alert('네이버 로그인에 실패했습니다. \n다시 시도해 주세요.');
                        naverLoginBtn.disabled = false;
                        naverLoginBtn.innerHTML = '<i class="fas fa-n"></i> 네이버 로그인';
                    });
            } else {
                // 개발 환경에서는 테스트용 로그인으로 대체
                const naverUserData = {
                    id: 'naver_user',
                    name: '네이버 유저',
                    nickname: '네이버님',
                    isNaverUser: true,
                    isLoggedIn: true,
                    autoLogin: true
                };
                
                chrome.storage.local.set({ naverUserData: naverUserData }, function() {
                    console.log('테스트 네이버 로그인 성공');
                    showLoggedInUI(naverUserData);
                });
            }
        });
    }
}

function checkLoginStatus() {
    // 일반 로그인과 네이버 로그인 상태 모두 확인
    chrome.storage.local.get(['userData', 'naverUserData'], function(result) {
        // 일반 로그인이 되어 있는지 확인
        if (result.userData && result.userData.isLoggedIn) {
            showLoggedInUI(result.userData);
            return;
        }
        
        // 네이버 로그인이 되어 있는지 확인
        if (result.naverUserData && result.naverUserData.isNaverUser && result.naverUserData.isLoggedIn) {
            showLoggedInUI(result.naverUserData);
            return;
        }
        
        // 자동 로그인 정보가 있다면 로그인 시도
        if (result.userData && result.userData.autoLogin && result.userData.id === TEST_USER.id) {
            loginUser(TEST_USER.id, TEST_USER.password, true);
            return;
        }
        
        // 네이버 자동 로그인 정보가 있다면 확인
        if (result.naverUserData && result.naverUserData.autoLogin && window.naverLogin && window.naverLogin.checkLoginStatus) {
            window.naverLogin.checkLoginStatus()
                .then(profileData => {
                    showLoggedInUI(profileData);
                })
                .catch(() => {
                    showLoginPage();
                });
            return;
        }
        
        // 로그인 상태가 아니면 로그인 페이지 표시
        showLoginPage();
    });
}

function showLoggedInUI(userData) {
    // 로그인 페이지 숨기기
    document.getElementById('login').classList.remove('active');
    
    // 홈 페이지 표시
    document.getElementById('home').classList.add('active');
    
    // 사이드바 표시 (요청대로 항상 유지)
    document.querySelector('.sidebar').style.display = 'flex';
    
    // 사용자 이름 표시
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        // 네이버 사용자의 경우 별명(nickname) 우선 표시
        if (userData.isNaverUser && userData.nickname) {
            userNameElement.textContent = userData.nickname;
        } else {
            userNameElement.textContent = userData.name;
        }
    }
    
    // 홈 아이콘 활성화
    document.querySelector('.home-icon').classList.add('active');

    // 캠페인 목록 로드
    loadCampaigns();
}

function showLoginPage() {
    // 홈 페이지 숨기기
    document.getElementById('home').classList.remove('active');
    
    // 로그인 페이지 표시
    document.getElementById('login').classList.add('active');
    
    // 사이드바 표시 (요청대로 항상 유지)
    document.querySelector('.sidebar').style.display = 'flex';
    
    // 로그인 아이콘 활성화
    document.querySelectorAll('.sidebar-icon').forEach(icon => icon.classList.remove('active'));
}

// 로그아웃 함수
function logoutUser() {
    // 일반 사용자와 네이버 사용자 로그아웃 정보 모두 확인
    chrome.storage.local.get(['userData', 'naverUserData'], function(result) {
        // 네이버 사용자 로그아웃
        if (result.naverUserData && result.naverUserData.isNaverUser) {
            if (window.naverLogin && window.naverLogin.logout) {
                window.naverLogin.logout()
                    .then(() => {
                        chrome.storage.local.remove(['naverUserData'], function() {
                            console.log('네이버 로그아웃 완료');
                            showLoginPage();
                        });
                    })
                    .catch(() => {
                        // 오류 발생시 강제로 삭제
                        chrome.storage.local.remove(['naverUserData'], function() {
                            showLoginPage();
                        });
                    });
            } else {
                // 개발 환경에서는 생략
                chrome.storage.local.remove(['naverUserData'], function() {
                    showLoginPage();
                });
            }
            return;
        }
        
        // 일반 사용자 로그아웃
        if (result.userData) {
            let userData = result.userData;
            
            // 자동 로그인 상태 해제
            userData = {
                id: userData.id,
                isLoggedIn: false,
                autoLogin: false
            };
            
            chrome.storage.local.set({ userData: userData }, function() {
                console.log('로그아웃 완료');
                showLoginPage();
            });
        } else {
            showLoginPage();
        }
    });
}

function loadCampaigns() {
    const campaignItems = document.querySelector('.campaign-items');
    if (!campaignItems) return;

    // 테스트용 캠페인 데이터
    const campaigns = [
        { name: "신역사", date: "2025-04-11", icon: "store", status: "writing" },
        { name: "코우부스콜", date: "2025-04-16", icon: "coffee", status: "selected" },
        { name: "모두의연구소", date: "2025-04-24", icon: "graduation-cap", status: "pending" },
        { name: "신용회복위원회", date: "2025-04-05", icon: "building", status: "completed" }
    ];

    campaignItems.innerHTML = campaigns.map(campaign => {
        // 상태에 따른 텍스트
        let statusText = '';
        let statusClass = '';
        
        switch(campaign.status) {
            case 'writing':
                statusText = '작성중';
                statusClass = 'writing';
                break;
            case 'selected':
                statusText = '선정됨';
                statusClass = 'selected';
                break;
            case 'pending':
                statusText = '대기중';
                statusClass = 'pending';
                break;
            case 'completed':
                statusText = '완료';
                statusClass = 'completed';
                break;
        }
        
        // 날짜 형식 변환
        const dateObj = new Date(campaign.date);
        const formattedDate = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
        
        return `
            <div class="campaign-item">
                <div class="site-icon">
                    <i class="fas fa-${campaign.icon}"></i>
                </div>
                <div class="campaign-info">
                    <div class="site-name">${campaign.name}</div>
                    <div class="campaign-date">${formattedDate}<span class="campaign-status ${statusClass}">${statusText}</span></div>
                </div>
            </div>
        `;
    }).join('');
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.search-button');
    const searchContainer = document.querySelector('.search-container');
    const searchClose = document.querySelector('.search-close');

    if (!searchInput || !searchButton || !searchContainer || !searchClose) return;

    // 검색 버튼 클릭 이벤트
    searchButton.addEventListener('click', function() {
        if (!searchContainer.classList.contains('active')) {
            searchContainer.classList.add('active');
            searchInput.focus();
            searchButton.style.opacity = '0';
        }
    });

    // 닫기 버튼 클릭 이벤트
    searchClose.addEventListener('click', function() {
        closeSearch();
    });

    // Enter 키 입력 이벤트
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch(searchInput.value);
        }
    });

    // ESC 키로 검색창 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
            closeSearch();
        }
    });

    // 검색창 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target) && 
            !searchButton.contains(e.target) &&
            searchContainer.classList.contains('active')) {
            closeSearch();
        }
    });

    function closeSearch() {
        searchContainer.classList.remove('active');
        searchInput.value = '';
        searchButton.style.opacity = '1';
    }
}

function handleSearch(query) {
    if (!query.trim()) return;
    
    // TODO: 실제 검색 기능 구현
    console.log('검색어:', query);
    
    // 테스트용 알림
    alert('검색 기능은 현재 준비중입니다.');
}

function initializeCalendar() {
    // 캘린더 오늘 날짜 표시
    const today = new Date();
    const todayDate = today.getDate();
    
    // 캘린더의 날짜 요소들 가져오기
    const days = document.querySelectorAll('.day:not(.prev-month):not(.next-month)');
    
    // 오늘 날짜에 today 클래스 추가
    days.forEach(day => {
        const dayNumber = parseInt(day.textContent);
        if (dayNumber === todayDate) {
            day.classList.add('today');
        }
        
        // 날짜 클릭 이벤트 추가
        day.addEventListener('click', function() {
            // 현재 선택된 날짜의 스타일 제거
            const selectedDay = document.querySelector('.day.selected');
            if (selectedDay) {
                selectedDay.classList.remove('selected');
            }
            
            // 클릭한 날짜에 selected 클래스 추가
            this.classList.add('selected');
        });
    });
    
    // 이전/다음 월 버튼 추가
    const prevMonthBtn = document.querySelector('.calendar-nav-btn:first-child');
    const nextMonthBtn = document.querySelector('.calendar-nav-btn:last-child');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            // 이전 월 로직은 추후 구현
            alert('이전 월 기능은 현재 개발중입니다.');
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            // 다음 월 로직은 추후 구현
            alert('다음 월 기능은 현재 개발중입니다.');
        });
    }
}