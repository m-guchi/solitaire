import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

const swPath = path.join(root, 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
swContent = swContent.replace(
  /const CACHE_VERSION = '[^']*';/,
  `const CACHE_VERSION = '${version}';`,
);
swContent = swContent.replace(
  /'\.\/styles\.css\?v=[^']*'/,
  `'./styles.css?v=${version}'`,
);
swContent = swContent.replace(
  /'\.\/js\/game\.js\?v=[^']*'/,
  `'./js/game.js?v=${version}'`,
);
fs.writeFileSync(swPath, swContent, 'utf8');

const indexPath = path.join(root, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent.replace(
  /assetUrl\('js\/game\.js\?v=[^']+'\)/,
  `assetUrl('js/game.js?v=${version}')`,
);
indexContent = indexContent.replace(
  /assetUrl\('styles\.css\?v=[^']+'\)/,
  `assetUrl('styles.css?v=${version}')`,
);
fs.writeFileSync(indexPath, indexContent, 'utf8');

console.log(`Synced version ${version} to js/changelog.js`);
