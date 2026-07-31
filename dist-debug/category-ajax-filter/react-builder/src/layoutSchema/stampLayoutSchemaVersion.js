import { CURRENT_LAYOUT_SCHEMA_VERSION } from "./constants";

/** Ensure persisted JSON carries the current schema version (call before save / export). */
export function stampLayoutSchemaVersion(doc) {
  if (!doc || typeof doc !== "object") {
    return;
  }
  if (!doc.common_data || typeof doc.common_data !== "object") {
    doc.common_data = {};
  }
  doc.common_data.layout_schema_version = CURRENT_LAYOUT_SCHEMA_VERSION;
}
