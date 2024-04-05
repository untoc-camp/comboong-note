const COLORS = ['#024d97', '#0275ce', '#02BA6E'];

function renderPopup(schedules, majorNotices) {
  const scheduleList = document.getElementById('scheduleList');
  const noticeList = document.getElementById('noticeList');

  schedules.forEach(({ content, duration }) => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    td1.textContent = content;
    td2.textContent = duration.replace(/2024-/g, '');
    scheduleList.append(tr);
    tr.append(td1, td2);
  });

  majorNotices.forEach(({ articleTitle, articleHref, articleWriter }) => {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    const link = document.createElement('a');
    link.href = articleHref;
    link.target = '_blank';
    link.textContent = articleTitle;
    td.appendChild(link);
    td.appendChild(document.createTextNode(` (${articleWriter})`));
    noticeList.append(tr);
    tr.append(td);
  });
}

async function fetchAndRender() {
  const { schedules = [], majorNotices = [] } = await chrome.storage.local.get(['schedules', 'majorNotices']);
  renderPopup(schedules, majorNotices);
}

const tabs = document.querySelectorAll('.tab-menu li');
const contents = document.querySelectorAll('.tab-content .content');

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    contents.forEach((content) => content.classList.remove('current'));
    contents[index].classList.add('current');

    const content_margin = document.getElementById('popup-edge');
    content_margin.style.backgroundColor = COLORS[index];
  });
});

fetchAndRender();

(async () => {
  // 차후 설정한 주기 시간으로 변경
  await chrome.runtime.sendMessage({ time: 1 });
})();

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'crawlingPeriod') {
    fetchAndRender();
  }
});
