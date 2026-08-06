import React, { useState, useRef, useEffect } from "react";
import { Select, Input, Switch, Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import { usePostTypeCustomFieldOptions } from "../../../../../utils/usePostTypeCustomFieldOptions";
import {
  canUsePostLinkCustomField,
  PostLinkTypeSegment,
  resolvePostLinkType,
} from "../shared/postModuleTier";

function ContentLink(props) {
  const builderPostData = props.postPreviewData || {};
  const isFirstRender = useRef(true);
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings;
  let item = { ...modSettings };

  let visibility = "";
  let ltype = "post-url";
  let cLink = "";
  let target = "same-tab";
  let customField = "0";
  if (item?.link?.visibility) {
    visibility = item.link.visibility;
  }
  if (item?.link?.type) {
    ltype = item.link.type;
  }
  if (item?.link?.customlink) {
    cLink = item.link.customlink;
  }
  if (item?.link?.target) {
    target = item.link.target;
  }
  if (item?.link?.custom_field) {
    customField = item.link.custom_field;
  }
  const { options: meta_object, loading: cfFieldListLoading } =
    usePostTypeCustomFieldOptions({
      includeValue: customField,
      placeholderLabel: "Select Field",
    });
  const [linkSwitch, setLinkSwitch] = useState(visibility);
  const [linkType, setLinkType] = useState(resolvePostLinkType(ltype));
  const [customLink, setCustomLink] = useState(cLink);
  const [linkTarget, setLinkTarget] = useState(target);
  const [customfield, setCustomfield] = useState(customField);

  useEffect(() => {
    const link =
      props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings?.link;
    if (!link || typeof link !== "object") {
      return;
    }

    setLinkSwitch(link.visibility === true || link.visibility === "true");
    setLinkType(resolvePostLinkType(link.type || "post-url"));
    setCustomLink(link.customlink || "");
    setLinkTarget(link.target || "same-tab");
    setCustomfield(link.custom_field || "0");
  }, [props.data, rowindex, columnindex, moduleindex]);

  const commitLinkPartial = (partial) => {
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.link = { ...(s.link || {}), ...partial };
      },
    });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCustomfield("0");
    commitLinkPartial({
      visibility: linkSwitch,
      type: linkType,
      customlink: customLink,
      target: linkTarget,
      condition: false,
      custom_field: "0",
    });
  }, [builderPostData?.value]);

  const onLinkSwitch = (checked) => {
    setLinkSwitch(checked);
    commitLinkPartial({
      visibility: checked,
      type: linkType,
      customlink: customLink,
      target: linkTarget,
      condition: false,
      custom_field: customfield,
    });
  };

  const handleLinkTypeChange = (value) => {
    if (value === "custom-url" && !canUsePostLinkCustomField()) {
      return;
    }
    setLinkType(value);
    setCustomfield("0");
    commitLinkPartial({
      visibility: linkSwitch,
      type: value,
      customlink: customLink,
      target: linkTarget,
      condition: false,
      custom_field: "0",
    });
  };

  const handleLinkTarget = (value) => {
    setLinkTarget(value);
    commitLinkPartial({
      visibility: linkSwitch,
      type: linkType,
      customlink: customLink,
      target: value,
      condition: false,
      custom_field: customfield,
    });
  };
  const handleChangeCf = (value) => {
    setCustomfield(value);
    commitLinkPartial({
      visibility: linkSwitch,
      type: linkType,
      customlink: customLink,
      target: linkTarget,
      condition: false,
      custom_field: value,
    });
  };
  return (
    <>
      {!props?.toggleFree && (
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title={`Configure ${String(props.title || "link").toLowerCase()}.`}
          >
            <label>{props.title}</label>
          </Tooltip>
          <div className="module-content-icon-switch">
            <Switch onChange={onLinkSwitch} checked={linkSwitch} />
          </div>
        </div>
      )}
      {linkSwitch && (
        <>
          <div
            className="module-content-tab-row caf-builder-centered-tabs-row"
            style={{ justifyContent: "center" }}
          >
            <PostLinkTypeSegment
              value={linkType}
              onChange={handleLinkTypeChange}
            />
          </div>
          {linkType === "custom-url" && canUsePostLinkCustomField() && (
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose custom field for link value.">
                <label>Custom Field</label>
              </Tooltip>
              <Select
                defaultValue={customfield}
                style={{
                  width: "100%",
                }}
                value={customfield}
                onChange={handleChangeCf}
                options={meta_object}
                loading={cfFieldListLoading}
              />
            </div>
          )}

          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose where the link opens.">
              <label>Open In</label>
            </Tooltip>
            <Select
              defaultValue="same-tab"
              style={{
                width: "100%",
              }}
              onChange={handleLinkTarget}
              value={linkTarget}
              options={[
                {
                  value: "same-tab",
                  label: "Same Window",
                },
                {
                  value: "new-tab",
                  label: "New Window",
                },
              ]}
            />
          </div>
        </>
      )}
    </>
  );
}

export default ContentLink;
