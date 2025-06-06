/// <reference types='vitest' />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import pages from 'react-generate-pages';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    const isDev = mode !== 'production';
    const isAnalyze = mode === 'analyze';

    // Load env file based on `mode` in the current directory
    const env = loadEnv(mode, process.cwd(), '');

    // List of problematic environment variables
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
        plugins: [react(), pages(), tailwindcss()],
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
        // },
        esbuild: {
            sourcemap: isDev,
        },
        define: {
            // Define process and process.env
            'process.env': Object.entries(env).reduce((prev, [key, val]) => {
                return {
                    ...prev,
                    [key]: val,
                };
            }, {}),
            'process.env.VITE_APPWRITE_PROJECT_ID': JSON.stringify(env.VITE_APPWRITE_PROJECT_ID),
            'process.env.VITE_APPWRITE_ENDPOINT': JSON.stringify(env.VITE_APPWRITE_ENDPOINT),
        },
        // Uncomment this if you are using workers.
        // worker: {
        //  plugins: [ nxViteTsPaths() ],
        // },
        build: {
            outDir: './dist',
            emptyOutDir: true,
            reportCompressedSize: true,
            commonjsOptions: {
                transformMixedEsModules: true,
            },
        },
    };
});
