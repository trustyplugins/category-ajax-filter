import React from "react";
import { Skeleton } from "antd";
import ModuleErrorBoundary from "../../components/ModuleErrorBoundary";
import { getModuleErrorBoundaryResetKey } from "../../utils/moduleErrorBoundaryUtils";
import ModuleTitle from "./components/modules-output/ModuleTitle";
import ModuleExcerpt from "./components/modules-output/ModuleExcerpt";
import ModuleImage from "./components/modules-output/ModuleImage";
import ModuleProductImage from "./components/modules-output/WooModules/ModuleProductImage";
import ModuleProductPrice from "./components/modules-output/WooModules/ModuleProductPrice";
import ModuleProductRating from "./components/modules-output/WooModules/ModuleProductRating";
import ModuleAddToCart from "./components/modules-output/WooModules/ModuleAddToCart";
import ModuleAttributeSwatch from "./components/modules-output/WooModules/ModuleAttributeSwatch";
import ModuleCategories from "./components/modules-output/ModuleCategories";
import ModuleAuthor from "./components/modules-output/ModuleAuthor";
import ModuleDate from "./components/modules-output/ModuleDate";
import ModuleCommentCount from "./components/modules-output/ModuleCommentCount";
import ModuleButton from "./components/modules-output/ModuleButton";
import ModuleBadges from "./components/modules-output/ModuleBadges";
import ModuleCustomField from "./components/modules-output/ModuleCustomField";
import ModuleCustomText from "./components/modules-output/ModuleCustomText";
import { generateCSS } from "../utils/functions";
import { isHiddenOnDevice } from "../utils/builderVisibility";
import { resolvePostModuleSettingsForOutput } from "./components/settingTabContent/ModuleContentData/shared/postModuleTier";
import { canUseProductPostType } from "../../tier/capabilities";
import { PostVariationPreviewProvider, useWooProductCardVariation } from "./components/woocommerce/WooProductCardVariationContext";

