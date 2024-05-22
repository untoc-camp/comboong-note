/* eslint-disable no-param-reassign */
import { getMajorNotices, getSchedules } from './scripts/crawling.js';
import { createDDayNotification, createNotification, createNotificationSignal } from './scripts/notification.js';
import { localStorageGet, localStorageSet } from './scripts/storage.js';
import settingData from './scripts/setting.js';
import preprocessAndUpload from './scripts/preprocess.js';

function openModal() {
  chrome.windows.create({
    url: 'assets/modal/modal.html',
    type: 'popup',
    width: 400,
    height: 400,
    focused: true,
  });
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    openModal();
    const schedules = await getSchedules();
    const majorNotices = await getMajorNotices();
    const fixedNotices = [];
    const nonfixedNotices = [];

    schedules.forEach((schedule) => {
      const sDay = schedule.duration.substr(0, 10);
      const eDay = schedule.duration.substr(17, 10);
      schedule.startDay = sDay;
      schedule.endDay = eDay;
    });

    majorNotices.forEach((notice) => {
      if (notice.articleTitle.startsWith('[ 일반공지 ]')) {
        fixedNotices.push(notice);
      } else nonfixedNotices.push(notice);
    });

    localStorageSet({
      schedules,
      fixedNotices,
      nonfixedNotices,
      todayDate: new Date().getDate(),
      modalOnOff: true,
      noticeDDay: 5,
      crawlingPeriod: 1,
      mymajor: '정보컴퓨터공학부',
      initialStart: true,
    });
    chrome.storage.local.get((result) => console.log(result)); // 크롬 개발자도구에선 확장프로그램의 로컬 스토리지를 볼 수 없다고 해서, 콘솔에 띄웁니다
  }
});

createNotificationSignal();
createNotification();
createDDayNotification();
