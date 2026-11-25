#!/usr/bin/env node
/* Builds dist/. Written in Node rather than shell so it runs on Windows without WSL or Git Bash. */

const { execSync } = require('child_process');
const {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} = require('fs');
const { join } = require('path');
const { tmpdir } = require('os');

const mode = process.argv[2];
const DIST = 'dist';
const run = (command) => execSync(command, { stdio: 'inherit' });

const declarations = mkdtempSync(join(tmpdir(), 'quill-'));
run(`npx tsc --declaration --emitDeclarationOnly --outDir "${declarations}"`);

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST);
// Copied rather than moved: the system temp dir is often on another volume, which rename cannot cross.
cpSync(join(declarations, 'src'), DIST, { recursive: true });
rmSync(declarations, { recursive: true, force: true });

run(
  `npx babel src --out-dir ${DIST} --copy-files --no-copy-ignored --extensions .ts --source-maps inline`,
);
run(`npx webpack -- --mode ${mode}`);

const bundles = join(DIST, 'dist');

// https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
for (const file of readdirSync(bundles))
  if (file.includes('.css.js')) rmSync(join(bundles, file));

for (const file of ['package.json', 'README.md', 'LICENSE'])
  cpSync(file, join(DIST, file));
