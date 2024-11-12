import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/cjs/index.cjs',
  format: 'cjs',
  platform: 'node',
  target: ['node14'],
  bundle: true,
});
