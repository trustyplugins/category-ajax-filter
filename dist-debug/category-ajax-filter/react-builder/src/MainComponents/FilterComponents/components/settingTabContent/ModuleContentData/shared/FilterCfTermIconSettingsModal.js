import React from "react";
import { Button, Modal } from "antd";
import ContentIcons from "../ContentComponents/ContentIcons";

export default function FilterCfTermIconSettingsModal({
  open,
  title,
  onCancel,
  onSave,
  iconsArray,
  data,
  indexes,
  onSettingChange,
  contentIconDetail,
  setcontentIconDetail,
  iconSwitch,
  setIconSwitch,
  selectedIcon,
  setSelectedIcon,
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
        <Button key="save" type="primary" onClick={onSave}>
          Save
        </Button>,
      ]}
    >
      <div className="module-content-tab-row">
        {children}
        {iconsArray ? (
          <ContentIcons
            title="Icons"
            data={data}
            indexes={indexes}
            iconsArray={iconsArray}
            onSettingChange={onSettingChange}
            setcontentIconDetail={setcontentIconDetail}
            contentIconDetail={contentIconDetail}
            iconSwitch={iconSwitch}
            setIconSwitch={setIconSwitch}
            selectedIcon={selectedIcon}
            setSelectedIcon={setSelectedIcon}
            hidePosition={true}
          />
        ) : null}
      </div>
    </Modal>
  );
}
