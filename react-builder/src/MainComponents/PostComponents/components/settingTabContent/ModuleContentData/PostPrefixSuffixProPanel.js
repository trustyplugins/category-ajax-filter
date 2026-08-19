import React from "react";
import { Input, Segmented, Skeleton, Switch, Tooltip } from "antd";
import ContentIcons from "./ContentComponents/ContentIcons";

/**
 * Isolates prefix/suffix settings behind a replaceable module boundary.
 * Consumers supply their module-specific controls because their metadata
 * choices (text, icon, avatar, price, and Woo states) differ.
 */
function wrapAffixHint(label) {
  if (typeof label !== "string") {
    return label;
  }
  const match = label.match(/^(Prefix|Suffix)\s+(\([^)]+\))$/);
  if (!match) {
    return label;
  }
  return (
    <>
      {match[1]}{" "}
      <span className="setting-label-sub-text">{match[2]}</span>
    </>
  );
}

export default function PostPrefixSuffixProPanel({
  prefixLabel,
  suffixLabel,
  checkPrefix,
  checkSuffix,
  prefixMeta,
  suffixMeta,
  prefixMetaText,
  suffixMetaText,
  onPrefixChange,
  onSuffixChange,
  onMetaChange,
  onMetaText,
  onMetaTextBlur,
  iconsArray,
  data,
  indexes,
  onSettingChange,
  allowAvatar = false,
}) {
  const options = [
    { label: "Text", value: "text" },
    { label: "Icon", value: "icon" },
  ];
  if (allowAvatar) options.splice(1, 0, { label: "Avatar", value: "avatar" });

  const renderAffix = (placement, label, enabled, meta, metaText, onEnable) => (
    <div className="setting-manage-f-label">
      {placement === "suffix" && <hr className="setting-hr-main" />}
      <label className="setting-label-main">{wrapAffixHint(label)}</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={`Enable or disable ${placement}.`}><label>Enable</label></Tooltip>
        <Switch onChange={onEnable} checked={enabled} />
      </div>
      {enabled && <><div className="module-content-tab-row caf-design-two-half"><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={`Select ${placement} content type.`}><label>Content Type</label></Tooltip><Segmented value={meta} onChange={(value) => onMetaChange(value, placement)} className="hoverTabCaf" options={options} /></div>{meta === "text" && <div className="module-content-tab-row caf-design-two-half"><Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={`Set ${placement} text value.`}><label>Text</label></Tooltip><Input onChange={(e) => onMetaText(e.target.value, placement)} value={metaText} onBlur={(e) => onMetaTextBlur(placement, e.target.value)} /></div>}{meta === "icon" && <div className="module-content-tab-row">{iconsArray.length > 0 ? <ContentIcons title="Icons" labelType="label" moduleIcon={placement} data={data} indexes={indexes} iconsArray={iconsArray} onSettingChange={onSettingChange} /> : <Skeleton active />}</div>}</>}
    </div>
  );

  return <>{renderAffix("prefix", prefixLabel, checkPrefix, prefixMeta, prefixMetaText, onPrefixChange)}{renderAffix("suffix", suffixLabel, checkSuffix, suffixMeta, suffixMetaText, onSuffixChange)}</>;
}
