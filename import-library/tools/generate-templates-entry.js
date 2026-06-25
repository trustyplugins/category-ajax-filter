import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildImportLibraryTemplates } from "../../react-builder/src/MainComponents/importExport/libraryDummyTemplates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const libraryRoot = path.resolve(__dirname, "..");
const templates = buildImportLibraryTemplates();

const manifest = templates.map((template) => {
  const relativeFile = template.file.replace(/\\/g, "/");
  const absoluteFile = path.join(libraryRoot, relativeFile);
  const fileDir = path.dirname(absoluteFile);

  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }

  fs.writeFileSync(
    absoluteFile,
    `${JSON.stringify(template.payload, null, 2)}\n`,
    "utf8"
  );

  const entry = {
    id: template.id,
    title: template.title,
    section: template.section,
    scope: template.scope,
    description: template.description || "",
    file: relativeFile,
  };

  if (template.filterLibraryTab) {
    entry.filterLibraryTab = template.filterLibraryTab;
  }

  return entry;
});

fs.writeFileSync(
  path.join(libraryRoot, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);

console.log(`Wrote manifest and ${manifest.length} templates to ${libraryRoot}`);
