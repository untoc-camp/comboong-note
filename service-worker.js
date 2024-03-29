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

async function getMajorNotices() {
  const { tabs } = await chrome.windows.create({
    url: 'https://cse.pusan.ac.kr/cse/14651/subview.do',
    state: 'minimized',
  });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => {
      const articleTitles = Array.from(document.querySelectorAll('.artclLinkView'));
      const articleWriters = Array.from(document.querySelectorAll('._artclTdWriter'));

      return articleTitles.map((articleTitleInfo, index) => {
        const articleTitle = articleTitleInfo.innerText;
        const articleHref = articleTitleInfo.href;
        const articleWriter = articleWriters[index].innerText;

        return { articleTitle, articleHref, articleWriter };
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
    const majorNotices = await getMajorNotices();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.requestModalData) {
    sendResponse({ modalDisplayData: new ModalDisplayData('종강', 60) });
  }
});
