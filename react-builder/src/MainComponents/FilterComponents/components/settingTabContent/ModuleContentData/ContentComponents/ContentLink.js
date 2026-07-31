import React, { useState } from "react";
import { Select, Input, Switch, Tooltip } from "antd";
import { commitFilterModuleSettingsPatch } from "../filterSettingsSnapshot";
import PostLinkCustomFieldProPanel from "./PostLinkCustomFieldProPanel";

function ContentLink(props) {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings;
  let item = { ...modSettings };
  let visibility = "";
  let ltype = "post-url";
  let cLink = "";
  let target = "same-tab";
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
  const [linkSwitch, setLinkSwitch] = useState(visibility);
  const [linkType, setLinkType] = useState(ltype);
  const [customLink, setCustomLink] = useState(cLink);
  const [linkTarget, setLinkTarget] = useState(target);

  const commitLink = (partial) => {
    commitFilterModuleSettingsPatch({
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

  const onLinkSwitch = (checked) => {
    setLinkSwitch(checked);
    commitLink({
      visibility: checked,
      type: linkType,
      customlink: customLink,
      target: linkTarget,
      condition: false,
    });
  };

  const handleLinkTypeChange = (value) => {
    setLinkType(value);
    commitLink({
      visibility: linkSwitch,
      type: value,
      customlink: customLink,
      target: linkTarget,
      condition: false,
    });
  };

  const handleCustomLink = (e) => {
    const value = e.target.value;
    setCustomLink(value);
    commitLink({
      visibility: linkSwitch,
      type: linkType,
      customlink: value,
      target: linkTarget,
      condition: false,
    });
  };
  const handleLinkTarget = (value) => {
    setLinkTarget(value);
    commitLink({
      visibility: linkSwitch,
      type: linkType,
      customlink: customLink,
      target: value,
      condition: false,
    });
  };
  return (
    <>
      <div class="module-content-tab-row">
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
      {linkSwitch && (
        <>
          <div class="module-content-tab-row">
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose link source type.">
              <label>Link Type</label>
            </Tooltip>
            <Select
              defaultValue="post-url"
              style={{
                width: "100%",
              }}
              onChange={handleLinkTypeChange}
              value={linkType}
              options={[
                {
                  value: "post-url",
                  label: "Post URL",
                },
                {
                  value: "custom-url",
                  label: "custom-url",
                },
              ]}
            />
          </div>
          {linkType == "custom-url" && (
            <PostLinkCustomFieldProPanel
              value={customLink}
              onChange={handleCustomLink}
            />
          )}

          <div class="module-content-tab-row">
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose where the link opens.">
              <label>Link Target</label>
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
                  label: "In The Same Window",
                },
                {
                  value: "new-tab",
                  label: "In The New Tab",
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
