import React, { useState, useEffect, useMemo } from "react";
import parse from "html-react-parser";
import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";
import { generateCSS ,generateImageModuleCSS ,generateImageModuleTagCSS } from "../../../utils/functions";
import {
  getBuilderPlaceholderImageUrl,
  resolveFeaturedImagePreviewUrl,
} from "../../../utils/builderPlaceholderImage";
import { resolvePostImageSource } from "../settingTabContent/ModuleContentData/shared/postModuleTier";
import {
  useWooProductCardVariation,
  resolveVariationDisplayImageSrc,
} from "../woocommerce/WooProductCardVariationContext";
function ModuleImage({
  postData,
  settings,
  styleDefault,
  module,
  rowindex,
  columnindex,
  moduleindex,
  selectedDevice,
  indexes,
  setIndexes = () => {},
}) {
  const variationCtx = useWooProductCardVariation();
  let image = getBuilderPlaceholderImageUrl();

  const [cfImageSizes, setCfImageSizes] = useState({});
  const [cfImageValue, setCfImageValue] = useState("");
  const [CfURLValue, setCfURLValue] = useState("#");

  //console.log(settings);

  useEffect(() => {
    if (settings?.custom_field !== "" && settings?.custom_field != "0") {
      fetchCfImageSizes(postData?.value, settings?.custom_field, "1");
    } else {
      setCfImageSizes({});
      if (settings?.placeholder_image) {
        setCfImageValue(settings.placeholder_image);
      } else {
        setCfImageValue(getBuilderPlaceholderImageUrl());
      }
    }
  }, [settings?.custom_field]);

  useEffect(() => {
    if (
      settings?.link?.custom_field !== "" &&
      settings?.link?.custom_field != "0"
    ) {
      fetchCfImageSizes(postData?.value, settings?.link?.custom_field, "2");
    } else {
      setCfURLValue("#");
    }
  }, [settings?.link?.custom_field]);

  const fetchCfImageSizes = async (postId, fieldName, type) => {
    const postedData = {
      post_id: postId,
      field_name: fieldName,
    };

    const res = await apiClient.post(apiEndpoints.getCfFieldValue, postedData);
    //console.log(res?.data?.data)
    if (type == "1") {
      const sizes = res?.data?.data?.sizes;
      setCfImageValue(res?.data?.data?.value);
      if (sizes && Object.keys(sizes).length > 0) {
        setCfImageSizes(sizes);
      } else {
        setCfImageSizes({});
      }
      return sizes;
    } else {
      const url = res?.data?.data?.value ?? "#";
      setCfURLValue(url);
      return url;
    }
  };

  //console.log(postData,settings);
  if (resolvePostImageSource(settings?.image_source) === "featured_image") {
    image = resolveFeaturedImagePreviewUrl(settings, postData);
  }
  if (resolvePostImageSource(settings?.image_source) === "custom_field") {
    if (settings?.custom_field !== "" && settings?.custom_field != "0") {
      if (cfImageSizes && Object.keys(cfImageSizes).length > 0) {
        image = cfImageSizes[settings?.image_size];
      } else {
        if (cfImageValue && cfImageValue != "") {
          image = cfImageValue;
        } else {
          if (settings?.placeholder_image) {
            image = settings.placeholder_image;
          } else {
            image = getBuilderPlaceholderImageUrl();
          }
        }
      }
    } else {
      if (settings?.placeholder_image) {
        image = settings.placeholder_image;
      } else {
        image = getBuilderPlaceholderImageUrl();
      }
    }
  }
  //console.log(image);
  if (!image) {
    image = getBuilderPlaceholderImageUrl();
  }

  const displayImage = useMemo(() => {
    if (resolvePostImageSource(settings?.image_source) !== "featured_image") {
      return image;
    }
    return resolveVariationDisplayImageSrc(variationCtx, image) || image;
  }, [
    image,
    settings?.image_source,
    variationCtx?.isComplete,
    variationCtx?.resolvedVariation?.image?.src,
    variationCtx?.matrix?.parent_image?.src,
  ]);
  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
  let postUrl = "";
  if (postData?.url) {
    postUrl = postData.url;
  }
  const visibility = settings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  // const [imageRes, setImageRes] = useState("");
  // let customfield = "";
  // let customfieldvalue = "#";
  // if (settings?.custom_field) {
  //   customfield = settings.custom_field;
  //   if (postData?.meta_fields?.[customfield]) {
  //     customfieldvalue = postData?.meta_fields[customfield];
  //   }
  // }
  // useEffect(()=>{
  //   //console.log(image,settings?.image_size,postData?.id);
  //   let image_data={
  //     post_id:postData?.id,
  //     url:image,
  //     size:settings?.image_size
  //   }
  //   const getImage = () => {
  //     axios
  //       .get(baseURL + "get-image-size/?image-data=" + JSON.stringify(image_data))
  //       .then((response) => {
  //         if (response.data) {
  //           if (response.data.status == "success") {
  //             setImageRes(response.data.result);
  //           }
  //         }
  //       })
  //       .catch((error)=>{
  //         console.log(error);
  //       })

  //   };
  //   getImage();
  // },[image,settings?.image_size])

  return (
    <>
      {settings?.link?.visibility ? (
        settings?.link?.type === "post-url" ? (
          <a
            href={postUrl}
            target={settings?.link?.target === "new-tab" ? "_blank" : "_self"}
            className={`caf-builder-module-main caf-module-${
              module.key
            } caf-module-${moduleindex} ${custom_class} ${
              indexes?.type === "module" &&
              indexes?.rowindex === rowindex &&
              indexes?.columnindex === columnindex &&
              indexes?.moduleindex === moduleindex
                ? "active"
                : ""
            } ${hideClass}`}
            onClick={(e) => {
              e.preventDefault();
              setIndexes({
                type: "module",
                rowindex: rowindex,
                columnindex: columnindex,
                moduleindex: moduleindex,
                module: module,
              });
            }}
          >
            <img src={displayImage} width="100%" />
            <style>
              {`
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
              ${generateImageModuleCSS(
                styleDefault,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
          }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
            ${generateImageModuleCSS(
              styleDefault,
              "hover",
              selectedDevice,
              settings,
              postData,
            )}
          }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img{
              ${generateImageModuleTagCSS(
                styleDefault,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
          }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img:hover{
            ${generateImageModuleTagCSS(
              styleDefault,
              "hover",
              selectedDevice,
              settings,
              postData,
            )}
          }
          `}
            </style>
          </a>
        ) : settings?.link?.type === "custom-url" ? (
          <a
            href={CfURLValue}
            target={settings?.link?.target === "new-tab" ? "_blank" : "_self"}
            className={`caf-builder-module-main caf-module-${
              module.key
            } caf-module-${moduleindex} ${custom_class} ${
              indexes?.type === "module" &&
              indexes?.rowindex === rowindex &&
              indexes?.columnindex === columnindex &&
              indexes?.moduleindex === moduleindex
                ? "active"
                : ""
            } ${hideClass}`}
            onClick={(e) => {
              e.preventDefault();
              setIndexes({
                type: "module",
                rowindex: rowindex,
                columnindex: columnindex,
                moduleindex: moduleindex,
                module: module,
              });
            }}
          >
            <img src={displayImage} width="100%" />
            <style>
              {`
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
              ${generateImageModuleCSS(
                styleDefault,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
          }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
            ${generateImageModuleCSS(
              styleDefault,
              "hover",
              selectedDevice,
              settings,
              postData,
            )}
          }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img{
              ${generateImageModuleTagCSS(
                styleDefault,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
          }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img:hover{
            ${generateImageModuleTagCSS(
              styleDefault,
              "hover",
              selectedDevice,
              settings,
              postData,
            )}
          }
          `}
            </style>
          </a>
        ) : null
      ) : (
        <div
          onClick={() =>
            setIndexes({
              type: "module",
              rowindex: rowindex,
              columnindex: columnindex,
              moduleindex: moduleindex,
              module: module,
            })
          }
          className={`caf-builder-module-main caf-module-${
            module.key
          } caf-module-${moduleindex} ${custom_class} ${
            indexes?.type === "module" &&
            indexes?.rowindex === rowindex &&
            indexes?.columnindex === columnindex &&
            indexes?.moduleindex === moduleindex
              ? "active"
              : ""
          } ${hideClass}`}
        >
          <img src={displayImage} width="100%" />
          <style>
            {`
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
              ${generateImageModuleCSS(
                styleDefault,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
          }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
            ${generateImageModuleCSS(
              styleDefault,
              "hover",
              selectedDevice,
              settings,
              postData,
            )}
          }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img{
              ${generateImageModuleTagCSS(
                styleDefault,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
          }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img:hover{
            ${generateImageModuleTagCSS(
              styleDefault,
              "hover",
              selectedDevice,
              settings,
              postData,
            )}
          }
          `}
          </style>
        </div>
      )}
      {/* <img src={displayImage} width="100%" /> */}

      {/* <style>
        {`
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
              ${generateCSS(
                styleDefault,
                "default",
                selectedDevice,
                settings,
                postData,
              )}
          }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
            ${generateCSS(
              styleDefault,
              "hover",
              selectedDevice,
              settings,
              postData,
            )}
          }
          `}
      </style> */}

      {/* // </div> */}
    </>
  );
}

export default ModuleImage;
