const createNotificationSignal = () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.time) {
      // 팝업 설정 페이지에서 설정한 크롤링 주기를 이용하여 알람을 생성합니다.
      chrome.alarms.create('crawlingPeriod', {
        delayInMinutes: 1,
        periodInMinutes: parseInt(request.time, 10),
      });
    }
  });
};

const createNotification = () => {
  console.log("h")
  // 나중에 크롤링한 데이터를 전후 비교하여 새 데이터만 출력되도록 짜야함
  chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.notifications.create(
      {
        type: 'basic',
        iconUrl: 'assets/img/iconImg.png',
        title: 'testing',
        message: 'doing testing..',
        silent: false,
      },
      () => {},
    );
  });
};

export { createNotificationSignal, createNotification };
