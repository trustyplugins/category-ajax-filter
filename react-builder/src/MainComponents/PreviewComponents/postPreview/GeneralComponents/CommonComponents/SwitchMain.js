import React,{useState,useEffect} from 'react'
import { Input, Select,Switch, Tooltip } from "antd";
const SwitchMain = (props) => {
const  {property,data,parentKey='' , moduleKey="" ,extraClass = ""} = props
let defaultval =
  parentKey === ""
    ? data?.[property] === "true"
    : data?.[parentKey]?.[property] === "true";
const[value,setValue]=useState(defaultval);

//console.log(defaultval)

const handleChange = (val) => {
  setValue(val);
  let newData = structuredClone(data || {})
  if(parentKey !== ""){
    if (!newData[parentKey]) {
      newData[parentKey] = {};
    }
    newData[parentKey][property] = val.toString();
  }else{
  newData[property] = val.toString();
  }

  if(props.moduleKey && props.moduleKey!==""){
  props.onChangeData(newData,props.moduleKey);
  }else{
  props.onChangeData(newData);
  }
};
const tooltipTitle = props.label ? `Configure ${String(props.label).toLowerCase()}.` : "";
  return (
    <div className={`module-content-tab-row caf-design-two-half ${extraClass}`}>
    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={tooltipTitle}>
      <label><span>{props.label}</span></label>
    </Tooltip>
    <Switch
      checkedChildren={props.checked}
      unCheckedChildren={props.unchecked}
      onChange={handleChange}
      checked={value}
    />
  </div>
  )
}

export default SwitchMain
