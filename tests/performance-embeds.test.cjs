const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const source = readFileSync(path.join(root, 'performance-detail.js'), 'utf8');
const collection = readFileSync(path.join(root, 'performances.html'), 'utf8');
const ids = [...new Set([...collection.matchAll(/performance\.html\?id=([A-Za-z0-9]+)/g)].map(match => match[1]))];

const devices = [
  { name: 'macOS Safari', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', maxTouchPoints: 0, ios: false },
  { name: 'desktop Chrome', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36', maxTouchPoints: 0, ios: false },
  { name: 'Windows touchscreen', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36', maxTouchPoints: 10, ios: false },
  { name: 'iPhone Safari', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1', maxTouchPoints: 5, ios: true },
  { name: 'iPhone Chrome', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/138.0.0.0 Mobile/15E148 Safari/604.1', maxTouchPoints: 5, ios: true },
  { name: 'iPad mobile mode', userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1', maxTouchPoints: 5, ios: true },
  { name: 'iPad desktop mode', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', maxTouchPoints: 5, ios: true },
  { name: 'Android Chrome', userAgent: 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/138.0.0.0 Mobile Safari/537.36', maxTouchPoints: 5, ios: false }
];

function renderDetail(id, language = 'en', device = devices[0], width = 1440) {
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
    innerWidth: width,
    location: { search: `?id=${encodeURIComponent(id)}` },
    addEventListener: (name, handler) => listeners.set(name, handler)
  };
  vm.runInNewContext(source, { document, window, navigator: device, URLSearchParams });
  return { mount, document, switchLanguage(lang) {
    document.documentElement.lang = lang;
    listeners.get('zilin-language-change')();
  } };
}

function assertPlayer(html, id, ios) {
  const frames = [...html.matchAll(/<iframe\b[^>]*>/g)];
  assert.equal(frames.length, 1);
  const frame = frames[0][0];
  const url = new URL(frame.match(/src="([^"]+)"/)[1].replaceAll('&amp;', '&'));
  assert.equal(url.origin, ios ? 'https://www.bilibili.com' : 'https://player.bilibili.com');
  assert.equal(url.pathname, ios ? '/blackboard/html5mobileplayer.html' : '/player.html');
  assert.equal(url.searchParams.get('bvid'), id);
  assert.equal(url.searchParams.get(ios ? 'p' : 'page'), '1');
  assert.equal(url.searchParams.get('danmaku'), '0');
  if (ios) assert.equal(url.searchParams.has('autoplay'), false);
  else {
    assert.equal(url.searchParams.get('autoplay'), '0');
    assert.equal(url.searchParams.get('high_quality'), '1');
  }
  assert.match(frame, /referrerpolicy="strict-origin-when-cross-origin"/);
  assert.match(html, /class="performance-video-frame"/);
  assert.doesNotMatch(html, /class="performance-video section-shell reveal"/);
  assert.ok(html.includes(`href="https://www.bilibili.com/video/${id}/"`));
}

for (const device of devices) test(`${device.name}: all 15 recordings use the right player in both languages`, () => {
  assert.equal(ids.length, 15);
  for (const id of ids) {
    for (const language of ['en', 'zh-CN']) {
      const page = renderDetail(id, language, device);
      assertPlayer(page.mount.innerHTML, id, device.ios);
      page.switchLanguage(language === 'en' ? 'zh-CN' : 'en');
      assertPlayer(page.mount.innerHTML, id, device.ios);
      assert.ok(page.mount.visibleSections > 0);
      page.switchLanguage(language);
      assertPlayer(page.mount.innerHTML, id, device.ios);
      assert.match(page.mount.innerHTML, language === 'en' ? /Programme note/ : /曲目介绍/);
    }
  }
});

test('narrow desktop windows still use the desktop player', () => {
  const page = renderDetail(ids[0], 'en', devices[0], 390);
  assertPlayer(page.mount.innerHTML, ids[0], false);
});

test('invalid video IDs do not create an iframe', () => {
  const page = renderDetail('<invalid>');
  assert.doesNotMatch(page.mount.innerHTML, /<iframe/);
  assert.match(page.mount.innerHTML, /could not be found/);
});
