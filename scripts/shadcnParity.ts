/**
 * Compares chadwick's implemented components against shadcn/ui's public registry
 * and writes a parity report. Pure data fetch/diff — no AI calls.
 *
 * Usage: npx tsx scripts/shadcnParity.ts [--out <path>]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(dirname, "..");
const COMPONENTS_DIR = path.join(ROOT, "src/components");
const REGISTRY_URL = "https://ui.shadcn.com/r/index.json";
const DEFAULT_OUT = path.join(ROOT, "shadcn-parity-report.md");

interface RegistryEntry {
  name: string;
  type: string;
}

function parseArgs(argv: string[]) {
  const outIndex = argv.indexOf("--out");
  return {
    outPath: outIndex !== -1 && argv[outIndex + 1] ? path.resolve(argv[outIndex + 1]) : DEFAULT_OUT,
  };
}

function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

// A component folder is a leaf directory whose name matches a same-named .tsx file inside it.
function findComponentFolders(dir: string): string[] {
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const entryPath = path.join(dir, entry.name);
    const ownFile = path.join(entryPath, `${entry.name}.tsx`);
    if (fs.existsSync(ownFile)) {
      found.push(entry.name);
    } else {
      found.push(...findComponentFolders(entryPath));
    }
  }
  return found;
}

async function fetchShadcnRegistry(): Promise<RegistryEntry[]> {
  const response = await fetch(REGISTRY_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch shadcn registry: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function main() {
  const { outPath } = parseArgs(process.argv.slice(2));

  const registry = await fetchShadcnRegistry();
  const shadcnNames = registry.filter((entry) => entry.type === "registry:ui").map((entry) => entry.name).sort();

  const chadwickFolders = findComponentFolders(COMPONENTS_DIR);
  const chadwickNameSet = new Set(chadwickFolders.map(toKebabCase));

  const implemented = shadcnNames.filter((name) => chadwickNameSet.has(name));
  const missing = shadcnNames.filter((name) => !chadwickNameSet.has(name));
  const extras = chadwickFolders
    .filter((folder) => !shadcnNames.includes(toKebabCase(folder)))
    .sort();

  const total = shadcnNames.length;
  const coveragePct = total === 0 ? 0 : Math.round((implemented.length / total) * 100);

  const lines: string[] = [];
  lines.push("# shadcn/ui parity report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`Coverage: ${implemented.length}/${total} shadcn components (${coveragePct}%)`);
  lines.push("");
  lines.push(`## Implemented (${implemented.length})`);
  lines.push("");
  lines.push(implemented.length ? implemented.map((name) => `- ${name}`).join("\n") : "_None_");
  lines.push("");
  lines.push(`## Missing (${missing.length})`);
  lines.push("");
  lines.push(missing.length ? missing.map((name) => `- ${name}`).join("\n") : "_None_");
  lines.push("");
  lines.push(`## Chadwick-only components not in shadcn's registry (${extras.length})`);
  lines.push("");
  lines.push(extras.length ? extras.map((name) => `- ${name}`).join("\n") : "_None_");
  lines.push("");

  fs.writeFileSync(outPath, lines.join("\n"));

  console.log(`Coverage: ${implemented.length}/${total} shadcn components (${coveragePct}%)`);
  console.log(`Missing: ${missing.length}`);
  console.log(`Report written to ${path.relative(ROOT, outPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
