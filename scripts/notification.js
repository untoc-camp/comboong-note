import { getMajorNotices, getSchedules } from './crawling.js';
import { localStorageSet } from './storage.js';

const createNotificationSignal = () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.crawlingPeriod) {
      // 팝업 설정 페이지에서 설정한 크롤링 주기를 이용하여 알람을 생성합니다.
      chrome.alarms.create('crawlingPeriod', {
        delayInMinutes: 0,
        periodInMinutes: parseInt(request.crawlingPeriod, 10),
      });
    }
  });
};

const createNotification = () => {
  let majorNoticeIsChange = false;
  const newNotice = [];
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.nonfixedNotices) {
      majorNoticeIsChange = true;
      newNotice.push(changes.nonfixedNotices.newValue[0]);
      console.log(changes.nonfixedNotices.newValue[0]);
    }
    if (changes.fixedNotices) {
      console.log(majorNoticeIsChange);
      majorNoticeIsChange = true;
      newNotice.push(changes.fixedNotices.newValue[0]);
      console.log(changes.fixedNotices.newValue[0]);
    }
    console.log(newNotice);
  });
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    const schedules = await getSchedules();
    const majorNotices = await getMajorNotices();
    const fixedNotices = [];
    const nonfixedNotices = [];

    majorNotices.forEach((notice) => {
      if (notice.articleTitle.startsWith('[ 일반공지 ]')) {
        fixedNotices.push(notice);
      } else nonfixedNotices.push(notice);
    });

    localStorageSet({ schedules, fixedNotices, nonfixedNotices });
    console.log('i rendered!');

    const { modalOnOff } = await chrome.storage.local.get('modalOnOff');
    if (modalOnOff === true && majorNoticeIsChange === true) {
      console.log(newNotice);
      for (let i = 0; i < newNotice.length; i += 1) {
        chrome.notifications.create(
          {
            type: 'basic',
            iconUrl: 'assets/img/iconImg.png',
            title: '새 공지가 등록되었습니다.',
            message: `${newNotice[0].articleTitle}`,
            silent: false,
          },
          () => {},
        );
      }
      newNotice.length = 0;
      majorNoticeIsChange = false;
    }
  });
};

export { createNotificationSignal, createNotification };
