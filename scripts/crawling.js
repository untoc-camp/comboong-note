import { localStorageSet, localStorageGet } from './storage.js';

async function getSchedules() {
  const { tabs } = await chrome.windows.create({
    url: 'https://onestop.pusan.ac.kr',
    state: 'minimized',
  });

  setTimeout(function () {
    chrome.windows.remove(tabs[0].windowId);
    return null;
  }, 15000);

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

  setTimeout(function () {
    chrome.windows.remove(tabs[0].windowId);
    return null;
  }, 15000);

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

export { getSchedules, getMajorNotices };
