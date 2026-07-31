import React, { useEffect, useState } from "react";
import apiClient from "../../../../../api/client";
import ContentIcons from "./ContentComponents/ContentIcons";
import { Switch, Input, Segmented, Skeleton, Select, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "./postLayoutSnapshot";
import { resolvePostAffixEnabledForUi } from "./shared/postModuleTier";
import PostPrefixSuffixProPanel from "./PostPrefixSuffixProPanel";
import {
  BADGE_TYPE_DEFAULT,
  getBadgeTypeSelectOptions,
  isFreeBadgeType,
  resolveBadgeTypeForTier,
} from "../../woocommerce/badgeTypeOptions";
import SaleBadgeSettings from "./BadgeTypeSettings/SaleBadgeSettings";
import FeaturedBadgeSettings from "./BadgeTypeSettings/FeaturedBadgeSettings";
import NewBadgeSettings from "./BadgeTypeSettings/NewBadgeSettings";
import StockStatusTextBadgeSettings from "./BadgeTypeSettings/StockStatusTextBadgeSettings";
import StockQuantityBadgeSettings from "./BadgeTypeSettings/StockQuantityBadgeSettings";
import DiscountBadgeSettings from "./BadgeTypeSettings/DiscountBadgeSettings";
import BestSellerBadgeSettings from "./BadgeTypeSettings/BestSellerBadgeSettings";

const BADGES_META_TEXT_DEFAULTS = {
  prefix: "Prefix",
  suffix: "Suffix",
};
const getDefaultMetaText = (placement) =>
  BADGES_META_TEXT_DEFAULTS[placement] || "Text";
const normalizeMetaText = (placement, value) => {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return nextValue !== "" ? nextValue : getDefaultMetaText(placement);
};

function ModuleBadgesContent(props) {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [badgeType, setBadgeType] = useState(
    resolveBadgeTypeForTier(modSettings?.badge_type ?? BADGE_TYPE_DEFAULT),
  );
  const [iconsArray, setIconsArray] = useState("");
  const site_url = tc_caf_ajax.plugin_path;
  let icons_url = site_url + "admin/fa-icons/fontawesome-5.json";

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
    modSettings?.prefix?.is_enable === "true" &&
      (modSettings?.prefix?.meta_type ?? "text") === "text"
      ? normalizeMetaText("prefix", modSettings?.prefix?.meta_text)
      : modSettings?.prefix?.meta_text ?? "",
  );
  const [suffixMetaText, setSuffixMetaText] = useState(
    modSettings?.suffix?.is_enable === "true" &&
      (modSettings?.suffix?.meta_type ?? "text") === "text"
      ? normalizeMetaText("suffix", modSettings?.suffix?.meta_text)
      : modSettings?.suffix?.meta_text ?? "",
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
    setBadgeType(
      resolveBadgeTypeForTier(modSettings?.badge_type ?? BADGE_TYPE_DEFAULT),
    );
    setCheckPrefix(modSettings?.prefix?.is_enable === "false" ? false : true);
    setCheckSuffix(modSettings?.suffix?.is_enable === "false" ? false : true);
    setPrefixMeta(modSettings?.prefix?.meta_type ?? "text");
    setSuffixMeta(modSettings?.suffix?.meta_type ?? "text");
    setPrefixMetaText(
      modSettings?.prefix?.is_enable === "true" &&
        (modSettings?.prefix?.meta_type ?? "text") === "text"
        ? normalizeMetaText("prefix", modSettings?.prefix?.meta_text)
        : modSettings?.prefix?.meta_text ?? "",
    );
    setSuffixMetaText(
      modSettings?.suffix?.is_enable === "true" &&
        (modSettings?.suffix?.meta_type ?? "text") === "text"
        ? normalizeMetaText("suffix", modSettings?.suffix?.meta_text)
        : modSettings?.suffix?.meta_text ?? "",
    );
  }, [props.data, rowindex, columnindex, moduleindex]);

  // Discount values are numeric only — seed Suffix "Off" when still at module defaults.
  useEffect(() => {
    const type = resolveBadgeTypeForTier(
      modSettings?.badge_type ?? BADGE_TYPE_DEFAULT,
    );
    if (type !== "discount") {
      return;
    }
    const suffixEnabled = modSettings?.suffix?.is_enable === "true";
    const suffixText = String(modSettings?.suffix?.meta_text ?? "").trim();
    const isUntouchedSuffix =
      !suffixEnabled &&
      (suffixText === "" ||
        suffixText === getDefaultMetaText("suffix") ||
        suffixText === "Suffix");
    if (!isUntouchedSuffix) {
      return;
    }
    setCheckSuffix(true);
    setSuffixMeta("text");
    setSuffixMetaText("Off");
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.suffix = {
          ...(s.suffix || {}),
          is_enable: "true",
          meta_type: "text",
          meta_text: "Off",
        };
      },
    });
  }, [props.data, rowindex, columnindex, moduleindex]);

  useEffect(() => {
    const prefixType = modSettings?.prefix?.meta_type ?? "text";
    const suffixType = modSettings?.suffix?.meta_type ?? "text";
    const shouldPatchPrefix =
      modSettings?.prefix?.is_enable === "true" &&
      prefixType === "text" &&
      normalizeMetaText("prefix", modSettings?.prefix?.meta_text) !==
        (modSettings?.prefix?.meta_text ?? "");
    const shouldPatchSuffix =
      modSettings?.suffix?.is_enable === "true" &&
      suffixType === "text" &&
      normalizeMetaText("suffix", modSettings?.suffix?.meta_text) !==
        (modSettings?.suffix?.meta_text ?? "");
    if (!shouldPatchPrefix && !shouldPatchSuffix) return;
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        if (shouldPatchPrefix) {
          s.prefix = {
            ...(s.prefix || {}),
            meta_text: normalizeMetaText("prefix", s?.prefix?.meta_text),
          };
        }
        if (shouldPatchSuffix) {
          s.suffix = {
            ...(s.suffix || {}),
            meta_text: normalizeMetaText("suffix", s?.suffix?.meta_text),
          };
        }
      },
    });
  }, [props.data, rowindex, columnindex, moduleindex]);

  const onSettingChange = (data) => {
    props.onSettingChange(data);
  };

  const handleBadgeTypeChange = (value) => {
    const nextType = resolveBadgeTypeForTier(value);
    if (nextType !== value && !isFreeBadgeType(value)) {
      return;
    }
    const prevType = badgeType;
    setBadgeType(nextType);

    const currentSuffixText = String(
      modSettings?.suffix?.meta_text ?? "",
    ).trim();
    const currentSuffixEnabled = modSettings?.suffix?.is_enable === "true";
    const isUntouchedSuffix =
      !currentSuffixEnabled &&
      (currentSuffixText === "" ||
        currentSuffixText === getDefaultMetaText("suffix") ||
        currentSuffixText === "Suffix");

    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.badge_type = nextType;

        if (nextType === "discount" && isUntouchedSuffix) {
          // Discount value is numeric only; seed Suffix "Off" when still at defaults.
          s.suffix = {
            ...(s.suffix || {}),
            is_enable: "true",
            meta_type: "text",
            meta_text: "Off",
          };
        } else if (
          prevType === "discount" &&
          String(s?.suffix?.meta_text ?? "").trim() === "Off"
        ) {
          s.suffix = {
            ...(s.suffix || {}),
            is_enable: "false",
            meta_text: getDefaultMetaText("suffix"),
          };
        }
      },
    });

    if (nextType === "discount" && isUntouchedSuffix) {
      setCheckSuffix(true);
      setSuffixMeta("text");
      setSuffixMetaText("Off");
    } else if (prevType === "discount" && suffixMetaText.trim() === "Off") {
      setCheckSuffix(false);
      setSuffixMetaText(getDefaultMetaText("suffix"));
    }
  };

  const handleChangePrefix = (checked) => {
    setCheckPrefix(checked);
    if (checked && prefixMeta === "text") {
      setPrefixMetaText(
        normalizeMetaText("prefix", modSettings?.prefix?.meta_text),
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
              ? normalizeMetaText("prefix", s?.prefix?.meta_text)
              : s?.prefix?.meta_text ?? "",
        };
      },
    });
  };

  const handleChangeSuffix = (checked) => {
    setCheckSuffix(checked);
    if (checked && suffixMeta === "text") {
      setSuffixMetaText(
        normalizeMetaText("suffix", modSettings?.suffix?.meta_text),
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
              ? normalizeMetaText("suffix", s?.suffix?.meta_text)
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
          nextMeta.meta_text = normalizeMetaText(placement, nextMeta.meta_text);
        }
        s[placement] = {
          ...nextMeta,
        };
      },
    });
  };

  const handleMetaText = (val, placement) => {
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
    const nextVal =
      isTextMode && isEnabled ? normalizeMetaText(placement, val) : val;
    if (placement === "prefix") {
      setPrefixMetaText(nextVal);
    }
    if (placement === "suffix") {
      setSuffixMetaText(nextVal);
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
          meta_text: nextVal,
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
    const normalized = normalizeMetaText(placement, value);
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

  return (
    <>
      <div className="module-content-tab-row no-pad-0">
        <label className="setting-label-main">Badge Settings</label>
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Select which product badge to display."
          >
            <label>Type</label>
          </Tooltip>
          <Select
            value={badgeType}
            onChange={handleBadgeTypeChange}
            options={getBadgeTypeSelectOptions()}
            popupMatchSelectWidth={false}
          />
        </div>
      </div>
      {badgeType === "sale" && (
        <SaleBadgeSettings
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
        />
      )}
      {badgeType === "featured" && (
        <FeaturedBadgeSettings
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
        />
      )}
      {badgeType === "new" && (
        <NewBadgeSettings
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
        />
      )}
      {badgeType === "stock_status_text" && (
        <StockStatusTextBadgeSettings
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
        />
      )}
      {badgeType === "stock_quantity" && (
        <StockQuantityBadgeSettings
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
        />
      )}
      {badgeType === "discount" && (
        <DiscountBadgeSettings
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
        />
      )}
      {badgeType === "best_seller" && (
        <BestSellerBadgeSettings
          data={props.data}
          indexes={props.indexes}
          onSettingChange={onSettingChange}
        />
      )}
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

export default ModuleBadgesContent;
