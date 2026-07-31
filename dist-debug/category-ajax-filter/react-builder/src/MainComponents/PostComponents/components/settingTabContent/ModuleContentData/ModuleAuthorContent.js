import React, { useEffect, useState } from "react";
import apiClient from "../../../../../api/client";
import { Input, Switch, Skeleton, Segmented, Tooltip } from "antd";
import ContentIcons from "./ContentComponents/ContentIcons";
import { commitPostModuleSettingsPatch } from "./postLayoutSnapshot";
import { resolvePostAffixEnabledForUi } from "./shared/postModuleTier";
import PostPrefixSuffixProPanel from "./PostPrefixSuffixProPanel";
const AUTHOR_META_TEXT_DEFAULTS = {
  prefix: "Prefix",
  suffix: "Suffix",
};
const getDefaultMetaText = (placement) =>
  AUTHOR_META_TEXT_DEFAULTS[placement] || "Text";
const normalizeMetaText = (placement, value) => {
  const nextValue = typeof value === "string" ? value.trim() : "";
  return nextValue !== "" ? nextValue : getDefaultMetaText(placement);
};

function ModuleAuthorContent(props) {
  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [avatarType, setAvatarType] = useState(
    modSettings?.avatar_type ?? "default"
  );
  const [avatarStatus, setAvatarStatus] = useState(
    modSettings?.avatar_status === "true" ? true : false
  );
  const [prefixMeta, setPrefixMeta] = useState(
    modSettings?.prefix?.meta_type ?? "text"
  );
  const [suffixMeta, setSuffixMeta] = useState(
    modSettings?.suffix?.meta_type ?? "text"
  );
  const [prefixMetaText, setPrefixMetaText] = useState(
    modSettings?.prefix?.is_enable === "true" &&
      (modSettings?.prefix?.meta_type ?? "text") === "text"
      ? normalizeMetaText("prefix", modSettings?.prefix?.meta_text)
      : modSettings?.prefix?.meta_text ?? ""
  );
  const [suffixMetaText, setSuffixMetaText] = useState(
    modSettings?.suffix?.is_enable === "true" &&
      (modSettings?.suffix?.meta_type ?? "text") === "text"
      ? normalizeMetaText("suffix", modSettings?.suffix?.meta_text)
      : modSettings?.suffix?.meta_text ?? ""
  );

  const [checkPrefix, setCheckPrefix] = useState(
    modSettings?.prefix?.is_enable === "false" ? false : true
  );
  const [checkSuffix, setCheckSuffix] = useState(
    modSettings?.suffix?.is_enable === "false" ? false : true
  );

  const [iconsArray, setIconsArray] = useState("");
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
    setAvatarType(modSettings?.avatar_type ?? "default");
    setAvatarStatus(modSettings?.avatar_status === "true" ? true : false);
    setCheckPrefix(modSettings?.prefix?.is_enable === "false" ? false : true);
    setCheckSuffix(modSettings?.suffix?.is_enable === "false" ? false : true);
    setPrefixMeta(modSettings?.prefix?.meta_type ?? "text");
    setSuffixMeta(modSettings?.suffix?.meta_type ?? "text");
    setPrefixMetaText(
      modSettings?.prefix?.is_enable === "true" &&
        (modSettings?.prefix?.meta_type ?? "text") === "text"
        ? normalizeMetaText("prefix", modSettings?.prefix?.meta_text)
        : modSettings?.prefix?.meta_text ?? ""
    );
    setSuffixMetaText(
      modSettings?.suffix?.is_enable === "true" &&
        (modSettings?.suffix?.meta_type ?? "text") === "text"
        ? normalizeMetaText("suffix", modSettings?.suffix?.meta_text)
        : modSettings?.suffix?.meta_text ?? ""
    );
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
  const handleChangeAvatar = (val) => {
    setAvatarType(val);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.avatar_type = val;
      },
    });
  };
  const handleAvatarStatus = (val) => {
    setAvatarStatus(val);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.avatar_status = val ? "true" : "false";
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
  const handleChangePrefix = (checked) => {
    setCheckPrefix(checked);
    if (checked && prefixMeta === "text") {
      setPrefixMetaText(normalizeMetaText("prefix", modSettings?.prefix?.meta_text));
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
      setSuffixMetaText(normalizeMetaText("suffix", modSettings?.suffix?.meta_text));
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
  return (
    <>
      <PostPrefixSuffixProPanel
        prefixLabel="Prefix (Before Author)"
        suffixLabel="Suffix (After Author)"
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
        allowAvatar={true}
      />
    </>
  );
}

export default ModuleAuthorContent;
