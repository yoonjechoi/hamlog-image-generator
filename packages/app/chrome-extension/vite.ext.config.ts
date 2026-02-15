import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import webExtension from '@samrum/vite-plugin-web-extension';

type ExtensionManifest = chrome.runtime.ManifestV3;

const manifestPath = resolve(__dirname, 'src/manifest.json');
const baseManifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as ExtensionManifest;

if (!baseManifest.content_scripts || baseManifest.content_scripts.length === 0) {
  throw new Error('Manifest must include at least one content script entry.');
}

const manifest: ExtensionManifest = {
  ...baseManifest,
  background: {
    ...(baseManifest.background ?? {}),
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: baseManifest.content_scripts.map((contentScript, index) =>
    index === 0 ? { ...contentScript, js: ['src/content-script.ts'] } : contentScript
  ),
  action: {
    ...(baseManifest.action ?? {}),
  },
  side_panel: {
    default_path: 'src/sidepanel/sidepanel.html',
  },
};

interface BundleOutputOptions {
  dir?: string;
}

function normalizeExtensionOutput() {
  return {
    name: 'normalize-extension-output',
    apply: 'build',
    writeBundle(outputOptions: BundleOutputOptions) {
      const outputDirName = typeof outputOptions.dir === 'string' ? outputOptions.dir : 'dist-ext';
      const outputDir = resolve(__dirname, outputDirName);
      const outputManifestPath = resolve(outputDir, 'manifest.json');
      const outputManifest = JSON.parse(readFileSync(outputManifestPath, 'utf-8')) as ExtensionManifest;

      const outputBackgroundPath = outputManifest.background?.service_worker;
      if (typeof outputBackgroundPath === 'string') {
        const sourcePath = resolve(outputDir, outputBackgroundPath);
        if (existsSync(sourcePath)) {
          const backgroundSource = readFileSync(sourcePath, 'utf-8').replace(/"\/assets\//g, '"./assets/');
          writeFileSync(resolve(outputDir, 'background.js'), backgroundSource);
        }

        if (outputManifest.background) {
          outputManifest.background.service_worker = 'background.js';
        }
      }

      const outputContentScriptPath = outputManifest.content_scripts?.[0]?.js?.[0];
      if (typeof outputContentScriptPath === 'string') {
        const sourcePath = resolve(outputDir, outputContentScriptPath);
        if (existsSync(sourcePath)) {
          copyFileSync(sourcePath, resolve(outputDir, 'content-script.js'));
        }

        if (outputManifest.content_scripts?.[0]?.js) {
          outputManifest.content_scripts[0].js = ['content-script.js'];
        }
      }

      const sidePanelPath = (outputManifest as Record<string, unknown>).side_panel as { default_path?: string } | undefined;
      const outputSidePanelPath = sidePanelPath?.default_path;
      if (typeof outputSidePanelPath === 'string') {
        const sourcePath = resolve(outputDir, outputSidePanelPath);
        if (existsSync(sourcePath)) {
          const sidepanelSource = readFileSync(sourcePath, 'utf-8');
          const scriptTagMatch = sidepanelSource.match(
            /<script\s+type="module"[^>]*src="([^"]+)"[^>]*><\/script>/
          );

          if (scriptTagMatch?.[1]) {
            const generatedScriptPath = scriptTagMatch[1].replace(/^\//, '');
            writeFileSync(
              resolve(outputDir, 'sidepanel.js'),
              `import './${generatedScriptPath}';\n`
            );
            writeFileSync(
              resolve(outputDir, 'sidepanel.html'),
              sidepanelSource.replace(scriptTagMatch[0], '<script type="module" src="./sidepanel.js"></script>')
            );
          } else {
            writeFileSync(resolve(outputDir, 'sidepanel.html'), sidepanelSource);
          }
        }

        if (sidePanelPath) {
          sidePanelPath.default_path = 'sidepanel.html';
        }
      }

      writeFileSync(outputManifestPath, `${JSON.stringify(outputManifest, null, 2)}\n`);
    },
  };
}

export default {
  root: __dirname,
  publicDir: resolve(__dirname, 'asset'),
  plugins: [webExtension({ manifest }), normalizeExtensionOutput()],
  resolve: {
    alias: {
      '@hamlog/gemini-client': resolve(__dirname, '../../lib/gemini-client/src/index.ts'),
      '@hamlog/core': resolve(__dirname, '../../lib/core/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist-ext',
    emptyOutDir: true,
  },
};
