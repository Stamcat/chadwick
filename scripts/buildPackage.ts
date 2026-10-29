/* eslint-disable no-console */
import fse from "fs-extra";
import path from "path";
import { EXPORTS, PACKAGE_EXPORTS } from "../exports";

// DO NOT DELETE THIS FILE
// This file is used by build system to build a clean npm package with the
// compiled js files in the root of the package.
// It will not be included in the npm package.
const getComponentFolder = () => {
    return EXPORTS.Components;
};

const getIndexPath = (folder: string | undefined) => {
    if (!folder) {
        return undefined;
    }

    return path.join(process.cwd(), "src", folder, "index.ts");
};

// Captures both the exported name and its module path (e.g. "./atoms/Button/Button") rather than
// assuming a flat src/components/{Name}/{Name} layout, so nested folders (atoms/molecules/
// organisms) resolve to the right subpath export on their own. A single `from` clause may export
// multiple names across one or more lines — the first name is used as the subpath key (it must
// match the module's file name), since all names in the clause live in that same module and are
// reachable through that one subpath regardless.
const getExportsFromIndex = (indexPath: string | undefined) => {
    if (!indexPath || !fse.existsSync(indexPath)) {
        return [] as { name: string; relativePath: string }[];
    }

    const indexSource = fse.readFileSync(indexPath, "utf-8");
    const exportRegex = /export\s*\{\s*([^}]+?)\s*\}\s*from\s*["']\.\/([^"']+)["'];?/g;
    const exports: { name: string; relativePath: string }[] = [];
    let match: RegExpExecArray | null = exportRegex.exec(indexSource);

    while (match) {
        const [firstName] = match[1]
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean);
        if (firstName) {
            exports.push({ name: firstName, relativePath: match[2] });
        }
        match = exportRegex.exec(indexSource);
    }
    return exports;
};

const getComponentExports = () => getExportsFromIndex(getIndexPath(getComponentFolder()));

const createPackageJson = () => {
    const buildSubpathExports = (folder: string, components: { name: string; relativePath: string }[]) =>
        components.reduce<Record<string, { types: string; default: string }>>((acc, { name, relativePath }) => {
            acc[`./${name}`] = {
                types: `./src/${folder}/${relativePath}.d.ts`,
                default: `./src/${folder}/${relativePath}.esm.js`,
            };
            return acc;
        }, {});

    const buildExportsMap = (components: { name: string; relativePath: string }[]) => ({
        ...PACKAGE_EXPORTS,
        ...buildSubpathExports(getComponentFolder(), components),
    });

    // copy package file into destination folder
    const pkgSrc = path.join(process.cwd(), "package.json");
    const source = fse.readFileSync(pkgSrc).toString("utf-8");
    const sourceObj = JSON.parse(source);

    // keep publish guard script in dist package
    const prepublishOnly = sourceObj?.scripts?.prepublishOnly;
    sourceObj.scripts = prepublishOnly ? { prepublishOnly } : {};
    sourceObj.devDependencies = {};
    sourceObj.main = "./Components.esm.js";
    const componentsFolder = getComponentFolder();
    sourceObj.types = `./src/${componentsFolder}/index.d.ts`;
    const componentExports = getComponentExports();
    if (componentExports.length > 0) {
        sourceObj.exports = buildExportsMap(componentExports);
    } else {
        delete sourceObj.exports;
    }

    const pkgDest = path.join(process.cwd(), "dist", "package.json");
    console.log(`writing ${pkgSrc} to ${pkgDest}`);
    const pkgSrcBuffer = Buffer.from(JSON.stringify(sourceObj, null, 2), "utf-8");
    fse.writeFileSync(pkgDest, pkgSrcBuffer);

    console.log("package.json file created");
};
const copyFile = (name: string) => {
    const readmeSrc = path.join(process.cwd(), name);
    const readmeDest = path.join(process.cwd(), "dist", name);
    console.log(`writing ${readmeSrc} to ${readmeDest}`);

    const ignoreFile = fse.readFileSync(readmeSrc).toString("utf-8");
    const src = Buffer.from(ignoreFile, "utf-8");
    fse.writeFileSync(readmeDest, src as never);

    console.log("readme file created");
};
const copyPrepublishScript = () => {
    const scriptSrc = path.join(process.cwd(), "scripts", "prepublishCheck.js");
    const scriptDest = path.join(process.cwd(), "dist", "scripts", "prepublishCheck.js");

    if (!fse.existsSync(scriptSrc)) {
        console.log(`publish guard script not found: ${scriptSrc}`);
        return;
    }

    console.log(`writing ${scriptSrc} to ${scriptDest}`);
    fse.ensureDirSync(path.dirname(scriptDest));
    fse.copyFileSync(scriptSrc, scriptDest);
    console.log("publish guard script copied");
};
const createIgnoreFile = () => {
    const ignoreSrc = path.join(process.cwd(), ".npmignore");
    const ignoreDest = path.join(process.cwd(), "dist", ".npmignore");
    console.log(`writing ${ignoreSrc} to ${ignoreDest}`);

    const ignoreFile = fse.readFileSync(ignoreSrc).toString("utf-8");
    const src = Buffer.from(ignoreFile, "utf-8");
    fse.writeFileSync(ignoreDest, src);

    console.log("ignore file created");
};
// dirs never shipped in the published package (docs-only, not referenced by any export)
const SKIP_DIRS = [path.join("src", "stories")];

