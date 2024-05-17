import { localStorageSet, localStorageGet } from '/scripts/storage.js';
import settingData from '/scripts/setting.js';

function renderPopup(schedules, fixedNotices, nonfixedNotices) {
  const scheduleList = document.getElementById('scheduleList');
  const noticeList = document.getElementById('noticeList');
  const majorNotices = fixedNotices.concat(nonfixedNotices);

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

    fixedNotices.forEach((notice) => {
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
  const { schedules = [], fixedNotices = [], nonfixedNotices = [] } = await localStorageGet(['schedules', 'fixedNotices', 'nonfixedNotices']);
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
  const Setting = await localStorageGet();

  listItems.forEach((item) => {
    switch(index){
      case 0:
        dropbtnContent.textContent = (item.getAttribute('value')==Setting.noticeDDay) ? item.innerText : dropbtnContent.textContent;
        break;
      case 1:
        dropbtnContent.textContent = (item.getAttribute('value')==Setting.crawlingPeriod) ? item.innerText : dropbtnContent.textContent;        break;
      case 2:
        dropbtnContent.textContent = Setting.mymajor;
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
  const Setting = await localStorageGet();

  // 초기 상태 반영.
  if (Setting.modalOnOff == true) {
    toggleSwitch.checked = true;
  } else {
    toggleSwitch.checked = false;
  }

  // 토글 스위치 클릭 시 value 값 변경
  toggleSwitch.addEventListener('change', () => {
    toggleSwitch.value = toggleSwitch.checked ? 'true' : 'false';
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

  localStorageSet(settingData(modalValue, ddayValue, crawlingValue, majorValue));
}

fetchAndRender();
tabEventListener();
updateToggleValues();
dropDownList();
majorNoticesToggle();

(async () => {
  let { modalOnOff, noticeDDay, crawlingPeriod, mymajor } = await chrome.storage.local.get([
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
  chrome.storage.onChanged.addListener(async (changes) => {
    if (changes.majorNotices || changes.schedules) {
      fetchAndRender();
    }
    ({ modalOnOff, noticeDDay, crawlingPeriod, mymajor } = await chrome.storage.local.get([
      'modalOnOff',
      'noticeDDay',
      'crawlingPeriod',
      'mymajor',
    ]));

    await chrome.runtime.sendMessage({
      modalOnOff,
      noticeDDay,
      crawlingPeriod,
      mymajor,
    });
  });
})();

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'crawlingPeriod') {
    // const schedules = await getSchedules();
    // const majorNotices = await getMajorNotices();
    // localStorageSet({ schedules, majorNotices });
    fetchAndRender();
  }
});

// setTimeout(
//   () =>
//     localStorageSet({
//       majorNotices: [
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1313281/artclView.do',
//           articleTitle: '[ 일반공지 ] [학과활동] 2024학년도 1학기 학과활동 안내(4/4 기준 업데이트)',
//           articleWriter: '정예랑',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1237068/artclView.do',
//           articleTitle: '[ 일반공지 ] [졸업] 2024년 8월 졸업(수료)예정자 졸업요건 서류 제출 안내: ~7.12.(금)',
//           articleWriter: '정예랑',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1135748/artclView.do',
//           articleTitle: '[ 일반공지 ] [중요] 부산대학교 영어 능력 졸업인증제도 시행 지침 안내(2024.5월 개정)',
//           articleWriter: '김지윤',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/972939/artclView.do',
//           articleTitle: '[ 일반공지 ] 타과생의 부전공/복수전공 교육과정 적용 안내',
//           articleWriter: '황유경',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/930641/artclView.do',
//           articleTitle: '[ 일반공지 ] ☆★ 코로나19 확진 시 가이드 ☆★',
//           articleWriter: '김지윤',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/813152/artclView.do',
//           articleTitle: '[ 일반공지 ] 타과생의 부전공 신청에 관한 안내',
//           articleWriter: '황유경',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/656247/artclView.do',
//           articleTitle: '[ 일반공지 ] 학생지원시스템 학생 개인정보 확인 및 수정 안내',
//           articleWriter: '유은화',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/408175/artclView.do',
//           articleTitle: '[ 일반공지 ] [필독] 학과 공지사항 안내',
//           articleWriter: '조교_유은화',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/407402/artclView.do',
//           articleTitle: '[ 일반공지 ] 학과활동인정 외부행사/세미나 안내',
//           articleWriter: '조교_김효경',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1532240/artclView.do',
//           articleTitle: '[소프트웨어융합교육원] 제3회 PNU Coding Challenge 개최 안내 새글',
//           articleWriter: '임현정',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1532175/artclView.do',
//           articleTitle: '2024학년도 제34기 부산대학교 산학협력해외봉사단 참가자 추가 모집 안내 새글',
//           articleWriter: '정예랑',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1532173/artclView.do',
//           articleTitle: '[교수학습지원센터] 2024-1학기 특강형 학습전략 프로그램 운영 안내 새글',
//           articleWriter: '정예랑',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1532137/artclView.do',
//           articleTitle: '2024 하나 소셜벤처 유니버시티 창업교육 프로그램 모집 안내 새글',
//           articleWriter: '정예랑',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1532133/artclView.do',
//           articleTitle: '[수업]2024학년도 여름계절수업 교류 수학 안내[성균관대학교] 새글',
//           articleWriter: '임현정',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1531881/artclView.do',
//           articleTitle: '[수업] 2024학년도 여름계절수업 교류 수학 안내[서강대, 울산과학기술원(UNIST), 새글',
//           articleWriter: '임현정',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1531832/artclView.do',
//           articleTitle: '[2024학년도 하계 해외도전과 체험] 수요자 중심 전공봉사팀 모집 안내 새글',
//           articleWriter: '정예랑',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1531726/artclView.do',
//           articleTitle: '[소프트웨어융합교육원] ICT학점연계 프로젝트인턴십 사업설명회 개최 안내 새글',
//           articleWriter: '배병주',
//         },
//         {
//           articleHref: 'https://cse.pusan.ac.kr/bbs/cse/2605/1523966/artclView.do',
//           articleTitle: '[장학] 2024 외국인 근로 선발 안내(~5/10)',
//           articleWriter: '정예랑',
//         },
//         {
//           articleHref: 'jiminiZZang',
//           articleTitle: '언톡 접수하겠다',
//           articleWriter: '임지민',
//         },
//       ],
//     }),
//   20000,
// );
