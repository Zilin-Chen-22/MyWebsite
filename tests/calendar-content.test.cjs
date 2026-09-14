const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const test = require('node:test');
const { buildCalendarData } = require('../scripts/build-calendar-data.cjs');

const calendar = readFileSync('calendar.html', 'utf8');
const home = readFileSync('index.html', 'utf8');
const translations = readFileSync('i18n.js', 'utf8');
const calendarScript = readFileSync('calendar.js', 'utf8');
const calendarData = JSON.parse(readFileSync('assets/data/calendar.json', 'utf8'));
const pages = readdirSync('.').filter(file => file.endsWith('.html') && file !== 'performance-embed-test.html')
  .concat(readdirSync('projects').filter(file => file.endsWith('.html')).map(file => `projects/${file}`));

test('calendar page uses a native anonymous view instead of the Outlook sign-in flow', () => {
  assert.match(calendar, /<body data-page="calendar">/);
  assert.doesNotMatch(calendar, /<iframe/);
  assert.doesNotMatch(calendar, /href="https:\/\/outlook\.live\.com/);
  assert.match(calendar, /id="calendar-grid"/);
  assert.match(calendar, /no Microsoft account or sign-in required/);
  assert.match(calendarScript, /assets\/data\/calendar\.json/);
});

test('Calendar appears in every site navigation and on the home rail', () => {
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const prefix = page.startsWith('projects/') ? '../' : '';
    assert.ok(html.includes(`data-nav="calendar" href="${prefix}calendar.html"`), `missing Calendar nav: ${page}`);
  }
  assert.match(home, /href="calendar\.html"><span>07<\/span><strong>Calendar<\/strong>/);
});

test('calendar interface has Chinese translations', () => {
  ['日历', '忙闲日历', '公开的忙碌时段', '无需 Microsoft 账户', '本月忙碌时段']
    .forEach(value => assert.ok(translations.includes(value), `missing translation: ${value}`));
});

test('published data contains only anonymous busy blocks', () => {
  assert.equal(calendarData.timeZone, 'Asia/Shanghai');
  assert.ok(Array.isArray(calendarData.events));
  for (const event of calendarData.events) {
    assert.deepEqual(Object.keys(event).sort(), ['allDay', 'end', 'start']);
  }
  const serialized = JSON.stringify(calendarData).toLowerCase();
  ['summary', 'location', 'attendee', 'organizer', 'description', 'uid'].forEach(field => assert.ok(!serialized.includes(field)));
});

test('calendar generator excludes transparent details and expands recurring busy times', () => {
  const fixture = `BEGIN:VCALENDAR
BEGIN:VTIMEZONE
TZID:China Standard Time
END:VTIMEZONE
BEGIN:VEVENT
DTSTART;TZID=China Standard Time:20260914T210000
DTEND;TZID=China Standard Time:20260914T213000
RRULE:FREQ=DAILY;COUNT=3
SUMMARY:Private meeting title
LOCATION:Private room
TRANSP:OPAQUE
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260916
DTEND;VALUE=DATE:20260917
SUMMARY:Free day
TRANSP:TRANSPARENT
END:VEVENT
END:VCALENDAR`;
  const result = buildCalendarData(fixture, new Date('2026-09-14T00:00:00Z'));
  assert.equal(result.events.length, 3);
  assert.equal(result.events[0].start, '2026-09-14T13:00:00.000Z');
  assert.equal(JSON.stringify(result).includes('Private'), false);
});