const fromDir = (startPath: string, filter: string) => {
    console.log("Starting from dir " + startPath + "/");

    if (!fse.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    if (SKIP_DIRS.includes(startPath)) {
        console.log("-- skipping: ", startPath);
        return;
    }

    const files = fse.readdirSync(startPath);
    for (const element of files) {
        const filename = path.join(startPath, element);
        const stat = fse.lstatSync(filename);
        if (stat.isDirectory()) {
            fromDir(filename, filter); //recurse
        } else if (filename.indexOf(filter) >= 0) {
            console.log("-- found: ", filename);
            const newPath = path.join(process.cwd(), "dist", filename);

            fse.copySync(filename, newPath);
        }
    }
};
const copyExtension = (filePath: string, arr: string[]) => {
    arr.forEach((ext) => {
        fromDir(filePath, ext);
    });
};

// Figma Make only reads files inside a kit's guidelines/ folder, so the router stubs at
// guidelines/components/{name}.md (which just link out to each component's AGENTS.md for
// human/Copilot readers) get replaced in dist with the real AGENTS.md content, generated
// fresh on every build — keeping them in sync without anyone hand-editing two files.
const inlineComponentGuidelines = () => {
    const componentsFolder = getComponentFolder();
    const componentsDir = path.join(process.cwd(), "src", componentsFolder);

    if (!fse.existsSync(componentsDir)) {
        return;
    }

    // Recurses through atoms/molecules/organisms subfolders — any directory holding an
    // AGENTS.md is treated as a component, keyed by its own folder name.
    const findComponentDirs = (dir: string): string[] => {
        const entries = fse.readdirSync(dir, { withFileTypes: true });
        const results: string[] = [];

        for (const entry of entries) {
            if (!entry.isDirectory()) {
                continue;
            }

            const entryPath = path.join(dir, entry.name);
            if (fse.existsSync(path.join(entryPath, "AGENTS.md"))) {
                results.push(entryPath);
            } else {
                results.push(...findComponentDirs(entryPath));
            }
        }
        return results;
    };

    for (const componentDir of findComponentDirs(componentsDir)) {
        const name = path.basename(componentDir);
        const agentsSrc = path.join(componentDir, "AGENTS.md");
        const guidelineDest = path.join(process.cwd(), "dist", "guidelines", "components", `${name.toLowerCase()}.md`);

        if (!fse.existsSync(guidelineDest)) {
            continue;
        }

        console.log(`inlining ${agentsSrc} into ${guidelineDest}`);
        const agentsContent = fse.readFileSync(agentsSrc, "utf-8");
        const relativeSrc = path.relative(process.cwd(), agentsSrc);
        const header = `<!-- Generated from ${relativeSrc} during build — do not edit this file directly. -->\n\n`;
        fse.writeFileSync(guidelineDest, header + agentsContent);
    }
};

export class PackageBuilder {
    static main() {
        console.log("Beginning Build");
        createPackageJson();
        copyPrepublishScript();
        createIgnoreFile();
        // Component-level .css (e.g. Button.css) is a Vite build entry — Vite already emitted its
        // compiled output (with @apply/@reference resolved) to the matching dist/ path, so a raw
        // source copy here would clobber it. Only src/styles holds standalone CSS assets (plain
        // custom properties, no Tailwind processing needed) that are meant to ship as raw source.
        copyExtension("src", [".png", ".jpg", ".ttf", ".bin", ".md"]);
        copyExtension(path.join("src", "styles"), [".css"]);
        copyExtension("guidelines", [".md"]);
        inlineComponentGuidelines();
        copyFile("README.md");
        copyFile("AGENTS.md");
    }
}
