const localStorageSet = (content) => {
  chrome.storage.local.set(content);
};

const localStorageGet = (content) => {};
// popup.js의 fetchAndRender함수에서 async와 같이 사용될 때, 데이터가 안 보이는 현상 발생

export { localStorageSet, localStorageGet };
