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
  console.log("createnotificationsignal");
};

const createNotification = () => {
  let majorNoticeIsChange;
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.majorNotices) {
      majorNoticeIsChange = true;
    }
  });
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    const { modalOnOff } = await chrome.storage.local.get('modalOnOff');
    if (modalOnOff === true && majorNoticeIsChange === true) {
      console.log("createnotification");
      chrome.notifications.create(
        {
          type: 'basic',
          iconUrl: 'assets/img/iconImg.png',
          title: '새 공지가 등록되었습니다.',
          message: 'doing testing..',
          silent: false,
        },
        () => {},
      );
    }
  });
};

export { createNotificationSignal, createNotification };