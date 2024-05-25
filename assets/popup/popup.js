/* eslint-disable import/no-unresolved  */
/* eslint-disable no-param-reassign */
import { localStorageSet, localStorageGet } from '../../scripts/storage.js';
import settingData from '../../scripts/setting.js';

function resetRender() {
  const scheduleList = document.getElementById('scheduleList');
  const noticeList = document.getElementById('noticeList');
  const scheduleTr = document.querySelectorAll('.Schedule');
  const noticeTr = document.querySelectorAll('.Notice');
  const text = document.getElementById('toggleText');

  if (text.innerText === '일반공지 닫기') {
    text.innerText = '일반공지 열기';
  } // 일반공지 창이 열려있는 상태에서 resetRender함수가 돌았을떄 일반공지 토글창 텍스트가 뒤바뀌는것 방지

  scheduleTr.forEach((schedule) => {
    scheduleList.removeChild(schedule);
  });
  noticeTr.forEach((notice) => {
    noticeList.removeChild(notice);
  });
}

function renderPopup(schedules, fixedNotices, nonfixedNotices) {
  const scheduleList = document.getElementById('scheduleList');
  const noticeList = document.getElementById('noticeList');
  const majorNotices = fixedNotices.concat(nonfixedNotices);

  resetRender();

  schedules.forEach(({ content, duration, startDay, endDay }, index) => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    const yearTr = document.createElement('tr');
    const yearTd = document.createElement('td');

    //  공지 리스트의 첫 칸에 올해의 년도 삽입
    if (index === 0) {
      yearTd.textContent = startDay.substr(0, 4);
      scheduleList.append(yearTr);
      yearTr.append(yearTd);
      yearTr.classList.add('Schedule');
      yearTd.classList.add('Year');
      yearTd.setAttribute('colspan', 2);
    }

    td1.textContent = content;
    td2.textContent = duration.replaceAll(startDay.substr(0, 5), '');
    scheduleList.append(tr);
    tr.append(td1, td2);
    tr.classList.add('Schedule');

    if (startDay.substr(0, 4) !== endDay.substr(0, 4)) {
      yearTd.textContent = endDay.substr(0, 4);
      scheduleList.append(yearTr);
      yearTr.append(yearTd);
      yearTr.classList.add('Schedule');
      yearTd.classList.add('Year');
      yearTd.setAttribute('colspan', 2);
    }
  });

  majorNotices.forEach(({ articleTitle, articleHref, articleWriter }) => {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    const link = document.createElement('a');
    link.href = articleHref;
    link.target = '_blank';
    link.textContent = articleTitle.replace(/ 새글/g, '');
    td.appendChild(link);
    td.appendChild(document.createTextNode(` (${articleWriter})`));
    noticeList.append(tr);
    tr.append(td);
    tr.classList.add('Notice');

    fixedNotices.forEach((notice) => {
      if (notice.articleTitle === articleTitle) {
        tr.classList.add('generalNotice', 'hide');
      }
    });
  });
}

async function fetchAndRender() {
  const {
    schedules = [],
    fixedNotices = [],
    nonfixedNotices = [],
  } = await localStorageGet(['schedules', 'fixedNotices', 'nonfixedNotices']);
  renderPopup(schedules, fixedNotices, nonfixedNotices);
}

function tabEventListener() {
  const tabs = document.querySelectorAll('.tab-menu li');
  const contents = document.querySelectorAll('.tab-content .content');
  const contentMargin = document.getElementById('popup-edge');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      contents.forEach((content) => content.classList.remove('current'));
      contents[index].classList.add('current');

      contentMargin.classList.remove('color-1', 'color-2', 'color-3');
      contentMargin.classList.add(`color-${index + 1}`);
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
    if (text.innerText === '일반공지 열기') {
      text.innerText = '일반공지 닫기';
    } else {
      text.innerText = '일반공지 열기';
    }
  });
}

async function initializeDropdown(dropdown, index) {
  // 초기 상태 반영.
  const listItems = dropdown.querySelectorAll('.list');
  const dropbtnContent = dropdown.querySelector('.dropbtn_content');
  const Setting = await localStorageGet();

  listItems.forEach((item) => {
    switch (index) {
      case 0:
        dropbtnContent.textContent =
          parseInt(item.getAttribute('value'), 10) === Setting.noticeDDay ? item.innerText : dropbtnContent.textContent;
        break;
      case 1:
        dropbtnContent.textContent =
          parseInt(item.getAttribute('value'), 10) === Setting.crawlingPeriod
            ? item.innerText
            : dropbtnContent.textContent;
        break;
      case 2:
        dropbtnContent.textContent = Setting.mymajor;
        break;
      default:
        break;
    }
  });
}

