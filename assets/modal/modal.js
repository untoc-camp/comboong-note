// (async () => {
//   const { modalDisplayData } = await chrome.runtime.sendMessage({ requestModalData: true });
//   console.log(modalDisplayData);
//   console.log(modalDisplayData.content, modalDisplayData.remainingDays);
// })();
document.addEventListener('DOMContentLoaded', function () {
    const settingsImg = document.getElementById('settingset');
    const extraDiv = document.getElementById('extra');
  
    settingsImg.addEventListener('mouseenter', function () {
        extraDiv.style.display = 'block';
    });
  
    settingsImg.addEventListener('mouseleave', function () {
        extraDiv.style.display = 'none';
    });
  });