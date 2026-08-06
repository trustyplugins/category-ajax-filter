import React, { useState, useEffect } from "react";
import BuilderCafFilterIcon from "./BuilderCafFilterIcon";
import BuilderCafFilterLogoTabIcon from "./BuilderCafFilterLogoTabIcon";
import BuilderElementorLogoIcon from "./BuilderElementorLogoIcon";
import BuilderPreviewLogoIcon from "./BuilderPreviewLogoIcon";
import BuilderPostItemLogoIcon from "./BuilderPostItemLogoIcon";
import bubbleTop from "./images/Bubble-vector.png";
import footerBubble from "./images/footer-bubble.png";
import { Input } from "antd";
import { DownOutlined } from "@ant-design/icons";

const LAYOUT_SOURCE_CAF = "caf_builder";
const LAYOUT_SOURCE_MAIN_QUERY = "main_query";
const DEFAULT_RESULTS_SELECTOR = "ul.products";

const EXISTING_LAYOUT_INTEGRATIONS = [
  { id: "elementor", label: "Elementor", tone: "elementor" },
  { id: "divi", label: "Divi", tone: "divi" },
  { id: "woocommerce", label: "WooCommerce", tone: "woo" },
  { id: "themes", label: "All themes", tone: "themes" },
];

/**
 * Home screen only offers CAF builder vs Existing layout (main_query).
 */
const resolveLayoutSource = (raw) => {
  const value = String(raw || LAYOUT_SOURCE_CAF);
  if (value === LAYOUT_SOURCE_CAF) {
    return LAYOUT_SOURCE_CAF;
  }
  return LAYOUT_SOURCE_MAIN_QUERY;
};

