import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildImportLibraryManifest } from "../../react-builder/src/MainComponents/importExport/libraryDummyTemplates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const libraryRoot = path.resolve(__dirname, "..");
const manifest = buildImportLibraryManifest();

fs.writeFileSync(
  path.join(libraryRoot, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);

console.log(
  `Wrote manifest with ${manifest.length} on-disk templates to ${libraryRoot}`
);
