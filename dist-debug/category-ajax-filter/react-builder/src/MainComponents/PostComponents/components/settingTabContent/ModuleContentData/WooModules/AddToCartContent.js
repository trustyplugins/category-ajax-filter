import React, { useEffect, useState } from "react";
import apiClient from "../../../../../../api/client";
import ContentIcons from "../ContentComponents/ContentIcons";
import {
  Switch,
  Input,
  Segmented,
  Skeleton,
  Select,
  Tooltip,
  Space,
} from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import { resolvePostAffixEnabledForUi } from "../shared/postModuleTier";
import PostPrefixSuffixProPanel from "../PostPrefixSuffixProPanel";
import {
  getPostAffixMetaTextForUi,
  normalizePostAffixMetaText,
} from "../shared/postAffixMetaTextUtils";
import { canUseFeature } from "../../../../../../tier/capabilities";

const AFTER_ATC_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Redirect to Cart", value: "cart" },
  { label: "Redirect to checkout", value: "checkout" },
  { label: "Custom Text", value: "custom_text" },
];

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

const DEFAULT_AFTER_ATC_TEXT = "Added";

const resolveAtcBehaviour = (value) => {
  if (!canUseFeature("woo_ajax_add_to_cart")) {
    return "product_page";
  }
  return value === "product_page" ? "product_page" : "ajax";
};

const resolveAfterAtc = (value) =>
  value === "cart" || value === "checkout" || value === "custom_text"
    ? value
    : "none";

const resolveAfterAtcText = (value) => {
  const next = String(value ?? "").trim();
  return next !== "" ? next : DEFAULT_AFTER_ATC_TEXT;
};

const resolveButtonTextMode = (value) => {
  if (value === "icon_only" && !canUseFeature("label_show_icon")) {
    return "woo_default";
  }
  if (
    value === "custom" ||
    value === "icon_only" ||
    value === "by_product_type"
  ) {
    return value;
  }
  return "woo_default";
};

const normalizeButtonTextByType = (raw) => {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    simple:
      String(source.simple ?? "").trim() || BUTTON_TEXT_BY_TYPE_DEFAULTS.simple,
    variable:
      String(source.variable ?? "").trim() ||
      BUTTON_TEXT_BY_TYPE_DEFAULTS.variable,
    grouped:
      String(source.grouped ?? "").trim() ||
      BUTTON_TEXT_BY_TYPE_DEFAULTS.grouped,
    external:
      String(source.external ?? "").trim() ||
      BUTTON_TEXT_BY_TYPE_DEFAULTS.external,
    subscription:
      String(source.subscription ?? "").trim() ||
      BUTTON_TEXT_BY_TYPE_DEFAULTS.subscription,
  };
};

const resolveProductTypeKey = (value) => {
  const allowed = PRODUCT_TYPE_OPTIONS.map((item) => item.value);
  return allowed.includes(value) ? value : "simple";
};

