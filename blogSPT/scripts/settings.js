/* settings.js – 사용자 프로필 저장/로드 */

document.addEventListener('DOMContentLoaded', () => {
  // 로드
  chrome.storage.sync.get(['userProfile'], ({ userProfile }) => {
    if (!userProfile) return;
    document.getElementById('ageRange').value = userProfile.ageRange || '';
    document.getElementById('maritalStatus').value =
      userProfile.maritalStatus || '';
    document.getElementById('region').value = userProfile.region || '';
    document.getElementById('hasChildren').value =
      userProfile.hasChildren || '';
  });

  // 저장
  document
    .getElementById('saveProfile')
    .addEventListener('click', async () => {
      const profile = {
        ageRange: document.getElementById('ageRange').value,
        maritalStatus: document.getElementById('maritalStatus').value,
        region: document.getElementById('region').value.trim(),
        hasChildren: document.getElementById('hasChildren').value
      };

      await chrome.storage.sync.set({ userProfile: profile });
      alert('프로필이 저장되었습니다!');
    });
});
