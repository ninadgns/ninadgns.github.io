import * as esbuild from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../3d');
const serve = process.argv.includes('--serve');

await mkdir(out, { recursive: true });
await rm(resolve(out, 'bundle.js'), { force: true });
await rm(resolve(out, 'bundle.css'), { force: true });

const options = {
  entryPoints: [resolve(here, 'src/main.js')],
  bundle: true,
  format: 'esm',
  target: ['es2020'],
  outfile: resolve(out, 'bundle.js'),
  minify: !serve,
  sourcemap: serve,
  legalComments: 'none',
  loader: { '.css': 'css' },
};

await cp(resolve(here, 'index.html'), resolve(out, 'index.html'));

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { host, port } = await ctx.serve({ servedir: out });
  console.log(`dev server: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
} else {
  await esbuild.build(options);
  console.log('built -> 3d/');
}
