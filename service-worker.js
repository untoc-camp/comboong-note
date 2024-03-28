function openModal() {
  chrome.windows.create({
    url: 'assets/modal.html',
    type: 'popup',
    width: 400,
    height: 400,
    focused: true,
  });
}

function getSchedules() {}

class ModalDisplayData {
  /**
   *
   * @param {string} content
   * @param {number} remainingDays
   */
  constructor(content, remainingDays) {
    this.content = content;
    this.remainingDays = remainingDays;
  }
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    openModal();
    const schedules = await getSchedules();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.requestModalData) {
    sendResponse({ modalDisplayData: new ModalDisplayData('종강', 60) });
  }
});
