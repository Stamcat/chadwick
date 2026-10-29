
export const EXPORTS = {
    Components: "components",
} as const;

export const PACKAGE_EXPORTS = {
    ".": {
        types: `./src/${EXPORTS.Components}/index.d.ts`,
        default: "./Components.esm.js",
    },
    "./styles/tokens": {
        default: "./src/styles/tokens.css",
    },
} as const;
