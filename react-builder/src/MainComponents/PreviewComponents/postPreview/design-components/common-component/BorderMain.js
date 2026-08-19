import React, { useState, useEffect } from "react";
import {
  Input,
  Slider,
  ColorPicker,
  Select,
  Row,
  Col,
  Tooltip,
  InputNumber,
  Space,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { normalizeColorPickerValue } from "../../../../utils/colorPicker";
import {
  BorderBottomOutlined,
  BorderLeftOutlined,
  BorderOuterOutlined,
  BorderRightOutlined,
  BorderTopOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
function BorderMain(props) {
  // console.log(props);
  const {
    property,
    label,
    styleState = "default",
    deviceSwitch,
    style,
    //styleTab ="",
    setDraggingDisabled = false,
    moduleKey = "",
    isMeta,
  } = props;
  
   let styleTab = props?.styleTab || "";
  if (isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
   let device = deviceSwitch;
  const [radiusJoint, setRadiusJoint] = useState(false);
  let borderstyletype = "outer";
  let radiusSuffix = "px";
  const [radiusSuffixnew, setRadiusSuffixnew] = useState({
    topLeft: "px",
    topRight: "px",
    bottomLeft: "px",
    bottomRight: "px",
  });
  const selectAfter = (
    <Select
      defaultValue={"px"}
      value={"px"}
      placement="bottomRight"
      popupMatchSelectWidth={70}
    >
      <Select.Option value="px">PX</Select.Option>
    </Select>
  );

  useEffect(() => {
    let items = { ...props.data };
     let swcopy = { ...items[style][device] };
     let item = { ...swcopy[styleState] };

    setRadiusSuffixnew({
      topLeft: getUnit(item?.borderTopLeftRadius),
      topRight: getUnit(item?.borderTopRightRadius),
      bottomLeft: getUnit(item?.borderBottomLeftRadius),
      bottomRight: getUnit(item?.borderBottomRightRadius),
    });
  }, []);

  const getUnit = (value) => {
    if (!value) return "px"; // null, undefined, empty string → px
    let match = value?.match(/[a-z%]+$/i);
    return match ? match[0] : "px";
  };
  const handleRadiusSuffixChange = (placement, suffix) => {
    const updated = { ...radiusSuffixnew, [placement]: suffix };
    setRadiusSuffixnew(updated);
    onChangeBorderRadius(
      placement,
      placement === "topLeft"
        ? bordertopleftradius
        : placement === "topRight"
        ? bordertoprightradius
        : placement === "bottomLeft"
        ? borderbottomleftradius
        : borderbottomrightradius,
      updated
    );
  };

  let borderprops = {
    borderTopWidth: "0px",
    borderRightWidth: "0px",
    borderBottomWidth: "0px",
    borderLeftWidth: "0px",
    borderTopColor: "#ffffff00",
    borderRightColor: "#ffffff00",
    borderBottomColor: "#ffffff00",
    borderLeftColor: "#ffffff00",
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    //   borderWidth: "0px",
  };
  let bordertopleftradius = 0;
  let bordertoprightradius = 0;
  let borderbottomleftradius = 0;
  let borderbottomrightradius = 0;
 
  // 🔹 --- Helper functions (top of bordermain.js) ---
  const getBorderValue = (styleObj, styleTab, device, styleState, key) => {
    if (!styleObj || !device || !styleState) return null;

    // If styleTab exists, use that section
    const base = styleTab && styleObj[styleTab] ? styleObj[styleTab] : styleObj;

    const tryPaths = [
      [device, styleState, key],
      [device, "default", key],
      ["desktop", styleState, key],
      ["desktop", "hover", key],
      ["desktop", "selected", key],
      ["desktop", "default", key],
    ];

    for (const [d, s, k] of tryPaths) {
      if (base?.[d]?.[s]?.[k]) return base[d][s][k];
    }
    return null;
  };

  const parseValue = (val) => {
    // If value is null, undefined, or empty string → return defaults
    if (val === null || val === undefined || val === "") {
      return { num: 0, unit: "px" };
    }

    // If value is already a number, just return it with default unit
    if (typeof val === "number") {
      return { num: val, unit: "px" };
    }

    // Try to match "number + optional unit" (e.g., 12px, 50%, 1.5em)
    const match = String(val).match(/^(\d*\.?\d+)?([a-zA-Z%]*)$/);

    // Gracefully handle bad input
    if (!match) {
      return { num: 0, unit: "px" };
    }

    const num = parseFloat(match[1]) || 0;
    const unit = match[2] || "px";
    return { num, unit };
  };

  const applyBorderStyles = (
    styleObj,
    styleTab,
    device,
    styleState,
    borderprops,
    setVars
  ) => {
    const borderKeys = {
      radius: [
        "borderTopLeftRadius",
        "borderTopRightRadius",
        "borderBottomLeftRadius",
        "borderBottomRightRadius",
      ],
      width: [
        "borderTopWidth",
        "borderRightWidth",
        "borderBottomWidth",
        "borderLeftWidth",
      ],
      color: [
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
      ],
      style: [
        "borderTopStyle",
        "borderRightStyle",
        "borderBottomStyle",
        "borderLeftStyle",
      ],
    };

    // --- Border Radius ---
    borderKeys.radius.forEach((key) => {
      const val = getBorderValue(styleObj, styleTab, device, styleState, key);
      if (val) {
        const { num, unit } = parseValue(val);
        if (key === "borderTopLeftRadius") setVars.topLeft(num, unit);
        if (key === "borderTopRightRadius") setVars.topRight(num, unit);
        if (key === "borderBottomLeftRadius") setVars.bottomLeft(num, unit);
        if (key === "borderBottomRightRadius") setVars.bottomRight(num, unit);
      }
    });

    // --- Border Widths, Colors, and Styles ---
    ["width", "color", "style"].forEach((type) => {
      borderKeys[type].forEach((key) => {
        const val = getBorderValue(styleObj, styleTab, device, styleState, key);
        if (val) borderprops[key] = val;
      });
    });
  };

    let styleObj = null;
    styleObj = {...props.data.style};

    applyBorderStyles(styleObj, styleTab, device, styleState, borderprops, {
      topLeft: (num, unit) => {
        bordertopleftradius = num;
        radiusSuffix = unit;
      },
      topRight: (num, unit) => {
        bordertoprightradius = num;
        radiusSuffix = unit;
      },
      bottomLeft: (num, unit) => {
        borderbottomleftradius = num;
        radiusSuffix = unit;
      },
      bottomRight: (num, unit) => {
        borderbottomrightradius = num;
        radiusSuffix = unit;
      },
    });
  //}

  const [borderStyleType, setBorderStyleType] = useState(borderstyletype);
  //const [borderProps, setBorderProps] = useState({ ...borderprops });
  const [radiusSuffixVal, setRadiusSuffixVal] = useState(radiusSuffix);
  const currentBorderColorValue =
    borderStyleType === "outer"
      ? borderprops.borderTopColor
      : borderStyleType === "top"
      ? borderprops.borderTopColor
      : borderStyleType === "right"
      ? borderprops.borderRightColor
      : borderStyleType === "bottom"
      ? borderprops.borderBottomColor
      : borderStyleType === "left"
      ? borderprops.borderLeftColor
      : "";
  const borderPickerValue = currentBorderColorValue;
  useEffect(() => {
    let allValues = [
      bordertopleftradius,
      bordertoprightradius,
      borderbottomleftradius,
      borderbottomrightradius,
    ];
    let allEqual = allValues.every((val) => val === allValues[0]);
    //let allEqual = allValues.every((val) => val === allValues[0] && val > 0);
    if (allEqual === true) {
      setRadiusJoint(allEqual);
    }
  }, []);
  useEffect(() => {
    setRadiusSuffixVal(radiusSuffix);
  }, [styleState]);

  const onChangeBorderRadius = (
    placement,
    value,
    updatedRadiusSuffix = radiusSuffixnew
  ) => {
     if (value !== "auto") {
      let num = (String(value).match(/\d+/g) || ["0"]).join("") * 1;
      //let num = Number((String(value).match(/-?\d+/) || ["0"])[0]);
      value = num;
    }

    let items = { ...props.data };
    let swcopy ="";
    if(styleTab!==""){
        swcopy = { ...items[style][styleTab][device] };
    }else{
        swcopy = { ...items[style][device] };
    }
    
    let item = { ...swcopy[styleState] };

    // --- joint vs individual corner control ---
    if (radiusJoint) {
      const suffixes = Object.values(updatedRadiusSuffix);
      const unique = [...new Set(suffixes)];
      let uniqueSuffix =
        unique.length === 1
          ? unique[0] // sab same → one  value
          : unique.length === 2 &&
            suffixes.filter((v) => v === unique[0]).length === 1
          ? unique[0] // first unique single
          : unique.length === 2 &&
            suffixes.filter((v) => v === unique[1]).length === 1
          ? unique[1] // second unique single
          : "px"; // multiple unique → px return

      item["borderTopLeftRadius"] = value + uniqueSuffix;
      item["borderTopRightRadius"] = value + uniqueSuffix;
      item["borderBottomLeftRadius"] = value + uniqueSuffix;
      item["borderBottomRightRadius"] = value + uniqueSuffix;
      setRadiusSuffixnew((prev) => ({
        ...prev,
        topLeft: uniqueSuffix,
        topRight: uniqueSuffix,
        bottomLeft: uniqueSuffix,
        bottomRight: uniqueSuffix,
      }));
    } else {
      // independent control for each corner
      const currentSuffix = updatedRadiusSuffix[placement] || "px";
      if (placement === "topLeft") {
        item["borderTopLeftRadius"] = value + currentSuffix;
      } else if (placement === "topRight") {
        item["borderTopRightRadius"] = value + currentSuffix;
      } else if (placement === "bottomLeft") {
        item["borderBottomLeftRadius"] = value + currentSuffix;
      } else if (placement === "bottomRight") {
        item["borderBottomRightRadius"] = value + currentSuffix;
      }
    }

    // --- assign back to props.data correctly ---
    swcopy[styleState] = item;
    if(styleTab!==""){
      items[style][styleTab][device] = swcopy;
    }else{
      items[style][device] = swcopy;
    }


    if(moduleKey && moduleKey !==""){
      props.onChangeStyle(props.data,moduleKey);
    }else{
    props.onChangeStyle(props.data);
    }

  };


  const handleRadiusJoint = () => {
    //setRadiusJoint(true);
    setRadiusJoint((prevCheck) => !prevCheck);
  };

  const handleBorderType = (type) => {
    setBorderStyleType(type);
  };
  //console.log(radiusJoint);

  const onChangeWidth = (value, isReset) => {
    if (value !== "auto") {
      let num = (String(value).match(/\d+/g) || ["0"]).join("") * 1;
      //let num = Number((String(value).match(/-?\d+/) || ["0"])[0]);
      value = num;
    }
     let items = { ...props.data };
      let swcopy = "";
      if(styleTab!==""){
        swcopy = { ...items[style][styleTab][device] };
      }else{
        swcopy = { ...items[style][device] };
      }
      let item = { ...swcopy[styleState] };

    if (borderStyleType === "outer") {
      borderprops.borderTopWidth = value + "px";
      borderprops.borderRightWidth = value + "px";
      borderprops.borderBottomWidth = value + "px";
      borderprops.borderLeftWidth = value + "px";
    }
    if (borderStyleType === "top") {
      borderprops.borderTopWidth = value + "px";
    }
    if (borderStyleType === "right") {
      borderprops.borderRightWidth = value + "px";
    }
    if (borderStyleType === "bottom") {
      borderprops.borderBottomWidth = value + "px";
    }
    if (borderStyleType === "left") {
      borderprops.borderLeftWidth = value + "px";
    }

    swcopy[styleState] = {...item,...borderprops,};

    if(styleTab!==""){
      items[style][styleTab][device] = swcopy;
    }else{
      items[style][device] = swcopy;
    }

    if(moduleKey && moduleKey !==""){
      props.onChangeStyle(props.data,moduleKey);
    }else{
    props.onChangeStyle(props.data);
    }

  };

  const setColorHexFun = (value, cssValue) => {
    value = normalizeColorPickerValue(value, "#ffffff00", cssValue);
    if (Array.isArray(value)) {
      value = normalizeColorPickerValue(value, "#ffffff00");
    }
    let items = { ...props.data };

    let swcopy = "";
    if(styleTab!==""){
      swcopy = { ...items[style][styleTab][device] };
    }else{
      swcopy = { ...items[style][device] };
    }

    let item = { ...swcopy[styleState] };
     

    if (borderStyleType === "outer") {
      borderprops.borderTopColor = value;
      borderprops.borderRightColor = value;
      borderprops.borderBottomColor = value;
      borderprops.borderLeftColor = value;
    }
    if (borderStyleType === "top") {
      borderprops.borderTopColor = value;
    }
    if (borderStyleType === "right") {
      borderprops.borderRightColor = value;
    }
    if (borderStyleType === "bottom") {
      borderprops.borderBottomColor = value;
    }
    if (borderStyleType === "left") {
      borderprops.borderLeftColor = value;
    }

    swcopy[styleState] = {...item,...borderprops,};

    if(styleTab!==""){
      items[style][styleTab][device] = swcopy;
    }else{
      items[style][device] = swcopy;
    }
    
    if(moduleKey && moduleKey !==""){
      props.onChangeStyle(props.data,moduleKey);
    }else{
    props.onChangeStyle(props.data);
    }
  };

  const handleChange = (value, isReset) => {
    let items = { ...props.data };
    let swcopy = "";
    if(styleTab!==""){
      swcopy = { ...items[style][styleTab][device] };
    }else{
      swcopy = { ...items[style][device] };
    }
    let item = { ...swcopy[styleState]};

    if (borderStyleType === "outer") {
      borderprops.borderTopStyle = value;
      borderprops.borderRightStyle = value;
      borderprops.borderBottomStyle = value;
      borderprops.borderLeftStyle = value;
    }
    if (borderStyleType === "top") {
      borderprops.borderTopStyle = value;
    }
    if (borderStyleType === "right") {
      borderprops.borderRightStyle = value;
    }
    if (borderStyleType === "bottom") {
      borderprops.borderBottomStyle = value;
    }
    if (borderStyleType === "left") {
      borderprops.borderLeftStyle = value;
    }

    swcopy[styleState] = {...item,...borderprops,};

    if(styleTab!==""){
      items[style][styleTab][device] = swcopy;
    }else{
      items[style][device] = swcopy;
    }
    
    if(moduleKey && moduleKey !==""){
      props.onChangeStyle(props.data,moduleKey);
    }else{
    props.onChangeStyle(props.data);
    }
  };
  const resetBorderRadius = () => {
    setRadiusSuffixVal("px");
      let items = { ...props.data };
      let swcopy = "";
      if(styleTab !==""){
        swcopy ={ ...items[style][styleTab][device] };
      }else{
        swcopy ={ ...items[style][device] };
      }
      
      let item = { ...swcopy[styleState] };
      item["borderTopLeftRadius"] = 0 + "px";
      item["borderTopRightRadius"] = 0 + "px";
      item["borderBottomLeftRadius"] = 0 + "px";
      item["borderBottomRightRadius"] = 0 + "px";

      swcopy[styleState] = item;
      items[style][device] = swcopy;
    
    if(moduleKey && moduleKey !==""){
      props.onChangeStyle(props.data,moduleKey);
    }else{
    props.onChangeStyle(props.data);
    }
    

  };

  const resetBorderStyle = () => {
    handleBorderType("outer");
  };
  const safeNumber = (v) => {
    if (!v) return 0; // null, undefined, empty
    if (v === "NaNpx" || v === "nullpx") return 0;

    const num = parseInt(v, 10);
    return isNaN(num) ? 0 : num;
  };
  return (
    <>
      <div className="caf-builder-border-container">
      
      <div className="caf-builder-setting-row-label">
        <label>
          <span>Border Radius</span>
          <Tooltip title="Reset">
            <span onClick={resetBorderRadius}>
              <FontAwesomeIcon icon={faArrowRotateLeft} />
            </span>
          </Tooltip>
        </label>
        <div className="caf-border-radius-container">
          <div className="caf-border-radius-row">
            <Space.Compact>
              <InputNumber
                min={0}
                max={100}
                value={safeNumber(bordertopleftradius)}
                onChange={(value) => onChangeBorderRadius("topLeft", value)}
              />
              <Select
                value={radiusSuffixnew.topLeft}
                onChange={(val) => handleRadiusSuffixChange("topLeft", val)}
                placement="bottomRight"
                popupMatchSelectWidth={70}
              >
                <Select.Option value="px">PX</Select.Option>
                <Select.Option value="%">%</Select.Option>
              </Select>
            </Space.Compact>
            <Space.Compact>
              <InputNumber
                min={0}
                max={100}
                value={safeNumber(bordertoprightradius)}
                onChange={(value) => onChangeBorderRadius("topRight", value)}
              />
              <Select
                value={radiusSuffixnew.topRight}
                onChange={(val) => handleRadiusSuffixChange("topRight", val)}
                placement="bottomRight"
                popupMatchSelectWidth={70}
              >
                <Select.Option value="px">PX</Select.Option>
                <Select.Option value="%">%</Select.Option>
              </Select>
            </Space.Compact>
          </div>
          <div className="border-radius-joint">
            <div
              className={`border-radius-joint-inner ${
                radiusJoint ? "active" : ""
              }`}
              onClick={handleRadiusJoint}
            >
              <FullscreenExitOutlined className="border-radius-joint-icon" />
            </div>
          </div>
          <div className="caf-border-radius-row">
            <Space.Compact>
              <InputNumber
                min={0}
                max={100}
                value={safeNumber(borderbottomleftradius)}
                onChange={(value) => onChangeBorderRadius("bottomLeft", value)}
              />
              <Select
                value={radiusSuffixnew.bottomLeft}
                onChange={(val) => handleRadiusSuffixChange("bottomLeft", val)}
                placement="bottomRight"
                popupMatchSelectWidth={70}
              >
                <Select.Option value="px">PX</Select.Option>
                <Select.Option value="%">%</Select.Option>
              </Select>
            </Space.Compact>
            <Space.Compact>
              <InputNumber
                min={0}
                max={100}
                value={safeNumber(borderbottomrightradius)}
                onChange={(value) => onChangeBorderRadius("bottomRight", value)}
              />
              <Select
                value={radiusSuffixnew.bottomRight}
                onChange={(val) => handleRadiusSuffixChange("bottomRight", val)}
                placement="bottomRight"
                popupMatchSelectWidth={70}
              >
                <Select.Option value="px">PX</Select.Option>
                <Select.Option value="%">%</Select.Option>
              </Select>
            </Space.Compact>
          </div>
        </div>
      </div>

      <div className="caf-builder-setting-row-label">
        <label>
        <span>Border Position</span>
          <Tooltip title="Reset">
            <span onClick={resetBorderStyle}>
              <FontAwesomeIcon icon={faArrowRotateLeft} />
            </span>
          </Tooltip>
        </label>
        <div className="border-styles-bar">
          <BorderOuterOutlined
            className={`border-bar b-outer ${
              borderStyleType === "outer" ? "active" : ""
            }`}
            onClick={() => handleBorderType("outer")}
          />
          <BorderTopOutlined
            className={`border-bar b-top ${
              borderStyleType === "top" ? "active" : ""
            }`}
            onClick={() => handleBorderType("top")}
          />
          <BorderRightOutlined
            className={`border-bar b-right ${
              borderStyleType === "right" ? "active" : ""
            }`}
            onClick={() => handleBorderType("right")}
          />
          <BorderBottomOutlined
            className={`border-bar b-bottom ${
              borderStyleType === "bottom" ? "active" : ""
            }`}
            onClick={() => handleBorderType("bottom")}
          />
          <BorderLeftOutlined
            className={`border-bar b-left ${
              borderStyleType === "left" ? "active" : ""
            }`}
            onClick={() => handleBorderType("left")}
          />
        </div>

        </div>

       

          <div
            className="caf-builder-setting-row-label"
        
          >
            <label>
              <span>Border Width</span>
              <Tooltip title="Reset">
                <span onClick={() => onChangeWidth(0, "reset")}>
                  <FontAwesomeIcon icon={faArrowRotateLeft} />
                </span>
              </Tooltip>
            </label>
            <Row>
              <Col span={15}>
                <Slider
                  min={0}
                  max={100}
                  onChange={onChangeWidth}
                  value={safeNumber(
                    borderStyleType === "outer"
                      ? borderprops.borderTopWidth
                      : borderStyleType === "top"
                      ? borderprops.borderTopWidth
                      : borderStyleType === "right"
                      ? borderprops.borderRightWidth
                      : borderStyleType === "bottom"
                      ? borderprops.borderBottomWidth
                      : borderStyleType === "left"
                      ? borderprops.borderLeftWidth
                      : 0
                  )}
                />
              </Col>
              <div className="caf-manage-suffix-look">
                <Col span={20} className="input-inner-px slide-cnt-col">
                  <InputNumber
                    // style={{
                    //   margin: "0 0px 0 10px",
                    // }}
                    min={0}
                    max={100}
                    value={safeNumber(
                      borderStyleType === "outer"
                        ? borderprops.borderTopWidth
                        : borderStyleType === "top"
                        ? borderprops.borderTopWidth
                        : borderStyleType === "right"
                        ? borderprops.borderRightWidth
                        : borderStyleType === "bottom"
                        ? borderprops.borderBottomWidth
                        : borderStyleType === "left"
                        ? borderprops.borderLeftWidth
                        : 0
                    )}
                    onChange={(newValue) => onChangeWidth(newValue)}
                  />
                </Col>
                <Col span={4} className="slide-cnt-col selectafter">
                  {selectAfter}
                </Col>
              </div>
            </Row>
          </div>

          <div
            className="caf-builder-setting-row-label"
          
          >
            <label>
              <span>Border Color</span>
              <Tooltip title="Reset">
                <span onClick={() => setColorHexFun("#ffffff00", "reset")}>
                  <FontAwesomeIcon icon={faArrowRotateLeft} />
                </span>
              </Tooltip>
            </label>
            <ColorPicker
              className="custom-color"
              value={borderPickerValue}
              mode="single"
              //format="rgb"
              onChange={setColorHexFun}
              placement="center"
            />
          </div>
          <div
            className="caf-builder-setting-row-label"
          
          >
            <label>
              <span>Border Style</span>
              <Tooltip title="Reset">
                <span onClick={() => handleChange("solid", "reset")}>
                  <FontAwesomeIcon icon={faArrowRotateLeft} />
                </span>
              </Tooltip>
            </label>
            <Select
              defaultValue={
                borderStyleType === "outer"
                  ? borderprops.borderTopStyle
                  : borderStyleType === "top"
                  ? borderprops.borderTopStyle
                  : borderStyleType === "right"
                  ? borderprops.borderRightStyle
                  : borderStyleType === "bottom"
                  ? borderprops.borderBottomStyle
                  : borderStyleType === "left"
                  ? borderprops.borderLeftStyle
                  : ""
              }
              style={{
                width: "100%",
              }}
              onChange={handleChange}
              options={[
                {
                  value: "solid",
                  label: "Solid",
                },
                {
                  value: "dashed",
                  label: "Dashed",
                },
                {
                  value: "dotted",
                  label: "Dotted",
                },
                {
                  value: "double",
                  label: "Double",
                },
                {
                  value: "groove",
                  label: "Groove",
                },
                {
                  value: "ridge",
                  label: "Ridge",
                },
                {
                  value: "inset",
                  label: "Inset",
                },
                {
                  value: "outset",
                  label: "Outset",
                },
                {
                  value: "none",
                  label: "None",
                },
              ]}
              value={
                borderStyleType === "outer"
                  ? borderprops.borderTopStyle
                  : borderStyleType === "top"
                  ? borderprops.borderTopStyle
                  : borderStyleType === "right"
                  ? borderprops.borderRightStyle
                  : borderStyleType === "bottom"
                  ? borderprops.borderBottomStyle
                  : borderStyleType === "left"
                  ? borderprops.borderLeftStyle
                  : ""
              }
            />
          </div>
        
      </div>
    </>
  );
}

export default BorderMain;
