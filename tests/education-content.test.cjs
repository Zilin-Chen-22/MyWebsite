const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');

const education = readFileSync('education.html', 'utf8');
const about = readFileSync('about.html', 'utf8');
const home = readFileSync('index.html', 'utf8');
const translations = readFileSync('i18n.js', 'utf8');

test('incoming HKU PhD is complete and presented before earlier education', () => {
  const required = [
    'The University of Hong Kong', 'Department of Mechanical Engineering · Hong Kong',
    'Incoming Doctoral Study', 'Doctor of Philosophy (4-year PhD)', 'Autonomous UAVs',
    'Peng Lu', 'Full-time', '2026.11', '2030.10'
  ];
  required.forEach(value => assert.ok(education.includes(value), `missing: ${value}`));
  assert.ok(education.indexOf('<h2>The University of Hong Kong</h2>') < education.indexOf('<h2>Tsinghua University</h2>'));
  assert.doesNotMatch(education, /Probationary|N\/A/);
  assert.doesNotMatch(education, /<span>Registration<\/span>|<span>Expected completion<\/span>|1 November 2026|31 October 2030/);
});

test('HKU education is reflected in About, Home, and Chinese translations', () => {
  assert.match(about, /incoming PhD student|begin full-time PhD study/i);
  assert.match(home, /Hong Kong, Tsinghua &amp; Toronto/);
  const chinese = ['香港大学', '机械工程系 · 香港', '自主无人机', '鲁鹏', '全日制', '2026 年 11 月'];
  chinese.forEach(value => assert.ok(translations.includes(value), `missing translation: ${value}`));
});
