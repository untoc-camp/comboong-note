/* eslint-disable no-param-reassign */
import { getMajorNotices, getSchedules } from './crawling.js';
import { localStorageGet, localStorageSet } from './storage.js';
import preprocessAndUpload from './preprocess.js';

const createNotificationSignal = () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    if (request.crawlingPeriod) {
      console.log('i created alarm');
      // 팝업 설정 페이지에서 설정한 크롤링 주기를 이용하여 알람을 생성합니다.
      chrome.alarms.create('crawlingPeriod', {
        delayInMinutes: 0,
        periodInMinutes: 60,
      });
    }
  });
};

const createDDayNotification = async () => {
  const aDay = 1000 * 60 * 60 * 24;
  chrome.storage.onChanged.addListener(async (changes) => {
    if (changes.todayDate || changes.noticeDDay) {
      const { schedules } = await localStorageGet('schedules');
      const { noticeDDay } = await localStorageGet('noticeDDay');
      const todayDate = new Date();
      console.log(noticeDDay);

      for (let i = 0; i < schedules.length; i += 1) {
        const scheduledDay = new Date(schedules[i].startDay);
        let dDay = (scheduledDay - todayDate) / aDay;

        if (dDay > noticeDDay) {
          break;
        } else if (dDay < 0) {
          dDay = 'Day';
        } else {
          dDay = Math.ceil(dDay);
        }

        chrome.notifications.create(
          {
            type: 'basic',
            iconUrl: 'assets/img/iconImg.png',
            title: `학사일정 D-Day - {${dDay}}`,
            message: `${schedules[i].content}`,
            silent: false,
          },
          () => {},
        );
      }
    }
  });
};

const createNotification = () => {
  const newNotice = [];
  chrome.storage.onChanged.addListener(async (changes) => {
    console.log(changes);
    if (changes.fixedNotices) {
      try {
        for (let i = 0; i < changes.fixedNotices.newValue.length; i += 1) {
          if (changes.fixedNotices.oldValue[0].articleTitle === changes.fixedNotices.newValue[i].articleTitle) {
            break;
          }
          newNotice.push(changes.fixedNotices.newValue[i]);
        }
      } catch (err) {}
    }
    if (changes.nonfixedNotices) {
      try {
        for (let i = 0; i < changes.nonfixedNotices.newValue.length; i += 1) {
          if (changes.nonfixedNotices.oldValue[0].articleTitle === changes.nonfixedNotices.newValue[i].articleTitle) {
            break;
          }
          newNotice.push(changes.nonfixedNotices.newValue[i]);
        }
      } catch (err) {}
    }
    console.log(newNotice);

    const { modalOnOff } = await chrome.storage.local.get('modalOnOff');
    if (modalOnOff === true && newNotice.length > 0) {
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
    }
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    const schedules = await getSchedules();
    const majorNotices = await getMajorNotices();
    const fixedNotices = [];
    const nonfixedNotices = [];

    // 네트워크 연결 오류 시 예외 처리 필요

    while (true) {
      try {
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
        console.log('i got alarm!');
        localStorageSet({ schedules, fixedNotices, nonfixedNotices, todayDate: new Date().getDate() });
        break;
      } catch (err) {
        console.log('Error occured: ', err);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve, reject) => {
          setTimeout(resolve, 5000);
        });
      }
    }
  });
};

export { createNotificationSignal, createDDayNotification, createNotification };
