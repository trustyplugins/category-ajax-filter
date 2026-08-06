import React, { useState, useEffect, useMemo, useRef } from "react";
import { Alert, Select, Modal, Switch, Tooltip } from "antd";

import { useDispatch } from "react-redux";
import { globalFontFamilyTooltipContent } from "./constants/globalFontFamilyTooltip";
import apiClient from "../api/client";
import { apiEndpoints } from "../api/endpoints";
import {
  resolvePostTypeFromBuilderData,
  resolveSinglePostFromBuilderData,
  resolveGlobalFontFamilyFromBuilderData,
} from "./utils/builderDataAdapters";
import {
  getGlobalFontFamily,
  loadFontFamily,
  propagateGlobalFontInBuilder,
  syncCustomFontsMap,
} from "./utils/globalFontFamily";
import {
  CUSTOM_FONTS_UPDATED_EVENT,
  fetchCustomFonts,
} from "./utils/customFonts";
import { canUseFeature } from "../tier/capabilities";
import { TierLockedSection } from "../tier/TierLockedSection";
import {
  setPostData,
  setSelectedPostId,
  setValue,
} from "../store/builderSlice";
import { setUpdatedInitialData, setExtraData as setFilterBuilderExtraData } from "../store/filterBuilderSlice";

const isBuilderBoolSetting = (raw, defaultValue = false) => {
  if (raw === undefined || raw === null || raw === "") {
    return defaultValue;
  }
  if (raw === true || raw === 1) {
    return true;
  }
  if (raw === false || raw === 0) {
    return false;
  }
  const normalized = String(raw).trim().toLowerCase();
  if (["1", "true", "yes", "on", "enable"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off", "disable"].includes(normalized)) {
    return false;
  }
  return defaultValue;
};

const parseBuilderApiPayload = (data) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
  return data;
};

