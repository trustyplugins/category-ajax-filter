import { CloseCircleFilled } from "@ant-design/icons";
import { Select, Segmented, Button, Tooltip } from "antd";
import React, { useEffect, useState, useRef } from "react";
import apiClient from "../../../../../api/client";
import { apiEndpoints } from "../../../../../api/endpoints";
import ContentLink from "./ContentComponents/ContentLink";
import { DeleteOutlined } from '@ant-design/icons';
import {
  commitPostModuleSettingsPatch,
} from "./postLayoutSnapshot";
import { usePostTypeCustomFieldOptions } from "../../../../utils/usePostTypeCustomFieldOptions";
import {
  getBuilderPlaceholderImageUrl,
  isBuilderDefaultPlaceholderImage,
} from "../../../../utils/builderPlaceholderImage";
import {
  canUsePostImageCustomField,
  PostImageSourceSegment,
  resolvePostImageSource,
} from "./shared/postModuleTier";
import PostImageCustomFieldProPanel from "./PostImageCustomFieldProPanel";

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

function ModuleImageContent(props) {
  const builderPostData = props.postPreviewData || {};
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const { options: meta_object, loading: cfFieldListLoading } =
    usePostTypeCustomFieldOptions({
      includeValue: modSettings?.custom_field,
    });

  let img = getBuilderPlaceholderImageUrl();

  if (modSettings?.placeholder_image) {
    img = modSettings.placeholder_image;
  }
  const [selected, setSelected] = useState(img);
  const [iconsArray, setIconsArray] = useState("");
  const [featImageTab, setFeatImageTab] = useState(
    resolvePostImageSource(modSettings?.image_source) === "custom_field"
  );
  const [cfImageSizes, setCfImageSizes] = useState({});
  const [cfLoading, setCfLoading] = useState(false)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (modSettings?.custom_field !== "0") {
      fetchCfImageSizes(builderPostData?.value, modSettings?.custom_field);
    }
  }, []);

  useEffect(() => {
    setFeatImageTab(resolvePostImageSource(modSettings?.image_source) === "custom_field");
  }, [modSettings?.image_source]);

  useEffect(() => {
    setSelected(
      modSettings?.placeholder_image || getBuilderPlaceholderImageUrl()
    );
    setFeatImageTab(
      resolvePostImageSource(modSettings?.image_source) === "custom_field"
    );
  }, [props.data, rowindex, columnindex, moduleindex]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // next time effect will run
      return; // skip first run
    }
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field = "0";
      },
    });
    setCfImageSizes({})
  }, [builderPostData?.value]); // reset on post /post type change 


  const fetchCfImageSizes = async (postId, fieldName) => {
    setCfLoading(true)
    const postedData = {
      post_id: postId,
      field_name: fieldName,
    };

    const res = await apiClient.post(
      apiEndpoints.getCfFieldValue,
      postedData
    );

    const sizes = res?.data?.data?.sizes;

    if (sizes && Object.keys(sizes).length > 0) {
      setCfImageSizes(sizes);
      setCfLoading(false)
    } else {
      setCfImageSizes({});
      setCfLoading(false)
    }

    return sizes;
  };

  let image_sizes = builderPostData?.imageArray?.sizes;
  let image_object = [];
  //console.log(meta_fields);
  if (image_sizes) {
    image_sizes?.map((item, i) => (
      <>{image_object.push({ value: item, label: item })}</>
    ));
  }
  //console.log(image_sizes,image_object);
  const handleChange = (value) => {
    //console.log(`selected ${value}`);
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

  // console.log(builderPostData?.imageArray);

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
  }, [iconsArray])
  const onSettingChange = (data) => {
    props.onSettingChange(data);
  };
  var customMediaLibrary =
    typeof window !== "undefined" &&
    window.wp &&
    typeof window.wp.media === "function"
      ? window.wp.media({
    // Accepts [ 'select', 'post', 'image', 'audio', 'video' ]
    // Determines what kind of library should be rendered.
    frame: "select",
    // Modal title.
    title: "Select Images",
    // Enable/disable multiple select
    multiple: false,
    // Library wordpress query arguments.
    library: {
      order: "DESC",
      // [ 'name', 'author', 'date', 'title', 'modified', 'uploadedTo', 'id', 'post__in', 'menuOrder' ]
      orderby: "date",
      // mime type. e.g. 'image', 'image/jpeg'
      type: "image",
      // Searches the attachment title.
      search: null,
      // Includes media only uploaded to the specified post (ID)
      uploadedTo: null, // wp.media.view.settings.post.id (for current post ID)
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
    var selectedImageIDs = selected;
    var selectionAPI = customMediaLibrary.state().get("selection");
    var attachment = wp.media.attachment(selected?.id);
    selectionAPI.add(attachment ? [attachment] : []);
  });
  customMediaLibrary.on("select", function () {
    var selectedImage = customMediaLibrary
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

  const onFeatSwitch = (checked) => {
    if (checked === true && !canUsePostImageCustomField()) {
      return;
    }
    let value = "featured_image";
    if (checked === true) {
      value = "custom_field";
    } else {
      value = "featured_image";
    }
    //setFeatImageTab((checked) => !checked);
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

  const handleChangeCF = async (value) => {
    //console.log(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.custom_field = value;
      },
    });
    setCfImageSizes({});
    if (value !== "0") {
      await fetchCfImageSizes(builderPostData?.value, value);
    }
  };
  //console.log(cfImageSizes)
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
          <PostImageSourceSegment value={featImageTab} onChange={onFeatSwitch} />
        </div>
        {!featImageTab || !canUsePostImageCustomField() ? (
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Select image size source.">
              <label>Image Size</label>
            </Tooltip>
            <Select
              defaultValue={modSettings?.image_size}
              style={{
                width: "100%",
              }}
              value={modSettings?.image_size}
              onChange={handleChange}
              options={image_object}
              className="image_size_caf"
            />
          </div>
        ) : (
          <PostImageCustomFieldProPanel
            modSettings={modSettings}
            metaObject={meta_object}
            cfImageSizes={cfImageSizes}
            cfLoading={cfLoading}
            cfFieldListLoading={cfFieldListLoading}
            imageOptions={image_object}
            onCustomFieldChange={handleChangeCF}
            onImageSizeChange={handleChange}
          />
        )}
        <hr className="setting-hr-main"></hr>
      </div>
      <div className="module-content-tab-row">
      <label className="setting-label-main">Fallback image</label>
      <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Upload placeholder image used when no image is found.">
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
          <button className="ic-lib" onClick={handleWpUploader}>Upload Image</button>
        </div>
      </div>
      <hr className="setting-hr-main"></hr>
      </div>
      <div className='module-content-tab-row'>
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
  )
}

export default ModuleImageContent