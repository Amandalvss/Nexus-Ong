// scripts/build-js.js
// Bundles and minifies JS using esbuild API
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const outdir = path.resolve(__dirname, '..', 'dist', 'js');
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

esbuild.build({
  entryPoints: [path.resolve(__dirname, '..', 'js', 'main.js')],
  bundle: true,
  format: 'esm',
  minify: true,
  sourcemap: false,
  target: ['es2018'],
  outfile: path.join(outdir, 'bundle.js')
}).then(() => {
  console.log('JS bundle written to', path.join('dist', 'js', 'bundle.js'));
}).catch(err => {
  console.error(err);
  process.exit(1);
});
