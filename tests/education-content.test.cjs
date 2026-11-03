const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const test = require('node:test');
const { execFileSync } = require('node:child_process');

const education = readFileSync('education.html', 'utf8');
const about = readFileSync('about.html', 'utf8');
const home = readFileSync('index.html', 'utf8');
const translations = readFileSync('i18n.js', 'utf8');

test('all published text sources are free of obsolete current-affiliation claims', () => {
  const files = execFileSync('git', ['ls-files', '*.html', '*.js'], {encoding: 'utf8'}).trim().split('\n');
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /I am a mechanical engineering student at Tsinghua|Zilin Chen is a robotics and control researcher at Tsinghua|Zilin Chen is a decision and planning algorithm engineer in Beijing|I work as a decision and planning algorithm engineer|目前在北京可以科技|即将赴香港大学|PhD Student student|Jul 2026[–-]present|2026\.07 — Present/, file);
  }
});

test('enrolled HKU PhD is complete and presented before earlier education', () => {
  const required = [
    'The University of Hong Kong', 'Department of Mechanical Engineering · Hong Kong',
    'Doctoral Study', 'Doctor of Philosophy (4-year PhD)', 'Autonomous UAVs',
    'Peng Lu', 'Full-time', '2026.11', '2030.10'
  ];
  required.forEach(value => assert.ok(education.includes(value), `missing: ${value}`));
  assert.ok(education.indexOf('<h2>The University of Hong Kong</h2>') < education.indexOf('<h2>Tsinghua University</h2>'));
  assert.doesNotMatch(education, /Probationary|N\/A/);
  assert.doesNotMatch(education, /<span>Registration<\/span>|<span>Expected completion<\/span>|1 November 2026|31 October 2030/);
});

test('current affiliation is ArcLab, not a current Keyi position', () => {
  const portfolio = readFileSync('portfolio.js', 'utf8');
  for (const source of [home, about, portfolio]) {
    assert.match(source, /ArcLab/);
    assert.match(source, /https:\/\/arclab.hku.hk\//);
    assert.doesNotMatch(source, /I work as a decision|目前在北京可以科技|Keyi Technology · Jul 2026–present|2026\.07 — Present/);
  }
  assert.match(about, /previously worked/);
  assert.match(translations, /此前，我在北京可以科技/);
  assert.match(education, /I joined ArcLab/);
});

test('HKU education is reflected in About, Home, and Chinese translations', () => {
  assert.match(about, /PhD student|began full-time PhD study/i);
  assert.match(home, /PhD student/i);
  assert.match(home, /University of Hong Kong/);
  const chinese = ['香港大学', '机械工程系 · 香港', '自主无人机', '鲁鹏', '全日制', '2026 年 11 月'];
  chinese.forEach(value => assert.ok(translations.includes(value), `missing translation: ${value}`));
});
