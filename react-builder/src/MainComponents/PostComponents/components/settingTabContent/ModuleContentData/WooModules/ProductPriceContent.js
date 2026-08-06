import React, { useEffect, useState } from "react";
import apiClient from "../../../../../../api/client";
import ContentIcons from "../ContentComponents/ContentIcons";
import { Switch, Input, Segmented, Skeleton, Select, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import { canUseFeature } from "../../../../../../tier/capabilities";
import {
  getPostAffixMetaTextForUi,
  normalizePostAffixMetaText,
} from "../shared/postAffixMetaTextUtils";

const TEXT_VISIBILITY_DEFAULT = "all";
const TEXT_VISIBILITY_OPTIONS = [
  { label: "All Products", value: "all" },
  { label: "Simple Products", value: "simple_products" },
  { label: "Variable Products", value: "variable_products" },
  { label: "Grouped Products", value: "grouped_products" },
];
const normalizeTextVisibility = (value) => {
  const allowed = TEXT_VISIBILITY_OPTIONS.map((option) => option.value);
  return allowed.includes(value) ? value : TEXT_VISIBILITY_DEFAULT;
};
const resolvePriceDisplayMode = (value) =>
  canUseFeature("woo_product_price_display_modes") &&
  (value === "lowest_price" || value === "highest_price")
    ? value
    : "default";
// Prefix/suffix is available on free for product price, but icon affixes stay Pro.
const resolveAffixMetaType = (value) => {
  const metaType = value ?? "text";
  return metaType === "icon" && !canUseFeature("label_show_icon")
    ? "text"
    : metaType;
};

function ProductPriceContent(props) {
  const site_url = tc_caf_ajax.plugin_path;
  let icons_url = site_url + "admin/fa-icons/fontawesome-5.json";
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [checkPrefix, setCheckPrefix] = useState(
    modSettings?.prefix?.is_enable === "false" ? false : true,
  );
  const [checkSuffix, setCheckSuffix] = useState(
    modSettings?.suffix?.is_enable === "false" ? false : true,
  );
  const [iconsArray, setIconsArray] = useState("");
  const [prefixMeta, setPrefixMeta] = useState(
    resolveAffixMetaType(modSettings?.prefix?.meta_type),
  );
  const [suffixMeta, setSuffixMeta] = useState(
    resolveAffixMetaType(modSettings?.suffix?.meta_type),
  );
  const [prefixMetaText, setPrefixMetaText] = useState(
    getPostAffixMetaTextForUi("prefix", modSettings?.prefix),
  );
  const [suffixMetaText, setSuffixMetaText] = useState(
    getPostAffixMetaTextForUi("suffix", modSettings?.suffix),
  )
  const [showPrice, setShowPrice] = useState(
    resolvePriceDisplayMode(modSettings?.show_price),
  );
  const [prefixTextVisibility, setPrefixTextVisibility] = useState(
    normalizeTextVisibility(modSettings?.prefix?.text_visibility),
  );
  const [suffixTextVisibility, setSuffixTextVisibility] = useState(
    normalizeTextVisibility(modSettings?.suffix?.text_visibility),
  );

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await apiClient.get(icons_url);
        if (response.data) {
          setIconsArray(response.data);
        }
      } catch (error) {
        console.error("Error ", error);
      }
    };

    fetchIcons();
  }, []);

  useEffect(() => {
    setCheckPrefix(modSettings?.prefix?.is_enable === "false" ? false : true);
    setCheckSuffix(modSettings?.suffix?.is_enable === "false" ? false : true);
    setPrefixMeta(resolveAffixMetaType(modSettings?.prefix?.meta_type));
    setSuffixMeta(resolveAffixMetaType(modSettings?.suffix?.meta_type));
    setPrefixMetaText(getPostAffixMetaTextForUi("prefix", modSettings?.prefix));
    setSuffixMetaText(getPostAffixMetaTextForUi("suffix", modSettings?.suffix))
    setShowPrice(resolvePriceDisplayMode(modSettings?.show_price));
    setPrefixTextVisibility(
      normalizeTextVisibility(modSettings?.prefix?.text_visibility),
    );
    setSuffixTextVisibility(
      normalizeTextVisibility(modSettings?.suffix?.text_visibility),
    );
  }, [props.data, rowindex, columnindex, moduleindex]);

  const handleChangePrefix = (checked) => {
    setCheckPrefix(checked);
    const nextPrefixText = checked
      ? normalizePostAffixMetaText("prefix", modSettings?.prefix?.meta_text)
      : modSettings?.prefix?.meta_text ?? "";
    if (checked) {
      setPrefixMetaText(nextPrefixText);
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.prefix = {
          ...(s.prefix || {}),
          is_enable: checked ? "true" : "false",
          meta_text: checked
            ? normalizePostAffixMetaText("prefix", s?.prefix?.meta_text)
            : s?.prefix?.meta_text ?? "",
        };
      },
    });
  };

  const handleChangeSuffix = (checked) => {
    setCheckSuffix(checked);
    const nextSuffixText = checked
      ? normalizePostAffixMetaText("suffix", modSettings?.suffix?.meta_text)
      : modSettings?.suffix?.meta_text ?? "";
    if (checked) {
      setSuffixMetaText(nextSuffixText);
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.suffix = {
          ...(s.suffix || {}),
          is_enable: checked ? "true" : "false",
          meta_text: checked
            ? normalizePostAffixMetaText("suffix", s?.suffix?.meta_text)
            : s?.suffix?.meta_text ?? "",
        };
      },
    });
  };

  const handleMetaChange = (val, placement) => {
    const nextVal = resolveAffixMetaType(val);
    if (nextVal !== val) {
      return;
    }
    if (placement === "prefix") {
      setPrefixMeta(nextVal);
    }
    if (placement === "suffix") {
      setSuffixMeta(nextVal);
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s[placement] = {
          ...(s[placement] || {}),
          meta_type: nextVal,
        };
      },
    });
  };

  const handleMetaText = (val, placement) => {
    if (placement === "prefix") {
      setPrefixMetaText(val);
    }
    if (placement === "suffix") {
      setSuffixMetaText(val);
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s[placement] = {
          ...(s[placement] || {}),
          meta_text: val,
        };
      },
    });
  };

  const handleMetaTextBlur = (placement, value) => {
    if (placement === "prefix" && !checkPrefix) return;
    if (placement === "suffix" && !checkSuffix) return;
    const normalizedVal = normalizePostAffixMetaText(placement, value);
    if (placement === "prefix") {
      setPrefixMetaText(normalizedVal);
    }
    if (placement === "suffix") {
      setSuffixMetaText(normalizedVal);
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s[placement] = {
          ...(s[placement] || {}),
          meta_text: normalizedVal,
        };
      },
    });
  };

  const handleTextVisibilityChange = (value, placement) => {
    const nextValue = normalizeTextVisibility(value);
    if (placement === "prefix") {
      setPrefixTextVisibility(nextValue);
    }
    if (placement === "suffix") {
      setSuffixTextVisibility(nextValue);
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s[placement] = {
          ...(s[placement] || {}),
          text_visibility: nextValue,
        };
      },
    });
  };

  const handleShowPriceChange = (value) => {
    const nextValue = resolvePriceDisplayMode(value);
    setShowPrice(nextValue);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.show_price = nextValue;
      },
    });
  };

  const iconAffixLocked = !canUseFeature("label_show_icon");
  const affixContentTypeOptions = [
    { label: "Regular Price", value: "regular_price" },
    { label: "Text", value: "text" },
    {
      label: iconAffixLocked ? (
        <span className="caf-filter-data-source-tab-label">
          Icon{" "}
          <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
            Pro
          </span>
        </span>
      ) : (
        "Icon"
      ),
      value: "icon",
      disabled: iconAffixLocked,
      className: iconAffixLocked
        ? "caf-builder-tier-locked-segment-item"
        : undefined,
    },
  ];

  return (
    <>
      <div className="module-content-tab-row">
        <label className="setting-label-main">Special Products</label>
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Choose which price to show for variable or grouped products."
          >
            <label>Display Price As</label>
          </Tooltip>
          <Select
            value={showPrice}
            style={{ width: "100%" }}
            onChange={handleShowPriceChange}
            options={[
              { label: "WooCommerce Default", value: "default" },
              {
                label: canUseFeature("woo_product_price_display_modes") ? (
                  "Lowest Price"
                ) : (
                  <span>
                    Lowest Price{" "}
                    <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                      Pro
                    </span>
                  </span>
                ),
                value: "lowest_price",
                disabled: !canUseFeature("woo_product_price_display_modes"),
              },
              {
                label: canUseFeature("woo_product_price_display_modes") ? (
                  "Highest Price"
                ) : (
                  <span>
                    Highest Price{" "}
                    <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                      Pro
                    </span>
                  </span>
                ),
                value: "highest_price",
                disabled: !canUseFeature("woo_product_price_display_modes"),
              },
            ]}
          />
        </div>
      </div>
      <div className="setting-manage-f-label">
        <hr className="setting-hr-main"></hr>
        <label className="setting-label-main">
          Prefix <span className="setting-label-sub-text">(Before Price)</span>
        </label>
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Enable or disable prefix."
          >
            <label>Enable</label>
          </Tooltip>
          <Switch onChange={handleChangePrefix} checked={checkPrefix} />
        </div>
        {checkPrefix && (
          <>
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip
                classNames={{ root: "caf-builder-tooltip" }}
                placement="topLeft"
                title="Select prefix content type."
              >
                <label>Content Type</label>
              </Tooltip>
              <Segmented
                value={prefixMeta}
                onChange={(value) => handleMetaChange(value, "prefix")}
                className={"hoverTabCaf"}
                options={affixContentTypeOptions}
              />
            </div>
            {prefixMeta === "text" && (
              <>
                <div className="module-content-tab-row caf-design-two-half">
                  <Tooltip
                    classNames={{ root: "caf-builder-tooltip" }}
                    placement="topLeft"
                    title="Set prefix text value."
                  >
                    <label>Text</label>
                  </Tooltip>
                  <Input
                    onChange={(e) => handleMetaText(e.target.value, "prefix")}
                    value={prefixMetaText}
                    onBlur={(e) => handleMetaTextBlur("prefix", e.target.value)}
                  />
                </div>
                <div className="module-content-tab-row caf-design-two-half">
                  <Tooltip
                    classNames={{ root: "caf-builder-tooltip" }}
                    placement="topLeft"
                    title="Choose which product types show this prefix text."
                  >
                    <label>Visibility</label>
                  </Tooltip>
                  <Select
                    value={prefixTextVisibility}
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      handleTextVisibilityChange(value, "prefix")
                    }
                    options={TEXT_VISIBILITY_OPTIONS}
                  />
                </div>
              </>
            )}
            {prefixMeta === "icon" && (
              <div className="module-content-tab-row">
                {iconsArray.length > 0 ? (
                  <ContentIcons
                    title="Icons"
                    labelType={"label"}
                    moduleIcon="prefix"
                    data={props.data}
                    indexes={props.indexes}
                    iconsArray={iconsArray}
                    onSettingChange={props.onSettingChange}
                  ></ContentIcons>
                ) : (
                  <Skeleton active></Skeleton>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="setting-manage-f-label">
        <hr className="setting-hr-main"></hr>
        <label className="setting-label-main">
          Suffix <span className="setting-label-sub-text">(After Price)</span>
        </label>
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Enable or disable suffix."
          >
            <label>Enable</label>
          </Tooltip>
          <Switch onChange={handleChangeSuffix} checked={checkSuffix} />
        </div>
        {checkSuffix && (
          <>
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip
                classNames={{ root: "caf-builder-tooltip" }}
                placement="topLeft"
                title="Select suffix content type."
              >
                <label>Content Type</label>
              </Tooltip>
              <Segmented
                value={suffixMeta}
                onChange={(value) => handleMetaChange(value, "suffix")}
                className={"hoverTabCaf"}
                options={affixContentTypeOptions}
              />
            </div>
            {suffixMeta === "text" && (
              <>
                <div className="module-content-tab-row caf-design-two-half">
                  <Tooltip
                    classNames={{ root: "caf-builder-tooltip" }}
                    placement="topLeft"
                    title="Set suffix text value."
                  >
                    <label>Text</label>
                  </Tooltip>
                  <Input
                    onChange={(e) => handleMetaText(e.target.value, "suffix")}
                    value={suffixMetaText}
                    onBlur={(e) => handleMetaTextBlur("suffix", e.target.value)}
                  />
                </div>
                <div className="module-content-tab-row caf-design-two-half">
                  <Tooltip
                    classNames={{ root: "caf-builder-tooltip" }}
                    placement="topLeft"
                    title="Choose which product types show this suffix text."
                  >
                    <label>Visibility</label>
                  </Tooltip>
                  <Select
                    value={suffixTextVisibility}
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      handleTextVisibilityChange(value, "suffix")
                    }
                    options={TEXT_VISIBILITY_OPTIONS}
                  />
                </div>
              </>
            )}
            {suffixMeta === "icon" && (
              <div className="module-content-tab-row">
                {iconsArray.length > 0 ? (
                  <ContentIcons
                    title="Icons"
                    labelType={"label"}
                    moduleIcon="suffix"
                    data={props.data}
                    indexes={props.indexes}
                    iconsArray={iconsArray}
                    onSettingChange={props.onSettingChange}
                  ></ContentIcons>
                ) : (
                  <Skeleton active></Skeleton>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ProductPriceContent;
