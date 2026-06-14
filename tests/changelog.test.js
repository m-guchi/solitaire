import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { APP_VERSION, CHANGELOG, formatChangelogDate } from '../js/changelog.js';

describe('formatChangelogDate', () => {
  it('formats ISO dates for display', () => {
    assert.equal(formatChangelogDate('2026-06-15'), '2026年6月15日');
    assert.equal(formatChangelogDate('invalid'), 'invalid');
  });
});

describe('version sync', () => {
  it('matches package.json version', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    assert.equal(APP_VERSION, pkg.version);
    assert.equal(CHANGELOG[0]?.version, pkg.version);
  });
});
