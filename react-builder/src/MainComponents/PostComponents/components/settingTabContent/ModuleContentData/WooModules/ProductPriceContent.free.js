import React, { useEffect, useState } from "react";
import { Input, Segmented, Select, Switch, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import { normalizePostAffixMetaText } from "../shared/postAffixMetaTextUtils";

const VISIBILITY_OPTIONS = [
  { label: "All Products", value: "all" },
  { label: "Simple Products", value: "simple_products" },
  { label: "Variable Products", value: "variable_products" },
  { label: "Grouped Products", value: "grouped_products" },
];

const normalizeMetaText = normalizePostAffixMetaText;
const normalizeVisibility = (value) =>
  VISIBILITY_OPTIONS.some((option) => option.value === value) ? value : "all";

function ProductPriceContent(props) {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [prefixEnabled, setPrefixEnabled] = useState(
    modSettings?.prefix?.is_enable !== "false",
  );
  const [suffixEnabled, setSuffixEnabled] = useState(
    modSettings?.suffix?.is_enable !== "false",
  );
  const [prefixType, setPrefixType] = useState(
    modSettings?.prefix?.meta_type === "regular_price" ? "regular_price" : "text",
  );
  const [suffixType, setSuffixType] = useState(
    modSettings?.suffix?.meta_type === "regular_price" ? "regular_price" : "text",
  );
  const [prefixText, setPrefixText] = useState(modSettings?.prefix?.meta_text ?? "");
  const [suffixText, setSuffixText] = useState(modSettings?.suffix?.meta_text ?? "");
  const [prefixVisibility, setPrefixVisibility] = useState(
    normalizeVisibility(modSettings?.prefix?.text_visibility),
  );
  const [suffixVisibility, setSuffixVisibility] = useState(
    normalizeVisibility(modSettings?.suffix?.text_visibility),
  );

  useEffect(() => {
    setPrefixEnabled(modSettings?.prefix?.is_enable !== "false");
    setSuffixEnabled(modSettings?.suffix?.is_enable !== "false");
    setPrefixType(
      modSettings?.prefix?.meta_type === "regular_price" ? "regular_price" : "text",
    );
    setSuffixType(
      modSettings?.suffix?.meta_type === "regular_price" ? "regular_price" : "text",
    );
    setPrefixText(modSettings?.prefix?.meta_text ?? "");
    setSuffixText(modSettings?.suffix?.meta_text ?? "");
    setPrefixVisibility(normalizeVisibility(modSettings?.prefix?.text_visibility));
    setSuffixVisibility(normalizeVisibility(modSettings?.suffix?.text_visibility));
  }, [props.data, rowindex, columnindex, moduleindex]);

  const updateSettings = (patch) =>
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch,
    });
  const updateAffix = (placement, values) =>
    updateSettings((settings) => {
      settings[placement] = { ...(settings[placement] || {}), ...values };
    });
  const affixOptions = [
    { label: "Regular Price", value: "regular_price" },
    { label: "Text", value: "text" },
    {
      label: (
        <span className="caf-filter-data-source-tab-label">
          Icon{" "}
          <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
            Pro
          </span>
        </span>
      ),
      value: "icon",
      disabled: true,
      className: "caf-builder-tier-locked-segment-item",
    },
  ];
  const renderAffix = (placement, enabled, setEnabled, type, setType, text, setText, visibility, setVisibility) => (
    <div className="setting-manage-f-label">
      <hr className="setting-hr-main" />
      <label className="setting-label-main">
        {placement === "prefix" ? "Prefix" : "Suffix"}{" "}
        <span className="setting-label-sub-text">
          ({placement === "prefix" ? "Before" : "After"} Price)
        </span>
      </label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={`Enable or disable ${placement}.`}>
          <label>Enable</label>
        </Tooltip>
        <Switch
          checked={enabled}
          onChange={(checked) => {
            setEnabled(checked);
            updateAffix(placement, {
              is_enable: checked ? "true" : "false",
              meta_text: checked && type === "text" ? normalizeMetaText(placement, text) : text,
            });
            if (checked && type === "text") setText(normalizeMetaText(placement, text));
          }}
        />
      </div>
      {enabled ? (
        <>
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={`Select ${placement} content type.`}>
              <label>Content Type</label>
            </Tooltip>
            <Segmented
              value={type}
              onChange={(value) => {
                if (value === "icon") return;
                setType(value);
                updateAffix(placement, { meta_type: value });
              }}
              className="hoverTabCaf"
              options={affixOptions}
            />
          </div>
          {type === "text" ? (
            <>
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={`Set ${placement} text value.`}>
                  <label>Text</label>
                </Tooltip>
                <Input
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    updateAffix(placement, { meta_text: event.target.value });
                  }}
                  onBlur={(event) => {
                    const value = normalizeMetaText(placement, event.target.value);
                    setText(value);
                    updateAffix(placement, { meta_text: value });
                  }}
                />
              </div>
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={`Choose which product types show this ${placement} text.`}>
                  <label>Visibility</label>
                </Tooltip>
                <Select
                  value={visibility}
                  style={{ width: "100%" }}
                  onChange={(value) => {
                    setVisibility(value);
                    updateAffix(placement, { text_visibility: value });
                  }}
                  options={VISIBILITY_OPTIONS}
                />
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="module-content-tab-row">
        <label className="setting-label-main">Special Products</label>
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose which price to show for variable or grouped products.">
            <label>Display Price As</label>
          </Tooltip>
          <Select
            value="default"
            style={{ width: "100%" }}
            options={[
              { label: "WooCommerce Default", value: "default" },
              {
                label: <span>Lowest Price <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">Pro</span></span>,
                value: "lowest_price",
                disabled: true,
              },
              {
                label: <span>Highest Price <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">Pro</span></span>,
                value: "highest_price",
                disabled: true,
              },
            ]}
          />
        </div>
      </div>
      {renderAffix("prefix", prefixEnabled, setPrefixEnabled, prefixType, setPrefixType, prefixText, setPrefixText, prefixVisibility, setPrefixVisibility)}
      {renderAffix("suffix", suffixEnabled, setSuffixEnabled, suffixType, setSuffixType, suffixText, setSuffixText, suffixVisibility, setSuffixVisibility)}
    </>
  );
}

export default ProductPriceContent;
