import React, { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { Tooltip } from "antd";
import { commitPostModuleSettingsPatch } from "./postLayoutSnapshot";

function ModuleCustomTextContent(props) {
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings;
  const [text, setText] = useState(modSettings?.customText ?? "");

  useEffect(() => {
    setText(modSettings?.customText ?? "");
  }, [props.data, rowindex, columnindex, moduleindex]);

  const onChange = (e) => {
    const v = e.target.value;
    setText(v);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.customText = v;
      },
    });
  };
  return (
    <>
      <label className="setting-label-main">Custom Text</label>
      <div className="module-content-tab-row">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enter custom text or HTML content.">
          <label>Content</label>
        </Tooltip>
        <TextArea
          placeholder="Add your text here ...."
          onChange={onChange}
          value={text}
        />
      </div>
    </>
  );
}

export default ModuleCustomTextContent;
