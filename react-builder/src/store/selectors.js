/**
 * Shared Redux selectors for the react-builder store.
 * Use these in useSelector() for stable references and easier refactors.
 */

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderState = (state) => state.builder;

/** Post layout rows (builder.inData) — mirrors local editor state where applicable. */
/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderInData = (state) => state.builder?.inData ?? [];

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderCustomLayouts = (state) =>
  state.builder?.customLayoutsAvail ?? [];

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderLayoutIndex = (state) => state.builder?.layoutIndex ?? "";

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderLayoutTitle = (state) => state.builder?.layoutTitle ?? "";

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderLayoutKey = (state) => state.builder?.layoutKey ?? "";

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderCustomCSS = (state) => state.builder?.customCSS ?? "";

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderClickSetting = (state) =>
  state.builder?.clickSetting ?? false;

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderBgColor = (state) => state.builder?.bgColor ?? "";

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderFooterSlider = (state) =>
  state.builder?.footerSlider ?? { value: "25", suffix: "%" };

/** REST preview payload for modules (builder.postData) — not the layout tree. */
/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderPostPreviewData = (state) => state.builder?.postData;

/** Canonical selected post type for post builder flow (builder.value). */
/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderPostType = (state) => state.builder?.value ?? "post";

/**
 * Effective post type for settings consumers.
 * Falls back to preview payload post_type when value is temporarily stale.
 */
/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderEffectivePostType = (state) =>
  state.builder?.value ||
  state.builder?.postData?.post_type ||
  "post";

/** Selected preview post id in post builder flow (builder.selectedPostId). */
/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectBuilderSelectedPostId = (state) =>
  state.builder?.selectedPostId ?? "";

/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectFilterBuilderState = (state) => state.filterBuilder;

/** Filter layout rows (filterBuilder.updatedInitialData). */
/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectFilterUpdatedInitialData = (state) =>
  state.filterBuilder?.updatedInitialData ?? [];

/** Filter General tab / extra payload (filterBuilder.extra_data). */
/** @param {{ builder?: object, filterBuilder?: object }} state */
export const selectFilterExtraData = (state) =>
  state.filterBuilder?.extra_data ?? {};
