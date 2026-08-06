import React, { useMemo } from "react";
import { Segmented, Tooltip } from "antd";
import { canUseFeature, getUpgradeUrl } from "../../../../../../tier/capabilities";
import { TierLockedWrap } from "../../../../../../tier/TierLockedWrap";

export const POST_MODULE_PRO_MESSAGE =
  "This feature is available in Category Ajax Filter Pro.";

export const canUsePostImageCustomField = () =>
  canUseFeature("post_image_custom_field");

export const canUsePostLinkCustomField = () =>
  canUseFeature("post_link_custom_field");

export const canUsePostPrefixSuffix = () => canUseFeature("post_prefix_suffix");
export const canUsePostModuleIcons = () => canUseFeature("label_show_icon");

/** UI display: locked prefix/suffix switches must appear off. */
export const resolvePostAffixEnabledForUi = (isEnabled) =>
  canUsePostPrefixSuffix() && Boolean(isEnabled);

/** Built-in suffix for comment count on free tier (customization remains Pro-only). */
export const FREE_DEFAULT_COMMENT_COUNT_SUFFIX = "comments";

export const getCommentCountModuleSettingsForOutput = (settings) => {
  if (!settings || typeof settings !== "object" || canUsePostPrefixSuffix()) {
    return settings;
  }

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

export const isCommentCountSuffixVisible = (settings) =>
  canUsePostPrefixSuffix()
    ? String(settings?.suffix?.is_enable ?? "") === "true"
    : true;

export const stripPostModuleIcons = (settings) => {
  if (!settings || typeof settings !== "object" || canUsePostModuleIcons()) {
    return settings;
  }

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

export const isPostPrefixEnabled = (settings) =>
  canUsePostPrefixSuffix() &&
  String(settings?.prefix?.is_enable ?? "") === "true";

export const isPostSuffixEnabled = (settings) =>
  canUsePostPrefixSuffix() &&
  String(settings?.suffix?.is_enable ?? "") === "true";

export function PostPrefixSuffixLockedSection({ children }) {
  const locked = !canUsePostPrefixSuffix();
  if (!locked) {
    return children;
  }

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
  const locked = !canUsePostModuleIcons();
  if (!locked) {
    return children;
  }

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

export const resolvePostImageSource = (storedValue) => {
  if (canUsePostImageCustomField() && storedValue === "custom_field") {
    return "custom_field";
  }
  return "featured_image";
};

export const resolvePostLinkType = (storedValue) => {
  if (canUsePostLinkCustomField() && storedValue === "custom-url") {
    return "custom-url";
  }
  return "post-url";
};

export function PostImageSourceSegment({
  value,
  onChange,
  className = "hoverTabCaf",
}) {
  const customFieldLocked = !canUsePostImageCustomField();
  const options = useMemo(
    () => [
      { label: "Featured Image", value: false },
      {
        label: (
          <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field">
            Custom Field
            {customFieldLocked ? (
              <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                Pro
              </span>
            ) : null}
          </span>
        ),
        value: true,
        disabled: customFieldLocked,
        className: customFieldLocked
          ? "caf-builder-tier-locked-segment-item"
          : undefined,
      },
    ],
    [customFieldLocked]
  );

  const handleChange = (nextValue) => {
    if (nextValue === true && customFieldLocked) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <div
      className={`hoverswitchguard caf-filter-data-source-segmented-wrap${
        customFieldLocked ? " caf-filter-data-source-segmented-wrap--locked" : ""
      }`}
    >
      <Segmented
        value={value}
        style={{ marginBottom: 8 }}
        onChange={handleChange}
        className={`${className} caf-filter-data-source-segmented`}
        options={options}
      />
      {customFieldLocked ? (
        <Tooltip
          classNames={{
            root: "caf-builder-tooltip caf-builder-tier-locked-tooltip",
          }}
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
      ) : null}
    </div>
  );
}

export function PostLinkTypeSegment({
  value,
  onChange,
  className = "hoverTabCaf caf-builder-centered-tabs",
  style = { marginBottom: 20 },
}) {
  const customFieldLocked = !canUsePostLinkCustomField();
  const options = useMemo(
    () => [
      {
        value: "post-url",
        label: "Post URL",
      },
      {
        value: "custom-url",
        label: (
          <span className="caf-filter-data-source-tab-label caf-filter-data-source-tab-label--custom-field">
            Custom Field
            {customFieldLocked ? (
              <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                Pro
              </span>
            ) : null}
          </span>
        ),
        disabled: customFieldLocked,
        className: customFieldLocked
          ? "caf-builder-tier-locked-segment-item"
          : undefined,
      },
    ],
    [customFieldLocked]
  );

  const handleChange = (nextValue) => {
    if (nextValue === "custom-url" && customFieldLocked) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <div
      className={`caf-filter-data-source-segmented-wrap${
        customFieldLocked ? " caf-filter-data-source-segmented-wrap--locked" : ""
      }`}
    >
      <Segmented
        value={value}
        style={style}
        onChange={handleChange}
        className={className}
        options={options}
      />
      {customFieldLocked ? (
        <Tooltip
          classNames={{
            root: "caf-builder-tooltip caf-builder-tier-locked-tooltip",
          }}
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
      ) : null}
    </div>
  );
}
