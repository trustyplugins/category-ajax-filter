import React, { useState } from "react";
import { Col, Input, Row, Slider, Select, Space } from "antd";
const { Option } = Select;
const Width = (props) => {
  const { type, rowindex, columnindex, moduleindex } = props.indexes;
  let currentWidth = "100";
  if (type == "row") {
    currentWidth = props.data[rowindex].style.default.width;
  }
  if (type == "column") {
    currentWidth = props.data[rowindex].data[columnindex].style.default.width;
  }
  if (type == "module") {
    currentWidth =
      props.data[rowindex].data[columnindex].data[moduleindex].style.default.width;
  }
  const [inputValue, setInputValue] = useState(parseInt(currentWidth,10));
  const [suffix, setSuffix] = useState("%");
  const onSelectChange = (value) => {
    setSuffix(value);
    ChangeStyle("width", inputValue, value);
  };
  const selectAfter = (
    <Select defaultValue="%" onChange={onSelectChange}>
      <Select.Option value="px">PX</Select.Option>
      <Select.Option value="%">%</Select.Option>
    </Select>
  );

  const onChangeSlider = (newValue) => {
    setInputValue(newValue);
    ChangeStyle("width", newValue, suffix);
  };
  const onChangeNumber = (e) => {
    setInputValue(e.target.value);
    ChangeStyle("width", e.target.value, suffix);
  };

  const ChangeStyle = (property, value, suffix = "") => {
    // 1. Make a shallow copy of the items
    let items = [...props.data];
    if (type == "row") {
      // 2. Make a shallow copy of the item you want to mutate
      let item = { ...items[rowindex]["style"]["default"] };
      // 3. Replace the property you're intested in
      item[property] = value + suffix;
      // 4. Put it back into our array. N.B. we *are* mutating the array here,
      //    but that's why we made a copy first
      items[rowindex]["style"]["default"] = item;
    }
    if (type == "column") {
      let item = { ...items[rowindex].data[columnindex]["style"]["default"] };
      item[property] = value + suffix;
      items[rowindex].data[columnindex]["style"]["default"] = item; 
    }
    if (type == "module") {
      let item = { ...items[rowindex].data[columnindex].data[moduleindex]["style"]["default"] };
      item[property] = value + suffix;
      items[rowindex].data[columnindex].data[moduleindex]["style"]["default"] = item; 
    }
    props.onChangeStyle(props.data);
  };
  // console.log(inputValue);
  return (
    <div className="caf-builder-setting-row-label width">
      <label>
        Width<span>Reset</span>
      </label>
      <Space orientation="vertical"></Space>
      <Row>
        <Col span={17}>
          <Slider
            min={1}
            max={100}
            onChange={onChangeSlider}
            value={inputValue}
          />
        </Col>
        <Col span={6}>
          <Space.Compact
            style={{
              margin: "0 0px 0 10px",
              width: "100%",
            }}
          >
            <Input value={inputValue} onChange={onChangeNumber} />
            {selectAfter}
          </Space.Compact>
        </Col>
      </Row>
    </div>
  );
};

export default Width;
