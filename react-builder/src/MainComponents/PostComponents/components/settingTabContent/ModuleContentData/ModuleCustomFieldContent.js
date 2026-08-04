import { Select, Switch, Input ,Segmented ,Skeleton, Tooltip} from "antd";
import React, { useEffect, useState } from "react";
import ContentIcons from "./ContentComponents/ContentIcons";
import apiClient from "../../../../../api/client";
import { apiEndpoints } from "../../../../../api/endpoints";
import {
  commitPostModuleSettingsPatch,
} from "./postLayoutSnapshot";
import { usePostTypeCustomFieldOptions } from "../../../../utils/usePostTypeCustomFieldOptions";
import { resolvePostAffixEnabledForUi } from "./shared/postModuleTier";
import PostPrefixSuffixProPanel from "./PostPrefixSuffixProPanel";
import {
  getPostAffixMetaTextForUi,
  normalizePostAffixMetaText,
} from "./shared/postAffixMetaTextUtils";
function ModuleCustomFieldContent(props) {
  const builderPostData = props.postPreviewData || {};
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const { options: meta_object, loading: cfFieldListLoading } =
    usePostTypeCustomFieldOptions({
      includeValue: modSettings?.custom_field,
    });

  //console.log(props.indexes)

  const path_url = tc_caf_ajax.plugin_path;
  let icons_url = path_url + "admin/fa-icons/fontawesome-5.json";

  const [checkPrefix, setCheckPrefix] = useState(
    modSettings?.prefix?.is_enable === "false" ? false : true
  );
  const [checkSuffix, setCheckSuffix] = useState(
    modSettings?.suffix?.is_enable === "false" ? false : true
  );
  // const [labelInput, setLabelInput] = useState(item.label.value);
  const [iconsArray, setIconsArray] = useState("");
 
  const [cfLoading, setCfLoading] = useState(false);
  const [placementTab ,setPlacementTab] = useState("prefix")
  const [prefixMeta , setPrefixMeta] = useState(modSettings?.prefix?.meta_type ?? 'text')
  const [suffixMeta , setSuffixMeta] = useState(modSettings?.suffix?.meta_type ?? 'text')
  const [prefixMetaText , setPrefixMetaText] = useState(
    modSettings?.prefix?.is_enable === "true" &&
      (modSettings?.prefix?.meta_type ?? "text") === "text"
      ? normalizePostAffixMetaText("prefix", modSettings?.prefix?.meta_text)
      : modSettings?.prefix?.meta_text ?? ''
  )
  const [suffixMetaText , setSuffixMetaText] = useState(
    modSettings?.suffix?.is_enable === "true" &&
      (modSettings?.suffix?.meta_type ?? "text") === "text"
      ? normalizePostAffixMetaText("suffix", modSettings?.suffix?.meta_text)
      : modSettings?.suffix?.meta_text ?? ''
  )
  useEffect(() => {
    setCheckPrefix(modSettings?.prefix?.is_enable === "false" ? false : true);
    setCheckSuffix(modSettings?.suffix?.is_enable === "false" ? false : true);
    setPrefixMeta(modSettings?.prefix?.meta_type ?? "text");
    setSuffixMeta(modSettings?.suffix?.meta_type ?? "text");
    setPrefixMetaText(getPostAffixMetaTextForUi("prefix", modSettings?.prefix));
    setSuffixMetaText(getPostAffixMetaTextForUi("suffix", modSettings?.suffix))
  }, [props.data, rowindex, columnindex, moduleindex]);
  
  useEffect(() => {
    if (
      modSettings?.custom_field &&
      modSettings.custom_field !== "0" &&
      builderPostData?.value
    ) {
      fetchCfValue(builderPostData.value, modSettings.custom_field);
    }
  }, [builderPostData?.value, modSettings?.custom_field]);

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
// console.log(iconsArray)

  const fetchCfValue = async (postId, fieldName) => {
    setCfLoading(true);
    const postedData = {
      post_id: postId,
      field_name: fieldName,
    };

    const res = await apiClient.post(apiEndpoints.getCfFieldValue, postedData);
    const value = res?.data?.data?.value;
    setCfLoading(false);
    return value;
  };

  

  const handleChange = async (value) => {
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field = value;
      },
    });
    if(value !== "0"){
    await fetchCfValue(builderPostData?.value, value); 
    }
  };
  const handleChangePrefix = (checked) => {
    setCheckPrefix(checked);
    if (checked && prefixMeta === "text") {
      setPrefixMetaText(normalizePostAffixMetaText("prefix", modSettings?.prefix?.meta_text));
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
      setSuffixMetaText(normalizePostAffixMetaText("suffix", modSettings?.suffix?.meta_text));
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
  // const handleLabel = (val) => {
  //   setLabelInput(val);
  //   item.label.value = val;
  //   items[rowindex].data[columnindex].data[moduleindex]["settings"] = item;
  //   props.onSettingChange(props.data);
  // };
  const onSettingChange = (data) => {
    props.onSettingChange(data);
  };

  const onhandlePlacement=(tab)=>{
    setPlacementTab(tab)
  }
  const handleMetaChange =(val,placement)=>{
    if(placement === "prefix"){
      setPrefixMeta(val)
    }
    if(placement === "suffix"){
      setSuffixMeta(val)
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
  }
  const handleMetaText =(val,placement)=>{
    if(placement === "prefix"){
      setPrefixMetaText(val)
    }
    if(placement === "suffix"){
      setSuffixMetaText(val)
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
  }
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
      <label className="setting-label-main">Field Source</label>
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Select custom field key.">
          <label>Select Field</label>
        </Tooltip>
        <Select
          defaultValue={modSettings?.custom_field}
          style={{
            width: "100%",
          }}
          value={modSettings?.custom_field}
          onChange={handleChange}
          options={meta_object}
          loading={cfLoading || cfFieldListLoading}
        />
      </div>
      <PostPrefixSuffixProPanel
        prefixLabel="Prefix (Before Value)"
        suffixLabel="Suffix (After Value)"
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

export default ModuleCustomFieldContent;
