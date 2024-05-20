/* eslint-disable no-param-reassign */
import { localStorageSet } from './storage.js';

export default function preprocessAndUpload(schedules, majorNotices) {
  const fixedNotices = [];
  const nonfixedNotices = [];

  schedules.forEach((schedule) => {
    const sDay = schedule.duration.substr(0, 10);
    const eDay = schedule.duration.substr(17, 10);
    schedule.startDay = sDay;
    schedule.endDay = eDay;
  });

  majorNotices.forEach((notice) => {
    if (notice.articleTitle.startsWith('[ 일반공지 ]')) {
      fixedNotices.push(notice);
    } else nonfixedNotices.push(notice);
  });

  localStorageSet({ schedules, fixedNotices, nonfixedNotices });
}
