const localStorageSet = (content) => {
  chrome.storage.local.set(content);
  console.log(content); // 크롬 개발자도구에선 확장프로그램의 로컬 스토리지를 볼 수 없다고 해서, 콘솔에 띄웁니다
};

const localStorageGet = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => resolve(result));
  });
};

export { localStorageSet, localStorageGet };
