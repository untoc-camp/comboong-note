import { localStorageSet, localStorageGet } from '/scripts/storage.js';
import { settingData } from '/scripts/setting.js';

function renderPopup(schedules, majorNotices) {
  const scheduleList = document.getElementById('scheduleList');
  const noticeList = document.getElementById('noticeList');
  const generalNotices = [];

  resetRender();

  schedules.forEach(({ content, duration }) => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    td1.textContent = content;
    td2.textContent = duration.replace(/2024-/g, '');
    scheduleList.append(tr);
    tr.append(td1, td2);
    tr.classList.add('Schedule');
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
    tr.classList.add('Notice');

    generalNotices.forEach((notice) => {
      if (notice.articleTitle == articleTitle) {
        tr.classList.add('generalNotice', 'hide');
      }
    });
  });
}

function resetRender() {
  const scheduleList = document.getElementById('scheduleList');
  const noticeList = document.getElementById('noticeList');
  const scheduleTr = document.querySelectorAll('.Schedule');
  const noticeTr = document.querySelectorAll('.Notice');
  const text = document.getElementById('toggleText');

  if (text.innerText == '일반공지 닫기') {
    text.innerText = '일반공지 열기';
  } // 일반공지 창이 열려있는 상태에서 resetRender함수가 돌았을떄 일반공지 토글창 텍스트가 뒤바뀌는것 방지

  scheduleTr.forEach((schedule) => {
    scheduleList.removeChild(schedule);
  });
  noticeTr.forEach((notice) => {
    noticeList.removeChild(notice);
  });
}

async function fetchAndRender() {
  const { schedules = [], majorNotices = [] } = await localStorageGet(['schedules', 'majorNotices']);
  renderPopup(schedules, majorNotices);
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
    if (text.innerText == '일반공지 열기') {
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
  const Setting = await localStorageGet("settingData");

  listItems.forEach((item) => {
    switch(index){
      case 0:
        dropbtnContent.textContent = (item.getAttribute('value')==Setting.settingData.noticeDDay) ? item.innerText : dropbtnContent.textContent;
        break;
      case 1:
        dropbtnContent.textContent = (item.getAttribute('value')==Setting.settingData.crawlingPeriod) ? item.innerText : dropbtnContent.textContent;        break;
      case 2:
        dropbtnContent.textContent = Setting.settingData.mymajor;
        break;
    }
  });
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

        //선택한 항목 스토리지에 저장
        StoreSetting();

        // 메뉴 닫기
        item.closest('.dropdown-content').style.display = 'none';
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

async function updateToggleValues(){
  const toggleSwitch = document.getElementById('toggleSwitch');
  const Setting = await localStorageGet("settingData");

  // 초기 상태 반영.
  if (Setting.settingData.modalOnOff == 1) {
    toggleSwitch.checked = true;
  } else {
    toggleSwitch.checked = false;
  }

  // 토글 스위치 클릭 시 value 값 변경
  toggleSwitch.addEventListener('change', () => {
    toggleSwitch.value = toggleSwitch.checked ? '1' : '0';
    StoreSetting()
  });
}

function StoreSetting() {
  var modalValue = document.querySelector('#ModalSetting input[type="checkbox"]').checked ? 1 : 0;
  var ddayValue = document.querySelector('#D-daySetting .Selected').getAttribute('value');
  var crawlingValue = document.querySelector('#CrawlingSetting .Selected').getAttribute('value');
  var majorValue = document.querySelector('#MajorSetting .Selected').textContent;

  // const SettingData = {
  //   ModalOnOff: modalValue,
  //   NoticeDDay: ddayValue,
  //   CrawlingPeriod: crawlingValue,
  //   MyMajor: majorValue
  // };

  localStorageSet({settingData(modalValue, ddayValue, crawlingValue, majorValue)});
}

fetchAndRender();
tabEventListener();
updateToggleValues();
dropDownList();
majorNoticesToggle();

(async () => {
  // 차후 설정한 주기 시간으로 변경
  await chrome.runtime.sendMessage({ time: 1 });
})();

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'crawlingPeriod') {
    fetchAndRender();
    alert('새로운 데이터가 업데이트 되었습니다!');
  }
});
