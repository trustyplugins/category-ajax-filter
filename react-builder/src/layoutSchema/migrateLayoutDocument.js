import { CURRENT_LAYOUT_SCHEMA_VERSION } from "./constants";

function parseStoredVersion(doc) {
  const raw = doc?.common_data?.layout_schema_version;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function ensureCommon(doc) {
  if (!doc.common_data || typeof doc.common_data !== "object") {
    doc.common_data = {};
  }
}

function ensureFilterLayout(doc) {
  if (!doc.filter_layout_data || typeof doc.filter_layout_data !== "object") {
    doc.filter_layout_data = {};
  }
  const fl = doc.filter_layout_data;
	if ( ! fl.extra_data || typeof fl.extra_data !== "object") {
    fl.extra_data = {};
  }
  if (
    !fl.extra_data.query_restriction ||
    typeof fl.extra_data.query_restriction !== "object"
  ) {
    fl.extra_data.query_restriction = {
      enabled: "false",
      include: { by: "", taxonomy: "", term_data: [] },
      exclude: { by: "", taxonomy: "", term_data: [], post_data: [] },
    };
  }
  // Migrate legacy filter-level listing_target → post layout_source.
  const legacyListingTarget = fl.extra_data.listing_target;
  const legacyResultsSelector = fl.extra_data.results_selector;
  if ("listing_target" in fl.extra_data) {
    delete fl.extra_data.listing_target;
  }
  if ("results_selector" in fl.extra_data) {
    delete fl.extra_data.results_selector;
  }
  if (!fl.breadcrumb_data || typeof fl.breadcrumb_data !== "object") {
    fl.breadcrumb_data = {};
  }
  if (!Array.isArray(fl.initial_data)) {
    fl.initial_data = [];
  }
  if (!fl.filter_query_data || typeof fl.filter_query_data !== "object") {
    fl.filter_query_data = {};
  }
  const fq = fl.filter_query_data;
  if (!fq.data_source || typeof fq.data_source !== "object") {
    fq.data_source = {};
  }
  if (!Array.isArray(fq.taxonomy_data)) {
    fq.taxonomy_data = [];
  }
  if (!Array.isArray(fq.custom_field_data)) {
    fq.custom_field_data = [];
  }
  return { legacyListingTarget, legacyResultsSelector };
}

function ensurePostLayout(doc, migrateHints = {}) {
  if (!doc.post_layout_data || typeof doc.post_layout_data !== "object") {
    doc.post_layout_data = {};
  }
  const pl = doc.post_layout_data;
  if (!pl.extra_data || typeof pl.extra_data !== "object") {
    pl.extra_data = {};
  }
  const allowedSources = ["caf_builder", "main_query"];
  if (!allowedSources.includes(pl.extra_data.layout_source)) {
    if (migrateHints.legacyListingTarget === "main_query") {
      pl.extra_data.layout_source = "main_query";
    } else {
      pl.extra_data.layout_source = "caf_builder";
    }
  } else if (
    migrateHints.legacyListingTarget === "main_query" &&
    pl.extra_data.layout_source === "caf_builder"
  ) {
    pl.extra_data.layout_source = "main_query";
  }
  if (typeof pl.extra_data.results_selector !== "string") {
    pl.extra_data.results_selector =
      typeof migrateHints.legacyResultsSelector === "string" &&
      migrateHints.legacyResultsSelector
        ? migrateHints.legacyResultsSelector
        : "ul.products";
  } else if (
    !pl.extra_data.results_selector &&
    typeof migrateHints.legacyResultsSelector === "string" &&
    migrateHints.legacyResultsSelector
  ) {
    pl.extra_data.results_selector = migrateHints.legacyResultsSelector;
  } else if (!String(pl.extra_data.results_selector || "").trim()) {
    pl.extra_data.results_selector = "ul.products";
  }
  if (!pl.breadcrumb_data || typeof pl.breadcrumb_data !== "object") {
    pl.breadcrumb_data = {};
  }
  if (
    pl.extra_data.layout_source === "main_query" &&
    pl.breadcrumb_data.select_builder !== "true"
  ) {
    pl.breadcrumb_data.select_builder = "true";
  }
  if (!Array.isArray(pl.initial_data)) {
    pl.initial_data = [];
  }
}

/**
 * v0 → v1: guarantee top-level branches exist so new keys / optional chaining do not crash.
 * Future: v1 → v2 adds only the deltas for that release.
 */
function migrateFrom0To1(doc) {
  ensureCommon(doc);
  const migrateHints = ensureFilterLayout(doc);
  ensurePostLayout(doc, migrateHints || {});
}

function ensurePreviewTemplate(doc) {
  if (!doc.common_data.preview_template_data || typeof doc.common_data.preview_template_data !== "object") {
    doc.common_data.preview_template_data = {};
  }
  const preview = doc.common_data.preview_template_data;
  if (!preview.misc_preview_data || typeof preview.misc_preview_data !== "object") {
    preview.misc_preview_data = {};
  }
  const misc = preview.misc_preview_data;
  if (!misc.container || typeof misc.container !== "object") {
    misc.container = {};
  }
  if (!misc.container.style || typeof misc.container.style !== "object") {
    misc.container.style = {};
  }
  if (!misc.container.style.mobile || typeof misc.container.style.mobile !== "object") {
    misc.container.style.mobile = {};
  }
  if (!misc.container.style.mobile.default || typeof misc.container.style.mobile.default !== "object") {
    misc.container.style.mobile.default = {};
  }
  return misc.container.style.mobile.default;
}

/**
 * v1 → v2: preview outer wrapper uses zero top/bottom padding on mobile by default.
 */
function migrateFrom1To2(doc) {
  ensureCommon(doc);
  const mobileDefault = ensurePreviewTemplate(doc);
  if (!Object.prototype.hasOwnProperty.call(mobileDefault, "paddingTop")) {
    mobileDefault.paddingTop = "0px";
  }
  if (!Object.prototype.hasOwnProperty.call(mobileDefault, "paddingBottom")) {
    mobileDefault.paddingBottom = "0px";
  }
}

function ensurePostPreviewGridMobile(doc) {
  if (
    !doc.common_data.preview_template_data ||
    typeof doc.common_data.preview_template_data !== "object"
  ) {
    doc.common_data.preview_template_data = {};
  }
  const preview = doc.common_data.preview_template_data;
  if (!preview.post_preview_data || typeof preview.post_preview_data !== "object") {
    preview.post_preview_data = {};
  }
  const postPreview = preview.post_preview_data;
  if (!postPreview.grid || typeof postPreview.grid !== "object") {
    postPreview.grid = {};
  }
  const grid = postPreview.grid;
  if (!grid.style || typeof grid.style !== "object") {
    grid.style = {};
  }
  if (!grid.style.mobile || typeof grid.style.mobile !== "object") {
    grid.style.mobile = {};
  }
  if (
    !grid.style.mobile.default ||
    typeof grid.style.mobile.default !== "object"
  ) {
    grid.style.mobile.default = {};
  }
  return grid.style.mobile.default;
}

/**
 * v2 → v3: post layout grid uses 10px left/right padding on mobile by default.
 */
function migrateFrom2To3(doc) {
  ensureCommon(doc);
  const mobileDefault = ensurePostPreviewGridMobile(doc);
  if (!Object.prototype.hasOwnProperty.call(mobileDefault, "paddingLeft")) {
    mobileDefault.paddingLeft = "10px";
  }
  if (!Object.prototype.hasOwnProperty.call(mobileDefault, "paddingRight")) {
    mobileDefault.paddingRight = "10px";
  }
}

/** @type {Array<(doc: object) => void>} migrators[fromVersion] runs to reach fromVersion+1 */
const MIGRATIONS = [migrateFrom0To1, migrateFrom1To2, migrateFrom2To3];

/**
 * Deep-clone, apply sequential migrations until `CURRENT_LAYOUT_SCHEMA_VERSION`,
 * and stamp `common_data.layout_schema_version`.
 *
 * @param {unknown} input Raw layout object (from API, import, or local state).
 * @returns {{ doc: object, migrated: boolean, fromVersion: number }}
 */
export function migrateLayoutDocument(input) {
  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    const doc = {
      common_data: { layout_schema_version: CURRENT_LAYOUT_SCHEMA_VERSION },
      filter_layout_data: {
        extra_data: {},
        breadcrumb_data: {},
        initial_data: [],
        filter_query_data: {
          data_source: {},
          taxonomy_data: [],
          custom_field_data: [],
        },
      },
      post_layout_data: {
        extra_data: {},
        breadcrumb_data: {},
        initial_data: [],
      },
    };
    return { doc, migrated: true, fromVersion: 0 };
  }

  let doc;
  try {
    doc = structuredClone(input);
  } catch {
    doc = JSON.parse(JSON.stringify(input));
  }

  ensureCommon(doc);
  const initialVersion = parseStoredVersion(doc);
  let fromVersion = initialVersion;

  if (fromVersion > CURRENT_LAYOUT_SCHEMA_VERSION) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn(
        "[CAF Builder] Layout schema version",
        fromVersion,
        "is newer than this builder (",
        CURRENT_LAYOUT_SCHEMA_VERSION,
        "). Skipping upgrades; some features may be missing."
      );
    }
    ensureFilterLayout(doc);
    ensurePostLayout(doc);
    return { doc, migrated: false, fromVersion: initialVersion };
  }

  let migrated = false;
  while (fromVersion < CURRENT_LAYOUT_SCHEMA_VERSION) {
    const step = MIGRATIONS[fromVersion];
    if (typeof step === "function") {
      step(doc);
    }
    fromVersion += 1;
    doc.common_data.layout_schema_version = fromVersion;
    migrated = true;
  }

  doc.common_data.layout_schema_version = CURRENT_LAYOUT_SCHEMA_VERSION;
  return { doc, migrated, fromVersion: initialVersion };
}
