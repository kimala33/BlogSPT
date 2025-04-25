// Initialize side panel when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    // Set up initial extension state
    chrome.storage.local.set({
        isLoggedIn: false,
        userType: 'free',
        stats: {
            activeCampaigns: 0,
            pendingAnnouncements: 0
        },
        userData: {
            id: '',
            name: '',
            isLoggedIn: false,
            autoLogin: false
        },
        naverUserData: {
            id: '',
            name: '',
            nickname: '',
            isNaverUser: false,
            isLoggedIn: false,
            autoLogin: false
        }
    });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // Open the side panel
    chrome.sidePanel.open({ windowId: tab.windowId });
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
    if (command === "_execute_action") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.sidePanel.open({ windowId: tabs[0].windowId });
            }
        });
    }
});