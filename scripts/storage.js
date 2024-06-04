const localStorageSet = (content) => {
  chrome.storage.local.set(content);
  console.log(content);
};

const localStorageGet = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => resolve(result));
  });
};

export { localStorageSet, localStorageGet };
