import { DeleteOutlined } from "@ant-design/icons";
import { Button, Segmented, Select, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import ContentLink from "../ContentComponents/ContentLink";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  getBuilderPlaceholderImageUrl,
  isBuilderDefaultPlaceholderImage,
} from "../../../../../utils/builderPlaceholderImage";
import { getUpgradeUrl } from "../../../../../../tier/capabilities";

function resolvePlaceholderPreviewSrc(value) {
  if (typeof value === "string") return value || getBuilderPlaceholderImageUrl();
  return value?.url || getBuilderPlaceholderImageUrl();
}

function ProductImageSourceSegment() {
  return (
    <div className="hoverswitchguard caf-filter-data-source-segmented-wrap caf-filter-data-source-segmented-wrap--locked">
      <Segmented
        value={false}
        style={{ marginBottom: 8 }}
        className="hoverTabCaf caf-filter-data-source-segmented"
        options={[
          { label: "Featured Image", value: false },
          {
            label: (
              <span className="caf-filter-data-source-tab-label">
                Gallery Images
                <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                  Pro
                </span>
              </span>
            ),
            value: true,
            disabled: true,
            className: "caf-builder-tier-locked-segment-item",
          },
        ]}
      />
      <Tooltip
        classNames={{
          root: "caf-builder-tooltip caf-builder-tier-locked-tooltip",
        }}
        placement="topLeft"
        title={
          <span className="caf-builder-tier-locked-section__tooltip-text">
            Gallery images are available in Category Ajax Filter Pro.{" "}
            <a
              href={getUpgradeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="caf-builder-tier-locked-section__upgrade-link"
            >
              Upgrade to Pro
            </a>
          </span>
        }
      >
        <div
          className="caf-builder-tier-locked-segment-overlay"
          aria-hidden="true"
        />
      </Tooltip>
    </div>
  );
}

function ProductImageContent(props) {
  const builderPostData = props.postPreviewData || {};
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [selected, setSelected] = useState(
    modSettings?.placeholder_image || getBuilderPlaceholderImageUrl(),
  );
  const [iconsArray, setIconsArray] = useState("");

  useEffect(() => {
    setSelected(modSettings?.placeholder_image || getBuilderPlaceholderImageUrl());
  }, [props.data, rowindex, columnindex, moduleindex]);

  useEffect(() => {
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (settings) => {
        settings.image_source = "featured_image";
      },
    });
  }, [builderPostData?.value]);

  const imageOptions = (builderPostData?.imageArray?.sizes || []).map((size) => ({
    value: size,
    label: size,
  }));
  const updateSettings = (patch) =>
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch,
    });
  const mediaLibrary =
    typeof window !== "undefined" && typeof window.wp?.media === "function"
      ? window.wp.media({
          frame: "select",
          title: "Select Images",
          multiple: false,
          library: { type: "image" },
          button: { text: "Done" },
        })
      : null;

  if (mediaLibrary) {
    mediaLibrary.on("select", () => {
      const image = mediaLibrary.state().get("selection").first().toJSON();
      setSelected(image);
      updateSettings((settings) => {
        settings.placeholder_image = image?.url;
      });
    });
  }

  const previewSrc = resolvePlaceholderPreviewSrc(selected);
  return (
    <>
      <div className="module-content-tab-row no-pad-0">
        <label className="setting-label-main">Image Source</label>
        <div className="module-content-tab-row">
          <ProductImageSourceSegment />
        </div>
        <div className="module-content-tab-row caf-design-two-half">
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title="Select image size source."
          >
            <label>Image Size</label>
          </Tooltip>
          <Select
            value={modSettings?.image_size}
            style={{ width: "100%" }}
            onChange={(value) =>
              updateSettings((settings) => {
                settings.image_size = value;
              })
            }
            options={imageOptions}
            className="image_size_caf"
          />
        </div>
        <hr className="setting-hr-main" />
      </div>
      <div className="module-content-tab-row">
        <label className="setting-label-main">Fallback image</label>
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title="Upload placeholder image used when no image is found."
        >
          <label>Placeholder Image</label>
        </Tooltip>
        <div className="caf-icon-container image-module-uploader-widget">
          <div className="icon-container-wrapper">
            <div className="icon-wrapper-fa">
              <img src={previewSrc} className="caf-bg-mask" alt="" />
            </div>
          </div>
          <div className="icon-container-header">
            {!isBuilderDefaultPlaceholderImage(previewSrc) ? (
              <Button
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => {
                  const image = getBuilderPlaceholderImageUrl();
                  setSelected(image);
                  updateSettings((settings) => {
                    settings.placeholder_image = image;
                  });
                }}
              />
            ) : null}
          </div>
          <div className="icon-container-footer">
            <button className="ic-lib" onClick={() => mediaLibrary?.open()}>
              Upload Image
            </button>
          </div>
        </div>
        <hr className="setting-hr-main" />
      </div>
      <div className="module-content-tab-row">
        <label className="setting-label-main">Link Settings</label>
        <ContentLink
          title="Link"
          data={props.data}
          indexes={props.indexes}
          iconsArray={iconsArray}
          onSettingChange={props.onSettingChange}
          postPreviewData={props.postPreviewData}
        />
      </div>
    </>
  );
}

export default ProductImageContent;
