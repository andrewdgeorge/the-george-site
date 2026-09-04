// Build the compiled dist/ the design-sync converter consumes:
//   dist/index.es.js  — ESM bundle, react/react-dom external (the converter provides them)
//   dist/styles.css   — tokens + fonts + component CSS (cfg.cssEntry)
import { build } from 'esbuild';
import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, 'dist');
mkdirSync(dist, { recursive: true });

await build({
  entryPoints: [resolve(__dirname, 'src/index.ts')],
  outfile: resolve(dist, 'index.es.js'),
  bundle: true,
  format: 'esm',
  target: 'es2020',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  logLevel: 'info',
});

// Assemble the single shipped stylesheet: fonts, then tokens, then components.
const styleDir = resolve(__dirname, 'src/styles');
const css = [
  readFileSync(resolve(styleDir, 'fonts.css'), 'utf8'),
  readFileSync(resolve(styleDir, 'tokens.css'), 'utf8'),
  readFileSync(resolve(styleDir, 'components.css'), 'utf8'),
].join('\n\n');
writeFileSync(resolve(dist, 'styles.css'), css);

console.log('✓ built dist/index.es.js + dist/styles.css');