async function addLinkAndMajor(majorLink = 'https://cse.pusan.ac.kr/cse/14651/subview.do') {
  const studentSupply = document.querySelector('.studentSupply');
  const yourMajor = document.querySelector('.yourMajor');
  const Setting = await localStorageGet();
  yourMajor.innerText = Setting.mymajor;

  studentSupply.addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://onestop.pusan.ac.kr',
    });
  });

  yourMajor.addEventListener('click', () => {
    chrome.tabs.create({
      url: majorLink,
    });
  });
}

function StoreSetting() {
  const modalValue = document.querySelector('#ModalSetting input[type="checkbox"]').checked;
  const ddayValue = parseInt(document.querySelector('#D-daySetting .Selected').getAttribute('value'), 10);
  const crawlingValue = parseInt(document.querySelector('#CrawlingSetting .Selected').getAttribute('value'), 10);
  const majorValue = document.querySelector('#MajorSetting .Selected').textContent;

  // const SettingData = {
  //   ModalOnOff: modalValue,
  //   NoticeDDay: ddayValue,
  //   CrawlingPeriod: crawlingValue,
  //   MyMajor: majorValue
  // };

  localStorageSet(settingData(modalValue, ddayValue, crawlingValue, majorValue));
  addLinkAndMajor();
}

function dropDownList() {
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach((dropdown, index) => {
    const dropdownBtn = dropdown.querySelector('.dropbtn');
    const listItems = dropdown.querySelectorAll('.list');

    // 초기화 함수 호출
    initializeDropdown(dropdown, index);

    dropdownBtn.addEventListener('click', () => {
      const dropdownContent = dropdownBtn.nextElementSibling;
      dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'block' : 'none';
    });

    listItems.forEach((item) => {
      item.addEventListener('click', () => {
        // 모든 항목에서 'Selected' 클래스 제거
        listItems.forEach((i) => i.classList.remove('Selected'));

        // 선택한 항목에 'Selected' 클래스 추가
        item.classList.add('Selected');

        // 'Selected' 클래스를 가진 항목의 텍스트를 드롭다운 버튼에 표시
        const selectedItem = dropdown.querySelector('.list.Selected');
        const dropbtnContent = dropdown.querySelector('.dropbtn_content');
        if (selectedItem) {
          dropbtnContent.textContent = selectedItem.textContent;
        }

        //  선택한 항목 스토리지에 저장
        StoreSetting();
      });
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

async function updateToggleValues() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const Setting = await localStorageGet();

  // 초기 상태 반영.
  toggleSwitch.checked = Setting.modalOnOff;

  // 토글 스위치 클릭 시 value 값 변경
  toggleSwitch.addEventListener('change', () => {
    toggleSwitch.value = toggleSwitch.checked;
    StoreSetting();
  });
}

fetchAndRender();
tabEventListener();
updateToggleValues();
dropDownList();
majorNoticesToggle();
addLinkAndMajor();

(async () => {
  const { initialStart } = await localStorageGet('initialStart');
  if (initialStart === true) {
    const { modalOnOff, noticeDDay, crawlingPeriod, mymajor } = await localStorageGet([
      'modalOnOff',
      'noticeDDay',
      'crawlingPeriod',
      'mymajor',
    ]);
    await chrome.runtime.sendMessage({
      modalOnOff,
      noticeDDay,
      crawlingPeriod,
      mymajor,
    });

    localStorageSet({ initialStart: false });
  }

  chrome.storage.onChanged.addListener(async (changes) => {
    if (changes.fixedNotices || changes.nonfixedNotices || changes.schedules) {
      fetchAndRender();
    }
    if (!changes.initialStart) {
      const { modalOnOff, noticeDDay, crawlingPeriod, mymajor } = await localStorageGet([
        'modalOnOff',
        'noticeDDay',
        'crawlingPeriod',
        'mymajor',
      ]);
      await chrome.runtime.sendMessage({
        modalOnOff,
        noticeDDay,
        crawlingPeriod,
        mymajor,
      });
    }
  });
})();

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'crawlingPeriod') {
    fetchAndRender();
  }
});
