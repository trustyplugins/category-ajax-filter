import React, { useEffect, useState } from "react";
import { Input, Switch, Select, Tooltip } from "antd";
import { useSelector } from "react-redux";
import apiClient from "../../../../../api/client";
import { apiEndpoints } from "../../../../../api/endpoints";
import {
  selectBuilderEffectivePostType,
} from "../../../../../store/selectors";
import { commitPostModuleSettingsPatch } from "./postLayoutSnapshot";

function ModuleCategoriesContent(props) {
  const builderPostData = props.postPreviewData || {};
  const builderPostType = useSelector(selectBuilderEffectivePostType);
  const taxo = builderPostData?.taxonomies;
  const { rowindex, columnindex, moduleindex } = props.indexes;
  const [resolvedTaxonomies, setResolvedTaxonomies] = useState([]);

  const modSettings =
    props.data[rowindex]?.data[columnindex]?.data[moduleindex]?.settings || {};
  const [selectedValue, setSelectedValue] = useState(modSettings?.categories || "0");
  const [termLimit, setTermLimit] = useState(modSettings?.limit ?? "3");
  const [separator, setSeparator] = useState(modSettings?.separator ?? "none");
  const [lastSeparator, setLastSeparator] = useState(
    modSettings?.last_separator ?? false,
  );
  const [link, setLink] = useState(modSettings?.link?.visibility ?? false);
  const [linkTarget, setLinkTarget] = useState(
    modSettings?.link?.target ?? "same-tab",
  );
  useEffect(() => {
    setSelectedValue(modSettings?.categories || "0");
    setTermLimit(modSettings?.limit ?? "3");
    setSeparator(modSettings?.separator ?? "none");
    setLastSeparator(modSettings?.last_separator ?? false);
    setLink(modSettings?.link?.visibility ?? false);
    setLinkTarget(modSettings?.link?.target ?? "same-tab");
  }, [props.data, rowindex, columnindex, moduleindex]);
  const hasTaxonomies = (value) =>
    (Array.isArray(value) && value.length > 0) ||
    (value && typeof value === "object" && Object.keys(value).length > 0);

  useEffect(() => {
    if (hasTaxonomies(taxo)) {
      setResolvedTaxonomies(taxo);
    }
  }, [taxo]);

  useEffect(() => {
    const hydrateTaxonomiesFromPostType = async () => {
      if (hasTaxonomies(taxo) || !builderPostType) {
        return;
      }
      try {
        const res = await apiClient.get(
          apiEndpoints.getTaxonomyRecursiveData(builderPostType),
        );
        if (res?.data?.status === "success" && Array.isArray(res?.data?.taxonomy_list)) {
          setResolvedTaxonomies(res.data.taxonomy_list);
        } else {
          setResolvedTaxonomies([]);
        }
      } catch (error) {
        setResolvedTaxonomies([]);
      }
    };
    hydrateTaxonomiesFromPostType();
  }, [builderPostType, taxo]);

  const normalizedTaxonomies = resolvedTaxonomies;

  const taxonomyOptions = (() => {
    if (Array.isArray(normalizedTaxonomies)) {
      return normalizedTaxonomies.map((entry, index) => {
        if (typeof entry === "string") {
          return { label: entry, value: entry };
        }
        if (entry?.key) {
          return {
            label: entry?.label || entry.key,
            value: entry.key,
          };
        }
        const label =
          entry?.label || entry?.name || entry?.slug || `Taxonomy ${index + 1}`;
        const value = entry?.name || entry?.slug || entry?.key || label;
        return { label, value };
      });
    }
    if (normalizedTaxonomies && typeof normalizedTaxonomies === "object") {
      return Object.entries(normalizedTaxonomies).map(([key, value]) => {
        if (typeof value === "string") {
          return { label: value, value: value || key };
        }
        return {
          label: value?.label || value?.name || key,
          value: value?.name || value?.slug || key,
        };
      });
    }
    return [];
  })();
  const handleChange = (value) => {
    setSelectedValue(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.categories = value;
      },
    });
  };
  const handleTermLimit = (value) => {
    setTermLimit(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.limit = parseInt(value, 10);
      },
    });
  };
  const handleChangeSeparator = (value) => {
    setSeparator(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.separator = value;
      },
    });
  };
  const handleChangeLastSeparator = (value) => {
    setLastSeparator(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.last_separator = value;
      },
    });
  };
  const handleChangeLink = (value) => {
    setLink(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.link = { ...(s.link || {}), visibility: value };
      },
    });
  };
  const handleLinkTarget = (value) => {
    setLinkTarget(value);
    commitPostModuleSettingsPatch({
      data: props.data,
      rowindex,
      columnindex,
      moduleindex,
      onSettingChange: props.onSettingChange,
      patch: (s) => {
        s.link = { ...(s.link || {}), target: value };
      },
    });
  };
  return (
    <>
      <div className="module-content-tab-row">
        <label className="setting-label-main">Data Source</label>
        <div className="module-content-cat-taxo module-content-tab-row caf-design-two-half">
          <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Select taxonomy to display.">
            <label style={{ display: "inherit" }}>Select Taxonomy</label>
          </Tooltip>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Taxonomy"
            value={selectedValue || "0"}
            onChange={handleChange}
            options={[
              {
                label: "Select Taxonomy", 
                value: "0", 
              },
              ...taxonomyOptions,
            ]}
          />
          {/* </Checkbox.Group> */}
        </div>
        <div className="setting-manage-f-label">
          <hr className="setting-hr-main"></hr>
          <label className="setting-label-main">Limit</label>
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Set number of terms to show.">
              <label>Enter Terms Limit</label>
            </Tooltip>
            <Input
              onChange={(e) => handleTermLimit(e.target.value)}
              value={termLimit}
              type="number"
            />
          </div>
        </div>
        <div className="setting-manage-f-label">
          <hr className="setting-hr-main"></hr>
          <label className="setting-label-main">Separator</label>
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose separator between terms.">
              <label>Select Separator</label>
            </Tooltip>
            <Select
              style={{ width: "100%" }}
              value={separator}
              onChange={handleChangeSeparator}
              options={[
                { label: "None", value: "none" },
                { label: "Comma (,)", value: "," },
              ]}
            />
          </div>
          {separator !== "none" && (
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enable separator before last item.">
                <label>Enable Last Item Separator</label>
              </Tooltip>
              <Switch
                onChange={handleChangeLastSeparator}
                checked={lastSeparator}
              />
            </div>
          )}
        </div>
        <div className="setting-manage-f-label">
          <hr className="setting-hr-main"></hr>
          <label className="setting-label-main">Term Link</label>
          <div className="module-content-tab-row caf-design-two-half">
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Enable or disable term links.">
              <label>Enable</label>
            </Tooltip>
            <Switch
              onChange={handleChangeLink}
              checked={link}
            />
          </div>
          {link && (
            <div className="module-content-tab-row caf-design-two-half">
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Choose where term links open.">
                <label>Open In</label>
              </Tooltip>
              <Select
                defaultValue="same-tab"
                style={{
                  width: "100%",
                }}
                onChange={handleLinkTarget}
                value={linkTarget}
                options={[
                  {
                    value: "same-tab",
                    label: "Same Window",
                  },
                  {
                    value: "new-tab",
                    label: "New Window",
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ModuleCategoriesContent;
