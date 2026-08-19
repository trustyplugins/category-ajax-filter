import React, { useState } from "react";
import { Col, Input, Row, Slider, Select, Space } from "antd";
const { Option } = Select;
const Height = (props) => {
  //console.log(props);
  const { type, rowindex, columnindex, moduleindex } = props.indexes;
  let currentHeight = "";
  if (type == "row") {
    currentHeight = props.data[rowindex].style.default.height;
  }
  if (type == "column") {
    currentHeight = props.data[rowindex].data[columnindex].style.default.height;
  }
  if (type == "module") {
    currentHeight =
      props.data[rowindex].data[columnindex].data[moduleindex].style.default.height;
  }
  const [inputValue, setInputValue] = useState(parseInt(currentHeight,10));
  const [suffix, setSuffix] = useState("%");
  const onSelectChange = (value) => {
    if(value!='auto') {
    setSuffix(value);
    ChangeStyle("height", inputValue, value);
    }
    else {
      ChangeStyle("height", "auto");
    }
  };

  const selectAfter = (
    <Select defaultValue="%" onChange={onSelectChange}>
      <Select.Option value="px">PX</Select.Option>
      <Select.Option value="%">%</Select.Option>
      <Select.Option value="auto">Auto</Select.Option>
    </Select>
  );

  const onChangeSlider = (newValue) => {
    setInputValue(newValue);
    ChangeStyle("height", newValue, suffix);
  };
  const onChangeNumber = (e) => {
    setInputValue(e.target.value);
    ChangeStyle("height", e.target.value, suffix);
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
  return (
    <div className="caf-builder-setting-row-label">
      <label>
        Height <span>Reset</span>
      </label>
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

export default Height;
