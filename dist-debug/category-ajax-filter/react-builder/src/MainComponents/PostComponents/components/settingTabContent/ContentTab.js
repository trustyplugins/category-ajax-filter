import React from "react";
import ModuleTitleContent from "./ModuleContentData/ModuleTitleContent";
import ModuleExcerptContent from "./ModuleContentData/ModuleExcerptContent";
import ModuleCategoriesContent from "./ModuleContentData/ModuleCategoriesContent";
import ModuleAuthorContent from "./ModuleContentData/ModuleAuthorContent";
import ModuleDateContent from "./ModuleContentData/ModuleDateContent";
import ModuleCommentContent from "./ModuleContentData/ModuleCommentContent";
import ModuleButtonContent from "./ModuleContentData/ModuleButtonContent";
import ModuleBadgesContent from "./ModuleContentData/ModuleBadgesContent";
import ModuleCustomTextContent from "./ModuleContentData/ModuleCustomTextContent";
import ModuleCustomFieldContent from "./ModuleContentData/ModuleCustomFieldContent";
import ModuleImageContent from "./ModuleContentData/ModuleImageContent";
import ProductImageContent from "./ModuleContentData/WooModules/ProductImageContent";
import ProductPriceContent from "./ModuleContentData/WooModules/ProductPriceContent";
import ProductRatingContent from "./ModuleContentData/WooModules/ProductRatingContent";
import AddToCartContent from "./ModuleContentData/WooModules/AddToCartContent";
import AttributeSwatchContent from "./ModuleContentData/WooModules/AttributeSwatchContent";
const ContentTab = (props) => {
  const { type, rowindex, columnindex, moduleindex ,module } = props.indexes;

  const onSettingChange=(data)=> {
    props.onChangeStyle(data);
 }
  return (
    <div className="setting-pop-content">
      {type == "row" ? (
        <div className="rowdata">
          <div className="caf-builder-setting-row-label">
            {/* <label>Column Structure</label>
    <Select
      defaultValue="lucy"
      style={{
        width: '100%',
      }}
      onChange={handleChange}
      options={[
        {
          value: 'jack',
          label: 'Jack',
        },
        {
          value: 'lucy',
          label: 'Lucy',
        },
        {
          value: 'Yiminghe',
          label: 'yiminghe',
        },
       
      ]}
    />
          */}
          </div>
        </div>
      ) : (
        ""
      )}

      {type == "column" ? <div className="columndata">Column Data</div> : ""}

      {type == "module" ? 

      <div className={`moduledata ${module.key === "woo_attribute_swatch" ? "caf-filter" : "caf-design-half-row"}`}>
        {module.key==='title' ? 
        <ModuleTitleContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData}></ModuleTitleContent> :
        module.key==='excerpt' ? 
        <ModuleExcerptContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange}></ModuleExcerptContent> :
        module.key==='image' ? 
        <ModuleImageContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData}></ModuleImageContent> :
        module.key==='woo_product_image' ?
        <ProductImageContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData}></ProductImageContent> :
        module.key==='product_price' ?
        <ProductPriceContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData}></ProductPriceContent> :
        module.key==='woo_product_rating' ?
        <ProductRatingContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange}></ProductRatingContent> :
        module.key==='woo_add_to_cart' ?
        <AddToCartContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData}></AddToCartContent> :
        module.key==='woo_attribute_swatch' ?
        <AttributeSwatchContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData} selectedDevice={props.selectedDevice} mainBuilderData={props.mainBuilderData}></AttributeSwatchContent> :
        module.key==='categories' ? 
        <ModuleCategoriesContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData}></ModuleCategoriesContent> :
        module.key==='author' ? 
        <ModuleAuthorContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange}></ModuleAuthorContent> :
        module.key==='date' ? 
        <ModuleDateContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange}></ModuleDateContent> :
        module.key==='commentcount' ? 
        <ModuleCommentContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange}></ModuleCommentContent> :
        module.key==='button' ? 
        <ModuleButtonContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData}></ModuleButtonContent> :
        module.key==='badges' ?
        <ModuleBadgesContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData}></ModuleBadgesContent> :
        module.key==='customtext' ? 
        <ModuleCustomTextContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange}></ModuleCustomTextContent> :
        module.key==='customfield' ? 
        <ModuleCustomFieldContent data={props.data} indexes={props.indexes} onSettingChange={onSettingChange} postPreviewData={props.postPreviewData}></ModuleCustomFieldContent> :
        ''}</div> 
      
      : ""}
    </div>
  );
};

export default ContentTab;
