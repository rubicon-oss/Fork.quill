# Overquill

`@actanova/overquill` is the Acta Nova fork of [Quill](https://quilljs.com/) 2.0.3.

It is Quill plus two bundled extensions, so a host without a bundler needs one script and one
stylesheet instead of three of each:

- `dist/quill.full.js` — Quill, [quill-resize-module](https://github.com/mudoo/quill-resize-module)
  and [quill-table-better](https://github.com/attoae/quill-table-better)
- `dist/quill.full.css` — the snow theme plus both extensions' styles

Load `quill.full.js` and the extensions register themselves against the global `Quill`, exactly as
they do when loaded as separate scripts. `quill-table-better` still has to be registered by hand:

```js
Quill.register({ 'modules/table-better': window.QuillTableBetter }, true);
```

The unbundled `dist/quill.js`, the core build and the individual theme stylesheets are published
unchanged, so nothing that used them needs to move.

For the editor's own API and documentation, see [quilljs.com](https://quilljs.com/).
