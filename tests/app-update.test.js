import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseAppVersion } from '../js/app-update.js';

describe('parseAppVersion', () => {
  it('reads APP_VERSION from changelog module source', () => {
    const source = "export const APP_VERSION = '1.2.0';\nexport const CHANGELOG = [];";
    assert.equal(parseAppVersion(source), '1.2.0');
  });

  it('returns null when version is missing', () => {
    assert.equal(parseAppVersion('export const CHANGELOG = [];'), null);
  });
});
