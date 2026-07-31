import React from "react";
import { Button, Modal, Switch, Tooltip } from "antd";
import ContentIcons from "../ContentComponents/ContentIcons";

export default function FilterTermIconSettingsModal({
  open,
  title,
  onCancel,
  onSave,
  saveDisabled,
  termSelected,
  iconsArray,
  data,
  indexes,
  onSettingChange,
  termDetail,
  contentIconDetail,
  setcontentIconDetail,
  iconSwitch,
  setIconSwitch,
  selectedIcon,
  setSelectedIcon,
  checkError,
  showAddAsParentSwitch,
  isParent,
  onToggleParent,
  className,
  destroyOnHidden = false,
  children,
}) {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onSave}
      onCancel={onCancel}
      destroyOnHidden={destroyOnHidden}
      className={className}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          disabled={saveDisabled}
          key="save"
          type="primary"
          onClick={onSave}
        >
          Save
        </Button>,
      ]}
    >
      <div className="module-content-tab-row">
        {termSelected ? (
          <>
            {children}
            {iconsArray && (
              <ContentIcons
                title="Icons"
                data={data}
                indexes={indexes}
                iconsArray={iconsArray}
                onSettingChange={onSettingChange}
                termDetail={termDetail}
                setcontentIconDetail={setcontentIconDetail}
                contentIconDetail={contentIconDetail}
                iconSwitch={iconSwitch}
                setIconSwitch={setIconSwitch}
                selectedIcon={selectedIcon}
                setSelectedIcon={setSelectedIcon}
                hidePosition={true}
              />
            )}
            {showAddAsParentSwitch && (
              <>
                <Tooltip
                  classNames={{ root: "caf-builder-tooltip" }}
                  placement="topLeft"
                  title="Treat this term as parent term."
                >
                  <label>Add As Parent</label>
                </Tooltip>
                <Switch
                  checkedChildren="Remove"
                  unCheckedChildren="Add"
                  onChange={onToggleParent}
                  checked={isParent}
                />
              </>
            )}
          </>
        ) : (
          <label style={{ color: "red" }}>
            Ooops! ⚠ you didn't select this term, please select it First
          </label>
        )}
        {checkError &&
          contentIconDetail.icon === "" &&
          contentIconDetail.iconChecked && (
            <Tooltip
              classNames={{ root: "caf-builder-tooltip" }}
              placement="topLeft"
              title="An icon selection is required."
            >
              <label style={{ color: "red" }}>Please Select the icon</label>
            </Tooltip>
          )}
      </div>
    </Modal>
  );
}
