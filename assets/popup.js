async function fetchAndRender() {
  const { schedules = [], majorNotices = [] } = await chrome.storage.local.get(['schedules', 'majorNotices']);
  renderPopup(schedules, majorNotices);
}

fetchAndRender();


function renderPopup(schedules, majorNotices) {
  const scheduleList = document.getElementById('scheduleList');
  const noticeList = document.getElementById('noticeList');

  schedules.forEach(({ content, duration }) => {
    const li = document.createElement('li');
    li.textContent = `${content} - ${duration}`;
    scheduleList.appendChild(li);
  });

  majorNotices.forEach(({ articleTitle, articleHref, articleWriter }) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = articleHref;
    link.target = '_blank';
    link.textContent = articleTitle;
    li.appendChild(link);
    li.appendChild(document.createTextNode(` (${articleWriter})`));
    noticeList.appendChild(li);
  });
}
