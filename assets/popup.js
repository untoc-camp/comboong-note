chrome.storage.local.get(['schedules', 'majorNotices'], (data) => {
  const { schedules, majorNotices } = data;
  
  console.log(schedules);
  console.log(majorNotices);

  getSchedulesAndNotices(schedules, majorNotices);
});

async function getSchedulesAndNotices(schedules, majorNotices) {
    // const schedules = await getSchedules();
    // const majorNotices = await getMajorNotices();
  
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
  
  