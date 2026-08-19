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
import {
  getPostAffixDefaultMetaText,
  getPostAffixMetaTextForUi,
  normalizePostAffixMetaText,
} from "./shared/postAffixMetaTextUtils";

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
    setBadgeType(
      resolveBadgeTypeForTier(modSettings?.badge_type ?? BADGE_TYPE_DEFAULT),
    );
    setCheckPrefix(modSettings?.prefix?.is_enable === "false" ? false : true);
    setCheckSuffix(modSettings?.suffix?.is_enable === "false" ? false : true);
    setPrefixMeta(modSettings?.prefix?.meta_type ?? "text");
    setSuffixMeta(modSettings?.suffix?.meta_type ?? "text");
    setPrefixMetaText(getPostAffixMetaTextForUi("prefix", modSettings?.prefix));
    setSuffixMetaText(getPostAffixMetaTextForUi("suffix", modSettings?.suffix))
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
        suffixText === getPostAffixDefaultMetaText("suffix") ||
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
        currentSuffixText === getPostAffixDefaultMetaText("suffix") ||
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
            meta_text: getPostAffixDefaultMetaText("suffix"),
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
      setSuffixMetaText(getPostAffixDefaultMetaText("suffix"));
    }
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
