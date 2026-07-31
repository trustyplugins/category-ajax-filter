import { DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Segmented, Select, Switch, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import ContentLink from "../ContentComponents/ContentLink";
import { commitPostModuleSettingsPatch } from "../postLayoutSnapshot";
import {
  getBuilderPlaceholderImageUrl,
  isBuilderDefaultPlaceholderImage,
} from "../../../../../utils/builderPlaceholderImage";
import { canUseFeature } from "../../../../../../tier/capabilities";

function resolvePlaceholderPreviewSrc(value) {
  if (!value) {
    return getBuilderPlaceholderImageUrl();
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && value.url) {
    return value.url;
  }
  return getBuilderPlaceholderImageUrl();
}

function resolveProductImageSource(storedValue) {
  return canUseFeature("woo_product_image_gallery") &&
    storedValue === "gallery"
    ? "gallery"
    : "featured_image";
}

function ProductImageSourceSegment({
  value,
  onChange,
  className = "hoverTabCaf",
}) {
  const galleryLocked = !canUseFeature("woo_product_image_gallery");
  const handleChange = (nextValue) => {
    if (nextValue === true && galleryLocked) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <div className="hoverswitchguard caf-filter-data-source-segmented-wrap">
      <Segmented
        value={value}
        style={{ marginBottom: 8 }}
        onChange={handleChange}
        className={`${className} caf-filter-data-source-segmented`}
        options={[
          { label: "Featured Image", value: false },
          {
            label: (
              <span className="caf-filter-data-source-tab-label">
                Gallery Images
                {galleryLocked ? (
                  <span className="caf-builder-tier-locked-wrap__badge caf-filter-data-source-pro-badge">
                    Pro
                  </span>
                ) : null}
              </span>
            ),
            value: true,
            disabled: galleryLocked,
            className: galleryLocked
              ? "caf-builder-tier-locked-segment-item"
              : undefined,
          },
        ]}
      />
    </div>
  );
}

function ProductImageContent(props) {
  const builderPostData = props.postPreviewData || {};
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};

  let img = getBuilderPlaceholderImageUrl();
  if (modSettings?.placeholder_image) {
    img = modSettings.placeholder_image;
  }

  const [selected, setSelected] = useState(img);
  const [iconsArray, setIconsArray] = useState("");
  const [galleryTab, setGalleryTab] = useState(
    resolveProductImageSource(modSettings?.image_source) === "gallery",
  );
  const [galleryImageLimit, setGalleryImageLimit] = useState(
    modSettings?.gallery_image_limit ?? "2",
  );
  const [autoScroll, setAutoScroll] = useState(
    modSettings?.auto_scroll === "true",
  );
  const [autoScrollDelay, setAutoScrollDelay] = useState(
    modSettings?.auto_scroll_delay ?? "1000",
  );
  const isFirstRender = useRef(true);

  useEffect(() => {
    setGalleryTab(
      resolveProductImageSource(modSettings?.image_source) === "gallery",
    );
  }, [modSettings?.image_source]);

  useEffect(() => {
    setSelected(
      modSettings?.placeholder_image || getBuilderPlaceholderImageUrl(),
    );
    setGalleryTab(
      resolveProductImageSource(modSettings?.image_source) === "gallery",
    );
    setGalleryImageLimit(modSettings?.gallery_image_limit ?? "2");
    setAutoScroll(modSettings?.auto_scroll === "true");
    setAutoScrollDelay(modSettings?.auto_scroll_delay ?? "1000");
  }, [props.data, rowindex, columnindex, moduleindex]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.image_source = "featured_image";
      },
    });
    setGalleryTab(false);
  }, [builderPostData?.value]);

  const imageSizes = builderPostData?.imageArray?.sizes;
  const imageObject = [];
  if (imageSizes) {
    imageSizes.map((item) => imageObject.push({ value: item, label: item }));
  }

  const handleImageSizeChange = (value) => {
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.image_size = value;
      },
    });
  };

  const handleGalleryImageLimitChange = (event) => {
    const value = event.target.value;
    setGalleryImageLimit(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.gallery_image_limit = value;
      },
    });
  };

  const handleAutoScrollChange = (checked) => {
    const value = checked ? "true" : "false";
    setAutoScroll(checked);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.auto_scroll = value;
      },
    });
  };

  const handleAutoScrollDelayChange = (event) => {
    const value = event.target.value;
    setAutoScrollDelay(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.auto_scroll_delay = value;
      },
    });
  };

  useEffect(() => {
    if (modSettings?.icons?.icon === "") {
      commitPostModuleSettingsPatch({
        data: props.data,
        rowindex,
        columnindex,
        moduleindex,
        onSettingChange: props.onSettingChange,
        patch: (s) => {
          s.icons = {};
        },
      });
    }
  }, [iconsArray]);

  const onSettingChange = (data) => {
    props.onSettingChange(data);
  };

  const customMediaLibrary =
    typeof window !== "undefined" &&
    window.wp &&
    typeof window.wp.media === "function"
      ? window.wp.media({
          frame: "select",
          title: "Select Images",
          multiple: false,
          library: {
            order: "DESC",
            orderby: "date",
            type: "image",
            search: null,
            uploadedTo: null,
          },
          button: {
            text: "Done",
          },
        })
      : null;

  const handleWpUploader = () => {
    if (!customMediaLibrary) {
      return;
    }
    customMediaLibrary.open();
  };

  if (customMediaLibrary) {
    customMediaLibrary.on("open", function () {
      const selectionAPI = customMediaLibrary.state().get("selection");
      const attachment = window.wp.media.attachment(selected?.id);
      selectionAPI.add(attachment ? [attachment] : []);
    });
    customMediaLibrary.on("select", function () {
      const selectedImage = customMediaLibrary
        .state()
        .get("selection")
        .first()
        .toJSON();
      setSelected(selectedImage);
      commitPostModuleSettingsPatch({
        data: props.data,
        rowindex,
        columnindex,
        moduleindex,
        onSettingChange: props.onSettingChange,
        patch: (s) => {
          s.placeholder_image = selectedImage?.url;
        },
      });
    });
  }

  const onImageSourceSwitch = (checked) => {
    const value = checked ? "gallery" : "featured_image";
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.image_source = value;
      },
    });
  };

  const removeBgImage = () => {
    const defaultPlaceholder = getBuilderPlaceholderImageUrl();
    setSelected(defaultPlaceholder);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.placeholder_image = defaultPlaceholder;
      },
    });
  };

  const placeholderPreviewSrc = resolvePlaceholderPreviewSrc(selected);

  return (
    <>
      <div className="module-content-tab-row no-pad-0">
        <label className="setting-label-main">Image Source</label>
        <div className="module-content-tab-row">
          <ProductImageSourceSegment
            value={galleryTab}
            onChange={onImageSourceSwitch}
          />
        </div>
        {!galleryTab ? (
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip
              classNames={{ root: "caf-builder-tooltip" }}
              placement="topLeft"
              title="Select image size source."
            >
              <label>Image Size</label>
            </Tooltip>
            <Select
              defaultValue={modSettings?.image_size}
              style={{
                width: "100%",
              }}
              value={modSettings?.image_size}
              onChange={handleImageSizeChange}
              options={imageObject}
              className="image_size_caf"
            />
          </div>
        ) : (
          <>
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip
                classNames={{ root: "caf-builder-tooltip" }}
                placement="topLeft"
                title="Select image size source."
              >
                <label>Image Size</label>
              </Tooltip>
              <Select
                defaultValue={modSettings?.image_size}
                style={{
                  width: "100%",
                }}
                value={modSettings?.image_size}
                onChange={handleImageSizeChange}
                options={imageObject}
                className="image_size_caf"
              />
            </div>
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip
                classNames={{ root: "caf-builder-tooltip" }}
                placement="topLeft"
                title="Maximum number of gallery images to display."
              >
                <label>Gallery Image Limit</label>
              </Tooltip>
              <Input
                type="number"
                min={1}
                placeholder="2"
                value={galleryImageLimit}
                onChange={handleGalleryImageLimitChange}
              />
            </div>
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip
                classNames={{ root: "caf-builder-tooltip" }}
                placement="topLeft"
                title="Automatically advance gallery images while hovering."
              >
                <label>Auto Scroll on Hover</label>
              </Tooltip>
              <div className="module-content-icon-switch">
                <Switch
                  checked={autoScroll}
                  onChange={handleAutoScrollChange}
                />
              </div>
            </div>
            {autoScroll ? (
              <div className="module-content-tab-row caf-design-two-half">
                <Tooltip
                  classNames={{ root: "caf-builder-tooltip" }}
                  placement="topLeft"
                  title="Delay in milliseconds between each auto scroll image change."
                >
                  <label>Auto Scroll Delay (ms)</label>
                </Tooltip>
                <Input
                  type="number"
                  min={100}
                  step={100}
                  placeholder="1000"
                  value={autoScrollDelay}
                  onChange={handleAutoScrollDelayChange}
                />
              </div>
            ) : null}
          </>
        )}
        <hr className="setting-hr-main"></hr>
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
              {placeholderPreviewSrc ? (
                <img
                  src={placeholderPreviewSrc}
                  className="caf-bg-mask"
                  alt=""
                />
              ) : null}
            </div>
          </div>
          <div className="icon-container-header">
            {!isBuilderDefaultPlaceholderImage(placeholderPreviewSrc) ? (
              <Button
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={removeBgImage}
              />
            ) : null}
          </div>
          <div className="icon-container-footer">
            <button className="ic-lib" onClick={handleWpUploader}>
              Upload Image
            </button>
          </div>
        </div>
        <hr className="setting-hr-main"></hr>
      </div>
      <div className="module-content-tab-row">
        <label className="setting-label-main">Link Settings</label>
        <ContentLink
          title="Link"
          data={props.data}
          indexes={props.indexes}
          iconsArray={iconsArray}
          onSettingChange={onSettingChange}
          postPreviewData={props.postPreviewData}
        ></ContentLink>
      </div>
    </>
  );
}

export default ProductImageContent;
