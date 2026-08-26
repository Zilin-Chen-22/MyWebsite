const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const source = readFileSync(path.join(root, 'performance-detail.js'), 'utf8');
const collection = readFileSync(path.join(root, 'performances.html'), 'utf8');
const ids = [...new Set([...collection.matchAll(/performance\.html\?id=([A-Za-z0-9]+)/g)].map(match => match[1]))];

function renderDetail(id, language = 'en') {
  const listeners = new Map();
  const mount = {
    innerHTML: '', visibleSections: 0,
    querySelectorAll(selector) {
      assert.equal(selector, '.reveal');
      return [{ classList: { add(value) {
        assert.equal(value, 'is-visible');
        mount.visibleSections += 1;
      } } }];
    }
  };
  const document = {
    documentElement: { lang: language }, title: '',
    querySelector: selector => selector === '#performance-detail' ? mount : null
  };
  const window = {
    location: { search: `?id=${encodeURIComponent(id)}` },
    addEventListener: (name, handler) => listeners.set(name, handler)
  };
  vm.runInNewContext(source, { document, window, URLSearchParams });
  return { mount, document, switchLanguage(lang) {
    document.documentElement.lang = lang;
    listeners.get('zilin-language-change')();
  } };
}

function assertPlayer(html, id) {
  const frames = [...html.matchAll(/<iframe\b[^>]*>/g)];
  assert.equal(frames.length, 1);
  const frame = frames[0][0];
  const url = new URL(frame.match(/src="([^"]+)"/)[1].replaceAll('&amp;', '&'));
  assert.equal(url.origin, 'https://www.bilibili.com');
  assert.equal(url.pathname, '/blackboard/html5mobileplayer.html');
  assert.equal(url.searchParams.get('bvid'), id);
  assert.equal(url.searchParams.get('p'), '1');
  assert.equal(url.searchParams.get('danmaku'), '0');
  assert.equal(url.searchParams.has('autoplay'), false);
  assert.match(frame, /referrerpolicy="strict-origin-when-cross-origin"/);
  assert.match(html, /class="performance-video-frame"/);
  assert.doesNotMatch(html, /class="performance-video section-shell reveal"/);
  assert.ok(html.includes(`href="https://www.bilibili.com/video/${id}/"`));
}

test('all 15 recordings keep inline players and bilingual content', () => {
  assert.equal(ids.length, 15);
  for (const id of ids) {
    for (const language of ['en', 'zh-CN']) {
      const page = renderDetail(id, language);
      assertPlayer(page.mount.innerHTML, id);
      page.switchLanguage(language === 'en' ? 'zh-CN' : 'en');
      assertPlayer(page.mount.innerHTML, id);
      assert.ok(page.mount.visibleSections > 0);
      page.switchLanguage(language);
      assertPlayer(page.mount.innerHTML, id);
      assert.match(page.mount.innerHTML, language === 'en' ? /Programme note/ : /曲目介绍/);
    }
  }
});

test('invalid video IDs do not create an iframe', () => {
  const page = renderDetail('<invalid>');
  assert.doesNotMatch(page.mount.innerHTML, /<iframe/);
  assert.match(page.mount.innerHTML, /could not be found/);
});
