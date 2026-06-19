import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  detectInstallPlatform,
  getInstallHelp,
  isStandaloneApp,
  shouldShowInstallLink,
} from '../js/pwa-install.js';

describe('detectInstallPlatform', () => {
  it('detects iOS', () => {
    assert.equal(detectInstallPlatform({ userAgent: 'iPhone', maxTouchPoints: 5, platform: 'iPhone' }), 'ios');
  });

  it('detects Android', () => {
    assert.equal(detectInstallPlatform({ userAgent: 'Android 14', maxTouchPoints: 5, platform: 'Linux' }), 'android');
  });

  it('falls back to desktop', () => {
    assert.equal(detectInstallPlatform({ userAgent: 'Windows NT', maxTouchPoints: 0, platform: 'Win32' }), 'desktop');
  });
});

describe('install link visibility', () => {
  it('hides when already installed', () => {
    assert.equal(shouldShowInstallLink({ displayModeStandalone: true, navigatorStandalone: false }), false);
  });

  it('shows in browser', () => {
    assert.equal(shouldShowInstallLink({ displayModeStandalone: false, navigatorStandalone: false }), true);
  });
});

describe('getInstallHelp', () => {
  it('returns platform-specific steps', () => {
    const help = getInstallHelp({ userAgent: 'iPhone', maxTouchPoints: 5, platform: 'iPhone' });
    assert.match(help.title, /iPhone/);
    assert.ok(help.steps.length >= 2);
  });
});
