/**
 * Increment when saved layout JSON shape gains breaking or required keys.
 * Add a matching entry in migrateLayoutDocument.js (MIGRATIONS[fromVersion]).
 *
 * v1: Introduced layout_schema_version + structural defaults for legacy files.
 * v2: Outer wrapper mobile default — zero top/bottom padding on preview container.
 * v3: Post layout (grid) mobile default — 10px left/right padding.
 */
export const CURRENT_LAYOUT_SCHEMA_VERSION = 3;
