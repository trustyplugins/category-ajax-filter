import React, { useEffect, useState } from "react";
import apiClient from "../../../../../api/client";
import ContentIcons from "./ContentComponents/ContentIcons";
import ContentLink from "./ContentComponents/ContentLink";
import { Switch, Input, Segmented, Skeleton, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "./postLayoutSnapshot";
import { resolvePostAffixEnabledForUi } from "./shared/postModuleTier";
import PostPrefixSuffixProPanel from "./PostPrefixSuffixProPanel";
const TITLE_META_TEXT_DEFAULTS = {
  prefix: "Prefix",
  suffix: "Suffix",
};
const getDefaultMetaText = (placement) =>
  TITLE_META_TEXT_DEFAULTS[placement] || "Text";
const normalizeMetaText = (placement, value) => {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return nextValue !== "" ? nextValue : getDefaultMetaText(placement);
};

function ModuleTitleContent(props) {
  //console.log(props.data);
  const site_url = tc_caf_ajax.plugin_path;
  let icons_url = site_url + "admin/fa-icons/fontawesome-5.json";
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [checkPrefix, setCheckPrefix] = useState(
    modSettings?.prefix?.is_enable === "false" ? false : true
  );
  const [checkSuffix, setCheckSuffix] = useState(
    modSettings?.suffix?.is_enable === "false" ? false : true
  );
  const [iconsArray, setIconsArray] = useState("");
  const [prefixMeta, setPrefixMeta] = useState(
    modSettings?.prefix?.meta_type ?? "text"
  );
  const [suffixMeta, setSuffixMeta] = useState(
    modSettings?.suffix?.meta_type ?? "text"
  );
  const [prefixMetaText, setPrefixMetaText] = useState(
    modSettings?.prefix?.is_enable === "true"
      ? normalizeMetaText("prefix", modSettings?.prefix?.meta_text)
      : modSettings?.prefix?.meta_text ?? ""
  );
  const [suffixMetaText, setSuffixMetaText] = useState(
    modSettings?.suffix?.is_enable === "true"
      ? normalizeMetaText("suffix", modSettings?.suffix?.meta_text)
      : modSettings?.suffix?.meta_text ?? ""
  );

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await apiClient.get(icons_url);
        // console.log(response)
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
    setPrefixMeta(modSettings?.prefix?.meta_type ?? "text");
    setSuffixMeta(modSettings?.suffix?.meta_type ?? "text");
    setPrefixMetaText(
      modSettings?.prefix?.is_enable === "true"
        ? normalizeMetaText("prefix", modSettings?.prefix?.meta_text)
        : modSettings?.prefix?.meta_text ?? ""
    );
    setSuffixMetaText(
      modSettings?.suffix?.is_enable === "true"
        ? normalizeMetaText("suffix", modSettings?.suffix?.meta_text)
        : modSettings?.suffix?.meta_text ?? ""
    );
  }, [props.data, rowindex, columnindex, moduleindex]);
  useEffect(() => {
    const shouldPatchPrefix =
      modSettings?.prefix?.is_enable === "true" &&
      normalizeMetaText("prefix", modSettings?.prefix?.meta_text) !==
        (modSettings?.prefix?.meta_text ?? "");
    const shouldPatchSuffix =
      modSettings?.suffix?.is_enable === "true" &&
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
  const handleChangePrefix = (checked) => {
    setCheckPrefix(checked);
    const nextPrefixText = checked
      ? normalizeMetaText("prefix", modSettings?.prefix?.meta_text)
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
            ? normalizeMetaText("prefix", s?.prefix?.meta_text)
            : s?.prefix?.meta_text ?? "",
        };
      },
    });
  };
  const handleChangeSuffix = (checked) => {
    setCheckSuffix(checked);
    const nextSuffixText = checked
      ? normalizeMetaText("suffix", modSettings?.suffix?.meta_text)
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
            ? normalizeMetaText("suffix", s?.suffix?.meta_text)
            : s?.suffix?.meta_text ?? "",
        };
      },
    });
  };

  const onSettingChange = (data) => {
    props.onSettingChange(data);
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
    const isEnabled =
      placement === "prefix" ? checkPrefix : placement === "suffix" ? checkSuffix : false;
    const normalizedVal = isEnabled ? normalizeMetaText(placement, val) : val;
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
  const handleMetaTextBlur = (placement, value) => {
    if (placement === "prefix" && !checkPrefix) return;
    if (placement === "suffix" && !checkSuffix) return;
    const normalizedVal = normalizeMetaText(placement, value);
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
      <div className="setting-manage-link">
        <label className="setting-label-main">Link Settings</label>
        <ContentLink
          title="Link"
          data={props.data}
          indexes={props.indexes}
          iconsArray={iconsArray}
          onSettingChange={onSettingChange}
          postPreviewData={props.postPreviewData}
        ></ContentLink>
      </div>
      <PostPrefixSuffixProPanel
        prefixLabel="Prefix (Before Title)"
        suffixLabel="Suffix (After Title)"
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

export default ModuleTitleContent;
