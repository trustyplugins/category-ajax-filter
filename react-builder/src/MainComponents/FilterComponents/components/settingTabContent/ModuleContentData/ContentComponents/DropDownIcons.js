import React, { useState } from 'react'
import { Input, Switch ,Segmented, Tooltip} from "antd";
import ContentIcons1 from "../ContentComponents/ContentIcons1";
const DropDownIcons = (props) => {
    const { type, rowindex, columnindex, moduleindex } = props.indexes;
    let mainData = [...props.data]
    let settingData = { ...mainData[rowindex]?.data[columnindex]?.data[moduleindex]?.settings }
    let dropdownData={...settingData?.dropdown_data}
    const [iconsArrayActive, setIconsArrayActive] = useState(props?.iconsArray);
    const [iconsArrayInActive, setIconsArrayInActive] = useState(props?.iconsArray);
    const [state, setState] = useState({
        iconSwitch: dropdownData.icons?.icon_switch,
        activeIcon: dropdownData.icons?.active_icon,
        inActiveIcon: dropdownData.icons?.inactive_icon,
        searchActive: '',
        searchInActive: '',
    })
    const [iconTabs ,setIconTabs]= useState('active')
    const handleIconSelectActive = (icon) => {
        setState((prev) => ({
            ...prev,
            activeIcon: icon
        }))
        dropdownData.icons.active_icon = icon;
        settingData['dropdown_data']= dropdownData
        mainData[rowindex].data[columnindex].data[moduleindex].settings = settingData;
        props.onSettingChange(mainData);
    };
    const handleIconSelectInActive = (icon) => {
        setState((prev) => ({
            ...prev,
            inActiveIcon: icon
        }))
        dropdownData.icons.inactive_icon = icon;
        settingData['dropdown_data']= dropdownData
        mainData[rowindex].data[columnindex].data[moduleindex].settings = settingData;
        props.onSettingChange(mainData);
    };
    const onIconSwitch = (checked) => {
        if (checked) {
            setState((prev) => ({
                ...prev,
                iconSwitch: checked
            }))
        } else {
            setState((prev) => ({
                ...prev,
                iconSwitch: checked,
                activeIcon: '',
                inActiveIcon: '',
            }))
            dropdownData.icons.active_icon = '';
            dropdownData.icons.inactive_icon = '';
            dropdownData.icons.active_type = 'icon';
            dropdownData.icons.inactive_type = '';
        }
        dropdownData.icons.icon_switch = checked;
        settingData['dropdown_data']= dropdownData
        mainData[rowindex].data[columnindex].data[moduleindex].settings = settingData;
        props.onSettingChange(mainData);
    };
    const handleIconSearchActive = (e) => {
        const searchValue = e.target.value;
        setState((prev) => ({
            ...prev,
            searchActive: searchValue
        }))
        let newArray = props?.iconsArray.filter(function (item) {
            return item
                .toString()
                .toLowerCase()
                .includes(searchValue.toString().toLowerCase());
        });
        setIconsArrayActive([...newArray]);
    };
    const handleIconSearchInActive = (e) => {
        const searchValue = e.target.value;
        setState((prev) => ({
            ...prev,
            searchInActive: searchValue
        }))
        let newArray = props?.iconsArray.filter(function (item) {
            return item
                .toString()
                .toLowerCase()
                .includes(searchValue.toString().toLowerCase());
        });
        setIconsArrayInActive([...newArray]);
    };
    const onChangeIconsTab =(tab)=>{
        setIconTabs(tab);
    }
    return (
        <>
        <div class="module-content-tab-row caf-design-two-half">
            <Tooltip
              classNames={{ root: "caf-builder-tooltip" }}
              placement="topLeft"
              title={`Configure ${String(props.title || "dropdown icons").toLowerCase()}.`}
            >
              <label>{props.title}</label>
            </Tooltip>
            <div className="module-content-icon-switch">
                <Switch onChange={onIconSwitch} checked={state.iconSwitch} />
            </div>
            </div>
            <div class="module-content-tab-row">
            {(state.iconSwitch && iconTabs === "active") ? (
                <>
                    <ContentIcons1
                        title="Icons"
                        data={props.data}
                        indexes={props.indexes}
                        iconsArray={props?.iconsArray}
                        onSettingChange={props.onSettingChange}
                        tab="active_icon"
                        type="active_type"
                    ></ContentIcons1>
                </>
            ) : (
                ""
            )}
        </div>
        </>
    )
}

export default DropDownIcons
