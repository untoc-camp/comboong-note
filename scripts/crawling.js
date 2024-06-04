import { localStorageGet } from './storage.js';

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
  const MAJOR_NOTICE_URL = {
    정보컴퓨터공학부: 'https://cse.pusan.ac.kr/cse/14651/subview.do',
    식품영양학과:
      'https://fsn.pusan.ac.kr/fsn/15462/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGZnNuJTJGMjc4MyUyRmFydGNsTGlzdC5kbyUzRmJic09wZW5XcmRTZXElM0QlMjZpc1ZpZXdNaW5lJTNEZmFsc2UlMjZzcmNoQ29sdW1uJTNEJTI2cGFnZSUzRDElMjZzcmNoV3JkJTNEJTI2cmdzQmduZGVTdHIlM0QlMjZiYnNDbFNlcSUzRCUyNnJnc0VuZGRlU3RyJTNEJTI2',
    토목공학과: 'https://civil.pusan.ac.kr/civil/16275/subview.do',
  };
  let majorNoticeUrl = MAJOR_NOTICE_URL['정보컴퓨터공학부'];
  const { mymajor } = await localStorageGet('mymajor');
  console.log(mymajor);

  if (mymajor) {
    majorNoticeUrl = MAJOR_NOTICE_URL[mymajor];
    console.log(majorNoticeUrl);
  }
  const { tabs } = await chrome.windows.create({
    url: majorNoticeUrl,
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

export { getSchedules, getMajorNotices };
