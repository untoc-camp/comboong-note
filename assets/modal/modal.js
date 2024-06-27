// (async () => {
//   const { modalDisplayData } = await chrome.runtime.sendMessage({ requestModalData: true });
//   console.log(modalDisplayData);
//   console.log(modalDisplayData.content, modalDisplayData.remainingDays);
// })();

window.open('/modal.html',"_blank","width = 500, height=600"); //링크 연결 안됨 