function PostBuilderPreviewChromeInner({
  fallbackPostData,
  previewWidth,
  suffix,
  initialdata,
  selectedDevice,
  indexes,
  setIndexes,
  customCSS,
  onExtraData,
  mainBuilderData,
  onSettingChange,
}) {
  const variationCtx = useWooProductCardVariation();
  const effectiveSinglePostData = variationCtx?.postData || fallbackPostData || {};

  return (
    <div
      className={`caf-builder-post-preview post-id-${effectiveSinglePostData?.id ?? 0}`}
      data-post-id={effectiveSinglePostData?.id ?? 0}
      style={{ width: `${previewWidth}${suffix}` }}
    >
      {initialdata.length == 0 ? (
        <>
          <Skeleton active />
          <Skeleton active />
        </>
      ) : (
        ""
      )}
      {initialdata.map((row, rowindex) => {
        const rowStyle = row.style;
        const rowSettings = row.settings;
        const row_custom_class = row.settings?.custom_class;
        if (isHiddenOnDevice(rowSettings, selectedDevice)) {
          return null;
        }
        return (
          <div
            className={`caf-builder-row-main caf-row-${rowindex} ${row_custom_class || ""
              } ${indexes?.type === "row" && indexes?.rowindex === rowindex ? "active" : ""
              }`}
            key={rowindex}
          >
            {row.data.map((column, columnindex) => {
              const columnStyle = column.style;
              const ColSettings = column.settings;
              const col_custom_class = column.settings?.custom_class;
              if (isHiddenOnDevice(ColSettings, selectedDevice)) {
                return null;
              }
              return (
                <div
                  className={`caf-builder-column-main caf-column-${columnindex} ${col_custom_class || ""
                    } ${indexes?.type === "column" &&
                      indexes?.rowindex === rowindex &&
                      indexes?.columnindex === columnindex
                      ? "active"
                      : ""
                    }`}
                  key={columnindex}
                >
                  {column.data?.map((module, moduleindex) => {
                    const moduleStyle = module.style;
                    const moduleSettings = resolvePostModuleSettingsForOutput(
                      module.settings
                    );
                    if (isHiddenOnDevice(moduleSettings, selectedDevice)) {
                      return null;
                    }
                    if (
                      (module.key === "woo_product_image" ||
                        module.key === "product_price" ||
                        module.key === "woo_product_rating" ||
                        module.key === "woo_add_to_cart" ||
                        module.key === "woo_attribute_swatch" ||
                        module.key === "badges") &&
                      !canUseProductPostType()
                    ) {
                      return null;
                    }
                    return (
                      <ModuleErrorBoundary
                        key={`${rowindex}-${columnindex}-${moduleindex}`}
                        moduleKey={module.key}
                        moduleLabel={module.title || module.key}
                        resetKey={getModuleErrorBoundaryResetKey(
                          rowindex,
                          columnindex,
                          moduleindex,
                          module.key
                        )}
                      >
                        {module.key === "title" ? (
                          <ModuleTitle
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "excerpt" ? (
                          <ModuleExcerpt
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                            usePlaceholderWhenEmpty
                          />
                        ) : module.key === "image" ? (
                          <ModuleImage
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "woo_product_image" ? (
                          <ModuleProductImage
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "product_price" ? (
                          <ModuleProductPrice
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                            hideDuplicateRegularPrice
                            applyTextVisibilityFilter
                          />
                        ) : module.key === "woo_product_rating" ? (
                          <ModuleProductRating
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                            showDesignStarsWhenEmpty
                          />
                        ) : module.key === "woo_add_to_cart" ? (
                          <ModuleAddToCart
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "woo_attribute_swatch" ? (
                          <ModuleAttributeSwatch
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                            initialdata={initialdata}
                            mainBuilderData={mainBuilderData}
                            onSettingChange={onSettingChange}
                          />
                        ) : module.key === "badges" ? (
                          <ModuleBadges
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                            isBuilderPreview={true}
                          />
                        ) : module.key === "categories" ? (
                          <ModuleCategories
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "author" ? (
                          <ModuleAuthor
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "date" ? (
                          <ModuleDate
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "commentcount" ? (
                          <ModuleCommentCount
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "button" ? (
                          <ModuleButton
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "customfield" ? (
                          <ModuleCustomField
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : module.key === "customtext" ? (
                          <ModuleCustomText
                            postData={effectiveSinglePostData}
                            settings={moduleSettings}
                            styleDefault={moduleStyle}
                            module={module}
                            rowindex={rowindex}
                            columnindex={columnindex}
                            moduleindex={moduleindex}
                            setIndexes={setIndexes}
                            selectedDevice={selectedDevice}
                            indexes={indexes}
                          />
                        ) : (
                          module.title
                        )}
                      </ModuleErrorBoundary>
                    );
                  })}
                  <style>
                    {`
              .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex}{
                ${generateCSS(columnStyle, "default", selectedDevice, ColSettings, effectiveSinglePostData)}
              }
              .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex}:hover{ 
                ${generateCSS(columnStyle, "hover", selectedDevice, ColSettings, effectiveSinglePostData)}
              }
              `}
                  </style>
                </div>
              );
            })}
            <style>
              {`
              .caf-bl-post .caf-row-${rowindex}{
                ${generateCSS(rowStyle, "default", selectedDevice, rowSettings, effectiveSinglePostData)}
              }
              .caf-bl-post .caf-row-${rowindex}:hover{ 
                ${generateCSS(rowStyle, "hover", selectedDevice, rowSettings, effectiveSinglePostData)}
              }
              `}
            </style>
          </div>
        );
      })}
      {(customCSS || onExtraData) && <style id={"custom-css"} />}
    </div>
  );
}

export default function PostBuilderPreviewChrome({
  effectiveSinglePostData,
  previewWidth,
  suffix,
  initialdata,
  selectedDevice,
  indexes,
  setIndexes,
  customCSS,
  onExtraData,
  mainBuilderData,
  onSettingChange,
}) {
  return (
    <PostVariationPreviewProvider
      postData={effectiveSinglePostData}
      layoutInitialData={initialdata}
    >
      <PostBuilderPreviewChromeInner
        fallbackPostData={effectiveSinglePostData}
        previewWidth={previewWidth}
        suffix={suffix}
        initialdata={initialdata}
        selectedDevice={selectedDevice}
        indexes={indexes}
        setIndexes={setIndexes}
        customCSS={customCSS}
        onExtraData={onExtraData}
        mainBuilderData={mainBuilderData}
        onSettingChange={onSettingChange}
      />
    </PostVariationPreviewProvider>
  );
}
