import React, { useState, useEffect } from "react";
import { Modal, Button, Select, message } from "antd";
import BuilderCafLogoFirstScreenIcon from "./BuilderCafLogoFirstScreenIcon";
import BuilderImageFirstScreenIcon from "./BuilderImageFirstScreenIcon";
import BuilderPreBuiltPanelIcon from "./BuilderPreBuiltPanelIcon";
import BuilderCafBuilderPanelIcon from "./BuilderCafBuilderPanelIcon";
import selectIcon from "./images/selected-icon.png";
import { RightOutlined } from "@ant-design/icons";
import apiClient from "../api/client";
import { apiEndpoints } from "../api/endpoints";
import { stampLayoutSchemaVersion } from "../layoutSchema/stampLayoutSchemaVersion";

const AddNewPage = (props) => {
  const site_url = tc_caf_ajax.site_base_url;

  const [postTypesList, setPostTypesList] = useState([
    { label: "Select Post Type", value: "0" },
  ]);

  const [postType, setPostType] = useState("0");
  const [layoutType, setLayoutType] = useState("2");
  const [layoutName, setLayoutName] = useState("");
  const [mainBuilderData, setMainBuilderData] = useState(props.mainBuilderData);
  const [errorMsg, setErrorMsg] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);

  useEffect(() => {
    getPostTypes();
  }, []);

  useEffect(() => {
    setMainBuilderData(props.mainBuilderData);
  }, [props.mainBuilderData]);

  useEffect(() => {
    if (layoutName.trim() !== "" && postType !== "0") {
      setErrorMsg(false);
    }
  }, [layoutName, postType]);
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.common_data) {
      nextBuilder.common_data = {};
    }
    if (!nextBuilder.post_layout_data) {
      nextBuilder.post_layout_data = {};
    }
    if (!nextBuilder.post_layout_data.extra_data) {
      nextBuilder.post_layout_data.extra_data = {};
    }
    mutator(nextBuilder);
    setMainBuilderData(nextBuilder);
    props.updatedBuilderData(nextBuilder);
  };

  const handleCancel = () => {
    props.pagePopupState(false);
  };

  const handleNext = () => {
    props.pagePopupState(false);
  };

  const handlePostTypeChange = (value) => {
    setPostType(value);
  };

  const getPostTypes = async () => {
    try {
      const { data } = await apiClient.get(apiEndpoints.getPostTypes);

      if (data?.status === "success") {
        setPostTypesList(data.post_types || []);
      } else {
        setPostTypesList([]);
      }
    } catch (error) {
      console.error(error);
      setPostTypesList([]);
    }
  };

  const getPostsList = async () => {
    try {
      const { data } = await apiClient.get(apiEndpoints.getPostsList(postType));
      return data;
    } catch (error) {
      console.error(error);
      return {};
    }
  };

  const openDraftSavedMessage = () => {
    message.success("Layout saved as draft.");
  };

  const handleLayout = (val) => {
    setLayoutType(val);
  };

  const handleSelectLayout = async () => {
    const isValid =
      layoutName.trim() !== "" &&
      postType !== "0" &&
      layoutType !== "0";

    if (!isValid) {
      setErrorMsg(true);
      return;
    }

    setNextLoading(true);

    try {
      const trimLayoutName = layoutName.trim().replace(/\s+/g, " ");

      if (layoutType === "1") {
        window.location.href =
          site_url +
          "/wp-admin/post-new.php?post_type=caf_posts&layout-label=" +
          encodeURIComponent(trimLayoutName) +
          "&tc-post-type=" +
          encodeURIComponent(postType);
        return;
      }

      if (layoutType === "2") {
        const postsRes = await getPostsList();
        const firstPost = postsRes?.posts_list?.[0] || {};

        const alldata = { ...mainBuilderData };
        alldata.common_data.layout_name = trimLayoutName;
        alldata.common_data.post_type = postType;
        alldata.post_layout_data.extra_data.single_post_data = firstPost;

        stampLayoutSchemaVersion(alldata);

        const postedData = {
          layout_data: JSON.stringify(alldata),
        };

        const response = await apiClient.post(
          apiEndpoints.saveBuilderLayout,
          postedData
        );

        if (response?.data?.status === "success") {
          commitBuilderPatch((nextBuilder) => {
            nextBuilder.common_data.layout_key = response.data.layout_key;
            nextBuilder.common_data.layout_index = response.data.layout_index;
            nextBuilder.common_data.layout_name = trimLayoutName;
            nextBuilder.common_data.post_type = postType;
            nextBuilder.post_layout_data.extra_data.single_post_data = firstPost;
          });
          openDraftSavedMessage();
          props.pagePopupState(false);
          props.handleLayoutContainer(true);
        } else {
          alert(response?.data?.message || "Something went wrong");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setNextLoading(false);
    }
  };

  const handleLayoutLabel = (val) => {
    setLayoutName(val);
  };

  return (
    <Modal
      open={true}
      onOk={handleNext}
      onCancel={handleCancel}
      footer={null}
      className="caf-add-new-page-popup-container caf-builder-modal"
    >
      <div className="caf-add-new-page-popup-content-main">
        <div className="caf-add-new-page-popup-content">
          <div className="caf-add-new-page-popup-image-section">
            <div className="logo">
              <BuilderCafLogoFirstScreenIcon className="caf-add-new-logo" alt="CAF Logo" />
            </div>
            <div className="welcome-img">
              <BuilderImageFirstScreenIcon className="caf-add-new-welcome-image" alt="Welcome illustration" />
            </div>
          </div>

          <div className="caf-add-new-page-popup-form-section">

            <div className="caf-add-new-form-wrapper">
            <div className="caf-heading">
              <h1>
              Create New Filter
              </h1>
              <span className="caf-description">
              Enter a name, choose post type and select how you want to build your layout.
              </span>
            </div>

            <div className="caf-form-section">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter Name"
                value={layoutName}
                onChange={(e) => handleLayoutLabel(e.target.value)}
              />
              <div className="caf-error-msg">
                {errorMsg && layoutName.trim() === "" && <>Please enter a layout name</>}
              </div>
            </div>

            <div className="caf-form-section">
              <label>Post Type</label>
              <Select
                defaultValue={postType}
                style={{ width: "100%" }}
                onChange={handlePostTypeChange}
                options={[...postTypesList]}
                value={postType}
              />
              <div className="caf-error-msg">
                {errorMsg && postType === "0" && <>Please select post type</>}
              </div>
            </div>

            <div className="caf-filter-selections">
              <div
                onClick={() => handleLayout("1")}
                className={`caf-filter-selection ${
                  layoutType === "1" ? "active" : ""
                }`}
              >
                <BuilderPreBuiltPanelIcon className="gp-img" alt="Pre-Built Panel" />
                <div className="caf-filter-selection-right">
                  <h5>Pre-Built Panel</h5>
                  <span>Old Panel</span>
                </div>

                {layoutType === "1" && (
                  <span className="radio-btn">
                    <img
                      className="radio-btn-img"
                      src={selectIcon}
                      alt="caf-img"
                    />
                  </span>
                )}
              </div>

              <div
                onClick={() => handleLayout("2")}
                className={`caf-filter-selection ${
                  layoutType === "2" ? "active" : ""
                }`}
              >
                <BuilderCafBuilderPanelIcon className="cyf-img" alt="CAF Builder Panel" />
                <div className="caf-filter-selection-right">
                  <h5>With Builder</h5>
                  <span>Drag and Drop</span>
                </div>

                {layoutType === "2" && (
                  <span className="radio-btn">
                    <img
                      className="radio-btn-img"
                      src={selectIcon}
                      alt="caf-img"
                    />
                  </span>
                )}
              </div>
            </div>

            <div className="select-layout-btn caf-filter-create-btn">
              <Button
                type="primary"
                size="large"
                onClick={handleSelectLayout}
                loading={nextLoading}
                title="Next"
              >
               Create
              </Button>
            </div>
</div>

          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddNewPage;