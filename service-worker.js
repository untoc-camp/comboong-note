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

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    openModal();
    const schedules = await getSchedules();
    const majorNotices = await getMajorNotices();

    chrome.storage.local.set({ schedules, majorNotices });
    chrome.storage.local.get((result) => console.log(result)); //크롬 개발자도구에선 확장프로그램의 로컬 스토리지를 볼 수 없다고 해서, 콘솔에 띄웁니다
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.time) {
    //팝업 설정 페이지에서 설정한 크롤링 주기를 이용하여 알람을 생성합니다.
    chrome.alarms.create('crawlingPeriod', {
      delayInMinutes: 1,
      periodInMinutes: parseInt(request.time),
    });
  }
});

// 나중에 크롤링한 데이터를 전후 비교하여 새 데이터만 출력되도록 짜야함
chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.notifications.create(
    {
      type: 'basic',
      iconUrl: 'img/iconImg.png',
      title: 'testing',
      message: 'doing testing..',
      silent: false,
    },
    () => {},
  );
});
