import React, { useEffect, useMemo, useState } from "react";
import { Modal, Select, Switch, Tooltip } from "antd";
import { useDispatch } from "react-redux";
import { globalFontFamilyTooltipContent } from "./constants/globalFontFamilyTooltip";
import apiClient from "../api/client";
import { apiEndpoints } from "../api/endpoints";
import {
  resolveGlobalFontFamilyFromBuilderData,
  resolvePostTypeFromBuilderData,
  resolveSinglePostFromBuilderData,
} from "./utils/builderDataAdapters";
import {
  getGlobalFontFamily,
  loadFontFamily,
  propagateGlobalFontInBuilder,
} from "./utils/globalFontFamily";
import { TierLockedSection } from "../tier/TierLockedSection";
import {
  setPostData,
  setSelectedPostId,
  setValue,
} from "../store/builderSlice";
import { setUpdatedInitialData } from "../store/filterBuilderSlice";

const parseBuilderApiPayload = (data) => {
  if (typeof data !== "string") return data;

  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

const MiscSettingDrawer = (props) => {
  const dispatch = useDispatch();
  const singlePostData = resolveSinglePostFromBuilderData(props.mainBuilderData);
  const [changePostType, setChangePostType] = useState(false);
  const [postTypesList, setPostTypesList] = useState([
    { label: "Select Post Type", value: "0" },
  ]);
  const [postsList, setPostsList] = useState([
    { label: "Select Single Post ", value: "0" },
  ]);
  const [postsData, setPostsData] = useState([]);
  const [postType, setPostType] = useState(
    resolvePostTypeFromBuilderData(props.mainBuilderData)
  );
  const [singlePostType, setSinglePostType] = useState(
    singlePostData?.value ?? "0"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [post, setPost] = useState("");
  const [googleFontOptions, setGoogleFontOptions] = useState([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [globalFontFamily, setGlobalFontFamily] = useState(() =>
    resolveGlobalFontFamilyFromBuilderData(props.mainBuilderData)
  );

  const commitBuilderPatch = (mutator) => {
    const newBuilder = structuredClone(props.mainBuilderData || {});
    newBuilder.common_data ||= {};
    newBuilder.post_layout_data ||= {};
    newBuilder.post_layout_data.extra_data ||= {};
    newBuilder.filter_layout_data ||= {};
    newBuilder.filter_layout_data.filter_query_data ||= {};
    newBuilder.filter_layout_data.extra_data ||= {};
    newBuilder.filter_layout_data.initial_data ||= [];
    mutator(newBuilder);
    props.updatedBuilderData(newBuilder);
    return newBuilder;
  };

  const loadFontOptions = async () => {
    setFontsLoading(true);
    try {
      const fontsUrl = `${tc_caf_ajax.plugin_path || ""}admin/google-fonts.json`;
      const response = await fetch(fontsUrl, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to load fonts (${response.status})`);
      }
      const googleResponse = await response.json();
      setGoogleFontOptions(
        (googleResponse?.items || []).map((item) => ({
          label: item.family,
          value: item.family,
        }))
      );
    } catch (error) {
      console.error("Error fetching font families:", error);
    } finally {
      setFontsLoading(false);
    }
  };

  const getPostTypes = async () => {
    try {
      const { data } = await apiClient.get(apiEndpoints.getPostTypes);
      const payload = parseBuilderApiPayload(data);
      if (payload?.status === "success") {
        setPostTypesList(payload.post_types || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getPostsList = async () => {
    if (!postType || postType === "0") {
      setPostsData([]);
      setPostsList([{ label: "Select Single Post ", value: "0" }]);
      return;
    }

    try {
      const { data } = await apiClient.get(apiEndpoints.getPostsList(postType));
      const payload = parseBuilderApiPayload(data);
      if (payload?.status !== "success") return;

      const safePostsList = Array.isArray(payload.posts_list)
        ? payload.posts_list
        : [];
      const nextPostsList = safePostsList.map((item) => ({
        label: item.label,
        value: item.value,
      }));
      const selectedPost = nextPostsList.find(
        (item) =>
          item.value ===
          resolveSinglePostFromBuilderData(props.mainBuilderData)?.value
      );
      const newPostId = changePostType
        ? nextPostsList?.[0]?.value
        : selectedPost?.value || 0;

      setPostsData(safePostsList);
      setPostsList(nextPostsList);
      setSinglePostType(newPostId);
      commitBuilderPatch((newBuilder) => {
        newBuilder.post_layout_data.extra_data.single_post_data =
          safePostsList.find((item) => item.value === newPostId) || {};
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPostTypes();
    loadFontOptions();
  }, []);

  useEffect(() => {
    getPostsList();
  }, [postType]);

  useEffect(() => {
    setPostType(resolvePostTypeFromBuilderData(props.mainBuilderData));
    setSinglePostType(
      resolveSinglePostFromBuilderData(props.mainBuilderData)?.value ?? "0"
    );
    const nextGlobalFont = resolveGlobalFontFamilyFromBuilderData(
      props.mainBuilderData
    );
    setGlobalFontFamily(nextGlobalFont);
    loadFontFamily(nextGlobalFont);
  }, [props.mainBuilderData]);

  const fontFamilyOptions = useMemo(
    () =>
      googleFontOptions.length
        ? [{ label: "Google Fonts", options: googleFontOptions }]
        : [],
    [googleFontOptions]
  );

  const handlePostTypeChange = (value) => {
    setIsModalOpen(true);
    setPost(value);
  };

  const handlePostChange = (value) => {
    setSinglePostType(value);
    setChangePostType(false);
    commitBuilderPatch((newBuilder) => {
      newBuilder.post_layout_data.extra_data.single_post_data =
        postsData.find((item) => item.value === value) || {};
    });
  };

  const handlePostChangeConfirm = () => {
    const newBuilder = commitBuilderPatch((builderState) => {
      builderState.common_data.post_type = post;
      builderState.post_layout_data.extra_data.single_post_data = {};
      builderState.post_layout_data.extra_data.post_type = post;
      builderState.filter_layout_data.filter_query_data = {
        ...builderState.filter_layout_data.filter_query_data,
        taxonomy_data: [],
        predefined_terms: [],
        cf_predefined_terms: [],
        data_source: {
          ...builderState.filter_layout_data.filter_query_data.data_source,
          custom_field: "false",
        },
        custom_field_data: [],
      };
      builderState.filter_layout_data.initial_data.forEach((row) => {
        row.data?.forEach((column) => {
          column.data?.forEach((item) => {
            item.settings ||= {};
            Object.assign(item.settings, {
              taxonomy_data: [],
              predefined_terms: [],
              cf_predefined_terms: [],
              post_type: post,
              custom_field_data: [],
            });
          });
        });
      });

      const clearBackgroundImage = (element) => {
        if (element?.settings?.background_image !== "post-img") return;

        element.settings.background_image = "";
        ["desktop", "tablet", "mobile"].forEach((device) => {
          ["default", "hover"].forEach((state) => {
            if (element.style?.[device]?.[state]) {
              element.style[device][state].backgroundImage = "";
            }
          });
        });
      };

      builderState.post_layout_data.initial_data?.forEach((row) => {
        clearBackgroundImage(row);
        row.data?.forEach((column) => {
          clearBackgroundImage(column);
          column.data?.forEach((item) => {
            clearBackgroundImage(item);
            if (item?.key === "categories") {
              item.settings ||= {};
              item.settings.categories = "0";
            }
          });
        });
      });
    });

    dispatch(setValue(post));
    dispatch(setPostData({}));
    dispatch(setSelectedPostId(""));
    if (Array.isArray(newBuilder?.filter_layout_data?.initial_data)) {
      dispatch(setUpdatedInitialData(structuredClone(newBuilder.filter_layout_data.initial_data)));
    }
    setPostType(post);
    setPostsList([{ label: "Select Single Post ", value: "0" }]);
    setSinglePostType("0");
    setIsModalOpen(false);
    setChangePostType(true);
  };

  const handleGlobalFontChange = (value) => {
    const oldFont = getGlobalFontFamily(props.mainBuilderData);
    const newBuilder = commitBuilderPatch((builderState) => {
      builderState.common_data.global_font_family = value;
      propagateGlobalFontInBuilder(builderState, value, oldFont);
    });
    setGlobalFontFamily(value);
    loadFontFamily(value);
    if (Array.isArray(newBuilder?.filter_layout_data?.initial_data)) {
      dispatch(setUpdatedInitialData(structuredClone(newBuilder.filter_layout_data.initial_data)));
    }
  };

  const renderToggleField = (title, description) => (
    <div className="caf-main-setting-page data-field caf-main-setting-toggle-field">
      <div className="module-content-tab-row caf-design-two-half caf-main-setting-toggle-row">
        <Tooltip
          classNames={{ root: "caf-builder-tooltip" }}
          placement="topLeft"
          title={description}
        >
          <label className="caf-main-setting-page label">{title}</label>
        </Tooltip>
        <Switch checked={false} onChange={() => {}} disabled />
      </div>
    </div>
  );

  return (
    <>
      <Modal
        open={isModalOpen}
        onOk={handlePostChangeConfirm}
        onCancel={() => setIsModalOpen(false)}
        className="caf-builder-post-type-change-modal caf-builder-modal"
      >
        <p>
          Taxonomy and Custom Field data will be deleted if post type change.
          <br />
          Are you sure you want to change the post type?
        </p>
      </Modal>
      <div className="caf-misc-setting-page-popup-container">
        <div className="caf-main-setting-page-popup-content">
          <div className="caf-main-setting-page-popup-form-section">
            <section className="caf-main-setting-section">
              <h3 className="caf-main-setting-section-title">General Settings</h3>
              <div className="caf-main-setting-section-body">
                <div className="caf-main-setting-page data-field">
                  <label className="caf-main-setting-page label">Change Post Type</label>
                  <Select style={{ width: "100%" }} onChange={handlePostTypeChange} options={postTypesList} value={postType} />
                </div>
                <div className="caf-main-setting-page data-field">
                  <label className="caf-main-setting-page label">Preview Post</label>
                  <Select style={{ width: "100%" }} onChange={handlePostChange} options={postsList} value={singlePostType} />
                </div>
                <div className="caf-main-setting-page data-field">
                  <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title={globalFontFamilyTooltipContent}>
                    <label className="caf-main-setting-page label">Global Font Family</label>
                  </Tooltip>
                  <Select showSearch optionFilterProp="label" style={{ width: "100%" }} onChange={handleGlobalFontChange} options={fontFamilyOptions} value={globalFontFamily} loading={fontsLoading} placeholder={fontsLoading ? "Loading fonts..." : "Select font family"} />
                </div>
              </div>
            </section>
            <TierLockedSection locked sectionTitle="Analytics" className="caf-builder-tier-locked-section--misc-analytics" upgradeMessage="Analytics is available in Category Ajax Filter Pro.">
              {renderToggleField("Enable", "Record interactions for Analytics. Off until you enable and save the layout.")}
            </TierLockedSection>
            <TierLockedSection locked sectionTitle="SEO" className="caf-builder-tier-locked-section--misc-seo" upgradeMessage="SEO settings are available in Category Ajax Filter Pro.">
              {renderToggleField("Filter with URL", "When on: update the browser address bar with shareable filter links (same as CAF post grids). When off: filters still work via AJAX without changing the URL bar.")}
              {renderToggleField("Schema", "Output ItemList JSON-LD for the filtered post list (updates on AJAX filter).")}
            </TierLockedSection>
            <TierLockedSection locked sectionTitle="Misc" className="caf-builder-tier-locked-section--misc-dtc" upgradeMessage="Dynamic term counts are available in Category Ajax Filter Pro.">
              {renderToggleField("Dynamic term counts", "Term counts always reflect the live layout query. Enable this to also update counts as visitors select filters, and to disable terms with no matching results.")}
            </TierLockedSection>
          </div>
        </div>
      </div>
    </>
  );
};

export default MiscSettingDrawer;
