import React from "react";
import { ColorPicker, Input, Select, Switch, Tooltip } from "antd";

const FloatingFilterSettingsPanel = ({
  checkFloatButton,
  handleChangeFloatButton,
  floatButtonValue,
  handleFloatButton,
  checkFloatIcon,
  handleChangeFloatIcon,
  selctedFloatIcon,
  handleFloatSelectIcon,
  animationType,
  SelectAnimationType,
  overlayColor,
  setColorHexFun,
}) => (
  <div className="module-content-tab-row no-pad-0">
    <div className="module-content-tab-row caf-design-two-half">
      <Tooltip
        classNames={{ root: "caf-builder-tooltip" }}
        placement="topLeft"
        title="Toggle floating filter button."
      >
        <label>
          <span>Show Button Text</span>
        </label>
      </Tooltip>
      <Switch
        onChange={handleChangeFloatButton}
        checked={checkFloatButton}
        disabled={checkFloatButton && !checkFloatIcon}
      />
    </div>
    {checkFloatButton && (
      <div className="module-content-tab-row caf-design-two-half">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Set floating button text."
        >
          <label>
            <span>Button Text</span>
          </label>
        </Tooltip>
        <Input
          type="text"
          value={floatButtonValue}
          defaultValue={floatButtonValue}
          onChange={(event) => handleFloatButton(event.target.value)}
        />
      </div>
    )}
    <div className="module-content-tab-row caf-design-two-half">
      <Tooltip
        classNames={{ root: "caf-builder-tooltip" }}
        placement="topLeft"
        title="Toggle floating filter icon."
      >
        <label>
          <span>Show Button Icon</span>
        </label>
      </Tooltip>
      <Switch
        onChange={handleChangeFloatIcon}
        checked={checkFloatIcon}
        disabled={checkFloatIcon && !checkFloatButton}
      />
    </div>
    {checkFloatIcon && (
      <div className="module-content-tab-row">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Choose floating icon."
        >
          <label>{"Select Icon"}</label>
        </Tooltip>
        <div className="caf-post-preview-icons-section loader">
          <ul className="caf-post-preview-icons-list">
            {["fas fa-align-justify", "fas fa-list-ul"].map((icon) => (
              <li
                key={icon}
                className={`caf-post-preview-icon-single-item ${
                  selctedFloatIcon === icon ? "active" : ""
                }`}
                onClick={() => handleFloatSelectIcon(icon)}
              >
                <i className={icon}></i>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}
    <div className="module-content-tab-row caf-design-two-half">
      <Tooltip
        classNames={{ root: "caf-builder-tooltip" }}
        placement="topLeft"
        title="Choose floating panel animation."
      >
        <label>
          <span>Panel Animation</span>
        </label>
      </Tooltip>
      <Select
        value={animationType}
        onChange={SelectAnimationType}
        options={[
          { label: "Right to Left", value: "slide-right-left" },
          { label: "Left to Right", value: "slide-left-right" },
          { label: "Top to Bottom", value: "slide-top-bottom" },
          { label: "Bottom to Top", value: "slide-bottom-top" },
        ]}
      />
    </div>
    <div className="module-content-tab-row caf-design-two-half">
      <Tooltip
        classNames={{ root: "caf-builder-tooltip" }}
        placement="topLeft"
        title="Set overlay color for floating panel."
      >
        <label>
          <span>Overlay Color</span>
        </label>
      </Tooltip>
      <ColorPicker
        className="custom-color"
        value={overlayColor}
        mode="single"
        onChange={setColorHexFun}
        placement="left"
      />
    </div>
  </div>
);

export default FloatingFilterSettingsPanel;
