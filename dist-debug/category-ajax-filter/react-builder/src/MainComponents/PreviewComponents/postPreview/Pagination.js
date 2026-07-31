import React,{useState,useEffect ,memo} from "react";
import { EllipsisOutlined } from '@ant-design/icons';
import {generatePostPreviewElementCSS} from "../../utils/functions";
import { resolvePreviewTemplateDataFromBuilderData } from "../../utils/builderDataAdapters";
import { isHiddenOnDevice } from "../../utils/builderVisibility";
import { resolvePaginationType } from "./shared/previewSettingsTier";
import { CafUploadedIcon as InlineSVG, isCafUploadedIconUrl } from "../../shared/cafUploadedIcon";
const Pagination = ({
  mainBuilderData,
  updatedBuilderData,
  deviceType,
  page,
  setCurrPage,
  currPage,
  paginationData
}) => {
  // let miscPreviewData = {
  //   ...mainBuilderData.common_data.preview_template_data.misc_preview_data,
  // };
  const previewTemplateData = resolvePreviewTemplateDataFromBuilderData(
    mainBuilderData
  );
  const fallbackPaginationData =
    previewTemplateData?.misc_preview_data?.dnd_column_data
      ?.flatMap((col) => col?.data || [])
      ?.find(
        (item) => item.key === "pagination" && item?.settings?.is_enable === "true"
      ) || {};
  const effectivePaginationData = paginationData || fallbackPaginationData;
  const settingData = {
    ...effectivePaginationData?.settings,
    pagination_type: resolvePaginationType(
      effectivePaginationData?.settings?.pagination_type
    ),
  };
  const [paginationElements, setPaginationElements] = useState([]);
  const [inputPage,setInputPage]=useState(currPage)

  useEffect(()=>{
    setInputPage(currPage);
  },[currPage])

  // useEffect(() => {
  //   let counter = 0;
  //   const elements = Array.from({ length: page.total }).map((_, i) => {
  //     if (i + 1 > 2 && i + 1 < page.total) {
  //       if(counter < 1){
  //         counter=1;
  //       return <span class="ellipsis-dots" key={i}>{settingData?.ellipsis_dots}</span>; 
  //       //return <EllipsisOutlined />;

  //       }
  //     } else {
  //       return (
  //         <span
  //           onClick={() => setCurrPage(i + 1)}
  //           className={`caf-builder-preview-page-no ${
  //             currPage === i + 1 ? "active" : ""
  //           }`}
  //           key={i}
  //         >
  //           {i + 1}
  //         </span>
  //       );
  //     }
  //   });
  //   setPaginationElements(elements);
  // }, [page.total, currPage, setCurrPage]);


//   useEffect(() => {
//   const total = page.total;
//   const elements = [];

//   for (let i = 1; i <= total; i++) {
//     // Always show first and last
//     if (
//       i === 1 ||
//       i === total ||
//       i === currPage ||
//       i === currPage - 1 ||
//       i === currPage + 1
//     ) {
//       elements.push(
//         <span
//           key={i}
//           onClick={() => setCurrPage(i)}
//           className={`caf-builder-preview-page-no ${
//             currPage === i ? "active" : ""
//           }`}
//         >
//           {i}
//         </span>
//       );
//     } 
//     // Show ellipsis when needed
//     else if (
//       (i === currPage - 2 && currPage > 3) ||
//       (i === currPage + 2 && currPage < total - 2)
//     ) {
//       elements.push(
//         <span className="ellipsis-dots" key={`ellipsis-${i}`}>
//           {settingData?.ellipsis_dots || "..."}
//         </span>
//       );
//     }
//   }

//   setPaginationElements(elements);
// }, [page.total, currPage]);

useEffect(() => {
  const total = page.total;
  const elements = [];
if(settingData?.ellipsis?.is_enable === "true"){
  // If total pages are small, show all
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      elements.push(
        <span
          key={i}
          onClick={() => setCurrPage(i)}
          className={`caf-builder-preview-page-no ${
            currPage === i ? "active" : ""
          }`}
        >
          {i}
        </span>
      );
    }
  } else {
    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        i === currPage ||
        i === currPage - 1 ||
        i === currPage + 1
      ) {
        elements.push(
          <span
            key={i}
            onClick={() => setCurrPage(i)}
            className={`caf-builder-preview-page-no ${
              currPage === i ? "active" : ""
            }`}
          >
            {i}
          </span>
        );
      } else if (
        (i === currPage - 2 && currPage > 3) ||
        (i === currPage + 2 && currPage < total - 2)
      ) {
        elements.push(
          <span className="ellipsis-dots" key={`ellipsis-${i}`}>
            {settingData?.ellipsis_dots || "..."}
          </span>
        );
      }
    }
  }
}else{
    for (let i = 1; i <= total; i++) {
    elements.push(
      <span
        key={i}
        onClick={() => setCurrPage(i)}
        className={`caf-builder-preview-page-no ${
          currPage === i ? "active" : ""
        }`}
      >
        {i}
      </span>
    );
  }
}
setPaginationElements(elements);
}, 
[
  page.total, 
  currPage,
  settingData?.ellipsis?.is_enable,
  settingData?.ellipsis?.value
]);

  const handleEnterPress = (e) => {
    if (e.key === 'Enter') {
      if(inputPage < 1){
        setInputPage(1)
        setCurrPage(1)
      }
      else if(inputPage > page.total){
        setInputPage(page.total)
        setCurrPage(page.total)
      }
      else{
      setCurrPage(inputPage)
      }
    }
  };
    /*============================================== Start Font Family Linking =========================================================*/
