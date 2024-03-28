(async () => {
  const { modalData } = await chrome.runtime.sendMessage({ requestModalData: true });
  console.log(modalData);
  console.log(modalData.content, modalData.remainingDays);
})();
