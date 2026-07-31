const DEFAULT_ROW_HEIGHT = 10;
const PREVIEW_ITEM_SELECTOR = ".caf-builder-preview-single-post-item";
const FRONTEND_ITEM_SELECTOR = ".caf-builder-post-area";

export function isMasonryEnabled(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function resizeMasonryItem(item, grid, rowHeightFallback = DEFAULT_ROW_HEIGHT) {
  if (!item || !grid) {
    return;
  }

  const styles = window.getComputedStyle(grid);
  const rowHeight =
    parseInt(styles.getPropertyValue("grid-auto-rows"), 10) || rowHeightFallback;
  const rowGap =
    parseInt(styles.rowGap, 10) || parseInt(styles.gap, 10) || 0;
  const itemHeight = item.getBoundingClientRect().height;
  const rowSpan = Math.max(
    1,
    Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap))
  );

  item.style.setProperty("--row-span", String(rowSpan));
}

export function clearMasonryItemSpans(grid, itemSelector = PREVIEW_ITEM_SELECTOR) {
  if (!grid) {
    return;
  }

  grid.querySelectorAll(itemSelector).forEach((item) => {
    item.style.removeProperty("--row-span");
  });
}

export function applyMasonryLayout(
  grid,
  itemSelector = PREVIEW_ITEM_SELECTOR,
  rowHeightFallback = DEFAULT_ROW_HEIGHT
) {
  if (!grid) {
    return;
  }

  grid.querySelectorAll(itemSelector).forEach((item) => {
    resizeMasonryItem(item, grid, rowHeightFallback);
  });
}

export function scheduleMasonryLayout(
  grid,
  itemSelector = PREVIEW_ITEM_SELECTOR,
  rowHeightFallback = DEFAULT_ROW_HEIGHT
) {
  if (!grid) {
    return;
  }

  const run = () => applyMasonryLayout(grid, itemSelector, rowHeightFallback);
  run();
  window.requestAnimationFrame(run);
  window.setTimeout(run, 60);
  window.setTimeout(run, 300);
}

export function observeMasonryLayout(
  grid,
  itemSelector = PREVIEW_ITEM_SELECTOR,
  rowHeightFallback = DEFAULT_ROW_HEIGHT
) {
  if (!grid) {
    return () => {};
  }

  const run = () => applyMasonryLayout(grid, itemSelector, rowHeightFallback);

  if (typeof ResizeObserver === "undefined") {
    const onResize = () => run();
    window.addEventListener("resize", onResize);
    run();
    return () => window.removeEventListener("resize", onResize);
  }

  const resizeObserver = new ResizeObserver(() => run());
  resizeObserver.observe(grid);
  grid.querySelectorAll(itemSelector).forEach((item) => resizeObserver.observe(item));
  grid.querySelectorAll("img").forEach((img) => {
    if (!img.complete) {
      img.addEventListener("load", run, { once: true });
    }
  });

  run();

  return () => resizeObserver.disconnect();
}

export const MASONRY_SELECTORS = {
  previewItem: PREVIEW_ITEM_SELECTOR,
  frontendItem: FRONTEND_ITEM_SELECTOR,
};
