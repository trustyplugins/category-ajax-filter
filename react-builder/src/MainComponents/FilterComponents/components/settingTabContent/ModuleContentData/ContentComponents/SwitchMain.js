import React, { useState } from 'react'
import { Switch } from 'antd';
import { Tooltip } from 'antd';
import { useEffect } from 'react';
const SwitchMain = ({ checkedChildren, unCheckedChildren, onSettingChange, label, property, property2 = '', data, currValue, labelTooltip = "", }) => {
    //console.log(data)
    const [value, setValue] = useState(currValue == 'true' ? true : false);
    useEffect(() => {
        setValue(currValue == 'true' ? true : false);
    }, [currValue]);
    const onChange = (val) => {
        setValue(val)
        let items = { ...data }
        if (property2 != '') {
            if(property === "label" && property2 === "is_label" && val === false){
            items[property][property2] = `${val}`;
            items["enable_toggle"] = "false";
            items["close_toggle"] = "false";
            }else{
            items[property][property2] = `${val}`;
            }
        } else {
            items[property] = `${val}`;
        }
        onSettingChange(items)
    }
    const tooltipTitle = labelTooltip || (label ? `Configure ${String(label).toLowerCase()}.` : "");
    return (
        <>
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={tooltipTitle}>
                <label>{label}</label>
            </Tooltip>
            <Switch
                checkedChildren={checkedChildren}
                unCheckedChildren={unCheckedChildren}
                onChange={onChange}
                checked={value}
            />
        </>
    )
}

export default SwitchMain
