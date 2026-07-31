import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FilterWithQuery from "./FilterWithQuery";
import FilterBuilderContainer from "./FilterBuilderContainer";
import { Switch } from "antd";
import filterQueryArrow from "../images/filter-query-arrow.svg"
import { selectFilterExtraData } from "../../store/selectors";
import { setExtraData as setFilterBuilderExtraData } from "../../store/filterBuilderSlice";
import { resolvePostExtraDataFromBuilderData } from "../utils/builderDataAdapters";

function FilterContainer(props) {
  const dispatch = useDispatch();
  const reduxExtraData = useSelector(selectFilterExtraData);
  let filterStatus =
    reduxExtraData?.filter_type ??
    props.mainBuilderData?.filter_layout_data?.extra_data.filter_type;
  const [checkDisable, setCheckDisable] = useState(filterStatus === "false" ? false: true);
  const [arrowCollapse ,setArrowCollapse]=useState(false);
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    mutator(nextBuilder);
    props.updatedBuilderData(nextBuilder);
    const ex = nextBuilder.filter_layout_data?.extra_data;
    if (ex && typeof ex === "object") {
      dispatch(setFilterBuilderExtraData(structuredClone(ex)));
    }
  };

useEffect(()=>{
  if(filterStatus === 'true'){
    setArrowCollapse(true);
  }
},[filterStatus])  
  useEffect(() => {
    setCheckDisable(filterStatus === "false" ? false : true);
  }, [filterStatus]);
  const handleDisable = (value) => {
    setCheckDisable(value);
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.filter_layout_data) nextBuilder.filter_layout_data = {};
      if (!nextBuilder.filter_layout_data.extra_data) {
        nextBuilder.filter_layout_data.extra_data = {};
      }
      nextBuilder.filter_layout_data.extra_data.filter_type = value ? "true" : "false";
    });
  };
  const handelArrowClick =(checked)=>{
    setArrowCollapse((checked) => !checked);
  };

  const postExtraData = resolvePostExtraDataFromBuilderData(props.mainBuilderData);

  const handleBack = () => {
    props.setSelectType("");
    props.setCurrStep("0");
  };

  const handleNext = () => {
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.filter_layout_data) {
        nextBuilder.filter_layout_data = {};
      }
      if (!nextBuilder.filter_layout_data.breadcrumb_data) {
        nextBuilder.filter_layout_data.breadcrumb_data = {};
      }
      nextBuilder.filter_layout_data.breadcrumb_data.select_builder = "true";
    });

    if (postExtraData?.layout_source === "caf_builder") {
      props.setSelectType("post");
      props.setCurrStep("2");
    } else {
      // Other (Elementor / Main Query): no CAF Layout Settings step.
      props.setCurrStep("0");
      props.setSelectType("");
    }
  };

  const queryOnlyFooter = (
    <div className="caf-builder-mainarea-footer-bar caf-layout-filter-query-footer">
      <div className="manage-footer-bar">
        <div className="caf-builder-footer-back-btn" onClick={handleBack}>
          Back
        </div>
        <div className="caf-builder-footer-center-box caf-layout-filter-query-footer-spacer" />
        <div className="caf-builder-footer-next-btn" onClick={handleNext}>
          Next
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="caf-layout-filter-container">
        <div className="caf-layout-filter-with-query-section">
        <div className={`caf-layout-filter-with-query-enable ${arrowCollapse === true ? "hide":""}`}>
          <div className="caf-layout-filter-with-query-enable-inner-left">
          <label>Query Only</label>
          <div className="caf-desc">No filter UI</div>
          </div>
          <Switch
            // checkedChildren="Enable"
            // unCheckedChildren="Disable"
            onChange={handleDisable}
            checked={checkDisable}
            className="caf-layout-filter-with-query-btn"
          />
          <div className="caf-layout-filter-with-query-enable-inner-right">
          <label>Design Filters</label>
          <div className="caf-desc">Add filter options</div>
          </div>
        </div>
        <div
          className={`caf-collapse-filter-arrow-btn ${arrowCollapse === true ? "hide":""}`}
          style={{
            position: "absolute",
            top: arrowCollapse === true ? "0" : "70px",
            left: "50%",
            zIndex: 99999,
            cursor: "pointer",
            transition:"all 0.3s ease-in-out"
          }}
          onClick={handelArrowClick}
        >
        <img className="caf-collapse-filter-arrow-btn-icon" src={filterQueryArrow} alt="" />
          </div>
          </div>
        {!checkDisable ? (
          <div className="caf-layout-filter-query-only-wrapper">
            <FilterWithQuery
              mainBuilderData={props.mainBuilderData}
              updatedBuilderData={props.updatedBuilderData}
            />
            {queryOnlyFooter}
          </div>
        ) : (
          <FilterBuilderContainer
            mainBuilderData={props.mainBuilderData}
            updatedBuilderData={props.updatedBuilderData}
            previewState={props.previewState}
            previewVal={props.previewVal}
            setSelectType={props.setSelectType}
            setCurrStep={props.setCurrStep}
            selectType={props.selectType}
            currStep={props.currStep}
          />
        )}
      </div>
    </>
  );
}

export default FilterContainer;
