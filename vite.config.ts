/// <reference types="vitest/config" />
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { defineConfig } from 'vite';
import { EXPORTS } from "./exports";

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export const ENTRIES = Object.fromEntries(
    Object.entries(EXPORTS).map(([key, value]) => [key, path.resolve(dirname, `src/${value}/index.ts`)]),
);

// Preserves a .d.ts alongside every source file so buildPackage.ts can point
// each component's subpath export at its own declaration file.
const dtsOptions = {
    exclude: ["src/stories/**/*", "src/**/*.stories.*", "src/**/*.mdx", "scripts/**/*"],
    insertTypesEntry: true,
    entryRoot: "src",
};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    plugins: [react(), tailwindcss(), dts(dtsOptions), libInjectCss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        copyPublicDir: false,
        lib: {
            entry: ENTRIES,
            name: "Chadwick",
            formats: ["es"],
        },
        rollupOptions: {
            // Externalize dependencies that should not be bundled
            external: [
                "react",
                "react-dom",
                "react/jsx-runtime",
                "cn",
                "class-variance-authority",
                "@base-ui/react",
                /^@base-ui\/react(\/.*)?$/,
                /^lucide-react(\/.*)?$/,
            ],
            output: {
                // preserveModulesRoot: "." makes [name] the full relative path minus extension, so a
                // component's .css import (same basename, same dir, e.g. Button/Button.css) resolves
                // to the same chunk name as Button/Button.tsx (and matches vite-plugin-dts's declaration
                // output, which also mirrors the full src/ path into dist/). Give style-derived chunks a
                // distinct suffix so Rollup never has to dedupe-rename the real component chunk.
                entryFileNames: (chunkInfo) => {
                    const isStyleModule = /\.css$/.test(chunkInfo.facadeModuleId ?? "");
                    return isStyleModule ? "[name].style.esm.js" : "[name].esm.js";
                },
                preserveModules: true,
                preserveModulesRoot: ".",
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
    },
    test: {
        projects: [
            {
                extends: true,
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, ".storybook"),
                    }),
                ],
                test: {
                    name: "storybook",
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        instances: [
                            {
                                browser: "chromium",
                            },
                        ],
                    },
                },
            },
        ],
    },
});
