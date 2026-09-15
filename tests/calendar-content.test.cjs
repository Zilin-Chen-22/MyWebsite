const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const test = require('node:test');

const calendar = readFileSync('calendar.html', 'utf8');
const home = readFileSync('index.html', 'utf8');
const translations = readFileSync('i18n.js', 'utf8');
const calendarScript = readFileSync('cal-embed.js', 'utf8');
const pages = readdirSync('.').filter(file => file.endsWith('.html') && file !== 'performance-embed-test.html')
  .concat(readdirSync('projects').filter(file => file.endsWith('.html')).map(file => `projects/${file}`));

test('calendar page embeds the public Cal.com profile with a direct fallback', () => {
  assert.match(calendar, /<body data-page="calendar">/);
  assert.match(calendar, /id="cal-booker"/);
  assert.equal((calendar.match(/data-cal-option=/g) || []).length, 3);
  assert.match(calendar, /href="https:\/\/cal\.com\/chenzili22"/);
  assert.doesNotMatch(calendar, /outlook\.live\.com/);
  assert.match(calendar, /no account required/);
  assert.match(calendarScript, /calLink: 'chenzili22\/15min'/);
  assert.match(calendarScript, /calLink: 'chenzili22\/30min'/);
  assert.match(calendarScript, /15min-%E5%A4%8D%E5%88%B6/);
  assert.match(calendarScript, /https:\/\/app\.cal\.com\/embed\/embed\.js/);
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
  ['日历', '预约时间', '选择会议', '无需注册账户', '自定义时长会议']
    .forEach(value => assert.ok(translations.includes(value), `missing translation: ${value}`));
});

test('meeting duration controls open detailed inline calendars', () => {
  assert.match(calendarScript, /activate\('meeting15'\)/);
  assert.match(calendarScript, /role', 'tabpanel'/);
  assert.match(calendarScript, /config: \{ layout: 'month_view', theme: theme\(\) \}/);
  assert.match(calendarScript, /button\.addEventListener\('click'/);
});

test('Cal.com embed follows the site light and dark themes', () => {
  assert.match(calendarScript, /cssVarsPerTheme/);
  assert.match(calendarScript, /'cal-brand': '#1e654e'/);
  assert.match(calendarScript, /'cal-brand': '#71b79b'/);
  assert.match(calendarScript, /zilin-theme-change/);
});
