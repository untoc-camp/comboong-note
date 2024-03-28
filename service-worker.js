function openModal() {
  chrome.windows.create({
    url: 'assets/modal.html',
    type: 'popup',
    width: 400,
    height: 400,
    focused: true,
  });
}

async function getSchedules() {
  const { tabs } = await chrome.windows.create({
    url: 'https://onestop.pusan.ac.kr',
    state: 'minimized',
  });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => {
      const liTags = Array.from(document.querySelectorAll('.schedule-list > li'));
      return liTags.map((li) => {
        const content = li.querySelector('.subject').textContent;
        const duration = li.querySelector('.list-date').textContent;
        return { content, duration };
      });
    },
  });

  chrome.windows.remove(tabs[0].windowId);

  return result[0].result;
}

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
