import React, { useEffect, useState } from "react";
import { Input, Segmented, Select, Space, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import { getUpgradeUrl } from "../../../../../../tier/capabilities";
import {
  getFreeformLabelTextForUi,
  normalizeFreeformLabelText,
} from "../shared/freeformLabelTextUtils";

const BUTTON_TEXT_BY_TYPE_DEFAULTS = {
  simple: "Add to cart",
  variable: "Select options",
  grouped: "View products",
  external: "Buy product",
  subscription: "Subscribe",
};
const PRODUCT_TYPE_OPTIONS = [
  { label: "Simple Product", value: "simple" },
  { label: "Variable Product", value: "variable" },
  { label: "Grouped Product", value: "grouped" },
  { label: "External Product", value: "external" },
  { label: "Subscription Product", value: "subscription" },
];

const DEFAULT_CUSTOM_BUTTON_TEXT = "Add to cart";

const syncButtonTextByTypeForUi = (value) => {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    Object.keys(BUTTON_TEXT_BY_TYPE_DEFAULTS).map((type) => [
      type,
      typeof source[type] === "string" ? source[type] : "",
    ]),
  );
};

const normalizeButtonTextByType = (value) => {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    Object.entries(BUTTON_TEXT_BY_TYPE_DEFAULTS).map(([type, fallback]) => [
      type,
      normalizeFreeformLabelText(source[type], fallback),
    ]),
  );
};
const normalizeProductType = (value) =>
  PRODUCT_TYPE_OPTIONS.some((option) => option.value === value) ? value : "simple";

function AddToCartContent(props) {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [textMode, setTextMode] = useState(
    ["custom", "by_product_type"].includes(modSettings?.button_text_mode)
      ? modSettings.button_text_mode
      : "woo_default",
  );
  const [buttonValue, setButtonValue] = useState(
    getFreeformLabelTextForUi(
      modSettings?.changeButtonValue,
      DEFAULT_CUSTOM_BUTTON_TEXT,
    ),
  );
  const [textByType, setTextByType] = useState(
    syncButtonTextByTypeForUi(modSettings?.button_text_by_type),
  );
  const [productType, setProductType] = useState(
    normalizeProductType(modSettings?.button_text_type_key),
  );

  useEffect(() => {
    setTextMode(
      ["custom", "by_product_type"].includes(modSettings?.button_text_mode)
        ? modSettings.button_text_mode
        : "woo_default",
    );
    setButtonValue(
      getFreeformLabelTextForUi(
        modSettings?.changeButtonValue,
        DEFAULT_CUSTOM_BUTTON_TEXT,
      ),
    );
    setTextByType(syncButtonTextByTypeForUi(modSettings?.button_text_by_type));
    setProductType(normalizeProductType(modSettings?.button_text_type_key));
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
  const ajaxOptions = [
    {
      label: (
        <span className="caf-filter-data-source-tab-label">
          Ajax Add to Cart{" "}
          <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
            Pro
          </span>
        </span>
      ),
      value: "ajax",
      disabled: true,
      className: "caf-builder-tier-locked-segment-item",
    },
    { label: "Open Product Page", value: "product_page" },
  ];

  return (
    <>
      <div className="module-content-tab-row no-pad-0">
        <label className="setting-label-main">Button Behaviour</label>
        <div
          className="module-content-tab-row caf-builder-centered-tabs-row caf-filter-data-source-segmented-wrap caf-filter-data-source-segmented-wrap--locked"
          style={{ justifyContent: "center" }}
        >
          <Segmented
            value="product_page"
            className="hoverTabCaf caf-builder-centered-tabs"
            style={{ marginBottom: 20 }}
            options={ajaxOptions}
          />
          <Tooltip
            classNames={{
              root: "caf-builder-tooltip caf-builder-tier-locked-tooltip",
            }}
            placement="topLeft"
            title={
              <span className="caf-builder-tier-locked-section__tooltip-text">
                AJAX add to cart is available in Category Ajax Filter Pro.{" "}
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
              className="caf-builder-tier-locked-segment-overlay"
              aria-hidden="true"
            />
          </Tooltip>
        </div>
      </div>
      <div className="setting-manage-f-label">
        <hr className="setting-hr-main" />
        <label className="setting-label-main">Button Text</label>
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Choose how the add to cart button label is generated."
          >
            <label>Text</label>
          </Tooltip>
          <Select
            value={textMode}
            style={{ width: "100%" }}
            onChange={(value) => {
              setTextMode(value);
              updateSettings((settings) => {
                settings.button_text_mode = value;
                if (value === "by_product_type") {
                  settings.button_text_by_type = normalizeButtonTextByType(
                    settings.button_text_by_type,
                  );
                  settings.button_text_type_key = normalizeProductType(
                    settings.button_text_type_key,
                  );
                }
              });
            }}
            options={[
              { label: "WooCommerce Default", value: "woo_default" },
              { label: "Custom Text", value: "custom" },
              {
                label: (
                  <span>
                    Icon Only{" "}
                    <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                      Pro
                    </span>
                  </span>
                ),
                value: "icon_only",
                disabled: true,
              },
              { label: "Custom by Product Type", value: "by_product_type" },
            ]}
          />
        </div>
        {textMode === "custom" ? (
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip
              classNames={{ root: "caf-builder-tooltip" }}
              placement="topLeft"
              title="Custom label used for all product types."
            >
              <label>Label</label>
            </Tooltip>
            <Input
              value={buttonValue}
              placeholder="Add to cart"
              onChange={(event) => {
                setButtonValue(event.target.value);
                updateSettings((settings) => {
                  settings.changeButtonValue = event.target.value;
                });
              }}
              onBlur={(event) => {
                const normalized = normalizeFreeformLabelText(
                  event.target.value,
                  DEFAULT_CUSTOM_BUTTON_TEXT,
                );
                setButtonValue(normalized);
                updateSettings((settings) => {
                  settings.changeButtonValue = normalized;
                });
              }}
            />
          </div>
        ) : null}
        {textMode === "by_product_type" ? (
          <div className="module-content-tab-row caf-woo-prd-atc-text">
            <Tooltip
              classNames={{ root: "caf-builder-tooltip" }}
              placement="topLeft"
              title="Set a custom label per product type."
            >
              <label>Label</label>
            </Tooltip>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                value={textByType[productType] || ""}
                placeholder={BUTTON_TEXT_BY_TYPE_DEFAULTS[productType]}
                onChange={(event) => {
                  const next = { ...textByType, [productType]: event.target.value };
                  setTextByType(next);
                  updateSettings((settings) => {
                    settings.button_text_by_type = {
                      ...normalizeButtonTextByType(settings.button_text_by_type),
                      [productType]: event.target.value,
                    };
                  });
                }}
                onBlur={(event) => {
                  const value = normalizeFreeformLabelText(
                    event.target.value,
                    BUTTON_TEXT_BY_TYPE_DEFAULTS[productType],
                  );
                  setTextByType({ ...textByType, [productType]: value });
                  updateSettings((settings) => {
                    settings.button_text_by_type = {
                      ...normalizeButtonTextByType(settings.button_text_by_type),
                      [productType]: value,
                    };
                  });
                }}
              />
              <Select
                value={productType}
                style={{ width: 150 }}
                popupMatchSelectWidth={false}
                options={PRODUCT_TYPE_OPTIONS}
                onChange={(value) => {
                  setProductType(value);
                  updateSettings((settings) => {
                    settings.button_text_type_key = value;
                    settings.button_text_by_type = normalizeButtonTextByType(
                      settings.button_text_by_type,
                    );
                  });
                }}
              />
            </Space.Compact>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default AddToCartContent;