const loadFont = (fontFamily) => {
  if (!document.getElementById(fontFamily) && fontFamily) {
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css?family=${fontFamily}:regular&display=swap`;
    link.async = true;
    link.id = fontFamily;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.body.appendChild(link);
  }
};

/* Start Main Font Loading */
if (effectivePaginationData?.style?.desktop?.default?.fontFamily) {
  loadFont(effectivePaginationData.style.desktop.default.fontFamily);
}
if (effectivePaginationData?.style?.desktop?.hover?.fontFamily) {
  loadFont(effectivePaginationData.style.desktop.hover.fontFamily);
}
if (effectivePaginationData?.style?.tablet?.default?.fontFamily) {
  loadFont(effectivePaginationData.style.tablet.default.fontFamily);
}
if (effectivePaginationData?.style?.tablet?.hover?.fontFamily) {
  loadFont(effectivePaginationData.style.tablet.hover.fontFamily);
}
if (effectivePaginationData?.style?.mobile?.default?.fontFamily) {
  loadFont(effectivePaginationData.style.mobile.default.fontFamily);
}
if (effectivePaginationData?.style?.mobile?.hover?.fontFamily) {
  loadFont(effectivePaginationData.style.mobile.hover.fontFamily);
}
/* End Main Font Loading */
/*============================================== End Font Family Linking =========================================================*/



//console.log(page)
if (isHiddenOnDevice(effectivePaginationData?.settings, deviceType)) {
  return null;
}

return (
    <div className={`caf-builder-preview-pagination-container ${settingData?.custom_class ?? ""}`}>

      {settingData?.pagination_type == 'number2' &&(
      <>
      {page.prev && (
        <>
          <div onClick={() => setCurrPage(currPage - 1)}
            className="caf-builder-preview-prev-btn">
            {settingData?.prev?.type === "text" &&(
              <>{settingData?.prev?.text}</>
            )}
             {settingData?.prev?.type === "icon" &&(
              <>
              {settingData?.prev?.icons?.visibility && settingData?.prev?.icons?.type ==="icon" && settingData?.prev?.icons?.icon !=="" && (
                <i
                  data-icon-name={settingData?.prev?.icons?.icon}
                  value={settingData?.prev?.icons?.icon}
                  className={settingData?.prev?.icons?.icon}
                ></i>
                )}
                {settingData?.prev?.icons?.visibility && settingData?.prev?.icons?.type ==="svg" && settingData?.prev?.icons?.icon?.url &&  isCafUploadedIconUrl(settingData?.prev?.icons?.icon?.url) &&(
                  <InlineSVG
                    src={settingData?.prev?.icons?.icon?.url}
                    className="caf-inline-svg-icon"
                  />
                )}
                </>
             )}

          <style>
            {`
              .caf-builder-preview-pagination-container .caf-builder-preview-prev-btn {
               ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "default")}
              }
              .caf-builder-preview-pagination-container .caf-builder-preview-prev-btn:hover{ 
               ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "hover")}
              }
            `}
          </style>
          </div>
          </>
      )}
      <div className="caf-builder-preview-pages">
          
          {page.total > 1 && paginationElements}

      <style>
        {`
          .caf-builder-preview-pagination-container .caf-builder-preview-page-no{
            ${generatePostPreviewElementCSS(paginationData.style?.meta1, deviceType, "default")}
          }
          .caf-builder-preview-pagination-container .caf-builder-preview-page-no:hover{ 
            ${generatePostPreviewElementCSS(paginationData?.style?.meta1, deviceType, "hover")}
          }
          .caf-builder-preview-pagination-container .caf-builder-preview-page-no.active{ 
            ${generatePostPreviewElementCSS(paginationData?.style?.meta1, deviceType, "selected")}
          }

          .caf-builder-preview-pagination-container .caf-builder-preview-pages{
            ${generatePostPreviewElementCSS(paginationData.style?.meta2, deviceType, "default")}
          }
          .caf-builder-preview-pagination-container .caf-builder-preview-pages:hover{ 
            ${generatePostPreviewElementCSS(paginationData?.style?.meta2, deviceType, "hover")}
          }
        `}
      </style>
      </div>
      {page.next && (
        <>
          <div onClick={() => setCurrPage(currPage + 1)}
            className="caf-builder-preview-next-btn">
            {settingData?.next?.type === "text" &&(
              <>{settingData?.next?.text}</>
            )}
             {settingData?.next?.type === "icon" &&(
              <>
              {settingData?.next?.icons?.visibility && settingData?.next?.icons?.type ==="icon" && settingData?.next?.icons?.icon !=="" && (
                <i
                  data-icon-name={settingData?.next?.icons?.icon}
                  value={settingData?.next?.icons?.icon}
                  className={settingData?.next?.icons?.icon}
                ></i>
                )}
                {settingData?.next?.icons?.visibility && settingData?.next?.icons?.type ==="svg" && settingData?.next?.icons?.icon?.url &&  isCafUploadedIconUrl(settingData?.next?.icons?.icon?.url) &&(
                  <InlineSVG
                    src={settingData?.next?.icons?.icon?.url}
                    className="caf-inline-svg-icon"
                  />
                )}
                </>
             )}

          <style>
            {`
              .caf-builder-preview-pagination-container .caf-builder-preview-next-btn {
                ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "default")}
              }
              .caf-builder-preview-pagination-container .caf-builder-preview-next-btn:hover{ 
                 ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "hover")}
              }
            `}
          </style>
          </div>
          </>
      )}
      </>
      )}

      {settingData?.pagination_type == 'number' &&(
      <>
      {/* <div className="caf-builder-preview-pages"> */}
          {page.total > 1 && paginationElements}

     <style>
        {`
          .caf-builder-preview-pagination-container .caf-builder-preview-page-no{
            ${generatePostPreviewElementCSS(paginationData.style?.meta1, deviceType, "default")}
          }
          .caf-builder-preview-pagination-container .caf-builder-preview-page-no:hover{ 
            ${generatePostPreviewElementCSS(paginationData?.style?.meta1, deviceType, "hover")}
          }
          .caf-builder-preview-pagination-container .caf-builder-preview-page-no.active{ 
            ${generatePostPreviewElementCSS(paginationData?.style?.meta1, deviceType, "selected")}
          }
        `}
      </style>
      {/* </div> */}

      </>
      )}

      {settingData?.pagination_type == 'button' &&(
      <>
      {page.prev && (
        <>
          <div onClick={() => setCurrPage(currPage - 1)}
            className="caf-builder-preview-prev-btn">
            {settingData?.prev?.type === "text" &&(
              <>{settingData?.prev?.text}</>
            )}
             {settingData?.prev?.type === "icon" &&(
              <>
              {settingData?.prev?.icons?.visibility && settingData?.prev?.icons?.type ==="icon" && settingData?.prev?.icons?.icon !=="" && (
                <i
                  data-icon-name={settingData?.prev?.icons?.icon}
                  value={settingData?.prev?.icons?.icon}
                  className={settingData?.prev?.icons?.icon}
                ></i>
                )}
                {settingData?.prev?.icons?.visibility && settingData?.prev?.icons?.type ==="svg" && settingData?.prev?.icons?.icon?.url &&  isCafUploadedIconUrl(settingData?.prev?.icons?.icon?.url) &&(
                  <InlineSVG
                    src={settingData?.prev?.icons?.icon?.url}
                    className="caf-inline-svg-icon"
                  />
                )}
                </>
             )}

          {/* <style>
            {`
              .caf-builder-preview-prev-btn {
                ${generateCSS(pagination.style, deviceType, "default")}
              }
              .caf-builder-preview-prev-btn:hover{ 
                ${generateCSS(pagination.style, deviceType, "hover")}
              }
            `}
          </style> */}
          </div>
          </>
      )}

      {page.next && (
        <>
          <div onClick={() => setCurrPage(currPage + 1)}
            className="caf-builder-preview-next-btn">
            {settingData?.next?.type === "text" &&(
              <>{settingData?.next?.text}</>
            )}
             {settingData?.next?.type === "icon" &&(
              <>
              {settingData?.next?.icons?.visibility && settingData?.next?.icons?.type ==="icon" && settingData?.next?.icons?.icon !=="" && (
                <i
                  data-icon-name={settingData?.next?.icons?.icon}
                  value={settingData?.next?.icons?.icon}
                  className={settingData?.next?.icons?.icon}
                ></i>
                )}
                {settingData?.next?.icons?.visibility && settingData?.next?.icons?.type ==="svg" && settingData?.next?.icons?.icon?.url &&  isCafUploadedIconUrl(settingData?.next?.icons?.icon?.url) &&(
                  <InlineSVG
                    src={settingData?.next?.icons?.icon?.url}
                    className="caf-inline-svg-icon"
                  />
                )}
                </>
             )}

          {/* <style>
            {`
              .caf-builder-preview-prev-btn {
                ${generateCSS(pagination.style, deviceType, "default")}
              }
              .caf-builder-preview-prev-btn:hover{ 
                ${generateCSS(pagination.style, deviceType, "hover")}
              }
            `}
          </style> */}
          </div>
          </>
      )}
      <style>
            {`
              .caf-builder-preview-pagination-container .caf-builder-preview-prev-btn {
               ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "default")}
              }
              .caf-builder-preview-pagination-container .caf-builder-preview-prev-btn:hover{ 
               ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "hover")}
              }
              .caf-builder-preview-pagination-container .caf-builder-preview-next-btn {
               ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "default")}
              }
              .caf-builder-preview-pagination-container .caf-builder-preview-next-btn:hover{ 
               ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "hover")}
              }
            `}
          </style>
      </>
      )}

    {settingData?.pagination_type == 'load-more' &&(
      <>
      {page?.load_more && (
      <div current-page={currPage} className="caf-builder-preview-load-more-btn" onClick={() => setCurrPage(currPage + 1)}>
        <span className="caf-load-more-btn-text">{settingData?.load_more?.text}</span>
        {settingData?.load_more?.icon_enable === "true" && settingData?.load_more?.icons?.visibility && settingData?.load_more?.icons?.type ==="icon" && settingData?.load_more?.icons?.icon !=="" && (
          <i
            data-icon-name={settingData?.load_more?.icons?.icon}
            value={settingData?.load_more?.icons?.icon}
            className={settingData?.load_more?.icons?.icon}
          ></i>
        )}
        {settingData?.load_more?.icon_enable === "true" && settingData?.load_more?.icons?.visibility && settingData?.load_more?.icons?.type ==="svg" && settingData?.load_more?.icons?.icon?.url && isCafUploadedIconUrl(settingData?.load_more?.icons?.icon?.url) && (
          <InlineSVG
            src={settingData?.load_more?.icons?.icon?.url}
            className="caf-inline-svg-icon"
          />
        )}
      </div>
    )}
            <style>
            {`
              .caf-builder-preview-pagination-container .caf-builder-preview-load-more-btn {
               ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "default")}
              }
              .caf-builder-preview-pagination-container .caf-builder-preview-load-more-btn:hover{ 
               ${generatePostPreviewElementCSS(paginationData.style?.meta, deviceType, "hover")}
              }
            `}
          </style>
      </>
      )}
      <style>
      {`
        .caf-builder-preview-pagination-container {
          ${generatePostPreviewElementCSS(paginationData?.style?.container, deviceType, "default")}
        }
        .caf-builder-preview-pagination-container:hover{ 
          ${generatePostPreviewElementCSS(paginationData?.style?.container, deviceType, "hover")}
        }
      `}
      </style>
  </div>

  );
};

export default Pagination;
