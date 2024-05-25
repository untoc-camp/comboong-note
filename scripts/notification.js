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
      const { modalOnOff } = await chrome.storage.local.get('modalOnOff');
      const todayDate = new Date();

      if (modalOnOff === true) {
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
              title: `학사일정 알림 - [D-${dDay}]`,
              message: `${schedules[i].content}`,
              silent: false,
            },
            () => {},
          );
        }
      }
    }
  });
};

const updateStorageByAlarm = async (alarm) => {
  const schedules = await getSchedules();
  const majorNotices = await getMajorNotices();
  const fixedNotices = [];
  const nonfixedNotices = [];

  // 네트워크 오류로 인해 schedules, majorNotices가 null일 경우 5초 뒤에 다시 시도합니다.
  if (schedules === null || majorNotices === null) {
    setTimeout(updateStorageByAlarm, 5000);
    return;
  }

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
      } catch (err) {
        // 아무것도 실행 X
      }
    }
    if (changes.nonfixedNotices) {
      try {
        for (let i = 0; i < changes.nonfixedNotices.newValue.length; i += 1) {
          if (changes.nonfixedNotices.oldValue[0].articleTitle === changes.nonfixedNotices.newValue[i].articleTitle) {
            break;
          }
          newNotice.push(changes.nonfixedNotices.newValue[i]);
        }
      } catch (err) {
        // 아무것도 실행 X
      }
    }
    console.log('newNotice : ', newNotice);

    const { modalOnOff } = await chrome.storage.local.get('modalOnOff');
    if (modalOnOff === true && newNotice.length > 0) {
      for (let i = 0; i < newNotice.length; i += 1) {
        chrome.notifications.create(
          {
            type: 'basic',
            iconUrl: 'assets/img/iconImg.png',
            title: '새 공지가 등록되었습니다.',
            message: `${newNotice[i].articleTitle}`,
            silent: false,
          },
          () => {},
        );
      }
      newNotice.length = 0;
    }
  });

  chrome.alarms.onAlarm.addListener(updateStorageByAlarm);
};

export { createNotificationSignal, createDDayNotification, createNotification };
