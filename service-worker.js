/* eslint-disable no-param-reassign */
import { getMajorNotices, getSchedules } from './scripts/crawling.js';
import { createDDayNotification, createNotification, createNotificationSignal } from './scripts/notification.js';
import { localStorageGet, localStorageSet } from './scripts/storage.js';

// function openModal() {
//   chrome.windows.create({
//     url: 'assets/modal/modal.html',
//     type: 'popup',
//     width: 400,
//     height: 400,
//     focused: true,
//   });
// }

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    // 모달창 개발 완료 후 주석 해제
    // openModal();
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
      noticeDDay: 3,
      crawlingPeriod: 3,
      mymajor: '정보컴퓨터공학부',
      initialStart: true,
    });
  }
});

createNotificationSignal();
createNotification();
createDDayNotification();
