import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Tooltip } from "antd";

const CodeEditor = (props) => {
    const [code, setCode] = useState(props.data.custom_css ?? "");
    const handleChangeCode =(val)=>{
        setCode(val)
        let newData = structuredClone(props.data || {});
        newData.custom_css = val;
        props.onChangeData(newData);
    }
    const tooltipTitle = props.label ? `Configure ${String(props.label).toLowerCase()}.` : "";
    return (
        <div className="module-content-tab-row">
             <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={tooltipTitle}>
               <label>{props.label}</label>
             </Tooltip>
        <Editor
          className='caf-preview-custom-code-editor'
          defaultLanguage="css"
          defaultValue={code}
          onChange={(value) => handleChangeCode(value)}
          theme="vs-dark" // Optional: vs-dark theme
          options={{
            wordWrap: 'on', // Enable word wrapping
            scrollBeyondLastLine: false, // Prevent scrolling beyond last line
            minimap: { enabled: false }, // Hide the minimap
          }}
        />
        </div>
    );
  };

export default CodeEditor;
