import React, { useEffect, useState } from "react";
import { Skeleton } from "antd";
import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import parse from 'html-react-parser';
import CustomFieldData from "./CustomFieldData";
import {generateContainerCSS,generateHeaderCSS,generateMetaCSS,getFilterMetaStyle,generateSkinWrapperCSS} from '../../../utils/functions';
import {
  commitFilterModuleSettingsPatch,
  dispatchFilterLayoutChange,
} from "../settingTabContent/ModuleContentData/filterSettingsSnapshot";
function ModuleFilter({
  settings,
  styleDefault,
  module,
  rowindex,
  columnindex,
  moduleindex,
  selectedDevice,
  initialdata,
  onSettingChange,
  mainBuilderData,
}) {
  const [active, setActive] = useState(false);
  const [dropdown, setDropdown] = useState('All')
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectDevice, setselectDevice] = useState(selectedDevice)
  const [enableToggle, setEnableToggle] = useState(settings?.enable_toggle);
  const [closeToggle, setCloseToggle] = useState(settings?.close_toggle);
  const [loading, setLoading] = useState(true)
  const [updatedTaxonomy, setUpdatedTaxonomy] = useState([])
  const [seletedTermHtml,setSeletedTermHtml]=useState(settings.dropdown_data?.all_option?.value!='' ? settings.dropdown_data?.all_option.value : 'All');
  const applyFilterLayoutChange = (freshItems) =>
    dispatchFilterLayoutChange({
      freshItems,
      mainBuilderData,
      onSettingChange,
    });

  let custom_class = ""
  if (settings?.custom_class) {
    custom_class = settings.custom_class
  }
  useEffect(() => {
    let arr = [];
    if (settings.taxonomy_data.length !== 0) {
      settings.taxonomy_data.forEach((ele) => {
        arr.push(ele.key)
      })
    }

    try {
      (async () => {
        const res = await apiClient.get(apiEndpoints.verifyTaxonomyTerms(arr));
        if (res.data.status === 'success') {
          setUpdatedTaxonomy(res.data.taxonomy_data);
        }
      })()
    } catch (error) {
      console.warn(error)
    }
  }, [settings])
  useEffect(() => {
    if (settings?.enable_toggle) {
      setEnableToggle(settings.enable_toggle);
    }
    if (settings?.close_toggle) {
      setCloseToggle(settings.close_toggle);
    }
  }, [settings?.close_toggle, settings?.enable_toggle]);

  useEffect(() => {
    setselectDevice(selectedDevice)
  }, [selectedDevice])
  const validateTerm = (taxonomy, id) => {
    let taxo = updatedTaxonomy?.[taxonomy]
    if (Object.keys(updatedTaxonomy).length !== 0) {
      if (taxo.length !== 0) {
        return taxo?.includes(id);
      }
    } else {
      return false
    }

  }
