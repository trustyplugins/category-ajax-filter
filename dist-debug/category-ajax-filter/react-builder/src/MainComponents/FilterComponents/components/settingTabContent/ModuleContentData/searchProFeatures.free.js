/**
 * Free build: Elementor-style Pro CTAs only — no AI / voice / CF search implementations.
 * Wired via free-build-replacements.js when CAF_BUILD_FREE=1.
 */
import React from "react";
import { Tooltip as AntTooltip } from "antd";
import { TierLockedSection } from "../../../../../tier/TierLockedSection";
import { BUILDER_TOOLTIP_CLASS_NAMES } from "../../../../shared/builderTooltipProps";
import SearchModeIcon from "./SearchModeIcon";

const Tooltip = ({ classNames, ...tooltipProps }) => (
  <AntTooltip
    classNames={{
      ...BUILDER_TOOLTIP_CLASS_NAMES,
      ...classNames,
    }}
    {...tooltipProps}
  />
);

export const includeSmartAiSearchMode = false;

export function getSearchModeOptions() {
  return [
    {
      label: (
        <Tooltip
          placement="topLeft"
          title="Classic keyword matching based on selected sources."
        >
          <span className="caf-search-mode-tab-label">
            <SearchModeIcon mode="keyword_search" />
            <span>Keyword</span>
          </span>
        </Tooltip>
      ),
      value: "keyword_search",
    },
  ];
}

export function SearchAiModeLockedOverlay() {
  return null;
}

export function SearchAiUpsellRow() {
  return (
    <div className="module-content-tab-row caf-free-pro-upsell-row">
      <TierLockedSection
        locked
        sectionTitle="AI Search"
        upgradeMessage="Smart AI Search is available in the separate Category Ajax Filter Pro plugin."
      >
        <p className="caf-free-pro-upsell-copy">
          Semantic, intent-based search is included with Category Ajax Filter Pro.
        </p>
      </TierLockedSection>
    </div>
  );
}

export function SearchCustomFieldControls() {
  return (
    <div className="module-content-tab-row caf-free-pro-upsell-row">
      <TierLockedSection
        locked
        sectionTitle="Custom Field Search"
        upgradeMessage="Custom field search is available in the separate Category Ajax Filter Pro plugin."
      >
        <p className="caf-free-pro-upsell-copy">
          Search specific custom fields with Category Ajax Filter Pro.
        </p>
      </TierLockedSection>
    </div>
  );
}

export function SearchVoiceControls() {
  return (
    <div className="module-content-tab-row caf-free-pro-upsell-row module-search-voice-row">
      <TierLockedSection
        locked
        sectionTitle="Voice Search"
        upgradeMessage="Voice Search is available in the separate Category Ajax Filter Pro plugin."
      >
        <p className="caf-free-pro-upsell-copy">
          Hands-free voice search is included with Category Ajax Filter Pro.
        </p>
      </TierLockedSection>
      <hr className="setting-hr-main" />
    </div>
  );
}
