/**
 * Pro search feature panels (settings UI).
 * Free builds replace with searchProFeatures.free.js (same locked chrome as Pro).
 */
import React from "react";
import { Input, Select, Switch, Tooltip as AntTooltip } from "antd";
import { getUpgradeUrl } from "../../../../../tier/capabilities";
import { TierLockedWrap } from "../../../../../tier/TierLockedWrap";
import { BUILDER_TOOLTIP_CLASS_NAMES } from "../../../../shared/builderTooltipProps";
import SearchModeIcon from "./SearchModeIcon";
import ContentIcons1 from "./ContentComponents/ContentIcons1";

const Tooltip = ({ classNames, ...tooltipProps }) => (
  <AntTooltip
    classNames={{
      ...BUILDER_TOOLTIP_CLASS_NAMES,
      ...classNames,
    }}
    {...tooltipProps}
  />
);

/** Free builds omit AI from the Search Type control entirely. */
export const includeSmartAiSearchMode = true;

export function getSearchModeOptions(canUseSmartAiSearch) {
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
            {!canUseSmartAiSearch ? (
              <span className="caf-builder-tier-locked-wrap__badge caf-search-mode-pro-badge">
                Pro
              </span>
            ) : null}
          </span>
        </Tooltip>
      ),
      value: "smart_ai_search",
      disabled: !canUseSmartAiSearch,
      className: !canUseSmartAiSearch
        ? "caf-builder-tier-locked-segment-item"
        : undefined,
    },
  ];
}

export function SearchAiModeLockedOverlay({ canUseSmartAiSearch }) {
  if (canUseSmartAiSearch) {
    return null;
  }
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

/** Free: Elementor-style CTA under Search Type (no AI segment). Pro: unused. */
export function SearchAiUpsellRow() {
  return null;
}

export function SearchCustomFieldControls({
  canUseSearchCustomField,
  source,
  customfield,
  metaObject,
  onToggleCustomField,
  onChangeCustomField,
}) {
  return (
    <TierLockedWrap
      locked={!canUseSearchCustomField}
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
        <Switch
          onChange={(val) => onToggleCustomField(val, "custom_field")}
          checked={canUseSearchCustomField ? source?.custom_field : false}
          disabled={!canUseSearchCustomField}
        />
      </div>
      {(canUseSearchCustomField ? source?.custom_field : false) && (
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            placement="topLeft"
            title="Pick the custom field used for matching."
          >
            <label>Select Custom Field</label>
          </Tooltip>
          <Select
            defaultValue={customfield}
            style={{ width: "100%" }}
            value={canUseSearchCustomField ? customfield : "0"}
            onChange={onChangeCustomField}
            options={metaObject}
            disabled={!canUseSearchCustomField}
          />
        </div>
      )}
    </TierLockedWrap>
  );
}

export function SearchVoiceControls({
  canUseVoiceSearch,
  checkVoice,
  iconsArray,
  voiceposition,
  inputValue,
  indexes,
  data,
  onSettingChange,
  onToggleVoice,
  onVoicePosition,
  onVoicePlaceholder,
  IconPositionTabs,
}) {
  return (
    <TierLockedWrap
      locked={!canUseVoiceSearch}
      className="caf-builder-tier-locked-search-voice module-search-voice-row"
      upgradeMessage="Voice Search is available in Category Ajax Filter Pro."
      showProBadge
    >
      <label className="setting-label-main">Voice Search</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip placement="topLeft" title="Turn voice search on or off.">
          <label>Enable</label>
        </Tooltip>
        <Switch
          onChange={onToggleVoice}
          checked={canUseVoiceSearch ? checkVoice : false}
          disabled={!canUseVoiceSearch}
        />
      </div>
      {(canUseVoiceSearch ? checkVoice : false) && iconsArray && (
        <>
          <div className="module-content-tab-row">
            <Tooltip placement="topLeft" title="Select the voice search icon.">
              <label>Voice Icon</label>
            </Tooltip>
            <ContentIcons1
              title="Icons"
              data={data}
              indexes={indexes}
              iconsArray={iconsArray}
              onSettingChange={onSettingChange}
              tab="voice_icon"
              type=""
            />
          </div>
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip
              placement="topLeft"
              title="Choose voice icon placement in the field."
            >
              <label>Icon Position</label>
            </Tooltip>
            <IconPositionTabs
              value={voiceposition}
              onChange={onVoicePosition}
            />
          </div>
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip
              placement="topLeft"
              title="Prompt shown for voice search input."
            >
              <label>Placeholder Text</label>
            </Tooltip>
            <Input
              type="text"
              value={inputValue}
              defaultValue={inputValue}
              onChange={(e) => onVoicePlaceholder(e.target.value)}
              disabled={!canUseVoiceSearch}
            />
          </div>
        </>
      )}
      <hr className="setting-hr-main" />
    </TierLockedWrap>
  );
}
