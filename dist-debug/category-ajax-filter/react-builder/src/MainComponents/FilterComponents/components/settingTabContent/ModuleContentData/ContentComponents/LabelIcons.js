import React, { useState } from "react";
import { Select, Input, Switch, Tooltip } from "antd";
import {
  commitFilterModuleSettingsPatch,
  commitFilterModuleReplaceSettings,
} from "../filterSettingsSnapshot";
function LabelIcons(props) {
  const [iconsArray, setIconsArray] = useState(props?.iconsArray);
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings;
  let item = {};
  if (props.objKey == "dropdown_data") {
    item = { ...modSettings?.[props.objKey]?.all_option };
  } else if (props.objKey == "reset") {
    item = { ...modSettings };
  } else {
    item = { ...modSettings?.[props.objKey] };
  }

  const persistItem = () => {
    const nextItem = JSON.parse(JSON.stringify(item));
    const base = {
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
    };
    if (props.objKey === "dropdown_data") {
      commitFilterModuleSettingsPatch({
        ...base,
        patch: (s) => {
          s.dropdown_data = { ...(s.dropdown_data || {}), all_option: nextItem };
        },
      });
    } else if (props.objKey === "reset") {
      commitFilterModuleReplaceSettings({
        ...base,
        nextSettings: nextItem,
      });
    } else {
      commitFilterModuleSettingsPatch({
        ...base,
        patch: (s) => {
          s[props.objKey] = nextItem;
        },
      });
    }
  };

  const [searchString, setSearchString] = useState("");
  const [iconSwitch, setIconSwitch] = useState(item?.icons?.visibility);
  let pos = "";
  if (item?.icons?.position) {
    pos = item.icons.position;
  } else {
    pos = `before-${props.labelType}`;
  }
  let icn = "";
  if (item?.icons?.icon) {
    icn = item.icons.icon;
  } else {
    icn = "";
  }
  const [iconPosition, setIconPosition] = useState(pos);
  const [selectedIcon, setSelectedIcon] = useState(icn);
  let icons = {
    visibility: iconSwitch,
    icon: selectedIcon,
    position: iconPosition,
  };
  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
    let ic = { ...icons };
    ic.icon = icon;
    item.icons = { ...icons, ...ic };
    persistItem();
  };
  const handlePositionChange = (value) => {
    setIconPosition(value);
    let ic = { ...icons };
    ic.position = value;
    item.icons = { ...icons, ...ic };
    persistItem();
  };
  const handleIconSearch = (e) => {
    const searchValue = e.target.value;
    setSearchString(searchValue);
    let newArray = props?.iconsArray.filter(function (item) {
      return item
        .toString()
        .toLowerCase()
        .includes(searchValue.toString().toLowerCase());
    });
    setIconsArray([...newArray]);
  };
  const onIconSwitch = (checked) => {
    setIconSwitch(checked);
    let ic = { ...icons };
    if (checked === false) {
      ic.icon = "";
      setSelectedIcon("");
    }
    ic.visibility = checked;
    item.icons = { ...icons, ...ic };
    persistItem();
  };
  return (
    <>
      <div class="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title={`Configure ${String(props.title || "icons").toLowerCase()}.`}
        >
          <label>{props.title}</label>
        </Tooltip>
        <div className="module-content-icon-switch">
          <Switch onChange={onIconSwitch} checked={iconSwitch} />
        </div>
      </div>
      {iconSwitch ? (
        <>
          <div className="icons-search">
            <Input
              placeholder="Search icon"
              onChange={handleIconSearch}
              value={searchString}
            />
          </div>

          <div className="icons-map">
            {iconsArray?.map((icon, index) => {
              return (
                <>
                  <i
                    data-icon-name={icon}
                    value={icon}
                    className={`${icon} ${
                      selectedIcon === icon ? "active" : ""
                    }`}
                    onClick={() => handleIconSelect(icon)}
                  ></i>
                </>
              );
            })}
          </div>
        </>
      ) : (
        ""
      )}

      {iconSwitch ? (
        <div class="module-content-tab-row caf-design-two-half">
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose icon placement.">
            <label>Icon Position</label>
          </Tooltip>
          <Select
            defaultValue={`before-${props.labelType}`}
            style={{
              width: "100%",
            }}
            onChange={handlePositionChange}
            value={iconPosition}
            options={[
              {
                value: `before-${props.labelType}`,
                label:
                  "Before" +
                  " " +
                  props.labelType.charAt(0).toUpperCase() +
                  props.labelType.slice(1),
              },
              {
                value: `after-${props.labelType}`,
                label:
                  "After" +
                  " " +
                  props.labelType.charAt(0).toUpperCase() +
                  props.labelType.slice(1),
              },
            ]}
          />
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default LabelIcons;
