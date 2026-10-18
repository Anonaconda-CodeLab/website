# anonacondacodelab.com

The studio homepage of Anonaconda Code Lab: a single static page listing its apps.

- `index.html`: the page. To add an app, copy one `<li class="app">` block (newest at the top) and add its icon to `icons/`.
- `logo.svg`: the studio mark (also the browser icon). `spine.svg`: the snake that winds down the app list. `social/`: profile picture and banners.
- `_headers`: security headers for Netlify (strict Content Security Policy; the page makes no outside requests).
- Font: Instrument Sans, SIL Open Font License 1.1 (`fonts/OFL-InstrumentSans.txt`).

No build step. Deploy the repository root as-is.
