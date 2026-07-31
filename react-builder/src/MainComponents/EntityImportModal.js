import React from "react";
import { Button, Modal } from "antd";
import BuilderCrossCircleIcon from "./BuilderCrossCircleIcon";
import BuilderUploadIcon from "./BuilderUploadIcon";

function EntityImportModal({
  open,
  title,
  hintText,
  selectedFileName,
  confirmLoading = false,
  onClose,
  onConfirm,
  onChooseFile,
  onFileSelected,
}) {
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file && typeof onFileSelected === "function") {
      onFileSelected(file);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={674}
      className="caf-entity-import-modal caf-builder-modal"
      destroyOnHidden
    >
      <div className="caf-entity-import-modal-header">
        <h3 className="caf-entity-import-modal-title">{title}</h3>
        <button
          type="button"
          className="caf-entity-import-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <BuilderCrossCircleIcon />
        </button>
      </div>

      <div
        className={`caf-entity-import-dropzone ${
          selectedFileName ? "has-file" : ""
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <BuilderUploadIcon className="caf-entity-import-dropzone-icon" />
        <p className="caf-entity-import-dropzone-text">
          Drag &amp; Drop or{" "}
          <button
            type="button"
            className="caf-entity-import-choose-link"
            onClick={onChooseFile}
          >
            Choose file
          </button>{" "}
          to Upload
        </p>
        {selectedFileName ? (
          <p className="caf-entity-import-selected-file">{selectedFileName}</p>
        ) : null}
        {hintText ? (
          <p className="caf-entity-import-hint">{hintText}</p>
        ) : null}
      </div>

      <div className="caf-entity-import-modal-footer">
        <Button
          type="primary"
          className="caf-entity-import-start-btn"
          onClick={onConfirm}
          loading={confirmLoading}
          disabled={!selectedFileName}
        >
          Start Import
        </Button>
      </div>
    </Modal>
  );
}

export default EntityImportModal;