//   function CamelToSnake(string) {
//     return string.replace(/([a-z]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
//   }
// const removeDuplicateProperty = (arr, item) => {
//     if (arr.length === 0) {
//       return arr;
//     }
//     let deletedval = "";
//     arr.map((property, index) => {
//       let propVal = property.split(":");
//       if (item == propVal[0]) {
//         deletedval = property;
//       }
//     });
//     if (deletedval != "") {
//       return arr.filter((e) => e !== deletedval);
//     }
//     return arr;
//   };

  // function getDropDownMetaStyle(state, device) {
  //  let  ar = [];
  //   if (device == 'mobile') {
  //     Object.keys(styleDefault[state].desktop.meta).map((item, i) => {
  //       let filter_item = CamelToSnake(item);
  //       ar = removeDuplicateProperty(ar, filter_item);
  //       if (item == "width") {
  //         if(styleDefault[state].desktop.meta[item] != 'auto'){
  //         ar.push("padding-right: 20px;");
  //         }
  //       }
  //     });

  //     Object.keys(styleDefault[state][device].meta).map((item, i) => {
  //       let filter_item = CamelToSnake(item);
  //       ar = removeDuplicateProperty(ar, filter_item);
  //       if (item == "width") {
  //         if(styleDefault[state].desktop.meta[item] != 'auto'){
  //         ar.push("padding-right: 20px;");
  //         }
  //       }

  //     });
  //   } else {
  //     Object.keys(styleDefault[state][device].meta).map((item, i) => {
  //       let filter_item = CamelToSnake(item);
  //       ar = removeDuplicateProperty(ar, filter_item);
  //       if (item == "width") {
  //         if(styleDefault[state].desktop.meta[item].includes('%')){
  //         ar.push("padding-right: 20px;");
  //         }
  //       }

  //     });
  //   }

  //   return ar.join(" ");
  // }

  // console.log(settings)
  const onChange = (e) => {
    // setRadioValue(e.target.value);
    setSelectedValue(e.target.value);
  };
  const handleItemClick = (e, val) => {
    e.preventDefault();
    // Ensure the target is always the <a> tag
    let aTag = e.target;
    if (aTag.tagName.toLowerCase() !== 'a') {
      aTag = aTag.closest('a');
    }
  let innerData = aTag.innerHTML;
    setSeletedTermHtml(innerData);
    setActive(false);
  
    const atags = document.querySelectorAll('.caf-row-'+rowindex +' .caf-column-'+columnindex+ ' .caf-module-'+moduleindex+' .caf-terms-list.dropdown .caf-terms-list-item a');
    atags.forEach(function (at) {
      if (at.classList.contains("active")) {
        at.classList.remove("active");
        at.style = '';
      }
    });
  
    aTag.classList.add("active");
    const li = aTag.closest('li');
    const defaultColor = styleDefault['default'][selectDevice].meta?.color;
    const hoverColor = styleDefault['hover'][selectDevice].meta?.color;
    const selected = document.querySelector('.caf-row-'+rowindex +' .caf-column-'+columnindex+ ' .caf-module-'+moduleindex+' .caf-selected-term-main');
  
    if (hoverColor) {
      let cssProps = generateSkinCSS('hover', selectDevice,styleDefault);
      Object.assign(aTag.style, cssProps);
      Object.assign(selected.style, cssProps);
    } else if (!hoverColor && defaultColor) {
      let cssProps = generateSkinCSS('default', selectDevice,styleDefault);
      Object.assign(selected.style, cssProps);
      Object.assign(aTag.style, cssProps);
    } else {
      aTag.style = '';
    }
  };

  useEffect(()=>{
    if(settings.dropdown_data?.all_option?.icons?.visibility === true){
      if(settings.dropdown_data?.all_option?.icons.icon !== '' && settings.dropdown_data?.all_option?.icons.position === 'before-option'){
        setSeletedTermHtml(
          settings.dropdown_data?.all_option?.value !== '' 
            ? (
                <>
                <i className={`fa-solid ${settings.dropdown_data?.all_option?.icons?.icon} filter-before-icon`}></i>
                  {settings.dropdown_data?.all_option.value} 
                </>
              )
            : (
                <>
                  <i className={`fa-solid ${settings.dropdown_data?.all_option?.icons?.icon} filter-before-icon`}></i>
                  All
                </>
              )
        );        
      }
      else if(settings.dropdown_data?.all_option?.icons.icon !== '' && settings.dropdown_data?.all_option?.icons.position === 'after-option'){
        setSeletedTermHtml(  settings.dropdown_data?.all_option?.value !== '' 
        ? (
            <>
              {settings.dropdown_data?.all_option.value} 
              <i className={`fa-solid ${settings.dropdown_data?.all_option?.icons?.icon} filter-after-icon`}></i>
            </>
          )
        : (
            <>
              All 
              <i className={`fa-solid ${settings.dropdown_data?.all_option?.icons?.icon} filter-after-icon`}></i>
            </>
          )
    )
      }else{
        setSeletedTermHtml(settings.dropdown_data?.all_option?.value!='' ? settings.dropdown_data?.all_option.value : 'All')
      }
  }else{
      setSeletedTermHtml(settings.dropdown_data?.all_option?.value!='' ? settings.dropdown_data?.all_option.value : 'All')
  }
  },[settings.dropdown_data?.all_option?.icons?.visibility,
    settings.dropdown_data?.all_option?.value,
    settings.dropdown_data?.all_option?.icons.icon,
    settings.dropdown_data?.all_option?.icons?.position])
  
  const handleArrow = (arrow) => {
    if (arrow == 'up') {
      setActive(false)
    } else {
      setActive(true)
    }
  }
  const handleToggle = (value) => {
    setCloseToggle(value)
  }
  useEffect(() => {
    setLoading(false);
  }, [settings.taxonomy_data, settings.custom_field_data, settings.data_source]);

  const isTaxonomyEmpty = () => {
    if (settings.data_source == 'taxonomy' && settings.taxonomy_data?.length > 0) {
      for (let i = 0; i < settings.taxonomy_data.length; i++) {
        if (settings.taxonomy_data[i].term_data.length != 0) {
          return true
        }
      }
    } else {
      if (settings.data_source == 'custom_field') return true;
    }
    return false;
  }
  const checkboxSkinsStyling = (e, skin, filterType) => {
    if (settings.multiple_term == 'false') {
      const checkboxes = document.querySelectorAll('.caf-row-'+rowindex +' .caf-column-'+columnindex+ ' .caf-module-'+moduleindex+' .caf-terms-list.' + filterType + ' .caf-taxo-input');
      checkboxes.forEach(function (cb) {
        if (cb.value != e.target.value) {
          cb.checked = false;
          let li = cb.closest('li');
          li.style = ''
        }
      });
    }
    //if(skin=='checkbox_skin1') return;
    const checkbox = e.target;
    const label = checkbox.parentNode;
    const li = checkbox.closest('li');
    const isChecked = checkbox.checked;
    let defaultColor = "";
    let hoverColor = "";
    if (selectDevice == 'mobile') {
      if (styleDefault['default'][selectDevice].meta?.color) {
        defaultColor = styleDefault['default'][selectDevice].meta?.color;
      } else {
        defaultColor = styleDefault['default']['desktop'].meta?.color;
      }
      if (styleDefault['hover'][selectDevice].meta?.color) {
        hoverColor = styleDefault['hover'][selectDevice].meta?.color;
      } else {
        if (styleDefault['default'][selectDevice].meta?.color) {
          hoverColor = styleDefault['default'][selectDevice].meta?.color;
        } else {
          hoverColor = styleDefault['hover']['desktop'].meta?.color;
        }
      }
    } else {
      defaultColor = styleDefault['default'][selectDevice].meta?.color;
      if (styleDefault['hover'][selectDevice].meta?.color) {
        hoverColor = styleDefault['hover'][selectDevice].meta?.color;
      }
    }
    if (isChecked && hoverColor != "") {
      checkbox.style.color = hoverColor;
      let cssProps = generateSkinCSS('hover', selectDevice,styleDefault);
      Object.assign(li.style, cssProps);
    } else if (isChecked && hoverColor == "" && defaultColor != "") {
      checkbox.style.color = defaultColor;
      let cssProps = generateSkinCSS('default', selectDevice,styleDefault);
      Object.assign(li.style, cssProps);
    } else {
      checkbox.style.color = '';
      li.style = ''
    }
  }
  const commitTaxonomyPreview = (mdata) => {
    commitFilterModuleSettingsPatch({
      data: initialdata,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: applyFilterLayoutChange,
      patch: (s) => {
        s.taxonomy_data = JSON.parse(JSON.stringify(mdata));
      },
    });
  };

  const onDragEnd = (result) => {
    // Handle drag end logic here
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const [destinationType, destinationId] = destination.droppableId.split('-');
    const [soureType, sourceId] = source.droppableId.split('-');
    const [type, Id, parentId] = draggableId.split('-');

    if (destinationType !== soureType && destination.index === source.index) {
      return;
    }
    if (type == 'child' && parentId != destinationId) return;
    let mdata = JSON.parse(JSON.stringify(settings.taxonomy_data || []));
    let sourceIndex = source.index;
    let destinationIndex = destination.index;
    let removedData = ''
    if (mdata) {
      for (let i = 0; i < mdata.length; i++) {
        if (destinationType === mdata[i].key) {
          if (type == 'parent') {
            removedData = mdata[i].term_data.splice(sourceIndex, 1)[0];
            mdata[i].term_data.splice(destinationIndex, 0, removedData);
            break;
          } else {
            let term = mdata[i].term_data;
            let flag = false;
            for (let j = 0; j < term.length; j++) {
              if (term[j].key == parentId) {
                removedData = term[j].children_data.splice(sourceIndex, 1)[0];
                term[j].children_data.splice(destinationIndex, 0, removedData);
                flag = true;
                break;
              }
            }
            if (flag) break;
          }
        }
      }
    }
    commitTaxonomyPreview(mdata);

  };
  const onDragEndButton = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId && destination.index === source.index) {
      return;
    }
    let mdata = JSON.parse(JSON.stringify(settings.taxonomy_data || []));
    let sourceIndex = source.index;
    let destinationIndex = destination.index;
    let removedData = ''
    if (mdata) {
      for (let i = 0; i < mdata.length; i++) {
        if (destination.droppableId === mdata[i].key) {
          removedData = mdata[i].term_data.splice(sourceIndex, 1)[0];
          mdata[i].term_data.splice(destinationIndex, 0, removedData);
          break;
        }
      }
    }
    commitTaxonomyPreview(mdata);
  }
  const onDragEndDropdown = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId && destination.index === source.index) {
      return;
    }
    let mdata = JSON.parse(JSON.stringify(settings.taxonomy_data || []));
    let sourceIndex = source.index;
    let destinationIndex = destination.index;
    let removedData = ''
    if (mdata) {
      for (let i = 0; i < mdata.length; i++) {
        if (destination.droppableId === mdata[i].key) {
          removedData = mdata[i].term_data.splice(sourceIndex, 1)[0];
          mdata[i].term_data.splice(destinationIndex, 0, removedData);
          break;
        }
      }
    }
    commitTaxonomyPreview(mdata);
  }
  const containsHTML = (str) => {
    // Check if the string contains HTML tags
    const div = document.createElement('div');
    div.innerHTML = str;
    return Array.from(div.childNodes).some(node => node.nodeType === 1); // Node.ELEMENT_NODE === 1
  };
  return (
    <div className={`caf-builder-module-main caf-module-${module.key} caf-module-${moduleindex} ${custom_class}`}>
      {settings.label.is_label == 'true' && (
        <div className="caf-filter-label-common label-header">
          <div className="caf-builder-custom-filed-label">
            {settings.label?.icons && settings.label?.icons?.icon != "" ? (
              <>
                <div className="caf-builder-custom-filed-label-inner">
                  {settings.label?.icons.position == 'before-label' && (
                    <span className={`caf-builder-before-label before-common ${settings.label?.icons.icon}`}></span>
                  )}
                  {settings.label?.value ? settings.label?.value : "Label"}
                  {settings.label?.icons.position == 'after-label' && (
                    <span className={`caf-builder-after-label after-common ${settings.label?.icons.icon}`}></span>
                  )}
                </div>
              </>
            ) : (
              <div className="caf-builder-custom-filed-label-inner">{settings.label?.value ? settings.label?.value : "Label"}</div>
            )}
          </div>
          {enableToggle === 'true' &&
            <div className="caf-builder-filter-toggle-icon">
              {closeToggle === 'false' ?
                <span className="label-icon-common" onClick={() => handleToggle('true')}><i className="fas fa-chevron-up"></i></span> :
                <span className="label-icon-common" onClick={() => handleToggle('false')}><i className="fas fa-chevron-down"></i></span>}
            </div>
          }
        </div>
      )}
      {closeToggle === 'false' && (
        <>{isTaxonomyEmpty() === true ?
          <>
            {
              settings.data_source == 'taxonomy' ?
                <>
                  <DragDropContext onDragEnd={onDragEnd}>
                    {settings.filter_type === 'checkbox' && settings.taxonomy_data && (
                      <ul className="caf-terms-list checkbox">
                        {settings.taxonomy_data.map((items, id) => (
                          <>
                            {items?.term_data.length > 0 && (
                              <>
                                {items.term_data.map((item, ind) => {
                                  let valid = validateTerm(items.key, item.key);
                                  if (valid === true) {
                                    return (
                                      <Droppable droppableId={String(`${items.key}-${item.key}`)} key={String(item.key)}>
                                        {(provided, snapshot) => (
                                          <div className="droppable-div" {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            <Draggable key={String(item.key)} draggableId={String(`parent-${item.key}`)} index={ind}>
                                              {(providedDraggable, snapshotDraggable) => (
                                                <>
                                                  <li
                                                    className="caf-terms-list-item"
                                                    ref={providedDraggable.innerRef}
                                                    {...providedDraggable.draggableProps}
                                                    {...providedDraggable.dragHandleProps}
                                                  >
                                                    {settings.skins.checkbox === 'checkbox_skin1' ? (
                                                      <label className='caf-taxo-checkbox-main' predefine={item.predefine}>
                                                        <input type="checkbox" className={`caf-taxo-input ${settings.skins.checkbox}`} value={item.key} onChange={(e) => {
                                                          checkboxSkinsStyling(e, settings.skins.checkbox, 'checkbox')
                                                        }} />
                                                        {(item.icons && item.icons.icon !== '' && item.icons.position === 'before') && <i className={`fa-solid ${item.icons?.icon} filter-before-icon`}></i>}
                                                        {item.value}
                                                        {(item.icons && item.icons.icon !== '' && item.icons.position === 'after') && <i className={`fa-solid ${item.icons?.icon} filter-after-icon`}></i>}
                                                      </label>
                                                    ) : (
                                                      <label className='caf-taxo-checkbox-main' predefine={item.predefine}>
                                                        <input type="checkbox" className={`caf-taxo-input ${settings.skins.checkbox}`} value={item.key} onChange={(e) => {
                                                          checkboxSkinsStyling(e, settings.skins.checkbox, 'checkbox')
                                                        }} />
                                                        {(item.icons && item.icons.icon !== '' && item.icons.position === 'before') && <i className={`fa-solid ${item.icons?.icon} filter-before-icon`}></i>}
                                                        {item.value}
                                                        {(item.icons && item.icons.icon !== '' && item.icons.position === 'after') && <i className={`fa-solid ${item.icons?.icon} filter-after-icon`}></i>}
                                                      </label>
                                                    )}
                                                  </li>
                                                  {item.children_data.length > 0 && (
                                                    <ul className="children">
                                                      {item.children_data.map((child, index) => {
                                                        valid = validateTerm(items.key, child.key);
                                                        if (valid === true) {
                                                          return (
                                                            <Draggable key={String(child.key)} draggableId={String(`child-${child.key}-${child.parent_id}`)} index={index}>
                                                              {(providedDraggableChild, snapshotDraggableChild) => (
                                                                <li
                                                                  className="caf-terms-list-item child"
                                                                  ref={providedDraggableChild.innerRef}
                                                                  {...providedDraggableChild.draggableProps}
                                                                  {...providedDraggableChild.dragHandleProps}
                                                                >
                                                                  <label className='caf-taxo-checkbox-main' predefine={child.predefine}>
                                                                    <input type="checkbox" className={`caf-taxo-input ${settings.skins.checkbox}`} value={child.key} onChange={(e) => {
                                                                      checkboxSkinsStyling(e, settings.skins.checkbox, 'checkbox')
                                                                    }} />
                                                                    {(child.icons && child.icons.icon !== '' && child.icons.position === 'before') && <i className={`fa-solid ${child.icons?.icon} filter-before-icon`}></i>}
                                                                    {child.value}
                                                                    {(child.icons && child.icons.icon !== '' && child.icons.position === 'after') && <i className={`fa-solid ${child.icons?.icon} filter-after-icon`}></i>}
                                                                  </label>
                                                                </li>
                                                              )}
                                                            </Draggable>
                                                          );
                                                        }
                                                      })}
                                                    </ul>
                                                  )}
                                                </>
                                              )}
                                            </Draggable>
                                            {provided.placeholder}
                                          </div>
                                        )}
                                      </Droppable>
                                    );
                                  }
                                })}
                              </>
                            )}
                          </>
                        ))}
                      </ul>
                    )}
                  </DragDropContext>

                  {settings.filter_type == 'dropdown' && settings.taxonomy_data && (
                    <div className="caf-manage-dropdown-labels-filter-dropdown">
                      <ul className="caf-terms-list dropdown">
                        <li className="caf-terms-list-item wrraper" term-value="all">
                          <div className="caf-selected-term-main" onClick={() => handleArrow(active ? 'up' : 'down')}>
                                <span key="all" className="result">
                                {containsHTML(seletedTermHtml)? parse(seletedTermHtml): seletedTermHtml}
                              </span>
                            <span className="selected-icon">
                              {(active && settings.dropdown_data?.icons.active_icon != '') && <i class={`fa-solid ${settings.dropdown_data.icons.active_icon}`}></i>}
                              {(!active && settings.dropdown_data?.icons.inactive_icon != '') && <i class={`fa-solid ${settings.dropdown_data.icons.inactive_icon}`}></i>}
                            </span>
                          </div>
                          <ul style={{ display: active ? 'block' : 'none'}}>
                            <DragDropContext onDragEnd={onDragEndDropdown}>
                              {settings.taxonomy_data.map((items, id) => (
                                <Droppable droppableId={String(items.key)} key={String(items.key)}>
                                  {(provided, snapshot) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                      {(items?.term_data.length > 0) && 
                                     <>
                                      {id === 0  &&
                                     <li className="caf-terms-list-item"  predefine="true">
                                        <a href="#" onClick={(e) => handleItemClick(e, settings.dropdown_data?.all_option.value!='' ? settings.dropdown_data?.all_option.value : 'All')}>
                                                    {(settings.dropdown_data?.all_option?.icons && settings.dropdown_data?.all_option?.icons.icon !== '' && settings.dropdown_data?.all_option?.icons.position === 'before-option') && (
                                                      <i className={`fa-solid ${settings.dropdown_data?.all_option.icons?.icon} filter-before-icon`}></i>
                                                    )}

                                                    {settings.dropdown_data?.all_option?.value!='' ? settings.dropdown_data?.all_option.value : 'All'}

                                                    {(settings.dropdown_data?.all_option?.icons && settings.dropdown_data?.all_option?.icons.icon !== '' && settings.dropdown_data?.all_option?.icons.position === 'after-option') && (
                                                      <i className={`fa-solid ${settings.dropdown_data?.all_option.icons?.icon} filter-after-icon`}></i>
                                                    )}    
                                          </a>
                                      </li>  
                                      }
                                      {items.term_data.map((item, ind) => {
                                        let valid = validateTerm(items.key, item.key);
                                       
                                        if (valid === true) {
                                          return (
                                            <Draggable key={String(item.key)} draggableId={String(`dropdown-${item.key}`)} index={ind}>
                                              {(providedDraggable, snapshotDraggable) => (
                                                <li
                                                  className="caf-terms-list-item"
                                                  predefine={item.predefine}
                                                  ref={providedDraggable.innerRef}
                                                  {...providedDraggable.draggableProps}
                                                  {...providedDraggable.dragHandleProps}
                                                >
                                                  <a href="#" onClick={(e) => handleItemClick(e, item.value)}>
                                                    {(item.icons && item.icons.icon !== '' && item.icons.position === 'before') && (
                                                      <i className={`fa-solid ${item.icons?.icon} filter-before-icon`}></i>
                                                    )}
                                                    {item.value}
                                                    {(item.icons && item.icons.icon !== '' && item.icons.position === 'after') && (
                                                      <i className={`fa-solid ${item.icons?.icon} filter-after-icon`}></i>
                                                    )}
                                                  </a>
                                                </li>
                                              )}
                                            </Draggable>
                                          );
                                        }
                                      })}
                                      </>
                                      }
                                      {provided.placeholder}
                                    </div>
                                    
                                  )}
                                </Droppable>
                               
                              ))}
                            </DragDropContext>


                          </ul>
                        </li>
                      </ul>
                    </div>
                  )}

                  {settings.filter_type == 'radio' && settings.taxonomy_data && (
                    <ul className="caf-terms-list radio">
                      {settings.taxonomy_data.map((items, id) => (
                        items?.term_data.length > 0 && items.term_data.map((item, ind) => {
                          valid = validateTerm(items.key, item.key)
                          if (valid === true) {
                            return (
                              <li className="caf-terms-list-item">
                                <label key={ind} className='caf-taxo-radio-main' predefine={item.predefine} >
                                  <input type="radio" className='caf-taxo-input' value={item.key} onClick={() => { }} />
                                  {(item.icons && item.icons.icon !== '' && item.icons.position == 'before') && <i class={`fa-solid ${item.icons?.icon} filter-before-icon`}>
                                  </i>}
                                  {item.value}
                                  {(item.icons && item.icons.icon !== '' && item.icons.position == 'after') && <i class={`fa-solid ${item.icons?.icon} filter-after-icon`}></i>}
                                </label>
                              </li>
                            )
                          }
                        })
                      ))}
                    </ul>
                  )}

                  {settings.filter_type === 'button' && settings.taxonomy_data && (
                    <DragDropContext onDragEnd={onDragEndButton}>
                      <ul className="caf-terms-list caf-button">
                        {settings.taxonomy_data.map((items, id) => (
                          <Droppable droppableId={String(items.key)} key={String(items.key)}>
                            {(provided, snapshot) => (
                              <div className="droppable-div"{...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {items?.term_data.length > 0 && items.term_data.map((item, ind) => {
                                  let valid = validateTerm(items.key, item.key);
                                  if (valid === true) {
                                    return (
                                      <Draggable key={String(item.key)} draggableId={String(`button-${item.key}`)} index={ind}>
                                        {(providedDraggable, snapshotDraggable) => (
                                          <li
                                            className="caf-terms-list-item"
                                            ref={providedDraggable.innerRef}
                                            {...providedDraggable.draggableProps}
                                            {...providedDraggable.dragHandleProps}
                                          >
                                            <label key={ind} className='caf-taxo-button-main' style={{ display: 'flex', alignItems: 'center' }} predefine={item.predefine} >
                                              <input type="checkbox" className='caf-taxo-input button' value={item.key} onChange={(e) => {
                                                checkboxSkinsStyling(e, settings.skins.checkbox, 'button')
                                              }} />
                                              {(item.icons && item.icons.icon !== '' && item.icons.position === 'before') && <i className={`fa-solid ${item.icons?.icon} filter-before-icon`}></i>}
                                              {item.value}
                                              {(item.icons && item.icons.icon !== '' && item.icons.position === 'after') && <i className={`fa-solid ${item.icons?.icon} filter-after-icon`}></i>}
                                            </label>
                                          </li>
                                        )}
                                      </Draggable>
                                    );
                                  }
                                })}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        ))}
                      </ul>
                    </DragDropContext>
                  )}
                </> : <CustomFieldData selectedDevice={selectedDevice} styleDefault={styleDefault} settings={settings} onSettingChange={onSettingChange} rowindex={rowindex} columnindex={columnindex} moduleindex={moduleindex} initialdata={initialdata}/>
            }
          </>
          :
          loading ? <Skeleton active /> : <p>No Data Found</p>}
        </>
      )}
      <style>
        {`
    .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
        ${generateContainerCSS("default", selectedDevice,styleDefault)}
    }
    .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
    ${generateContainerCSS("hover", selectedDevice,styleDefault)}
    }
    `}
        {settings.filter_type == 'dropdown' ? (
          <>
            {`.caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-terms-list-item a{
          ${generateMetaCSS("default", selectedDevice,styleDefault)}
      }
      .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-terms-list-item a:hover{
      ${generateMetaCSS("hover", selectedDevice,styleDefault)}
      }
      .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common{
        ${generateHeaderCSS("default", selectedDevice,styleDefault)}
        }
      .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common:hover{
      ${generateHeaderCSS("hover", selectedDevice,styleDefault)}
      }
      .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-manage-dropdown-labels-filter-dropdown{
       
      }
      `}
        {generateMetaCSS("hover", selectedDevice,styleDefault) == "" ? 
          `.caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-terms-list-item.wrraper .caf-selected-term-main{
          ${generateMetaCSS("default", selectedDevice,styleDefault)} 
          }
          `
        :
          `.caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-terms-list-item.wrraper .caf-selected-term-main{
          ${generateMetaCSS("hover", selectedDevice,styleDefault)} 
          }`
        }
          </>
        ) : (
          <>
            {`
       .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-terms-list-item{
          ${generateMetaCSS("default", selectedDevice,styleDefault)}
      }
      .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-terms-list-item:hover{
      ${generateMetaCSS("hover", selectedDevice,styleDefault)}
      }
      .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common{
        ${generateHeaderCSS("default", selectedDevice,styleDefault)}
        }
      .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common:hover{
      ${generateHeaderCSS("hover", selectedDevice,styleDefault)}
      }
      .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .droppable-div{
        ${getFilterMetaStyle("default", selectedDevice,styleDefault)}
        }
      `}
          </>
        )}
      </style>
    </div >
  )
}

export default ModuleFilter;