const MiscSettingDrawer = (props) => {
  const dispatch = useDispatch();
  const mainBuilderDataRef = useRef(props.mainBuilderData);

  useEffect(() => {
    mainBuilderDataRef.current = props.mainBuilderData;
  }, [props.mainBuilderData]);
  const canUseAnalytics = canUseFeature("analytics");
  const canUseFilterUrl = canUseFeature("filter_url");
  const canUseSchema = canUseFeature("schema");
  const canUseCustomFonts = canUseFeature("custom_fonts");
  const canUseDynamicTermCounts = canUseFeature("dynamic_term_counts");
  const singlePostData = resolveSinglePostFromBuilderData(props.mainBuilderData);
  const [changePostType, setChangePostType] = useState(false);

  const [postTypesList, setPostTypesList] = useState([
    { label: "Select Post Type", value: "0" },
  ]);
  const [postTypesLoaded, setPostTypesLoaded] = useState(false);

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
  const [customFonts, setCustomFonts] = useState([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [globalFontFamily, setGlobalFontFamily] = useState(() =>
    resolveGlobalFontFamilyFromBuilderData(props.mainBuilderData)
  );

  const rawAnalyticsEnabled = props.mainBuilderData?.common_data?.analytics_enabled;
  const analyticsEnabled =
    canUseAnalytics &&
    (rawAnalyticsEnabled === true ||
      rawAnalyticsEnabled === 1 ||
      String(rawAnalyticsEnabled).toLowerCase() === "true" ||
      String(rawAnalyticsEnabled).toLowerCase() === "yes" ||
      rawAnalyticsEnabled === "Enable");

  const filterUrlEnabled =
    canUseFilterUrl &&
    isBuilderBoolSetting(
      props.mainBuilderData?.common_data?.filter_url_enabled,
      true
    );
  const schemaEnabled =
    canUseSchema &&
    isBuilderBoolSetting(
      props.mainBuilderData?.common_data?.schema_enabled,
      true
    );
  const dynamicTermCountsEnabled =
    canUseDynamicTermCounts &&
    isBuilderBoolSetting(
      props.mainBuilderData?.filter_layout_data?.extra_data?.dynamic_term_counts,
      false
    );

  const commitBuilderPatch = (mutator) => {
    const newBuilder = structuredClone(mainBuilderDataRef.current || {});
    if (!newBuilder.common_data) {
      newBuilder.common_data = {};
    }
    if (!newBuilder.post_layout_data) {
      newBuilder.post_layout_data = {};
    }
    if (!newBuilder.post_layout_data.extra_data) {
      newBuilder.post_layout_data.extra_data = {};
    }
    if (!newBuilder.filter_layout_data) {
      newBuilder.filter_layout_data = {};
    }
    if (!newBuilder.filter_layout_data.filter_query_data) {
      newBuilder.filter_layout_data.filter_query_data = {};
    }
    if (!newBuilder.filter_layout_data.extra_data) {
      newBuilder.filter_layout_data.extra_data = {};
    }
    if (!Array.isArray(newBuilder.filter_layout_data.initial_data)) {
      newBuilder.filter_layout_data.initial_data = [];
    }
    mutator(newBuilder);
    props.updatedBuilderData(newBuilder);
    mainBuilderDataRef.current = newBuilder;
    return newBuilder;
  };

  const loadFontOptions = async () => {
    setFontsLoading(true);
    try {
      const siteUrl = tc_caf_ajax.plugin_path || "";
      const fontsUrl = `${siteUrl}admin/google-fonts.json`;
      const [googleResponse, uploadedFonts] = await Promise.all([
        fetch(fontsUrl, { credentials: "same-origin", cache: "no-store" }).then(
          (response) => {
            if (!response.ok) {
              throw new Error(`Failed to load fonts (${response.status})`);
            }
            return response.json();
          }
        ),
        canUseCustomFonts
          ? fetchCustomFonts().catch(() => [])
          : Promise.resolve([]),
      ]);

      if (googleResponse?.items) {
        setGoogleFontOptions(
          googleResponse.items.map((item) => ({
            label: item.family,
            value: item.family,
          }))
        );
      }

      setCustomFonts(uploadedFonts);
      syncCustomFontsMap(uploadedFonts);
    } catch (error) {
      console.error("Error fetching font families:", error);
    } finally {
      setFontsLoading(false);
    }
  };

  const fontFamilyOptions = useMemo(() => {
    const groups = [];
    if (customFonts.length) {
      groups.push({
        label: "Custom Fonts",
        options: customFonts.map((font) => ({
          label: font.family,
          value: font.family,
        })),
      });
    }
    if (googleFontOptions.length) {
      groups.push({
        label: "Google Fonts",
        options: googleFontOptions,
      });
    }
    return groups;
  }, [customFonts, googleFontOptions]);

  const getPostTypes = async () => {
    try {
      const endpoint = apiEndpoints.getPostTypesForLayout
        ? apiEndpoints.getPostTypesForLayout(postType)
        : apiEndpoints.getPostTypes;
      const { data } = await apiClient.get(endpoint);
      const payload = parseBuilderApiPayload(data);

      if (payload?.status === "success") {
        setPostTypesList(payload.post_types || []);
        setPostTypesLoaded(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const postTypeUnavailable = useMemo(() => {
    if (!postType || postType === "0" || !postTypesLoaded) {
      return false;
    }
    const match = postTypesList.find((option) => option?.value === postType);
    if (!match) {
      return true;
    }
    return Boolean(match.unavailable || match.disabled);
  }, [postType, postTypesList, postTypesLoaded]);

  const postTypeUnavailableMessage = useMemo(() => {
    if (!postTypeUnavailable) {
      return "";
    }
    if (postType === "product") {
      return "This layout uses Products, but WooCommerce is not active. Activate WooCommerce or change the post type below.";
    }
    return `Post type "${postType}" is not registered on this site. Activate the plugin that provides it, or change the post type below.`;
  }, [postType, postTypeUnavailable]);

  const getPostsList = async () => {
    if (!postType || postType === "0" || postTypeUnavailable) {
      setPostsData([]);
      setPostsList([{ label: "Select Single Post ", value: "0" }]);
      return;
    }

    try {
      const { data } = await apiClient.get(apiEndpoints.getPostsList(postType));
      const payload = parseBuilderApiPayload(data);

      if (payload?.status === "success") {
        const safePostsList = Array.isArray(payload.posts_list) ? payload.posts_list : [];
        setPostsData(safePostsList);
        
        const newArray = safePostsList?.map((item) => ({
          label: item.label,
          value: item.value,
        }));

        setPostsList(newArray);

        const selectedPost = newArray?.find(
          (item) =>
            item.value ===
          resolveSinglePostFromBuilderData(props.mainBuilderData)?.value
        );
        
        const newPostId = changePostType === true ? newArray?.[0]?.value : selectedPost?.value || 0;
        //const newPostId = newArray?.[0]?.value || 0;
        setSinglePostType(newPostId);
        const obj = safePostsList?.find((ele) => ele.value === newPostId) || {};
        const currentSingle = resolveSinglePostFromBuilderData(props.mainBuilderData);
        const currentSingleId = String(
          currentSingle?.value ?? currentSingle?.id ?? ""
        );
        const shouldCommitSinglePost =
          changePostType ||
          currentSingleId !== String(newPostId ?? "") ||
          JSON.stringify(currentSingle || {}) !== JSON.stringify(obj || {});
        if (shouldCommitSinglePost) {
          commitBuilderPatch((newBuilder) => {
            newBuilder.post_layout_data.extra_data.single_post_data = obj;
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadFontOptions();
  }, []);

  useEffect(() => {
    getPostTypes();
  }, [postType]);

  useEffect(() => {
    const handleCustomFontsUpdated = (event) => {
      const fonts = Array.isArray(event?.detail?.fonts) ? event.detail.fonts : [];
      setCustomFonts(fonts);
      syncCustomFontsMap(fonts);
    };

    window.addEventListener(CUSTOM_FONTS_UPDATED_EVENT, handleCustomFontsUpdated);
    return () => {
      window.removeEventListener(CUSTOM_FONTS_UPDATED_EVENT, handleCustomFontsUpdated);
    };
  }, []);

  useEffect(() => {
    getPostsList();
  }, [postType, postTypeUnavailable]);

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

  const handlePostTypeChange = (value) => {
    setIsModalOpen(true);
    setPost(value);

  };

  const handlePostChange = (value) => {
    setSinglePostType(value);
    setChangePostType(false);
    const obj = postsData.find((ele) => ele.value === value) || {};
    commitBuilderPatch((newBuilder) => {
      newBuilder.post_layout_data.extra_data.single_post_data = obj;
    });
  };

  const handlePostChangeConfirm = () => {
    const newBuilder = commitBuilderPatch((newBuilderState) => {
      newBuilderState.common_data.post_type = post;
      newBuilderState.post_layout_data.extra_data.single_post_data = {};
      newBuilderState.post_layout_data.extra_data.post_type = post;

      newBuilderState.filter_layout_data.filter_query_data = {
        ...newBuilderState.filter_layout_data.filter_query_data,
        taxonomy_data: [],
        predefined_terms: [],
        cf_predefined_terms: [],
        data_source: {
          ...newBuilderState.filter_layout_data.filter_query_data.data_source,
          custom_field: "false",
        },
        custom_field_data: [],
      };

      newBuilderState.filter_layout_data.initial_data.forEach((row) => {
        row.data?.forEach((col) => {
          col.data?.forEach((item) => {
            if (!item.settings || typeof item.settings !== "object") {
              item.settings = {};
            }
            const settings = item.settings;

            settings.taxonomy_data = [];
            settings.predefined_terms = [];
            settings.cf_predefined_terms = [];
            settings.post_type = post;
            settings.custom_field_data = [];
          });
        });
      });

      const clearBackgroundImage = (element) => {
        if (element?.settings?.background_image === "post-img") {
          element.settings.background_image = "";

          if (element.style) {
            ["desktop", "tablet", "mobile"].forEach((device) => {
              if (element.style?.[device]) {
                ["default", "hover"].forEach((state) => {
                  if (element.style?.[device]?.[state]) {
                    element.style[device][state].backgroundImage = "";
                  }
                });
              }
            });
          }
        }
      };

      newBuilderState.post_layout_data.initial_data?.forEach((row) => {
        clearBackgroundImage(row);
        row.data?.forEach((col) => {
          clearBackgroundImage(col);
          col.data?.forEach((item) => {
            clearBackgroundImage(item);
            if (item?.key === "categories") {
              if (!item.settings || typeof item.settings !== "object") {
                item.settings = {};
              }
              const settings = item.settings;
              settings.categories = "0";
            }
          });
        });
      });
    });

    dispatch(setValue(post));
    dispatch(setPostData({}));
    dispatch(setSelectedPostId(""));
    const resetFilterRows = newBuilder?.filter_layout_data?.initial_data;
    if (Array.isArray(resetFilterRows)) {
      dispatch(setUpdatedInitialData(structuredClone(resetFilterRows)));
    }

    setPostType(post);
    setPostsList([{ label: "Select Single Post ", value: "0" }]);
    setSinglePostType("0");
    setIsModalOpen(false);
    setChangePostType(true);
  };

  const handlePostChangeCancel = () => {
    setIsModalOpen(false);
  };

  const handleGlobalFontChange = (value) => {
    const oldFont = getGlobalFontFamily(props.mainBuilderData);
    const newBuilder = commitBuilderPatch((builderState) => {
      builderState.common_data.global_font_family = value;
      propagateGlobalFontInBuilder(builderState, value, oldFont);
    });
    setGlobalFontFamily(value);
    loadFontFamily(value);
    const resetFilterRows = newBuilder?.filter_layout_data?.initial_data;
    if (Array.isArray(resetFilterRows)) {
      dispatch(setUpdatedInitialData(structuredClone(resetFilterRows)));
    }
  };

  const renderToggleField = (
    title,
    description,
    checked,
    onChange,
    disabled = false
  ) => (
    <div className="caf-main-setting-page data-field caf-main-setting-toggle-field">
      <div className="module-content-tab-row caf-design-two-half caf-main-setting-toggle-row">
        {description ? (
          <Tooltip
            classNames={{ root: "caf-builder-tooltip" }}
            placement="topLeft"
            title={description}
          >
            <label className="caf-main-setting-page label">{title}</label>
          </Tooltip>
        ) : (
          <label className="caf-main-setting-page label">{title}</label>
        )}
        <Switch checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );

  return (
    <>
      <Modal
        open={isModalOpen}
        onOk={handlePostChangeConfirm}
        onCancel={handlePostChangeCancel}
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
                {postTypeUnavailable ? (
                  <Alert
                    type="warning"
                    showIcon
                    className="caf-builder-missing-post-type-alert"
                    style={{ marginBottom: 16 }}
                    message="Post type unavailable"
                    description={postTypeUnavailableMessage}
                  />
                ) : null}
                <div className="caf-main-setting-page data-field">
                  <label className="caf-main-setting-page label">Change Post Type</label>
                  <Select
                    style={{ width: "100%" }}
                    onChange={handlePostTypeChange}
                    options={postTypesList}
                    value={postType}
                  />
                </div>

                <div className="caf-main-setting-page data-field">
                  <label className="caf-main-setting-page label">Preview Post</label>
                  <Select
                    style={{ width: "100%" }}
                    onChange={handlePostChange}
                    options={postsList}
                    value={singlePostType}
                  />
                </div>

                <div className="caf-main-setting-page data-field">
                  <Tooltip
                    classNames={{ root: "caf-builder-tooltip" }}
                    placement="topLeft"
                    title={globalFontFamilyTooltipContent}
                  >
                    <label className="caf-main-setting-page label">Global Font Family</label>
                  </Tooltip>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    style={{ width: "100%" }}
                    onChange={handleGlobalFontChange}
                    options={fontFamilyOptions}
                    value={globalFontFamily}
                    loading={fontsLoading}
                    placeholder={fontsLoading ? "Loading fonts..." : "Select font family"}
                  />
                </div>
              </div>
            </section>

            <TierLockedSection
              locked={!canUseAnalytics}
              sectionTitle="Analytics"
              className="caf-builder-tier-locked-section--misc-analytics"
              upgradeMessage="Analytics is available in Category Ajax Filter Pro."
            >
              {renderToggleField(
                "Enable",
                "Record interactions for Analytics. Off until you enable and save the layout.",
                canUseAnalytics ? analyticsEnabled : false,
                (checked) => {
                  commitBuilderPatch((newBuilder) => {
                    newBuilder.common_data.analytics_enabled = checked;
                  });
                },
                !canUseAnalytics
              )}
            </TierLockedSection>

            <TierLockedSection
              locked={!canUseFilterUrl || !canUseSchema}
              sectionTitle="SEO"
              className="caf-builder-tier-locked-section--misc-seo"
              upgradeMessage="SEO settings are available in Category Ajax Filter Pro."
            >
              {renderToggleField(
                "Filter with URL",
                "When on: update the browser address bar with shareable filter links (same as CAF post grids). When off: filters still work via AJAX without changing the URL bar.",
                canUseFilterUrl ? filterUrlEnabled : false,
                (checked) => {
                  commitBuilderPatch((newBuilder) => {
                    newBuilder.common_data.filter_url_enabled = checked;
                  });
                },
                !canUseFilterUrl
              )}

              {renderToggleField(
                "Schema",
                "Output ItemList JSON-LD for the filtered post list (updates on AJAX filter).",
                canUseSchema ? schemaEnabled : false,
                (checked) => {
                  commitBuilderPatch((newBuilder) => {
                    newBuilder.common_data.schema_enabled = checked;
                  });
                },
                !canUseSchema
              )}
            </TierLockedSection>

            <TierLockedSection
              locked={!canUseDynamicTermCounts}
              sectionTitle="Misc"
              className="caf-builder-tier-locked-section--misc-dtc"
              upgradeMessage="Dynamic term counts are available in Category Ajax Filter Pro."
            >
              {renderToggleField(
                "Dynamic term counts",
                "Term counts always reflect the live layout query. Enable this to also update counts as visitors select filters, and to disable terms with no matching results.",
                canUseDynamicTermCounts ? dynamicTermCountsEnabled : false,
                (checked) => {
                  if (!canUseDynamicTermCounts) {
                    return;
                  }
                  const newBuilder = commitBuilderPatch((builderState) => {
                    builderState.filter_layout_data.extra_data.dynamic_term_counts =
                      checked ? "true" : "false";
                  });
                  const extra = newBuilder?.filter_layout_data?.extra_data;
                  if (extra && typeof extra === "object") {
                    dispatch(
                      setFilterBuilderExtraData(structuredClone(extra)),
                    );
                  }
                },
                !canUseDynamicTermCounts,
              )}
            </TierLockedSection>
          </div>
        </div>
      </div>
    </>
  );
};

export default MiscSettingDrawer;
