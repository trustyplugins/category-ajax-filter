
import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload, message } from 'antd';
import { CloseCircleFilled } from "@ant-design/icons";
const IconUpload = (props) => {
const {label,property,parentKey,data}= props;
let uploaded = parentKey === '' ? data?.[property] : data?.[parentKey]?.[property] ;
  const [selected, setSelected] = useState(uploaded);
  var customMediaLibrary = window.wp.media({
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
  });
  const handleWpUploader = () => {
    customMediaLibrary.open();
  };
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
    let newData = structuredClone(data || {});
    if(parentKey !== ""){
      if (!newData[parentKey]) {
        newData[parentKey] = {};
      }
      newData[parentKey][property] = selectedImage;
    }else{
    newData[property] = selectedImage;
    }

     if(props.moduleKey && props.moduleKey!==""){
    props.onChangeData(newData,props.moduleKey);
    }else{
    props.onChangeData(newData);
    }
  });
  const removeSelectedIcon = () => {
    setSelected("");
    let newData = structuredClone(data || {});
    if(parentKey !== ""){
      if (!newData[parentKey]) {
        newData[parentKey] = {};
      }
      newData[parentKey][property] = "";
    }else{
    newData[property] = "";
    }
if(props.moduleKey && props.moduleKey!==""){
  props.onChangeData(newData,props.moduleKey);
  }else{
  props.onChangeData(newData);
  }
  };
  return (
    <div className="module-content-image-uploader loader-icon">
    <div
      className="caf-image-container-mask"
      onClick={handleWpUploader}
    >
      {!selected && (
      <div className='caf-loader-icon-upload-label'>{label}</div>
      )}
      {selected?.url && <img src={selected?.url} className="caf-bg-mask"></img>}
    </div>
    {selected?.url && (
      <>
        <div
          className="close-circle-bg"
          title="Remove Image"
          onClick={removeSelectedIcon}
        >
          <CloseCircleFilled></CloseCircleFilled>
        </div>
      </>
    )}
  </div>
  );
};

export default IconUpload;
