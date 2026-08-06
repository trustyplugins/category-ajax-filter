import React,{useState,useEffect} from 'react'
import { Input, Select,Switch, Tooltip } from "antd";
const InputMain = (props) => {
const  {property,defaultValue,data,parentKey='' ,placeholder="" ,extraClass=""} = props
let defaultval = parentKey === '' ? data?.[property] : data?.[parentKey]?.[property]
const[value,setValue]=useState(defaultval);
useEffect(() => {
setValue(defaultval);
}, [defaultval]);
const handleChange = (val) => {
setValue(val);
let newData = structuredClone(data || {});
if(parentKey !== ""){
  if (!newData[parentKey]) {
    newData[parentKey] = {};
  }
  newData[parentKey][property] = val;
}else{
newData[property] = val;
}
 if(props.moduleKey && props.moduleKey!==""){
  props.onChangeData(newData,props.moduleKey);
  }else{
  props.onChangeData(newData);
  }
}
const handleBlur = (val) => {
if (typeof props.onBlurData !== "function") return;
const normalizedVal = props.onBlurData(val);
if (normalizedVal === undefined || normalizedVal === val) return;
handleChange(normalizedVal);
}
const tooltipTitle = props.label ? `Configure ${String(props.label).toLowerCase()}.` : "";
  return (
    <div className={`module-content-tab-row ${extraClass}`}>
    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={tooltipTitle}>
      <label><span>{props.label}</span></label>
    </Tooltip>
    <Input
        type={props.type}
        value={value}
        defaultValue={value}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => handleBlur(e.target.value)}
      />
  </div>
  )
}

export default InputMain
