const SCROLL_HIDE_DELAY_MS = 900;
const scrollTimers = new WeakMap();

const AUTO_HIDE_SCROLL_TARGETS = [
  ".caf-builder-sidebar",
  ".caf-builder-mainarea",
  ".caf-builder-post-preview-wrapper",
  ".setting-popup-tab-content",
  ".caf-post-preview-setting-popup-tab-content",
  ".caf-main-layout-content-section.layout-preview",
  ".caf-builder-row",
  ".icons-map",
  "body",
  ".new-modules-container ul",
  ".manage-scroll-inner",
  ".caf-builder-revisions-panel__list",
  ".caf-layout-filter-with-query-content-inner-section",
  ".caf-preview-collapse-design",
  ".caf-preview-dnd-column-main-container",
  ".caf-post-preview-icons-section.loader",
  ".caf-preview-setting-pop-content .caf-preview-custom-code-editor",
  ".caf-builder-module-main.caf-module-filter ul.caf-terms-list.caf-checkbox:not(.caf-woo-rating)",
  ".caf-builder-module-main.caf-module-filter ul.caf-terms-list.caf-woo-rating",
  ".caf-builder-module-main.caf-module-filter ul.caf-terms-list ul.caf-dropdown-child",
  ".caf-mobile-preview-frame-screen",
  ".caf-tablet-preview-frame-screen-portrait",
  ".caf-mobile-preview-iframe-body",
  ".caf-tablet-preview-iframe-body",
  ".caf-builder-preview-template-container.caf-mobile-preview-wrapper",
  ".caf-builder-preview-template-container.caf-tablet-preview-wrapper",
].join(", ");

const resolveScrollElement = (target) => {
  if (target === document || target === document.documentElement) {
    return document.body;
  }
  if (!(target instanceof Element)) {
    return null;
  }
  if (target.matches(AUTO_HIDE_SCROLL_TARGETS)) {
    return target;
  }
  return target.closest(AUTO_HIDE_SCROLL_TARGETS);
};

const isScrollable = (element) =>
  element.scrollHeight > element.clientHeight ||
  element.scrollWidth > element.clientWidth;

const markScrolling = (element) => {
  if (!(element instanceof Element) || !isScrollable(element)) {
    return;
  }

  element.classList.add("caf-is-scrolling");

  const existingTimer = scrollTimers.get(element);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  scrollTimers.set(
    element,
    setTimeout(() => {
      element.classList.remove("caf-is-scrolling");
      scrollTimers.delete(element);
    }, SCROLL_HIDE_DELAY_MS)
  );
};

const handleScrollIntent = (event) => {
  const element = resolveScrollElement(event.target);
  if (element) {
    markScrolling(element);
  }
};

const attachScrollListeners = (root) => {
  if (!root || root.documentElement?.dataset?.cafAutoHideScrollbar === "true") {
    return;
  }

  root.documentElement.dataset.cafAutoHideScrollbar = "true";
  root.addEventListener("scroll", handleScrollIntent, true);
  root.addEventListener("wheel", handleScrollIntent, {
    capture: true,
    passive: true,
  });
  root.addEventListener("touchmove", handleScrollIntent, {
    capture: true,
    passive: true,
  });
};

const bindIframe = (iframe) => {
  const tryBind = () => {
    try {
      const doc = iframe.contentDocument;
      if (doc?.body) {
        attachScrollListeners(doc);
      }
    } catch (error) {
      // Cross-origin iframe; ignore.
    }
  };

  tryBind();
  iframe.addEventListener("load", tryBind);
};

const initAutoHideScrollbars = () => {
  attachScrollListeners(document);
  document.querySelectorAll("iframe").forEach(bindIframe);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLIFrameElement) {
          bindIframe(node);
          return;
        }

        if (node instanceof Element) {
          node.querySelectorAll("iframe").forEach(bindIframe);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
};

initAutoHideScrollbars();
