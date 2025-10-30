// scripts/build-html.js
// Minimal HTML minifier wrapper using html-minifier-terser
const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

const src = path.resolve(__dirname, '..', 'index.html');
const outdir = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

const html = fs.readFileSync(src, 'utf8');
minify(html, {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  minifyCSS: true,
  minifyJS: true
}).then(min => {
  fs.writeFileSync(path.join(outdir, 'index.html'), min, 'utf8');
  console.log('Minified HTML written to dist/index.html');
}).catch(err => {
  console.error('HTML minify error', err);
  process.exit(1);
});