function AddToCartContent(props) {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [buttonTextMode, setButtonTextMode] = useState(
    resolveButtonTextMode(modSettings?.button_text_mode),
  );
  const [buttonValue, setButtonValue] = useState(
    modSettings?.changeButtonValue || "Add to cart",
  );
  const [buttonTextByType, setButtonTextByType] = useState(
    normalizeButtonTextByType(modSettings?.button_text_by_type),
  );
  const [productTypeKey, setProductTypeKey] = useState(
    resolveProductTypeKey(modSettings?.button_text_type_key),
  );
  const [atcBehaviour, setAtcBehaviour] = useState(
    resolveAtcBehaviour(modSettings?.atc_behaviour),
  );
  const [afterAtc, setAfterAtc] = useState(
    resolveAfterAtc(modSettings?.after_atc),
  );
  const [afterAtcText, setAfterAtcText] = useState(
    resolveAfterAtcText(modSettings?.after_atc_text),
  );
  const [iconsArray, setIconsArray] = useState("");
  const site_url = tc_caf_ajax.plugin_path;
  const icons_url = site_url + "admin/fa-icons/fontawesome-5.json";

  const [checkPrefix, setCheckPrefix] = useState(
    modSettings?.prefix?.is_enable === "false" ? false : true,
  );
  const [checkSuffix, setCheckSuffix] = useState(
    modSettings?.suffix?.is_enable === "false" ? false : true,
  );
  const [prefixMeta, setPrefixMeta] = useState(
    modSettings?.prefix?.meta_type ?? "text",
  );
  const [suffixMeta, setSuffixMeta] = useState(
    modSettings?.suffix?.meta_type ?? "text",
  );
  const [prefixMetaText, setPrefixMetaText] = useState(
    getPostAffixMetaTextForUi("prefix", modSettings?.prefix),
  );
  const [suffixMetaText, setSuffixMetaText] = useState(
    getPostAffixMetaTextForUi("suffix", modSettings?.suffix),
  )

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
    setButtonTextMode(resolveButtonTextMode(modSettings?.button_text_mode));
    setButtonValue(modSettings?.changeButtonValue || "Add to cart");
    setButtonTextByType(
      normalizeButtonTextByType(modSettings?.button_text_by_type),
    );
    setProductTypeKey(resolveProductTypeKey(modSettings?.button_text_type_key));
    setAtcBehaviour(resolveAtcBehaviour(modSettings?.atc_behaviour));
    setAfterAtc(resolveAfterAtc(modSettings?.after_atc));
    setAfterAtcText(resolveAfterAtcText(modSettings?.after_atc_text));
    setCheckPrefix(modSettings?.prefix?.is_enable === "false" ? false : true);
    setCheckSuffix(modSettings?.suffix?.is_enable === "false" ? false : true);
    setPrefixMeta(modSettings?.prefix?.meta_type ?? "text");
    setSuffixMeta(modSettings?.suffix?.meta_type ?? "text");
    setPrefixMetaText(getPostAffixMetaTextForUi("prefix", modSettings?.prefix));
    setSuffixMetaText(getPostAffixMetaTextForUi("suffix", modSettings?.suffix))
  }, [props.data, rowindex, columnindex, moduleindex]);

  

  const handleButtonTextModeChange = (value) => {
    const nextMode = resolveButtonTextMode(value);
    if (value === "icon_only" && nextMode !== "icon_only") {
      return;
    }
    setButtonTextMode(nextMode);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.button_text_mode = nextMode;
        if (nextMode === "by_product_type") {
          s.button_text_by_type = normalizeButtonTextByType(
            s.button_text_by_type,
          );
          s.button_text_type_key = resolveProductTypeKey(
            s.button_text_type_key,
          );
        }
        if (nextMode === "icon_only") {
          s.button_icon = {
            ...(s.button_icon || {}),
            icons: {
              visibility: true,
              type: s?.button_icon?.icons?.type || "icon",
              icon: s?.button_icon?.icons?.icon || "fas fa-shopping-cart",
              position: s?.button_icon?.icons?.position || "before-button",
            },
          };
        }
      },
    });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setButtonValue(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.changeButtonValue = value;
      },
    });
  };

  const handleProductTypeKeyChange = (value) => {
    const nextKey = resolveProductTypeKey(value);
    setProductTypeKey(nextKey);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.button_text_type_key = nextKey;
        s.button_text_by_type = normalizeButtonTextByType(
          s.button_text_by_type,
        );
      },
    });
  };

  const handleProductTypeTextChange = (e) => {
    const value = e.target.value;
    const nextByType = {
      ...buttonTextByType,
      [productTypeKey]: value,
    };
    setButtonTextByType(nextByType);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.button_text_by_type = {
          ...normalizeButtonTextByType(s.button_text_by_type),
          [productTypeKey]: value,
        };
      },
    });
  };

  const handleProductTypeTextBlur = (e) => {
    const fallback =
      BUTTON_TEXT_BY_TYPE_DEFAULTS[productTypeKey] || "Add to cart";
    const normalized = String(e.target.value ?? "").trim() || fallback;
    const nextByType = {
      ...buttonTextByType,
      [productTypeKey]: normalized,
    };
    setButtonTextByType(nextByType);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.button_text_by_type = {
          ...normalizeButtonTextByType(s.button_text_by_type),
          [productTypeKey]: normalized,
        };
      },
    });
  };

  const handleAtcBehaviourChange = (value) => {
    const nextBehaviour = resolveAtcBehaviour(value);
    if (value === "ajax" && nextBehaviour !== "ajax") {
      return;
    }
    setAtcBehaviour(nextBehaviour);
    if (nextBehaviour !== "ajax") {
      setAfterAtc("none");
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.atc_behaviour = nextBehaviour;
        if (nextBehaviour !== "ajax") {
          s.after_atc = "none";
        }
      },
    });
  };

  const handleAfterAtcChange = (value) => {
    const nextAfter = resolveAfterAtc(value);
    setAfterAtc(nextAfter);
    if (nextAfter === "custom_text") {
      setAfterAtcText(resolveAfterAtcText(modSettings?.after_atc_text));
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.after_atc = nextAfter;
        if (nextAfter === "custom_text") {
          s.after_atc_text = resolveAfterAtcText(s.after_atc_text);
        }
      },
    });
  };

  const handleAfterAtcTextChange = (e) => {
    const value = e.target.value;
    setAfterAtcText(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.after_atc_text = value;
      },
    });
  };

  const handleAfterAtcTextBlur = (e) => {
    const normalized = resolveAfterAtcText(e.target.value);
    setAfterAtcText(normalized);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.after_atc_text = normalized;
      },
    });
  };

  const handleChangePrefix = (checked) => {
    setCheckPrefix(checked);
    if (checked && prefixMeta === "text") {
      setPrefixMetaText(
        normalizePostAffixMetaText("prefix", modSettings?.prefix?.meta_text),
      );
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
          meta_text:
            checked && (s?.prefix?.meta_type ?? "text") === "text"
              ? normalizePostAffixMetaText("prefix", s?.prefix?.meta_text)
              : s?.prefix?.meta_text ?? "",
        };
      },
    });
  };

  const handleChangeSuffix = (checked) => {
    setCheckSuffix(checked);
    if (checked && suffixMeta === "text") {
      setSuffixMetaText(
        normalizePostAffixMetaText("suffix", modSettings?.suffix?.meta_text),
      );
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
          meta_text:
            checked && (s?.suffix?.meta_type ?? "text") === "text"
              ? normalizePostAffixMetaText("suffix", s?.suffix?.meta_text)
              : s?.suffix?.meta_text ?? "",
        };
      },
    });
  };

  const handleMetaChange = (val, placement) => {
    if (placement === "prefix") {
      setPrefixMeta(val);
    }
    if (placement === "suffix") {
      setSuffixMeta(val);
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        const isEnabled = s?.[placement]?.is_enable === "true";
        const nextMeta = {
          ...(s[placement] || {}),
          meta_type: val,
        };
        if (isEnabled && val === "text") {
          nextMeta.meta_text = normalizePostAffixMetaText(placement, nextMeta.meta_text);
        }
        s[placement] = {
          ...nextMeta,
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
    const isTextMode =
      placement === "prefix"
        ? prefixMeta === "text"
        : placement === "suffix"
        ? suffixMeta === "text"
        : false;
    const isEnabled =
      placement === "prefix"
        ? checkPrefix
        : placement === "suffix"
        ? checkSuffix
        : false;
    if (!isTextMode || !isEnabled) return;
    const normalized = normalizePostAffixMetaText(placement, value);
    if (placement === "prefix") setPrefixMetaText(normalized);
    if (placement === "suffix") setSuffixMetaText(normalized);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s[placement] = {
          ...(s[placement] || {}),
          meta_text: normalized,
        };
      },
    });
  };

  const productTypeSelect = (
    <Select
      value={productTypeKey}
      onChange={handleProductTypeKeyChange}
      options={PRODUCT_TYPE_OPTIONS}
      popupMatchSelectWidth={false}
      style={{ width: 150 }}
    />
  );

  const ajaxAtcLocked = !canUseFeature("woo_ajax_add_to_cart");
  const iconOnlyLocked = !canUseFeature("label_show_icon");
  const buttonTextModeOptions = [
    { label: "WooCommerce Default", value: "woo_default" },
    { label: "Custom Text", value: "custom" },
    {
      label: iconOnlyLocked ? (
        <span>
          Icon Only{" "}
          <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
            Pro
          </span>
        </span>
      ) : (
        "Icon Only"
      ),
      value: "icon_only",
      disabled: iconOnlyLocked,
    },
    { label: "Custom by Product Type", value: "by_product_type" },
  ];
  const atcBehaviourTabOptions = [
    {
      label: ajaxAtcLocked ? (
        <span className="caf-filter-data-source-tab-label">
          Ajax Add to Cart{" "}
          <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
            Pro
          </span>
        </span>
      ) : (
        "Ajax Add to Cart"
      ),
      value: "ajax",
      disabled: ajaxAtcLocked,
      className: ajaxAtcLocked
        ? "caf-builder-tier-locked-segment-item"
        : undefined,
    },
    { label: "Open Product Page", value: "product_page" },
  ];

  return (
    <>
      <div className="module-content-tab-row no-pad-0">
        <label className="setting-label-main">Button Behaviour</label>
        <div
          className="module-content-tab-row caf-builder-centered-tabs-row"
          style={{ justifyContent: "center" }}
        >
          <Segmented
            value={atcBehaviour}
            onChange={handleAtcBehaviourChange}
            className="hoverTabCaf caf-builder-centered-tabs"
            style={{ marginBottom: 20 }}
            options={atcBehaviourTabOptions}
          />
        </div>
        {atcBehaviour === "ajax" && (
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip
              classNames={{ root: "caf-builder-tooltip" }}
              placement="topLeft"
              title="Choose what happens after a successful AJAX add to cart."
            >
              <label>Action</label>
            </Tooltip>
            <Select
              value={afterAtc}
              style={{ width: "100%" }}
              onChange={handleAfterAtcChange}
              options={AFTER_ATC_OPTIONS}
            />
          </div>
        )}
        {atcBehaviour === "ajax" && afterAtc === "custom_text" && (
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip
              classNames={{ root: "caf-builder-tooltip" }}
              placement="topLeft"
              title="Temporary message shown on the button after a successful add to cart."
            >
              <label>Message</label>
            </Tooltip>
            <Input
              value={afterAtcText}
              onChange={handleAfterAtcTextChange}
              onBlur={handleAfterAtcTextBlur}
              placeholder={DEFAULT_AFTER_ATC_TEXT}
            />
          </div>
        )}
      </div>
      <div className="setting-manage-f-label">
        <hr className="setting-hr-main"></hr>
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
            value={buttonTextMode}
            style={{ width: "100%" }}
            onChange={handleButtonTextModeChange}
            options={buttonTextModeOptions}
          />
        </div>
        {buttonTextMode === "custom" && (
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip
              classNames={{ root: "caf-builder-tooltip" }}
              placement="topLeft"
              title="Custom label used for all product types."
            >
              <label>Label</label>
            </Tooltip>
            <Input
              onChange={handleChange}
              value={buttonValue}
              placeholder="Add to cart"
            />
          </div>
        )}
        {buttonTextMode === "by_product_type" && (
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
                value={buttonTextByType[productTypeKey] || ""}
                onChange={handleProductTypeTextChange}
                onBlur={handleProductTypeTextBlur}
                placeholder={
                  BUTTON_TEXT_BY_TYPE_DEFAULTS[productTypeKey] || "Add to cart"
                }
              />
              {productTypeSelect}
            </Space.Compact>
          </div>
        )}
        {buttonTextMode === "icon_only" && (
          <div className="module-content-tab-row">
            {iconsArray.length > 0 ? (
              <ContentIcons
                title="Icons"
                labelType={"button"}
                moduleIcon="button_icon"
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
      </div>
      <PostPrefixSuffixProPanel
        prefixLabel="Prefix (Before Text)"
        suffixLabel="Suffix (After Text)"
        checkPrefix={resolvePostAffixEnabledForUi(checkPrefix)}
        checkSuffix={resolvePostAffixEnabledForUi(checkSuffix)}
        prefixMeta={prefixMeta}
        suffixMeta={suffixMeta}
        prefixMetaText={prefixMetaText}
        suffixMetaText={suffixMetaText}
        onPrefixChange={handleChangePrefix}
        onSuffixChange={handleChangeSuffix}
        onMetaChange={handleMetaChange}
        onMetaText={handleMetaText}
        onMetaTextBlur={handleMetaTextBlur}
        iconsArray={iconsArray}
        data={props.data}
        indexes={props.indexes}
        onSettingChange={props.onSettingChange}
        allowAvatar={false}
      />
    </>
  );
}

export default AddToCartContent;
