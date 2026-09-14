const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const test = require('node:test');

const calendar = readFileSync('calendar.html', 'utf8');
const home = readFileSync('index.html', 'utf8');
const translations = readFileSync('i18n.js', 'utf8');
const pages = readdirSync('.').filter(file => file.endsWith('.html') && file !== 'performance-embed-test.html')
  .concat(readdirSync('projects').filter(file => file.endsWith('.html')).map(file => `projects/${file}`));

test('calendar page embeds the canonical public Outlook view and has a direct fallback', () => {
  assert.match(calendar, /<body data-page="calendar">/);
  assert.match(calendar, /<iframe[^>]+outlook\.live\.com\/calendar\/published\//);
  assert.match(calendar, /<a[^>]+outlook\.live\.com\/owa\/calendar\//);
  assert.match(calendar, /read-only Outlook calendar/);
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
  ['日历', '忙闲日历', '当前忙闲情况', '在 Outlook 中打开', '公开的空闲与忙碌时间']
    .forEach(value => assert.ok(translations.includes(value), `missing translation: ${value}`));
});
