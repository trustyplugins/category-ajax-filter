import React, { useState } from "react";
import { Col, Input, Row, Slider, Select, Space, ColorPicker ,Tooltip ,InputNumber} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft} from "@fortawesome/free-solid-svg-icons";
import { normalizeColorPickerValue } from "../../../../utils/colorPicker";
function BoxShadow(props) {
  //console.log(props, type);
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    styleState = "default",
    deviceSwitch,
    style,
    moduleKey = "",
    //styleTab ="",
    setDraggingDisabled = false,
    isMeta ="",
  } = props;
   let styleTab = props?.styleTab || "";
  if (isMeta !== undefined && isMeta !== '') {
    styleTab = isMeta;
  }
  const boxshadow = {
    shadow: "inset",
    hPosition: "0px",
    vPosition: "0px",
    blur: "0px",
    spread: "0px",
    color: "#333333",
  };
  let device = "desktop";
  if (deviceSwitch) {
    device = deviceSwitch;
  }
  
  const selectAfter = (
    <Select defaultValue={'px'} value={'px'} placement="bottomRight" popupMatchSelectWidth={70}>
      <Select.Option value="px">PX</Select.Option>
    </Select>
  );

  if(styleTab!==""){
    if (props.data[style][styleTab][device][styleState]?.["boxShadow"]) {
      let boxshadow1 = props.data[style][styleTab][device][styleState]["boxShadow"];
      let barray = boxshadow1.split(" ");
      boxshadow.hPosition = barray[0];
      boxshadow.vPosition = barray[1];
      boxshadow.blur = barray[2];
      boxshadow.spread = barray[3];
      boxshadow.shadow = barray[4];
      boxshadow.color = barray[5];
    } else {
      if (device == "desktop") {
        if (styleState == "hover" || styleState === "selected" || styleState === "placeholder") {
          if (props.data[style][styleTab][device]["default"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style][styleTab][device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (props.data[style][styleTab]["desktop"]["default"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style][styleTab]["desktop"]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        } else {
          if (props.data[style][styleTab][device]["default"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style][styleTab][device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          } else {
            if (props.data[style][styleTab]["desktop"]["hover"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style][styleTab]["desktop"]["hover"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
            } else {
              if (props.data[style][styleTab]["desktop"]["default"]?.["boxShadow"]) {
                let boxshadow1= props.data[style][styleTab]["desktop"]["default"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (props.data[style][styleTab]["desktop"]["default"]?.["boxShadow"]) {
            let boxshadow1= props.data[style][styleTab]["desktop"]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        } else {
          if (props.data[style][styleTab][device]["default"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style][styleTab][device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          } else {
            if (props.data[style][styleTab]["desktop"]["hover"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style][styleTab]["desktop"]["hover"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
            } else {
              if (props.data[style][styleTab]["desktop"]["default"]?.["boxShadow"]) {
              let boxshadow1 = props.data[style][styleTab]["desktop"]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
              }
            }
          }
        }
      }
    }
  }else{
    if (props.data[style][device][styleState]?.["boxShadow"]) {
      let boxshadow1 = props.data[style][device][styleState]["boxShadow"];
      let barray = boxshadow1.split(" ");
      boxshadow.hPosition = barray[0];
      boxshadow.vPosition = barray[1];
      boxshadow.blur = barray[2];
      boxshadow.spread = barray[3];
      boxshadow.shadow = barray[4];
      boxshadow.color = barray[5];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (props.data[style][device]["default"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style][device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (props.data[style]["desktop"]["default"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style]["desktop"]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        } else {
          if (props.data[style][device]["default"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style][device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          } else {
            if (props.data[style]["desktop"]["hover"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style]["desktop"]["hover"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
            } else {
              if (props.data[style]["desktop"]["default"]?.["boxShadow"]) {
                let boxshadow1= props.data[style]["desktop"]["default"]["boxShadow"];
                let barray = boxshadow1.split(" ");
                boxshadow.hPosition = barray[0];
                boxshadow.vPosition = barray[1];
                boxshadow.blur = barray[2];
                boxshadow.spread = barray[3];
                boxshadow.shadow = barray[4];
                boxshadow.color = barray[5];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (props.data[style]["desktop"]["default"]?.["boxShadow"]) {
            let boxshadow1= props.data[style]["desktop"]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          }
        } else {
          if (props.data[style][device]["default"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style][device]["default"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
          } else {
            if (props.data[style]["desktop"]["hover"]?.["boxShadow"]) {
            let boxshadow1 = props.data[style]["desktop"]["hover"]["boxShadow"];
            let barray = boxshadow1.split(" ");
            boxshadow.hPosition = barray[0];
            boxshadow.vPosition = barray[1];
            boxshadow.blur = barray[2];
            boxshadow.spread = barray[3];
            boxshadow.shadow = barray[4];
            boxshadow.color = barray[5];
            } else {
              if (props.data[style]["desktop"]["default"]?.["boxShadow"]) {
              let boxshadow1 = props.data[style]["desktop"]["default"]["boxShadow"];
              let barray = boxshadow1.split(" ");
              boxshadow.hPosition = barray[0];
              boxshadow.vPosition = barray[1];
              boxshadow.blur = barray[2];
              boxshadow.spread = barray[3];
              boxshadow.shadow = barray[4];
              boxshadow.color = barray[5];
              }
            }
          }
        }
      }
    }
}

  const onChangeBox = (value, ftype) => {
     if (value !== "auto" && ftype !== "color" && ftype !== "shadow" ) {
      //let num = (String(value).match(/\d+/g) || ["0"]).join("") * 1;
      let num = Number((String(value).match(/-?\d+/) || ["0"])[0]);
      value = num;
    }
    let items = { ...props.data };
    let item = "";
    let Swcopy = "";

    if(styleTab!==""){
    Swcopy = { ...items[style][styleTab][device] };
    }else{
    Swcopy = { ...items[style][device] };
    }
    item = { ...Swcopy[styleState] };

    if (
      ftype == "hPosition" ||
      ftype == "vPosition" ||
      ftype == "blur" ||
      ftype == "spread"
    ) {
      boxshadow[ftype] = value + "px";
    }
    if (ftype == "color") {
      if (typeof value == "object") {
        boxshadow[ftype] = normalizeColorPickerValue(value);
      } else {
        boxshadow[ftype] = value;
      }
    }
    if (ftype == "shadow") {
      if (value == "inset") {
        boxshadow[ftype] = value;
      } else {
        boxshadow[ftype] = "";
      }
    }

    let bShadow =
      boxshadow["hPosition"] +
      " " +
      boxshadow["vPosition"] +
      " " +
      boxshadow["blur"] +
      " " +
      boxshadow["spread"] +
      " " +
      boxshadow["shadow"] +
      " " +
      boxshadow["color"];

    Swcopy[styleState] = {
      ...item,
      boxShadow: bShadow,
    };
    if(styleTab!==""){
    items[style][styleTab][device] = Swcopy;
    }else{
    items[style][device] = Swcopy;
    }

    if(moduleKey && moduleKey !==""){
      props.onChangeStyle(props.data,moduleKey);
    }else{
    props.onChangeStyle(props.data);
    }
  };

  const resetPosition = (value, type) => {
    if (type == "hPosition") {
      onChangeBox(0, "hPosition");
    } else if (type == "vPosition") {
      onChangeBox(0, "vPosition");
    } else if (type == "blur") {
      onChangeBox(0, "blur");
    } else if (type == "spread") {
      onChangeBox(0, "spread");
    } else if (type == "shadow") {
      onChangeBox("inset", "shadow");
    } else if (type == "color") {
      onChangeBox(value, type);
    }
  };

  const safeNumber = (v) => {
    if (!v) return 0; // null, undefined, empty
    if (v === "NaNpx" || v === "nullpx") return 0;

    const num = parseInt(v, 10);
    return isNaN(num) ? 0 : num;
  };

  // const handleFocus = () => {
  //   setDraggingDisabled(true);
  // };

  // const handleBlur = () => {
  //   setDraggingDisabled(false);
  // };
  return (
    // <>
    //   <div className="caf-builder-setting-row-label">
    //     <label>
    //       Box Shadow Color
    //       <Tooltip title="Reset">
    //     <span onClick={() => resetPosition("#333333", "color")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
    //     </Tooltip>
    //     </label>
    //     <ColorPicker
    //       className="custom-color"
    //       value={boxshadow.color}
    //       format="rgb"
    //       onChange={(value) => onChangeBox(value, "color")}
    //       placement="center"
    //     />
    //   </div>
    //   <div className="caf-builder-setting-row-label">
    //     <label>
    //       Box Shadow Horizontal Position
    //       <Tooltip title="Reset">
    //          <span onClick={() => resetPosition(0, "hPosition")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
    //       </Tooltip>
    //     </label>

    //     <Slider
    //       min={-80}
    //       max={100}
    //       onChange={(value) => onChangeBox(value, "hPosition")}
    //       value={parseInt(boxshadow.hPosition, 10)}
    //     />

    //     <Input
    //       style={{
    //         margin: "0 0px 0 10px",
    //       }}
    //       addonAfter={"PX"}
    //       value={parseInt(boxshadow.hPosition, 10)}
    //       onChange={(e) => onChangeBox(e.target.value, "hPosition")}
    //       type="number"
    //       // onFocus={handleFocus}
    //       // onBlur={handleBlur}
    //     />
    //   </div>
    //   <div className="caf-builder-setting-row-label">
    //     <label>
    //       Box Shadow Vertical Position
    //       <Tooltip title="Reset">
    //          <span onClick={() => resetPosition(0, "vPosition")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
    //       </Tooltip>
    //     </label>

    //     <Slider
    //       min={-80}
    //       max={100}
    //       onChange={(value) => onChangeBox(value, "vPosition")}
    //       value={parseInt(boxshadow.vPosition, 10)}
    //     />

    //     <Input
    //       style={{
    //         margin: "0 0px 0 10px",
    //       }}
    //       addonAfter={"PX"}
    //       value={parseInt(boxshadow.vPosition, 10)}
    //       onChange={(e) => onChangeBox(e.target.value, "vPosition")}
    //       type="number"
    //       // onFocus={handleFocus}
    //       // onBlur={handleBlur}
    //     />
    //   </div>
    //   <div className="caf-builder-setting-row-label">
    //     <label>
    //       Box Shadow Blur Strength
    //       <Tooltip title="Reset">
    //       <span onClick={() => resetPosition(0, "blur")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
    //       </Tooltip>
    //     </label>

    //     <Slider
    //       min={0}
    //       max={50}
    //       onChange={(value) => onChangeBox(value, "blur")}
    //       value={parseInt(boxshadow.blur, 10)}
    //     />

    //     <Input
    //       style={{
    //         margin: "0 0px 0 10px",
    //       }}
    //       addonAfter={"PX"}
    //       value={parseInt(boxshadow.blur, 10)}
    //       onChange={(e) => onChangeBox(e.target.value, "blur")}
    //       type="number"
    //       // onFocus={handleFocus}
    //       // onBlur={handleBlur}
    //     />
    //   </div>
    //   <div className="caf-builder-setting-row-label">
    //     <label>
    //       Box Shadow Spread Strength
    //       <Tooltip title="Reset">
    //       <span onClick={() => resetPosition(0, "spread")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
    //       </Tooltip>
    //     </label>

    //     <Slider
    //       min={-80}
    //       max={80}
    //       onChange={(value) => onChangeBox(value, "spread")}
    //       value={parseInt(boxshadow.spread, 10)}
    //     />

    //     <Input
    //       style={{
    //         margin: "0 0px 0 10px",
    //       }}
    //       addonAfter={"PX"}
    //       value={parseInt(boxshadow.spread, 10)}
    //       onChange={(e) => onChangeBox(e.target.value, "spread")}
    //       type="number"
    //     //   onFocus={handleFocus}
    //     // onBlur={handleBlur}
    //     />
    //   </div>
    //   <div className="caf-builder-setting-row-label">
    //     <label>
    //       Box Shadow Position
    //       <Tooltip title="Reset">
    //     <span onClick={() => resetPosition("inset", "shadow")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span> 
    //     </Tooltip>
    //     </label>
    //     <Select
    //       defaultValue={boxshadow.shadow == "inset" ? "inset" : "outset"}
    //       style={{
    //         width: "100%",
    //       }}
    //       onChange={(value) => onChangeBox(value, "shadow")}
    //       options={[
    //         {
    //           value: "inset",
    //           label: "Inner Shadow",
    //         },
    //         {
    //           value: "outset",
    //           label: "Outer Shadow",
    //         },
    //       ]}
    //       value={boxshadow.shadow == "inset" ? "inset" : "outset"}
    //     />
    //   </div>
    // </>
  <>
        <div className="caf-builder-setting-row-label">
          <label>
            <span>Color</span>
            <Tooltip title="Reset">
              <span onClick={() => resetPosition("#333333", "color", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
            </Tooltip>
          </label>
          <ColorPicker
            className="custom-color"
            value={boxshadow.color}
            mode={["single"]}
            // format="rgb"
            onChange={(value) => onChangeBox(value, "color")}
            placement="center"
          />
        </div>
        <div className="caf-builder-setting-row-label">
          <label>
            <span>Horizontal Position</span>
            <Tooltip title="Reset">
              <span onClick={() => resetPosition(0, "hPosition", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
            </Tooltip>
          </label>
          <Row>
            <Col span={15}>
              <Slider
                min={-80}
                max={100}
                onChange={(value) => onChangeBox(value, "hPosition")}
                value={parseInt(boxshadow.hPosition, 10)}
              />
            </Col>
            <div className="caf-manage-suffix-look">
              <Col span={20} className="input-inner-px slide-cnt-col">
                <InputNumber
                  // style={{
                  //   margin: "0 0px 0 10px",
                  // }}
                  value={safeNumber(boxshadow.hPosition, 10)}
                  onChange={(newValue) => onChangeBox(newValue, "hPosition")}
                />
              </Col>
              <Col span={4} className="slide-cnt-col selectafter">
                {selectAfter}
              </Col>
            </div>
          </Row>
        </div>
        <div className="caf-builder-setting-row-label">
          <label>
           <span>Vertical Position</span>
            <Tooltip title="Reset">
              <span onClick={() => resetPosition(0, "vPosition", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
            </Tooltip>
          </label>
          <Row>
            <Col span={15}>
              <Slider
                min={-80}
                max={100}
                onChange={(value) => onChangeBox(value, "vPosition")}
                value={parseInt(boxshadow.vPosition, 10)}
              />
            </Col>
            <div className="caf-manage-suffix-look">
              <Col span={20} className="input-inner-px slide-cnt-col">
                <InputNumber
                  // style={{
                  //   margin: "0 0px 0 10px",
                  // }}
                  value={safeNumber(boxshadow.vPosition, 10)}
                  onChange={(newValue) => onChangeBox(newValue, "vPosition")}
                />
              </Col>
              <Col span={4} className="slide-cnt-col selectafter">
                {selectAfter}
              </Col>
            </div>
          </Row>
        </div>
        <div className="caf-builder-setting-row-label">
          <label>
            <span>Blur Strength</span>
            <Tooltip title="Reset">
              <span onClick={() => resetPosition(0, "blur", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
            </Tooltip>
          </label>
          <Row>
            <Col span={15}>
              <Slider
                min={0}
                max={50}
                onChange={(value) => onChangeBox(value, "blur")}
                value={parseInt(boxshadow.blur, 10)}
              />
            </Col>
            <div className="caf-manage-suffix-look">
              <Col span={20} className="input-inner-px slide-cnt-col">
                <InputNumber
                  // style={{
                  //   margin: "0 0px 0 10px",
                  // }}
                  value={safeNumber(boxshadow.blur, 10)}
                  onChange={(newValue) => onChangeBox(newValue, "blur")}
                />
              </Col>
              <Col span={4} className="slide-cnt-col selectafter">
                {selectAfter}
              </Col>
            </div>
          </Row>
        </div>
        <div className="caf-builder-setting-row-label">
          <label>
            <span>Spread Strength</span>
            <Tooltip title="Reset">
              <span onClick={() => resetPosition(0, "spread", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
            </Tooltip>
          </label>
          <Row>
            <Col span={15}>
              <Slider
                min={-80}
                max={80}
                onChange={(value) => onChangeBox(value, "spread")}
                value={parseInt(boxshadow.spread, 10)}
              />
            </Col>
            <div className="caf-manage-suffix-look">
                <Col span={20} className="input-inner-px slide-cnt-col">
              <InputNumber
                // style={{
                //   margin: "0 0px 0 10px",
                // }}
                value={safeNumber(boxshadow.spread, 10)}
                onChange={(newValue) => onChangeBox(newValue, "spread")}
              />
            </Col>
            <Col span={4} className="slide-cnt-col selectafter">
                  {selectAfter}
                </Col>
            </div>
          </Row>
        </div>
        <div className="caf-builder-setting-row-label">
          <label>
            <span>Position</span>
            <Tooltip title="Reset">
              <span onClick={() => resetPosition("inset", "shadow", "reset")}><FontAwesomeIcon icon={faArrowRotateLeft} /></span>
            </Tooltip>
          </label>
          <Select
            defaultValue={boxshadow.shadow == "inset" ? "inset" : "outset"}
            style={{
              width: "100%",
            }}
            onChange={(value) => onChangeBox(value, "shadow")}
            options={[
              {
                value: "inset",
                label: "Inner Shadow",
              },
              {
                value: "outset",
                label: "Outer Shadow",
              },
            ]}
            value={boxshadow.shadow == "inset" ? "inset" : "outset"}
          />
        </div>
      </>
  );
}

export default BoxShadow;
