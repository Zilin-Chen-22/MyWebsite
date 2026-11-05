const { readFileSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const { runInNewContext } = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');
test('every legacy entry preserves path, query and fragment on the root domain', () => {
  const files = execFileSync('git', ['ls-files', '*.html'], {encoding: 'utf8'}).trim().split('\n');
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    let result;
    runInNewContext(html.match(/<script>(.*?)<\/script>/s)[1], {
      location: {search: '?id=BV1Nu411e74Z', hash: '#video', replace: url => result = url}
    });
    const target = 'https://zilin-chen-22.github.io/' + (file === 'index.html' ? '' : file);
    assert.equal(result, target + '?id=BV1Nu411e74Z#video');
    assert.ok(html.includes('content="0;url=' + target + '"'));
  }
});
