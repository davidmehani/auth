// build.js
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const handlersDir = path.join(__dirname, 'src', 'handlers');
const distDir = path.join(__dirname, 'dist');
const zipsDir = path.join(distDir, 'zips');

// Clean dist folder
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir);
fs.mkdirSync(zipsDir);

const handlers = fs.readdirSync(handlersDir).filter(name => {
  const fullPath = path.join(handlersDir, name, 'index.ts');
  return fs.existsSync(fullPath);
});

handlers.forEach(handler => {
  const entryFile = path.join(handlersDir, handler, 'index.ts');
  const outDir = path.join(distDir, handler);

  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Building ${handler}...`);

  esbuild.buildSync({
    entryPoints: [entryFile],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(outDir, 'index.js'),
    minify: true,
    sourcemap: true,
    external: ['aws-sdk'],
  });

  // Zip the handler into dist/zips
  const zipFile = path.join(zipsDir, `${handler}.zip`);
  execSync(`cd ${distDir} && zip -r ${zipFile} ${handler}`);
  console.log(`${zipFile} created`);
});

console.log('All handlers built and zipped!');
