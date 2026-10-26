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
  assert.match(calendar, /id="cal-inline-chenzili22"/);
  assert.match(calendar, /href="https:\/\/cal\.com\/chenzili22"/);
  assert.doesNotMatch(calendar, /outlook\.live\.com/);
  assert.match(calendar, /no account required/i);
  assert.match(calendarScript, /calLink: 'chenzili22'/);
  assert.match(calendarScript, /https:\/\/app\.cal\.com\/embed\/embed\.js/);
});

test('Calendar appears in every site navigation', () => {
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const prefix = page.startsWith('projects/') ? '../' : '';
    assert.ok(html.includes(`href="${prefix}calendar.html"`), `missing Calendar nav: ${page}`);
  }
  assert.match(home, /href="calendar\.html"/);
});

test('calendar interface has Chinese translations', () => {
  ['日历', '预约时间', '选择会议', '无需注册账户', '单独打开']
    .forEach(value => assert.ok(translations.includes(value), `missing translation: ${value}`));
});

test('Cal.com embed follows the site light and dark themes', () => {
  assert.match(calendarScript, /cssVarsPerTheme/);
  assert.match(calendarScript, /'cal-brand': '#404650'/);
  assert.match(calendarScript, /'cal-brand': '#b7bfcd'/);
  assert.match(calendarScript, /zilin-theme-change/);
});
