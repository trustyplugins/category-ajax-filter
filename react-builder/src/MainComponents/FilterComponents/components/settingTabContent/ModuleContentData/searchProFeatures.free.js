/**
 * Free: same Search Type / voice / custom-field chrome as Pro, with Pro tabs locked.
 * Does not enable AI / voice / CF search — settings stay gated via canUseFeature in parent.
 */
import React from "react";
import { Switch, Tooltip as AntTooltip } from "antd";
import { getUpgradeUrl } from "../../../../../tier/capabilities";
import { TierLockedWrap } from "../../../../../tier/TierLockedWrap";
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

export const includeSmartAiSearchMode = true;

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
    {
      label: (
        <Tooltip
          placement="topLeft"
          title="AI-assisted semantic search for intent-based results."
        >
          <span className="caf-search-mode-tab-label caf-search-mode-tab-label--smart-ai">
            <SearchModeIcon mode="smart_ai_search" />
            <span className="caf-ai-search-btn-label">AI Search</span>
            <span className="caf-builder-tier-locked-wrap__badge caf-search-mode-pro-badge">
              Pro
            </span>
          </span>
        </Tooltip>
      ),
      value: "smart_ai_search",
      disabled: true,
      className: "caf-builder-tier-locked-segment-item",
    },
  ];
}

export function SearchAiModeLockedOverlay() {
  return (
    <Tooltip
      classNames={{
        root: "caf-builder-tooltip caf-builder-tier-locked-tooltip",
      }}
      placement="topLeft"
      title={
        <span className="caf-builder-tier-locked-section__tooltip-text">
          Smart AI Search is available in Category Ajax Filter Pro.{" "}
          <a
            href={getUpgradeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="caf-builder-tier-locked-section__upgrade-link"
          >
            Upgrade to Pro
          </a>
        </span>
      }
    >
      <div
        className="caf-builder-tier-locked-segment-overlay caf-builder-tier-locked-segment-overlay--smart-ai"
        aria-hidden="true"
      />
    </Tooltip>
  );
}

export function SearchAiUpsellRow() {
  return null;
}

export function SearchCustomFieldControls() {
  return (
    <TierLockedWrap
      locked
      className="caf-builder-tier-locked-search-custom-field"
      upgradeMessage="Custom field search is available in Category Ajax Filter Pro."
      showProBadge
    >
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          placement="topLeft"
          title="Include a specific custom field in matching."
        >
          <label>Custom Field</label>
        </Tooltip>
        <Switch checked={false} disabled />
      </div>
    </TierLockedWrap>
  );
}

export function SearchVoiceControls() {
  return (
    <TierLockedWrap
      locked
      className="caf-builder-tier-locked-search-voice module-search-voice-row"
      upgradeMessage="Voice Search is available in Category Ajax Filter Pro."
      showProBadge
    >
      <label className="setting-label-main">Voice Search</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip placement="topLeft" title="Turn voice search on or off.">
          <label>Enable</label>
        </Tooltip>
        <Switch checked={false} disabled />
      </div>
      <hr className="setting-hr-main" />
    </TierLockedWrap>
  );
}
