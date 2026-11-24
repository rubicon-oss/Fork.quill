#!/usr/bin/env node
/* Builds dist/. Written in Node rather than shell so it runs on Windows without WSL or Git Bash. */

const { execSync } = require('child_process');
const {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
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

// Single-file build for hosts without a bundler. The extensions' UMD dists take Quill from the
// global and resize.js self-registers on load, so they must be concatenated after Quill rather
// than bundled through webpack, which would run them before the global exists.
const concat = (out, parts) =>
  writeFileSync(
    join(bundles, out),
    parts.map((part) => readFileSync(part, 'utf8')).join('\n'),
  );

concat('quill.full.js', [
  join(bundles, 'quill.js'),
  require.resolve('quill-resize-module'),
  require.resolve('quill-table-better'),
]);

concat('quill.full.css', [
  join(bundles, 'quill.snow.css'),
  require.resolve('quill-resize-module/dist/resize.css'),
  require.resolve('quill-table-better/dist/quill-table-better.css'),
]);

const full = readFileSync(join(bundles, 'quill.full.js'), 'utf8');

// Browsers honour the last sourceMappingURL, so Quill's inline map is only correct while it is
// the only one and Quill's code is still at the top of the file.
if ((full.match(/sourceMappingURL/g) || []).length > 1)
  throw new Error('quill.full.js has more than one source map');

for (const global of ['QuillResize', 'QuillTableBetter'])
  if (!full.includes(global)) throw new Error(`quill.full.js is missing ${global}`);

for (const file of ['package.json', 'README.md', 'LICENSE'])
  cpSync(file, join(DIST, file));
