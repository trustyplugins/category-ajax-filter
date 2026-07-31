import React, { useState } from "react";
import { Col, Input, Row, Slider, Select, Space } from "antd";

const Position = (props) => {
  const { type, rowindex, columnindex, moduleindex } = props.indexes;
  let currentposition = "";
  if (type == "row") {
    currentposition = props.data[rowindex].style.default.position;
  }
  if (type == "column") {
    currentposition = props.data[rowindex].data[columnindex].style.default.position;
  }
  if (type == "module") {
    currentposition =
      props.data[rowindex].data[columnindex].data[moduleindex].style.default.position;
  }
  const handleChange = (value) => {
   // 1. Make a shallow copy of the items
   let items = [...props.data];
   if (type == "row") {
     // 2. Make a shallow copy of the item you want to mutate
     let item = { ...items[rowindex]["style"]["default"] };
     // 3. Replace the property you're intested in
     item['position'] = value;
     // 4. Put it back into our array. N.B. we *are* mutating the array here,
     //    but that's why we made a copy first
     items[rowindex]["style"]["default"] = item;
   }
   if (type == "column") {
     let item = { ...items[rowindex].data[columnindex]["style"]["default"] };
     item['position'] = value ;
     items[rowindex].data[columnindex]["style"]["default"] = item; 
   }
   if (type == "module") {
     let item = { ...items[rowindex].data[columnindex].data[moduleindex]["style"]["default"] };
     item['position'] = value;
     items[rowindex].data[columnindex].data[moduleindex]["style"]["default"] = item; 
   }
   props.onChangeStyle(props.data);
  };
  return (
    <div className="caf-builder-setting-row-label">
      <label>
        Position <span>Reset</span>
      </label>
      <Select
        defaultValue={currentposition}
        style={{
          width: "100%",
        }}
        onChange={handleChange}
        options={[
          {
            value: "static",
            label: "Static",
          },
          {
            value: "relative",
            label: "Relative",
          },
          {
            value: "absolute",
            label: "Absolute",
          },
          {
            value: "fixed",
            label: "Fixed",
          },
          {
            value: "inherit",
            label: "Inherit",
          },
        ]}
      />
    </div>
  );
};

export default Position;
