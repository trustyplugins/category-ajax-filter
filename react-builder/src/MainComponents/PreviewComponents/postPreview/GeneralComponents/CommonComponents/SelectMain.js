import React,{useState,useEffect} from 'react'
import { Input, Select,Switch, Tooltip } from "antd";

const SelectMain = (props) => {
    const  {property,defaultValue,data,parentKey='',extraClass=""} = props
    let defaultval = parentKey === '' ? data?.[property] : data?.[parentKey]?.[property]
    const[value,setValue]=useState(defaultval);
    const handleChange = (val) => {
    setValue(val);
    let newData = structuredClone(data || {})
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
  const tooltipTitle = props.label ? `Configure ${String(props.label).toLowerCase()}.` : "";
  return (
     <div className={`module-content-tab-row ${extraClass}`}>
    <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={tooltipTitle}>
      <label><span>{props.label}</span></label>
    </Tooltip>
    <Select
      style={{
        width: "100%",
      }}
      onChange={handleChange}
      options={[...props.options]}
      value={value}
    />
  </div>
  )
}

export default SelectMain
