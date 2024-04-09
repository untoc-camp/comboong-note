function renderPopup(schedules, majorNotices) {
  const scheduleList = document.getElementById('scheduleList');
  const noticeList = document.getElementById('noticeList');
  const generalNotices = [];

  schedules.forEach(({ content, duration }) => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    td1.textContent = content;
    td2.textContent = duration.replace(/2024-/g, '');
    scheduleList.append(tr);
    tr.append(td1, td2);
  });

  majorNotices.forEach((notice) => {
    if (notice.articleTitle.startsWith('[ 일반공지 ]')) {
      generalNotices.push(notice);
    }
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

    generalNotices.forEach((notice) => {
      if (notice.articleTitle == articleTitle) {
        tr.classList.add('generalNotice', 'hide');
      }
    });
  });
}

async function fetchAndRender() {
  const { schedules = [], majorNotices = [] } = await chrome.storage.local.get(['schedules', 'majorNotices']);
  renderPopup(schedules, majorNotices);
}

function tabEventListener() {
  const tabs = document.querySelectorAll('.tab-menu li');
  const contents = document.querySelectorAll('.tab-content .content');
  const content_margin = document.getElementById('popup-edge');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      contents.forEach((content) => content.classList.remove('current'));
      contents[index].classList.add('current');

      content_margin.classList.remove('color-1', 'color-2', 'color-3');
      content_margin.classList.add(`color-${index + 1}`);
    });
  });
}

function majorNoticesToggle() {
  const toggle = document.querySelector('#majorNoticeToggle');
  const text = document.getElementById('toggleText');

  toggle.addEventListener('click', () => {
    const generalNotices = document.querySelectorAll('.generalNotice');
    generalNotices.forEach((tr) => {
      tr.classList.toggle('hide');
    });
    if(text.innerText=="일반공지 닫기"){
      text.innerText="일반공지 열기";
    }else{
      text.innerText="일반공지 닫기";
    }
  });
}

function dropDownList() {
  const dropdownBtns = document.querySelectorAll('.dropbtn');
  const listItems = document.querySelectorAll('.list');

  dropdownBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dropdownContent = btn.nextElementSibling;
      dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'block' : 'none';
    });
  });

  listItems.forEach((item) => {
    item.addEventListener('click', () => {
      const dropbtnContent = item.closest('.dropdown').querySelector('.dropbtn_content');
      dropbtnContent.textContent = item.textContent;
    });
  });

  window.addEventListener('click', (e) => {
    if (!e.target.matches('.dropbtn')) {
      const dropdownContents = document.querySelectorAll('.dropdown-content');
      dropdownContents.forEach((content) => {
        content.style.display = 'none';
      });
    }
  });
}

fetchAndRender();
tabEventListener();
dropDownList();
majorNoticesToggle();

(async () => {
  // 차후 설정한 주기 시간으로 변경
  await chrome.runtime.sendMessage({ time: 1 });
})();

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'crawlingPeriod') {
    fetchAndRender();
  }
});