function SelectFilterPostPage(props) {
  const postExtra =
    props?.mainBuilderData?.post_layout_data?.extra_data || {};

  const [layoutSource, setLayoutSource] = useState(() =>
    resolveLayoutSource(postExtra?.layout_source)
  );
  const [resultsSelector, setResultsSelector] = useState(
    () => String(postExtra?.results_selector || DEFAULT_RESULTS_SELECTOR)
  );
  const [showResultsSelector, setShowResultsSelector] = useState(() => {
    const saved = String(postExtra?.results_selector || "").trim();
    return Boolean(saved && saved !== DEFAULT_RESULTS_SELECTOR);
  });

  const isExistingLayoutTab = layoutSource !== LAYOUT_SOURCE_CAF;
  const filtersReady =
    props?.mainBuilderData?.filter_layout_data?.breadcrumb_data
      ?.select_builder === "true";

  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.post_layout_data) {
      nextBuilder.post_layout_data = {};
    }
    if (!nextBuilder.post_layout_data.extra_data) {
      nextBuilder.post_layout_data.extra_data = {};
    }
    if (!nextBuilder.post_layout_data.breadcrumb_data) {
      nextBuilder.post_layout_data.breadcrumb_data = {};
    }
    mutator(nextBuilder.post_layout_data);
    props.updatedBuilderData(nextBuilder);
  };

  useEffect(() => {
    const next = resolveLayoutSource(
      props?.mainBuilderData?.post_layout_data?.extra_data?.layout_source
    );
    setLayoutSource(next);
    setResultsSelector(
      String(
        props?.mainBuilderData?.post_layout_data?.extra_data
          ?.results_selector || DEFAULT_RESULTS_SELECTOR
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props?.mainBuilderData?.post_layout_data?.extra_data?.layout_source,
    props?.mainBuilderData?.post_layout_data?.extra_data?.results_selector,
  ]);

  const handelSelectFilter = () => {
    props.setSelectType("filter");
    props.setCurrStep("1");
  };

  const handelSelectPost = () => {
    props.setSelectType("post");
    props.setCurrStep("2");
  };
  const handelSelectPostPreview = () => {
    props.setSelectType("post-preview");
    props.setCurrStep("3");
  };

  const applyLayoutSource = (value) => {
    const next = resolveLayoutSource(value);
    setLayoutSource(next);
    commitBuilderPatch((postLayout) => {
      postLayout.extra_data.layout_source = next;
      if (next === LAYOUT_SOURCE_MAIN_QUERY) {
        postLayout.breadcrumb_data.select_builder = "true";
        const currentSelector = String(
          postLayout.extra_data.results_selector || ""
        ).trim();
        postLayout.extra_data.results_selector =
          currentSelector || DEFAULT_RESULTS_SELECTOR;
        setResultsSelector(postLayout.extra_data.results_selector);
      }
      if (next === LAYOUT_SOURCE_CAF) {
        postLayout.breadcrumb_data.select_builder = "false";
      }
    });
  };

  const onChangeSourceTab = (useExistingLayout) => {
    applyLayoutSource(
      useExistingLayout ? LAYOUT_SOURCE_MAIN_QUERY : LAYOUT_SOURCE_CAF
    );
  };

  const handleResultsSelector = (value) => {
    const next = String(value || "");
    setResultsSelector(next);
    commitBuilderPatch((postLayout) => {
      postLayout.extra_data.results_selector = next;
    });
  };

  const postDesignReady =
    props?.mainBuilderData?.post_layout_data?.breadcrumb_data
      ?.select_builder === "true";
  const canOpenLayoutSettings =
    !isExistingLayoutTab && filtersReady && postDesignReady;

  return (
    <div className="caf-select-filter-post-page-container">
      <img className="top-img" src={bubbleTop} alt="top" />
      <img className="lower-img" src={footerBubble} alt="lower" />
      <div className="caf-select-filter-heading">Build Your Layout</div>
      <div className="caf-select-filter-description">
        <p>Set up filters, design post items and customize layout settings</p>
      </div>
      <div className="caf-select-post-filter-secton">
        <div className="caf-select-post-filter-common">
          <div className="caf-filter-home-wrapper">
            <BuilderCafFilterIcon
              className="caf-query-filters-card-icon"
              alt="Query and Filters"
            />
            <label className="caf-card-label">Query & Filters</label>
            <p>Build your query or create custom filters.</p>
            <span
              className="filter-post-setting-btn"
              onClick={handelSelectFilter}
            >
              {filtersReady ? "Edit Filters" : "Create Filters"}
            </span>
          </div>
        </div>
        <div className="caf-select-post-filter-common post-sec-wrapper">
          <div className="caf-post-top-bar-wrapper">
            <div
              className="caf-layout-source-tabs"
              role="tablist"
              aria-label="Layout source"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isExistingLayoutTab}
                className={`caf-layout-source-tab${!isExistingLayoutTab ? " is-active" : ""}`}
                onClick={() => onChangeSourceTab(false)}
              >
                <BuilderCafFilterLogoTabIcon aria-hidden="true" />
                
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isExistingLayoutTab}
                className={`caf-layout-source-tab${isExistingLayoutTab ? " is-active" : ""}`}
                onClick={() => onChangeSourceTab(true)}
              >
                <span className="caf-layout-source-tab-text">
                  <span className="caf-layout-source-tab-title">
                    Existing layout
                  </span>
                  <span className="caf-layout-source-tab-subtitle">
                    Filter only
                  </span>
                </span>
              </button>
            </div>
          </div>
          <div className="caf-filter-home-wrapper">
            {isExistingLayoutTab ? (
              <>
                <BuilderElementorLogoIcon />
                <label className="caf-card-label">Use Existing Layout</label>
                <p>
                  CAF renders only the filter bar — your theme or page builder
                  handles the product grid. Works on Shop/Category archives and
                  on any page that includes this shortcode plus an Elementor,
                  Divi, or WooCommerce products module.
                </p>

                <div className="caf-existing-layout-integrations">
                  <div className="caf-existing-layout-integrations-label">
                    All supported integrations
                  </div>
                  <div className="caf-existing-layout-integrations-grid">
                    {EXISTING_LAYOUT_INTEGRATIONS.map((item) => (
                      <div
                        key={item.id}
                        className={`caf-existing-layout-integration-card caf-existing-layout-integration-card--${item.tone}`}
                      >
                        <span
                          className="caf-existing-layout-integration-icon"
                          aria-hidden="true"
                        >
                          {item.id === "elementor"
                            ? "E"
                            : item.id === "divi"
                              ? "D"
                              : item.id === "woocommerce"
                                ? "W"
                                : "▣"}
                        </span>
                        <span className="caf-existing-layout-integration-name">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`caf-existing-layout-troubleshoot${
                    showResultsSelector ? " is-open" : ""
                  }`}
                >
                  <button
                    type="button"
                    className={`caf-existing-layout-troubleshoot-toggle${
                      showResultsSelector ? " is-open" : ""
                    }`}
                    aria-expanded={showResultsSelector}
                    onClick={() => setShowResultsSelector((open) => !open)}
                  >
                    <span className="caf-existing-layout-troubleshoot-copy">
                      <span className="caf-existing-layout-troubleshoot-title">
                        Filter not working?
                      </span>
                      <span className="caf-existing-layout-troubleshoot-desc">
                        Manually point to your product grid
                      </span>
                    </span>
                    <DownOutlined
                      className="caf-existing-layout-troubleshoot-chevron"
                      aria-hidden
                    />
                  </button>
                  {showResultsSelector && (
                    <div className="caf-existing-layout-troubleshoot-panel">
                      <label className="caf-main-setting-page label">
                        Results selector
                      </label>
                      <Input
                        allowClear
                        placeholder="ul.products"
                        value={resultsSelector}
                        onChange={(e) =>
                          handleResultsSelector(String(e.target.value || ""))
                        }
                      />
                      <p className="caf-existing-layout-troubleshoot-help">
                        Optional CSS selector when auto-detect fails. Default
                        works for WooCommerce, Divi, Elementor, and most themes.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <BuilderPostItemLogoIcon />
                <label className="caf-card-label">Post Item Design</label>
                <p>
                  Design your post item with image, title, meta, and more.
                </p>
              </>
            )}

            {!isExistingLayoutTab && (
              <>
                {filtersReady ? (
                  <span
                    className="filter-post-setting-btn"
                    onClick={handelSelectPost}
                  >
                    {postDesignReady ? "Edit Design" : "Create Design"}
                  </span>
                ) : (
                  <span className="filter-post-setting-btn caf-home-screen-disable-btn">
                    Create Design
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="caf-select-post-filter-common">
          <div className="caf-filter-home-wrapper">
            <BuilderPreviewLogoIcon className="caf-preview-logo-card-icon" />
            <label className="caf-card-label">Layout Settings</label>
            <p>
              {isExistingLayoutTab
                ? "Not used for Existing layout — theme / shop controls columns, pagination, and cards."
                : "Arrange items and control layout behavior"}
            </p>

            {canOpenLayoutSettings ? (
              <span
                className="filter-post-setting-btn"
                onClick={handelSelectPostPreview}
              >
                Layout Settings
              </span>
            ) : (
              <span className="filter-post-setting-btn caf-home-screen-disable-btn">
                Layout Settings
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectFilterPostPage;
