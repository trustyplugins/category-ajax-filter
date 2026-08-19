import React, { useState, useEffect,memo,useRef,useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { generateFilterCSS, generateFilterFocusCSS, generateFilterPlaceholderCSS ,generateFilterLabelCSS,generateFilterLabelInnerCSS} from "../../../utils/functions";
import { resolvePreviewTemplateDataFromBuilderData } from "../../../utils/builderDataAdapters";
import {
  syncPreviewSelectedTags,
} from "../../../PreviewComponents/postPreview/previewRangeSliderTagUtils";
import { meetsMinCharLimitFromSettings } from "../../../PreviewComponents/postPreview/previewSearchUtils";
import { canUseFeature } from "../../../../tier/capabilities";
import { resolveSearchModuleSettingsForOutput } from "../settingTabContent/ModuleContentData/shared/filterModuleTier";
import { CafUploadedIcon as InlineSVG, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";

function ModuleSearch({
  postData,
  settings,
  styleDefault,
  module,
  rowindex,
  columnindex,
  moduleindex,
  selectedDevice,
  setIndexes,
  indexes,
  mainBuilderData,
  emptySearchInput = false,
  setEmptySearchInput = () => {},
}) {
  const outputSettings = useMemo(
    () => resolveSearchModuleSettingsForOutput(settings),
    [settings]
  );
  
  const moduleRootRef = useRef(null);
  const [checkIcon, setCheckIcon] = useState(false);
  const [checkButton, setCheckButton] = useState(false);
  const [enableToggle, setEnableToggle] = useState(outputSettings?.enable_toggle);
  const [closeToggle, setCloseToggle] = useState(outputSettings?.close_toggle);
  const [selectDevice, setselectDevice] = useState(selectedDevice);
  const [inputValue, setInputValue] = useState("");
  const [foucsClass, setFoucsClass] = useState("");
  const [listening ,setListening] = useState(false)
  const [clickStatus, setClickStatus] = useState(false);
  /** Keyword shown in selected-tags UI (only after submit / live-search commit). */
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const canUseSmartAiSearch = canUseFeature("smart_ai_search");
  const canUseSearchCustomField = canUseFeature("search_custom_field");
  const canUseVoiceSearch = canUseFeature("voice_search");
  const voiceSearchEnabled =
    canUseVoiceSearch && settings?.voice_icon?.is_enable === "true";
  const smartSearchEnabled =
    canUseSmartAiSearch && settings?.smart_ai_search?.is_enable !== "false";
  const searchCustomFieldEnabled =
    canUseSearchCustomField && settings?.source?.custom_field === true;
  // console.log(settings);
  let custom_class = "";
  if (settings?.custom_class) {
    custom_class = settings.custom_class;
  }
  let positionClass = "";
  if (settings?.position === "left") {
    positionClass = "caf-fl-p-left";
  }

  const visibility = settings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";

  // useEffect(()=>{
  //   if(emptySearchInput === true){
  //     console.log('one')
  //     setInputValue('');
  //   }
  // },[emptySearchInput])

  // useEffect(()=>{
  //   if(setEmptySearchInput){
  //     console.log('one')
  //     setEmptySearchInput(false);
  //   }
  // },[inputValue])

  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    mainBuilderData
  );
  //console.log(mainBuilderData)
  let dndColDataData = [
    ...(previewTemplateData?.misc_preview_data?.dnd_column_data || []),
  ];
  let selectedTagData = dndColDataData.flatMap(col => col.data || []).find(item => item.key === "selected");

  const AddSelectedTags = () => {
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
    syncPreviewSelectedTags(scopeDocument, selectedTagData);
  };
  useEffect(() => {
    AddSelectedTags();
  }, [
    selectedTagData?.settings?.close_button,
    selectedTagData?.settings?.is_enable,
    submittedKeyword,
  ]);

  // useEffect(() => {
  //   setTimeout(()=>{
  //   AddSelectedTags();
  // },1000)
  // }, [clickStatus]);

  const handleIcon = () => {
    if (!settings.default_field) setCheckIcon(true);
  };
  const handleButton = () => {
    if (!settings.default_field) setCheckButton(true);
  };
  const handleToggle = () => {
    if (enableToggle === "true") {
      if (closeToggle === "false") {
        setCloseToggle("true");
      } else {
        setCloseToggle("false");
      }
    }
  };
  useEffect(() => {
    if (outputSettings?.enable_toggle) {
      setEnableToggle(outputSettings.enable_toggle);
    }
    if (outputSettings?.close_toggle) {
      setCloseToggle(outputSettings.close_toggle);
    }
  }, [outputSettings?.close_toggle, outputSettings?.enable_toggle]);

  useEffect(() => {
    setselectDevice(selectedDevice);
  }, [selectedDevice]);

  const [placeholder, setPlaceholder] = useState(
    settings?.search_placeholder || ""
  );

  useEffect(()=>{
  setPlaceholder(settings?.search_placeholder || "")
  },[settings?.search_placeholder])

  //console.log(settings,placeholder)

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!canUseVoiceSearch) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; 
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      //console.log('start')
      setFoucsClass("caf-focused")
      setListening(true)
      setPlaceholder(
      settings?.voice_icon?.is_enable === "true"
    ? (settings?.voice_icon?.placeholder !== ""
        ? settings.voice_icon.placeholder
        : settings?.search_placeholder !== ""
          ? settings.search_placeholder
          : "")
    : (settings?.search_placeholder !== ""
        ? settings.search_placeholder
        : "")
      );

    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInputValue(spokenText);
      const scopeDocument = moduleRootRef.current?.ownerDocument || document;
      const moduleOutput = moduleRootRef.current?.querySelector(
        ".caf-filter-module-search-output"
      );
      const trigger =
        moduleOutput?.getAttribute("data-search-trigger") || "enter_icon";
      requestAnimationFrame(() => {
        const input = moduleRootRef.current?.querySelector("input.input-field");
        if (trigger === "typing") {
          input?.dispatchEvent(new Event("input", { bubbles: true }));
        } else if (
          spokenText.trim() !== "" &&
          meetsMinCharLimitFromSettings(settings, spokenText.trim())
        ) {
          setSubmittedKeyword(spokenText.trim());
          setClickStatus(true);
          scopeDocument.dispatchEvent(
            new CustomEvent("caf-preview-search-execute", {
              detail: {
                moduleOutput,
                rowindex,
                columnindex,
                moduleindex,
              },
            })
          );
        }
      });
    };

    recognition.onend = () => {
      //console.log('end')
      setPlaceholder(settings?.search_placeholder || "");
      setFoucsClass("")
      setListening(false)
    };

    recognition.onerror = () => {
      // setPlaceholder(settings?.search_placeholder || "Search...");
      // setFoucsClass("")
    };

    recognitionRef.current = recognition;
  }, [settings,settings?.search_placeholder]);

  useEffect(() => {
    const handlePreviewResetSearch = () => {
      setInputValue("");
      setSubmittedKeyword("");
      setFoucsClass("");
      setClickStatus(false);
      setPlaceholder(settings?.search_placeholder || "");
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // Ignore if speech recognition is not active.
      }
    };
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;

    const handleSearchCommitted = (event) => {
      const detail = event?.detail || {};
      if (
        String(detail.rowindex) !== String(rowindex) ||
        String(detail.columnindex) !== String(columnindex) ||
        String(detail.moduleindex) !== String(moduleindex)
      ) {
        return;
      }
      const keyword = String(detail.keyword ?? "").trim();
      setSubmittedKeyword(keyword);
      setClickStatus(keyword !== "");
    };

    scopeDocument.addEventListener("caf-preview-reset-search", handlePreviewResetSearch);
    scopeDocument.addEventListener("caf-preview-search-committed", handleSearchCommitted);
    return () => {
      scopeDocument.removeEventListener("caf-preview-reset-search", handlePreviewResetSearch);
      scopeDocument.removeEventListener("caf-preview-search-committed", handleSearchCommitted);
    };
  }, [settings?.search_placeholder]);
  
  useEffect(() => {
  if(inputValue.trim() === ""){
    const scopeDocument = moduleRootRef.current?.ownerDocument || document;
          // search keyword 
          const searchInputs = scopeDocument.querySelectorAll(
            ".caf-builder-template-preview-filter .caf-module-search input.input-field"
          );
        if(searchInputs){
          searchInputs.forEach((inputEl) => {
            const input = inputEl;

            input.value = "";
            input.dispatchEvent(new Event("input", { bubbles: true }));
          });
  
        // Ensure ModuleSearch controlled state is also reset.
        scopeDocument.dispatchEvent(new CustomEvent("caf-preview-reset-search"));
  
        }
        setClickStatus(false);
  }
}, [inputValue]);

  const startVoiceSearch = () => {
    setInputValue("");
    setSubmittedKeyword("");
    setClickStatus(false);
    const input = moduleRootRef.current?.querySelector("input.input-field");
    if (input) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setTimeout(() => {
      recognitionRef.current.stop();
      }, 10000); // 10 seconds
    }
  };
  return (
    <>
      <div
        ref={moduleRootRef}
        onClick={() =>
          setIndexes &&
          setIndexes({
            type: "module",
            rowindex: rowindex,
            columnindex: columnindex,
            moduleindex: moduleindex,
            module: module,
          })
        }
        className={`caf-builder-module-main caf-module-filter caf-module-type-search caf-module-${module.key} caf-module-${moduleindex} ${custom_class} ${positionClass} ${indexes?.type === "module" &&
          indexes?.rowindex === rowindex &&
          indexes?.columnindex === columnindex &&
          indexes?.moduleindex === moduleindex
          ? "active"
          : ""
          } ${hideClass}`}
      >
      {settings.label.is_label === "true" && (
        <div className="caf-filter-label-common label-header" onClick={() => handleToggle()}>
          {enableToggle === "true" && outputSettings?.toggle_position === "left" &&(
            <div className="caf-builder-filter-toggle-icon">
              {closeToggle === "false" ? (
                <span
                  class="label-icon-common">
                  <i className="fas fa-chevron-up"></i>
                </span>
              ) : (
                <span
                  class="label-icon-common">
                  <i className="fas fa-chevron-down"></i>
                </span>
              )}
            </div>
          )}
          <div className="caf-builder-filter-label-wrapper">
            {outputSettings.label?.icons && outputSettings.label?.icons?.icon !== "" ? (
                 <>
              {outputSettings.label?.icons?.type ==="icon" && 
              <>
                {/* <div className="caf-builder-custom-filed-label-inner"> */}
                  {outputSettings.label?.icons.position == "before-label" &&  outputSettings.label?.icons. visibility === true &&(
                    <i
                      className={`caf-builder-before-label before-common ${outputSettings.label?.icons.icon}`}
                    ></i>
                  )}
                  <span className="caf-builder-filter-label">
                  {settings.label?.value ? settings.label?.value : "Label"}
                  </span>
                  {outputSettings.label?.icons.position == "after-label" && outputSettings.label?.icons. visibility === true && (
                    <i
                      className={`caf-builder-after-label after-common ${outputSettings.label?.icons.icon}`}
                    ></i>
                  )}
                {/* </div> */}
                </>
                }
                 {outputSettings.label?.icons?.type ==="svg" && 
                 <>
                {/* <div className="caf-builder-custom-filed-label-inner"> */}
                  {outputSettings.label?.icons.position == "before-label" && outputSettings.label?.icons. visibility === true && (
                     <InlineSVG
                      src={outputSettings.label?.icons?.icon?.url}
                      className="caf-inline-svg-icon caf-builder-before-label before-common"
                    />
                  )}
                  <span className="caf-builder-filter-label">
                    {settings.label?.value ? settings.label?.value : "Label"}
                  </span>
                  {outputSettings.label?.icons.position == "after-label" && outputSettings.label?.icons. visibility === true && (
                     <InlineSVG
                      src={outputSettings.label?.icons?.icon?.url}
                      className="caf-inline-svg-icon caf-builder-after-label after-common"
                    />
                  )}
                {/* </div> */}
                </>
                }
                </>
            ) : (
              // <div className="caf-builder-custom-filed-label-inner">
              <span className="caf-builder-filter-label">
                {settings.label?.value ? settings.label?.value : "Label"}
                </span>
              // </div>
            )}
          </div>
          {enableToggle === "true" && outputSettings?.toggle_position === "right" && (
            <div className="caf-builder-filter-toggle-icon">
              {closeToggle === "false" ? (
                <span
                  class="label-icon-common">
                  <i className="fas fa-chevron-up"></i>
                </span>
              ) : (
                <span
                  class="label-icon-common">
                  <i className="fas fa-chevron-down"></i>
                </span>
              )}
            </div>
          )}
        </div>
      )}
        {closeToggle === "false" && (
          <>
              <div
                className={`caf-filter-module-search-output ${foucsClass}`}
                data-search-trigger={settings?.search_trigger === "typing" ? "typing" : "enter_icon"}
                data-char-limit-enabled={
                  settings?.char_limit?.is_enable === "true" ? "true" : "false"
                }
                data-char-limit={String(settings?.char_limit?.limit ?? "0")}
                data-search-custom-field={
                  canUseSearchCustomField
                    ? String(settings?.custom_field ?? "")
                    : ""
                }
                data-search-source-everything={
                  settings?.source?.everything === true ? "true" : "false"
                }
                data-search-source-title={
                  settings?.source?.title === true ? "true" : "false"
                }
                data-search-source-descriptions={
                  settings?.source?.descriptions === true ? "true" : "false"
                }
                data-search-source-custom-field={
                  searchCustomFieldEnabled ? "true" : "false"
                }
                data-keyword-search-enabled={
                  settings?.keyword_search?.is_enable !== "false" ? "true" : "false"
                }
                data-smart-search-enabled={
                  smartSearchEnabled ? "true" : "false"
                }
                data-preview-row={rowindex}
                data-preview-column={columnindex}
                data-preview-module={moduleindex}
                trigger-type={settings?.search_trigger === "typing" ? "typing" : "enter_icon"}
              > 
                {((outputSettings?.search_icon?.is_enable === "true" && outputSettings?.search_icon?.position ==="left") || 
                (voiceSearchEnabled && settings?.voice_icon?.position === "left") ||
                (outputSettings?.clear_icon?.is_enable === "true" && outputSettings?.clear_icon?.position === "left")
                )&&
                <div className="caf-search-left-col">
                  {outputSettings?.search_icon?.is_enable === "true" && outputSettings?.search_icon?.position ==="left" &&
                  <span className="search-icon">
                    {outputSettings?.search_icon?.type === "icon" &&
                    <i className={`${outputSettings?.search_icon?.icon !=="" ? outputSettings?.search_icon?.icon : "fas fa-search"}`}></i> 
                    }
                    {outputSettings?.search_icon?.type === "svg" && outputSettings?.search_icon?.icon?.url && isCafUploadedIconUrl(outputSettings.search_icon.icon.url) &&
                      <InlineSVG
                      src={outputSettings?.search_icon?.icon?.url}
                      className="caf-inline-svg-icon"
                    />
                    }
                  </span>
                  }
                  {voiceSearchEnabled && settings?.voice_icon?.position === "left" &&
                  <span className="voice-icon" onClick={startVoiceSearch}> 
                    {settings?.voice_icon?.type === "icon" &&
                    <i className={`${settings?.voice_icon?.icon !=="" ? settings?.voice_icon?.icon : "fas fa-microphone"}`}></i> 
                    }
                    {settings?.voice_icon?.type === "svg" && settings?.voice_icon?.icon?.url && isCafUploadedIconUrl(settings.voice_icon.icon.url) &&
                      <InlineSVG
                      src={settings?.voice_icon?.icon?.url}
                      className="caf-inline-svg-icon"
                    />
                    }
                  </span>
                  }
                  {outputSettings?.clear_icon?.is_enable === "true" && outputSettings?.clear_icon?.position === "left" && ((outputSettings?.clear_icon?.visibility ==="type" && (inputValue !=="" || listening )) || (outputSettings?.clear_icon?.visibility ==="always") ) &&
                  <span className="clear-icon" onClick={()=>{setInputValue("");recognitionRef.current.stop();}} >
                    {outputSettings?.clear_icon?.type === "icon" &&
                    <i className={`${outputSettings?.clear_icon?.icon !=="" ? outputSettings?.clear_icon?.icon : "fas fa-times"}`}></i> 
                    }
                    {outputSettings?.clear_icon?.type === "svg" && outputSettings?.clear_icon?.icon?.url && isCafUploadedIconUrl(outputSettings.clear_icon.icon.url) &&
                      <InlineSVG
                      src={outputSettings?.clear_icon?.icon?.url}
                      className="caf-inline-svg-icon"
                    />
                    }
                  </span>
                  }
                  </div>
                }
                <input
                  type="text"
                  placeholder={placeholder}
                  className="input-field caf-search-input-field"
                  value={inputValue}
                  onChange={(e)=>setInputValue(e.target.value)}
                  onFocus={() => setFoucsClass("caf-focused")}
                  onBlur={() => !listening && setFoucsClass("")}
                  spellCheck="false"
                  readOnly={listening}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") {
                      return;
                    }
                    if (
                      settings?.search_trigger === "typing" &&
                      !inputValue.trim()
                    ) {
                      e.preventDefault();
                      return;
                    }
                    if (!meetsMinCharLimitFromSettings(settings, inputValue.trim())) {
                      e.preventDefault();
                    }
                  }}
                /> 

               {((outputSettings?.search_icon?.is_enable === "true" && outputSettings?.search_icon?.position ==="right") || 
                (voiceSearchEnabled && settings?.voice_icon?.position === "right") ||
                (outputSettings?.clear_icon?.is_enable === "true" && outputSettings?.clear_icon?.position === "right")
               )&&
                <div className="caf-search-right-col">
                  {outputSettings?.search_icon?.is_enable === "true" && outputSettings?.search_icon?.position ==="right" &&
                  <span className="search-icon">
                    {outputSettings?.search_icon?.type === "icon" &&
                    <i className={`${outputSettings?.search_icon?.icon !=="" ? outputSettings?.search_icon?.icon : "fas fa-search"}`}></i> 
                    }
                    {outputSettings?.search_icon?.type === "svg" && outputSettings?.search_icon?.icon?.url && isCafUploadedIconUrl(outputSettings.search_icon.icon.url) &&
                      <InlineSVG
                      src={outputSettings?.search_icon?.icon?.url}
                      className="caf-inline-svg-icon"
                    />
                    }
                  </span>
                  }
                  {voiceSearchEnabled && settings?.voice_icon?.position === "right" &&
                  <span className="voice-icon" onClick={startVoiceSearch}> 
                    {settings?.voice_icon?.type === "icon" &&
                    <i className={`${settings?.voice_icon?.icon !=="" ? settings?.voice_icon?.icon : "fas fa-microphone"}`}></i> 
                    }
                    {settings?.voice_icon?.type === "svg" && settings?.voice_icon?.icon?.url && isCafUploadedIconUrl(settings.voice_icon.icon.url) &&
                      <InlineSVG
                      src={settings?.voice_icon?.icon?.url}
                      className="caf-inline-svg-icon"
                    />
                    }
                  </span>
                  }

                 {/* {outputSettings?.clear_icon?.is_enable === "true" && outputSettings?.clear_icon?.position === "right" && ((outputSettings?.clear_icon?.visibility ==="type" && inputValue !=="" ) || (outputSettings?.clear_icon?.visibility ==="voice" && listening) ||(outputSettings?.clear_icon?.visibility ==="both" && (inputValue !=="" || listening ) ) ) && */}
                {outputSettings?.clear_icon?.is_enable === "true" && outputSettings?.clear_icon?.position === "right" && ((outputSettings?.clear_icon?.visibility ==="type" && (inputValue !=="" || listening )) || (outputSettings?.clear_icon?.visibility ==="always") ) &&
                  <span className="clear-icon" onClick={()=>{setInputValue("");recognitionRef.current.stop();}} >
                    {outputSettings?.clear_icon?.type === "icon" &&
                    <i className={`${outputSettings?.clear_icon?.icon !=="" ? outputSettings?.clear_icon?.icon : "fas fa-times"}`}></i> 
                    }
                    {outputSettings?.clear_icon?.type === "svg" && outputSettings?.clear_icon?.icon?.url && isCafUploadedIconUrl(outputSettings.clear_icon.icon.url) &&
                      <InlineSVG
                      src={outputSettings?.clear_icon?.icon?.url}
                      className="caf-inline-svg-icon"
                    />
                    }
                  </span>
                  }
                </div>
              }
              </div>
          </>
        )}
      </div>
      <style>
        {`
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
          ${generateFilterCSS(
            "container",
            "default",
            selectedDevice,
            styleDefault
          )}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
          ${generateFilterCSS(
            "container",
            "hover",
            selectedDevice,
            styleDefault
          )}
        }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header{
            ${generateFilterLabelCSS("header", "default", selectedDevice, styleDefault)}
            }
          .caf-bl-filter  .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header:hover{
          ${generateFilterLabelCSS("header", "hover", selectedDevice, styleDefault)}
          }
          .caf-bl-filter .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper{
            ${generateFilterLabelInnerCSS("header", "default", selectedDevice, styleDefault)}
          }
          .caf-bl-filter  .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-label-common.label-header .caf-builder-filter-label-wrapper:hover{
          ${generateFilterLabelInnerCSS("header", "hover", selectedDevice, styleDefault)}
          }
          
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .caf-search-left-col{
          ${generateFilterCSS("meta1", "default", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .caf-search-left-col:hover{
          ${generateFilterCSS("meta1", "hover", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .caf-search-right-col{
          ${generateFilterCSS("meta2", "default", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .caf-search-right-col:hover{
          ${generateFilterCSS("meta2", "hover", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output{
          ${generateFilterCSS("input", "default", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output:hover{
          ${generateFilterCSS("input", "hover", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output.caf-focused{
          ${generateFilterFocusCSS("input", selectedDevice, styleDefault)}
        }   
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .search-icon i{
          ${generateFilterCSS("icon", "default", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .search-icon i:hover{
          ${generateFilterCSS("icon", "hover", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .search-icon svg{
          ${generateFilterCSS("icon", "default", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .search-icon svg:hover{
          ${generateFilterCSS("icon", "hover", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .voice-icon i{
          ${generateFilterCSS("icon2", "default", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .voice-icon i:hover{
          ${generateFilterCSS("icon2", "hover", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .voice-icon svg{
          ${generateFilterCSS("icon2", "default", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .voice-icon svg:hover{
          ${generateFilterCSS("icon2", "hover", selectedDevice, styleDefault)}
        } 
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .clear-icon i{
          ${generateFilterCSS("icon3", "default", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .clear-icon i:hover{
          ${generateFilterCSS("icon3", "hover", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .clear-icon svg{
          ${generateFilterCSS("icon3", "default", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output .clear-icon svg:hover{
          ${generateFilterCSS("icon3", "hover", selectedDevice, styleDefault)}
        }
        .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-filter-module-search-output input.input-field::placeholder{
          ${generateFilterPlaceholderCSS("input", "placeholder", selectedDevice, styleDefault)}
        }   
       
      `}
      </style>
    </>
  );
}

export default ModuleSearch;
