/* eslint-disable no-param-reassign */
import { getMajorNotices, getSchedules } from './crawling.js';
import { localStorageSet } from './storage.js';
import preprocessAndUpload from './preprocess.js';

const createNotificationSignal = () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    if (request.crawlingPeriod) {
      console.log('i created alarm');
      // 팝업 설정 페이지에서 설정한 크롤링 주기를 이용하여 알람을 생성합니다.
      chrome.alarms.create('crawlingPeriod', {
        delayInMinutes: 0,
        periodInMinutes: 1,
      });
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
    if (schedules.length !== 0 && fixedNotices.length !== 0 && nonfixedNotices.length !== 0) {
      localStorageSet({ schedules, fixedNotices, nonfixedNotices });
    }
    // setTimeout(() => {
    //   localStorageSet({
    //     fixedNotices: [
    //       {
    //         articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/407402/artclView.do',
    //         articleTitle: '[ 일반공지 ] 아 개같네',
    //         articleWriter: '임지민',
    //       },
    //       {
    //         articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1313281/artclView.do',
    //         articleTitle: '[ 일반공지 ] [학과활동] 2024학년도 1학기 학과활동 안내(4/4 기준 업데이트)',
    //         articleWriter: '정예랑',
    //       },
    //       {
    //         articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1237068/artclView.do',
    //         articleTitle: '[ 일반공지 ] [졸업] 2024년 8월 졸업(수료)예정자 졸업요건 서류 제출 안내: ~7.12.(금)',
    //         articleWriter: '정예랑',
    //       },
    //       {
    //         articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1135748/artclView.do',
    //         articleTitle: '[ 일반공지 ] [중요] 부산대학교 영어 능력 졸업인증제도 시행 지침 안내(2024.5월 개정)',
    //         articleWriter: '김지윤',
    //       },
    //       {
    //         articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/972939/artclView.do',
    //         articleTitle: '[ 일반공지 ] 타과생의 부전공/복수전공 교육과정 적용 안내',
    //         articleWriter: '황유경',
    //       },
    //       {
    //         articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/930641/artclView.do',
    //         articleTitle: '[ 일반공지 ] ☆★ 코로나19 확진 시 가이드 ☆★',
    //         articleWriter: '김지윤',
    //       },
    //       {
    //         articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/813152/artclView.do',
    //         articleTitle: '[ 일반공지 ] 타과생의 부전공 신청에 관한 안내',
    //         articleWriter: '황유경',
    //       },
    //       {
    //         articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/656247/artclView.do',
    //         articleTitle: '[ 일반공지 ] 학생지원시스템 학생 개인정보 확인 및 수정 안내',
    //         articleWriter: '유은화',
    //       },
    //       {
    //         articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/408175/artclView.do',
    //         articleTitle: '[ 일반공지 ] [필독] 학과 공지사항 안내',
    //         articleWriter: '조교_유은화',
    //       },
    //     ],
    //   });
    // }, 20000);
  });
};

export { createNotificationSignal, createNotification };
