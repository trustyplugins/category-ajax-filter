import React, { useMemo } from "react";
import { Segmented, Tooltip } from "antd";
import { getUpgradeUrl } from "../../../../../../tier/capabilities";
import { TierLockedWrap } from "../../../../../../tier/TierLockedWrap";

export const POST_MODULE_PRO_MESSAGE =
  "This feature is available in Category Ajax Filter Pro.";

export const canUsePostImageCustomField = () => false;
export const canUsePostLinkCustomField = () => false;
export const canUsePostPrefixSuffix = () => false;
export const canUsePostModuleIcons = () => false;

export const resolvePostAffixEnabledForUi = () => false;

export const FREE_DEFAULT_COMMENT_COUNT_SUFFIX = "comments";

export const getCommentCountModuleSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object") return settings;
  return {
    ...settings,
    prefix: { ...(settings.prefix || {}), is_enable: "false" },
    suffix: {
      ...(settings.suffix || {}),
      is_enable: "true",
      meta_type: "text",
      meta_text: FREE_DEFAULT_COMMENT_COUNT_SUFFIX,
    },
  };
};

export const isCommentCountSuffixVisible = () => true;

export const stripPostModuleIcons = (settings) => {
  if (!settings || typeof settings !== "object") return settings;
  return {
    ...settings,
    icons: {
      ...(settings.icons || {}),
      visibility: false,
      icon: "",
      type: "icon",
      position: "",
    },
  };
};

export const resolvePostModuleSettingsForOutput = (settings) =>
  stripPostModuleIcons(settings);

export const isPostPrefixEnabled = () => false;
export const isPostSuffixEnabled = () => false;

export function PostPrefixSuffixLockedSection({ children }) {
  return (
    <TierLockedWrap
      locked
      showProBadge
      className="caf-builder-tier-locked-post-prefix-suffix"
      upgradeMessage="Prefix and suffix controls are available in Category Ajax Filter Pro."
    >
      {children}
    </TierLockedWrap>
  );
}

export function PostModuleIconLockedSection({ children }) {
  return (
    <TierLockedWrap
      locked
      showProBadge
      className="caf-builder-tier-locked-post-module-icons"
      upgradeMessage="Module icon controls are available in Category Ajax Filter Pro."
    >
      {children}
    </TierLockedWrap>
  );
}

export const resolvePostImageSource = () => "featured_image";
export const resolvePostLinkType = () => "post-url";

export function PostImageSourceSegment({
  value,
  onChange,
  className = "hoverTabCaf",
}) {
  const options = useMemo(
    () => [
      { label: "Featured Image", value: false },
      {
        label: (
          <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field">
            Custom Field
            <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
              Pro
            </span>
          </span>
        ),
        value: true,
        disabled: true,
        className: "caf-builder-tier-locked-segment-item",
      },
    ],
    []
  );

  return (
    <div className="hoverswitchguard caf-filter-data-source-segmented-wrap caf-filter-data-source-segmented-wrap--locked">
      <Segmented
        value={value === true ? false : value}
        style={{ marginBottom: 8 }}
        onChange={(nextValue) => {
          if (nextValue !== true) onChange(nextValue);
        }}
        className={`${className} caf-filter-data-source-segmented`}
        options={options}
      />
      <Tooltip
        classNames={{ root: "caf-builder-tooltip caf-builder-tier-locked-tooltip" }}
        placement="topLeft"
        title={
          <span className="caf-builder-tier-locked-section__tooltip-text">
            Custom field image source is available in Category Ajax Filter Pro.{" "}
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
          className="caf-builder-tier-locked-segment-overlay caf-builder-tier-locked-segment-overlay--custom-field"
          aria-hidden="true"
        />
      </Tooltip>
    </div>
  );
}

export function PostLinkTypeSegment({
  value,
  onChange,
  className = "hoverTabCaf caf-builder-centered-tabs",
  style = { marginBottom: 20 },
}) {
  const options = useMemo(
    () => [
      { value: "post-url", label: "Post URL" },
      {
        value: "custom-url",
        label: (
          <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field">
            Custom Field
            <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
              Pro
            </span>
          </span>
        ),
        disabled: true,
        className: "caf-builder-tier-locked-segment-item",
      },
    ],
    []
  );

  return (
    <div className="caf-filter-data-source-segmented-wrap caf-filter-data-source-segmented-wrap--locked">
      <Segmented
        value={value === "custom-url" ? "post-url" : value}
        style={style}
        onChange={(nextValue) => {
          if (nextValue !== "custom-url") onChange(nextValue);
        }}
        className={className}
        options={options}
      />
      <Tooltip
        classNames={{ root: "caf-builder-tooltip caf-builder-tier-locked-tooltip" }}
        placement="topLeft"
        title={
          <span className="caf-builder-tier-locked-section__tooltip-text">
            Custom field links are available in Category Ajax Filter Pro.{" "}
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
          className="caf-builder-tier-locked-segment-overlay caf-builder-tier-locked-segment-overlay--custom-field"
          aria-hidden="true"
        />
      </Tooltip>
    </div>
  );
}
