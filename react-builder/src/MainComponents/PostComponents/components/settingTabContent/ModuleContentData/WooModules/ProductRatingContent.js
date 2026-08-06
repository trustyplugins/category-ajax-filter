import React, { useEffect, useState } from "react";
import apiClient from "../../../../../../api/client";
import ContentIcons from "../ContentComponents/ContentIcons";
import { Switch, Input, Segmented, Skeleton, Select, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import { resolvePostAffixEnabledForUi } from "../shared/postModuleTier";
import PostPrefixSuffixProPanel from "../PostPrefixSuffixProPanel";
import {
  getPostAffixMetaTextForUi,
  normalizePostAffixMetaText,
} from "../shared/postAffixMetaTextUtils";

const RATING_DISPLAY_DEFAULT = "stars";
const RATING_DISPLAY_OPTIONS = [
  { label: "Stars", value: "stars" },
  { label: "Average Value", value: "average_value" },
];
const COUNT_SEPARATOR_DEFAULT = "none";
const COUNT_SEPARATOR_OPTIONS = [
  { label: "None", value: "none" },
  { label: "(Brackets)", value: "brackets" },
  { label: "Hyphen - ", value: "hyphen" },
  { label: "Slash /", value: "slash" },
];
const normalizeRatingDisplay = (value) => {
  const allowed = RATING_DISPLAY_OPTIONS.map((option) => option.value);
  return allowed.includes(value) ? value : RATING_DISPLAY_DEFAULT;
};
const normalizeCountSeparator = (value) => {
  const allowed = COUNT_SEPARATOR_OPTIONS.map((option) => option.value);
  return allowed.includes(value) ? value : COUNT_SEPARATOR_DEFAULT;
};

function ProductRatingContent(props) {
  const site_url = tc_caf_ajax.plugin_path;
  const icons_url = site_url + "admin/fa-icons/fontawesome-5.json";
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [ratingDisplay, setRatingDisplay] = useState(
    normalizeRatingDisplay(modSettings?.rating_display),
  );
  const [checkPrefix, setCheckPrefix] = useState(
    modSettings?.prefix?.is_enable === "false" ? false : true,
  );
  const [checkSuffix, setCheckSuffix] = useState(
    modSettings?.suffix?.is_enable === "false" ? false : true,
  );
  const [iconsArray, setIconsArray] = useState("");
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
  const [prefixCountSeparator, setPrefixCountSeparator] = useState(
    normalizeCountSeparator(modSettings?.prefix?.count_separator),
  );
  const [suffixCountSeparator, setSuffixCountSeparator] = useState(
    normalizeCountSeparator(modSettings?.suffix?.count_separator),
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
    setRatingDisplay(normalizeRatingDisplay(modSettings?.rating_display));
    setCheckPrefix(modSettings?.prefix?.is_enable === "false" ? false : true);
    setCheckSuffix(modSettings?.suffix?.is_enable === "false" ? false : true);
    setPrefixMeta(modSettings?.prefix?.meta_type ?? "text");
    setSuffixMeta(modSettings?.suffix?.meta_type ?? "text");
    setPrefixMetaText(getPostAffixMetaTextForUi("prefix", modSettings?.prefix));
    setSuffixMetaText(getPostAffixMetaTextForUi("suffix", modSettings?.suffix))
    setPrefixCountSeparator(
      normalizeCountSeparator(modSettings?.prefix?.count_separator),
    );
    setSuffixCountSeparator(
      normalizeCountSeparator(modSettings?.suffix?.count_separator),
    );
  }, [props.data, rowindex, columnindex, moduleindex]);

  const handleRatingDisplayChange = (value) => {
    const nextValue = normalizeRatingDisplay(value);
    setRatingDisplay(nextValue);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.rating_display = nextValue;
      },
    });
  };

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

  const handleCountSeparatorChange = (value, placement) => {
    const nextValue = normalizeCountSeparator(value);
    if (placement === "prefix") {
      setPrefixCountSeparator(nextValue);
    }
    if (placement === "suffix") {
      setSuffixCountSeparator(nextValue);
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
          count_separator: nextValue,
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
        s[placement] = {
          ...(s[placement] || {}),
          meta_type: val,
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

  return (
    <>
      <div className="module-content-tab-row">
        <label className="setting-label-main">Star Settings</label>
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Choose how the product rating should display."
          >
            <label>Display As</label>
          </Tooltip>
          <Select
            value={ratingDisplay}
            style={{ width: "100%" }}
            onChange={handleRatingDisplayChange}
            options={RATING_DISPLAY_OPTIONS}
          />
        </div>
      </div>
      <PostPrefixSuffixProPanel
        prefixLabel="Prefix"
        suffixLabel="Suffix"
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

export default ProductRatingContent;
