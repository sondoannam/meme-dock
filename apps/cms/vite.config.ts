/// <reference types='vitest' />
import react from '@vitejs/plugin-react';
import pages from 'react-generate-pages';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';
  const isAnalyze = mode === 'analyze';

  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '');

  // Remove environment variables that cause build issues on Windows systems
  // These variables contain special characters that interfere with Vite's environment processing
  const problematicEnvVars = [
    'CommonProgramFiles(x86)',
    'ProgramFiles(x86)',
    'IntelliJ IDEA Community Edition',
    'IntelliJ IDEA',
  ];

  // Remove the problematic environment variables
  problematicEnvVars.forEach((varName) => {
    delete process.env[varName];
  });

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/cms',
    server: {
      port: 5173,
      host: 'localhost',
    },
    preview: {
      port: 4300,
      host: 'localhost',
    },
    plugins: [react(), pages('./src/pages'), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ['react'],
    },
    // build: {
    //     commonjsOptions: {
    //         include: ['../../node_modules/'],
    //     },
    //     sourcemap: isAnalyze,
    // },        esbuild: false, // Disable esbuild since we're using SWC

    // Configure SWC for faster builds
    build: {
      minify: 'terser',
      sourcemap: isDev,
      outDir: './dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        treeshake: true,
      },
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev,
        },
      },
    },
    define: {
      // Define process and process.env
      'process.env': Object.fromEntries(Object.entries(env)),
      //   'process.env.VITE_APPWRITE_PROJECT_ID': JSON.stringify(env.VITE_APPWRITE_PROJECT_ID),
      //   'process.env.VITE_APPWRITE_ENDPOINT': JSON.stringify(env.VITE_APPWRITE_ENDPOINT),
    },
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },        // Build configuration is defined above
  };
});
