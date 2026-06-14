'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const changelogPath = path.join(root, 'js', 'changelog.js');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Invalid semver in package.json: ${version}`);
  process.exit(1);
}

let content = fs.readFileSync(changelogPath, 'utf8');

content = content.replace(
  /export const APP_VERSION = '[^']*';/,
  `export const APP_VERSION = '${version}';`,
);

const topVersionMatch = content.match(
  /export const CHANGELOG = \[\s*\{\s*version:\s*'([^']+)'/,
);

if (!topVersionMatch) {
  console.error('Could not parse CHANGELOG in js/changelog.js');
  process.exit(1);
}

const topVersion = topVersionMatch[1];
if (topVersion !== version) {
  const today = new Date().toISOString().slice(0, 10);
  const newEntry = `  {
    version: '${version}',
    date: '${today}',
    changes: [
      '（更新内容を記入してください）',
    ],
  },
`;
  content = content.replace(
    /export const CHANGELOG = \[\n/,
    `export const CHANGELOG = [\n${newEntry}`,
  );
}

fs.writeFileSync(changelogPath, content, 'utf8');
console.log(`Synced version ${version} to js/changelog.js`);
