import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import filterImg from "../images/filter-start.png";
import BuilderBuildYourQueryIcon from "../BuilderBuildYourQueryIcon";
import warningIcon from "../images/caution-sign.svg";
import bubble from "../images/Bubble-lower.png";
import apiClient from "../../api/client";
import { apiEndpoints } from "../../api/endpoints";
import parse from "html-react-parser";
import { Select, Checkbox, Button, Skeleton, Input } from "antd";
// import { RightOutlined ,DownOutlined,UpOutlined} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import BuilderDeleteIcon from "../BuilderDeleteIcon";
import { PlusCircleOutlined ,PlusCircleFilled } from "@ant-design/icons";
import {
  resolvePostExtraDataFromBuilderData,
  resolvePostTypeFromBuilderData,
} from "../utils/builderDataAdapters";
import {
  selectBuilderEffectivePostType,
  selectBuilderPostPreviewData,
} from "../../store/selectors";
import { canUseFilterCustomField } from "./components/settingTabContent/ModuleContentData/shared/filterModuleTier";
import { getTaxonomyPickerSelectOptions } from "./components/settingTabContent/ModuleContentData/taxonomyPickerSections";
import { FilterQueryCustomFieldSource } from "./filterQueryCustomFieldSource";

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizeGroupedTaxonomyData = (value) => {
  const source = ensureArray(value);
  if (source.length === 0) return [];
  if (Array.isArray(source[0])) return source;
  return [source];
};

const normalizeGroupedCustomFieldData = (value) => {
  const source = ensureArray(value);
  if (source.length === 0) return [];
  if (Array.isArray(source[0])) return source;
  return [source];
};

const buildMetaKeyOptions = (metaFields) => {
  const options = [{ label: "Select Field", value: "0" }];
  if (!metaFields || typeof metaFields !== "object") {
    return options;
  }
  Object.keys(metaFields).forEach((fieldKey) => {
    options.push({ value: fieldKey, label: fieldKey });
  });
  return options;
};

const FilterWithQuery = (props) => {
  const resolvedPostExtraData = resolvePostExtraDataFromBuilderData(
    props.mainBuilderData
  );
  const builderPostPreviewData = useSelector(selectBuilderPostPreviewData);
  const effectiveSinglePostData =
    builderPostPreviewData && Object.keys(builderPostPreviewData || {}).length > 0
      ? builderPostPreviewData
      : resolvedPostExtraData.single_post_data || {};
  const reduxPostTypeSource = useSelector(selectBuilderEffectivePostType);

  const [firstRender, setFirstRender] = useState(true);
  const mainBuilderData = { ...props?.mainBuilderData };
  const builderResolvedPostType = resolvePostTypeFromBuilderData(mainBuilderData);
  const effectivePostType = builderResolvedPostType || reduxPostTypeSource || "post";
  let filter_layout_data = { ...mainBuilderData?.filter_layout_data };
  const initialtaxonomyData = normalizeGroupedTaxonomyData(
    filter_layout_data?.filter_query_data?.taxonomy_data
  );
  const [taxonomyData, setTaxonomyData] = useState(initialtaxonomyData);

  const initialCustomFieldData = normalizeGroupedCustomFieldData(
    filter_layout_data?.filter_query_data?.custom_field_data
  );

const meta_fields = effectiveSinglePostData?.meta_fields;
const fieldOptions = buildMetaKeyOptions(meta_fields);
  // const fieldOptions = [
  //   { label: "Select Custom Field", value: "0" }, 
  //   ...meta_fields.map((item) => ({
  //     label: item,
  //     value: item,
  //   })),
  // ];

  const [isLoading, setIsLoading] = useState(true);
  const [taxonomyList, setTaxonomyList] = useState([]);
  const [taxonomyListArray, setTaxonomyListArray] = useState([]);
  const taxonomyPickerSelectOptions = useMemo(() => {
    const list = Array.isArray(taxonomyListArray)
      ? taxonomyListArray.filter((item) => !item?.is_woo_virtual)
      : [];
    return getTaxonomyPickerSelectOptions(list);
  }, [taxonomyListArray]);
  const [updateData, setUpdateData] = useState(false);
  const [metaKeys, setMetaKeys] = useState(fieldOptions);

  const [checkDataSourceTaxonomy, setCheckDataSourceTaxonomy] = useState(
    filter_layout_data?.filter_query_data?.data_source?.taxonomy === "false"
      ? false
      : true,
  );
  const [checkDataSourceCustomField, setCheckDataSourceCustomField] = useState(
    () => {
      if (!canUseFilterCustomField()) {
        return false;
      }
      return filter_layout_data?.filter_query_data?.data_source?.custom_field ===
        "false"
        ? false
        : true;
    },
  );
  const [categoryRelation, setCategoryRelation] = useState(
    filter_layout_data?.filter_query_data?.category_relation,
  );
  const [metaRelation, setMetaRelation] = useState(
    filter_layout_data?.filter_query_data?.meta_relation,
  );
  const [taxonomyRelation, setTaxonomyRelation] = useState(
    filter_layout_data?.filter_query_data?.taxonomy_relation,
  );
  const [customFieldData, setCustomFieldData] = useState(initialCustomFieldData);
  const [orderByMeta, setOrderByMeta] = useState(
    filter_layout_data?.filter_query_data?.order_by_meta === "false"
      ? false
      : true,
  );
  const [orderByMetaKey, setOrderByMetaKey] = useState(
    filter_layout_data?.filter_query_data?.meta_key ?? "",
  );
  const [orderByMetaVal, setOrderByMetaVal] = useState(
    filter_layout_data?.filter_query_data?.meta_value ?? "",
  );
  const [expandedItems, setExpandedItems] = useState([]);
  const [expandedTaxoItems, setExpandedTaxoItems] = useState([]);
  const [openCfRows, setOpenCfRows] = useState({});
  const [openCfAdv, setOpenCfAdv] = useState({});
  const [openTaxoAdv, setOpenTaxoAdv] = useState({});

  //   useEffect(() => {
  //   const toExpand = [];
  //     console.log(taxonomyData);
  //   taxonomyData.forEach(taxo => {
  //     if (!Array.isArray(taxo.term_data)) return;

  //     taxo.term_data.forEach(term => {
  //       toExpand.push(term.key);
  //     });
  //   });
  //   console.log(toExpand)
  //   setExpandedItems(prev => [...prev, ...toExpand]); // existing expandedItems में merge
  // }, [taxonomyListArray]);

  // console.log(expandedItems);
  // console.log(firstRender.current)
  // useEffect(()=>{

  // },[])

  useEffect(() => {
    setMetaKeys(buildMetaKeyOptions(meta_fields));
  }, [meta_fields]);

  useEffect(() => {
    if (!canUseFilterCustomField()) {
      setCheckDataSourceCustomField(false);
      return;
    }

    setCheckDataSourceCustomField(
      filter_layout_data?.filter_query_data?.data_source
        ?.custom_field === "false"
        ? false
        : true,
    );
  }, [
    filter_layout_data?.filter_query_data?.data_source?.custom_field,
  ]);

  useEffect(() => {
    setTaxonomyData(
      normalizeGroupedTaxonomyData(filter_layout_data?.filter_query_data?.taxonomy_data),
    );
  }, [
    filter_layout_data?.filter_query_data?.taxonomy_data,
  ]);

  useEffect(() => {
    setCustomFieldData(
      normalizeGroupedCustomFieldData(filter_layout_data?.filter_query_data?.custom_field_data)
    );
  }, [filter_layout_data?.filter_query_data?.custom_field_data]);

  //   useEffect(() => {
  //     setIsLoading(true);
  //     const fetchData = async () => {
  //       try {
  //         const response = await apiClient.get(
  //           baseURL +
  //             "get-taxonomy/?post-type=" +
  //             mainBuilderData.common_data.post_type
  //         );
  //         if (response.data && response.data.status === "success") {
  //           //console.log(response.data);
  //           setTaxonomyList(response.data.taxonomy_list);
  //           // func();
  //           // TermChecked();
  //           TemrsRefresh();
  //           setIsLoading(true);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching data:", error.message);
  //         setIsLoading(false);
  //       }
  //     };
  //     fetchData();
  //   }, [mainBuilderData.common_data.post_type]);

  useEffect(() => {
    setFirstRender(true);
    setExpandedTaxoItems([]);
  }, [checkDataSourceTaxonomy]);

  useEffect(() => {
    const fetchTaxoData = async () => {
      try {
        const res = await apiClient.get(
          apiEndpoints.getTaxonomyRecursiveData(effectivePostType)
        );
        if (res.data && res.data.status === "success") {
          setTaxonomyListArray(res.data.taxonomy_list);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    if (effectivePostType) {
      //console.log(mainBuilderData?.common_data?.post_type)
      setIsLoading(true);
      fetchTaxoData();
    }
  }, [effectivePostType]);

  useEffect(() => {
    const nextBuilder = structuredClone(mainBuilderData || {});
    if (!nextBuilder.filter_layout_data) nextBuilder.filter_layout_data = {};
    const filterQuery =
      nextBuilder.filter_layout_data.filter_query_data ||
      (nextBuilder.filter_layout_data.filter_query_data = {});
    filterQuery.taxonomy_data = taxonomyData;
    props.updatedBuilderData(nextBuilder);
  }, [updateData]);

  const customFieldCompareOperators = [
    {
      label: "is Equal to",
      value: "=",
    },
    {
      label: "is Not Equal to",
      value: "!=",
    },
    {
      label: ">",
      value: ">",
    },
    {
      label: ">=",
      value: ">=",
    },
    {
      label: "<",
      value: "<",
    },
    {
      label: "<=",
      value: "<=",
    },
    // {
    //   label: "LIKE",
    //   value: "LIKE",
    // },
    // {
    //   label: "NOT LIKE",
    //   value: "NOT LIKE",
    // },
    // {
    //   label: "IN",
    //   value: "IN",
    // },
    // {
    //   label: "NOT IN",
    //   value: "NOT IN",
    // },
    // {
    //   label: "BETWEEN",
    //   value: "BETWEEN",
    // },
    // {
    //   label: "NOT BETWEEN",
    //   value: "NOT BETWEEN",
    // },
    // {
    //   label: "EXISTS",
    //   value: "EXISTS",
    // },
    // {
    //   label: "NOT EXISTS",
    //   value: "NOT EXISTS",
    // },
    // {
    //   label: "REGEXP",
    //   value: "REGEXP",
    // },
    // {
    //   label: "NOT REGEXP",
    //   value: "NOT REGEXP",
    // },
  ];

  const customFieldMetaTypes = [
    {
      label: "CHAR",
      value: "CHAR",
    },
    {
      label: "NUMERIC",
      value: "NUMERIC",
    },
    // {
    //   label: "BINARY",
    //   value: "BINARY",
    // },
    // {
    //   label: "DATE",
    //   value: "DATE",
    // },
    // {
    //   label: "DATETIME",
    //   value: "DATETIME",
    // },
    // {
    //   label: "DECIMAL",
    //   value: "DECIMAL",
    // },
    // {
    //   label: "SIGNED",
    //   value: "SIGNED",
    // },
    // {
    //   label: "TIME",
    //   value: "TIME",
    // },
    // {
    //   label: "UNSIGNED",
    //   value: "UNSIGNED",
    // },
  ];
const toggleCfRow = (index) => {
  setOpenCfRows((prev) => ({
    ...prev,
     [index]: !(prev[index] ?? true),
  }));
};
const toggleCfAdv = (index) => {
  setOpenCfAdv((prev) => ({
    ...prev,
     [index]: !prev[index],
  }));
};
const toggleTaxoAdv = (index) => {
  setOpenTaxoAdv((prev) => ({
    ...prev,
     [index]: !prev[index],
  }));
};
  const commitFilterQueryPatch = (mutator) => {
    const nextBuilder = structuredClone(mainBuilderData || {});
    if (!nextBuilder.filter_layout_data) nextBuilder.filter_layout_data = {};
    const filterQuery =
      nextBuilder.filter_layout_data.filter_query_data ||
      (nextBuilder.filter_layout_data.filter_query_data = {});
    mutator(filterQuery);
    props.updatedBuilderData(nextBuilder);
  };

  useEffect(() => {
    if (canUseFilterCustomField()) {
      return;
    }

    const customFieldEnabled =
      filter_layout_data?.filter_query_data?.data_source?.custom_field !==
      "false";
    const hasCustomFieldData =
      normalizeGroupedCustomFieldData(
        filter_layout_data?.filter_query_data?.custom_field_data,
      ).length > 0;

    if (!customFieldEnabled && !hasCustomFieldData) {
      return;
    }

    setCheckDataSourceCustomField(false);
    setCustomFieldData([]);
    commitFilterQueryPatch((filterQuery) => {
      filterQuery.custom_field_data = [];
      filterQuery.data_source = {
        ...(filterQuery.data_source || {}),
        custom_field: "false",
      };
    });
  }, []);

  const updateFilterQueryData = (key, value) => {
    commitFilterQueryPatch((filterQuery) => {
      filterQuery[key] = value;
    });
  };

  const handleTaxonomyRelation = (val, type) => {
    const key =
      type === "taxo"
        ? "taxonomy_relation"
        : type === "meta"
        ? "meta_relation"
        : "category_relation";
    type === "taxo"
      ? setTaxonomyRelation(val)
      : type === "meta"
      ? setMetaRelation(val)
      : setCategoryRelation(val);
    updateFilterQueryData(key, val);
  };

  const handleDataSource = (val, type) => {
    if (type === "custom" && !canUseFilterCustomField()) {
      return;
    }

    if (val && type === "custom" && customFieldData?.length === 0) {
      //addCustomField("OR");
    }
    const key = type === "taxo" ? "taxonomy" : "custom_field";
    type === "taxo"
      ? setCheckDataSourceTaxonomy(val)
      : setCheckDataSourceCustomField(val);
    if (val) {
      commitFilterQueryPatch((filterQuery) => {
        filterQuery.data_source = {
          ...(filterQuery.data_source || {}),
          [key]: "true",
        };
      });
    }

    if (!val && type === "taxo") {
      commitFilterQueryPatch((filterQuery) => {
        filterQuery.taxonomy_data = [];
        filterQuery.data_source = {
          ...(filterQuery.data_source || {}),
          taxonomy: "false",
        };
      });
    }
    if (!val && type === "custom") {
      commitFilterQueryPatch((filterQuery) => {
        filterQuery.custom_field_data = [];
        filterQuery.data_source = {
          ...(filterQuery.data_source || {}),
          custom_field: "false",
        };
      });
    }
  };

  const handleTaxonomy = (e) => {
    let value = e.target.value;
    let newtaxonomyData = taxonomyData;
    if (newtaxonomyData?.length > 0) {
      let isValuePresent = newtaxonomyData?.some((obj) =>
        Object.values(obj).includes(value),
      );
      if (isValuePresent) {
        newtaxonomyData = newtaxonomyData.filter(
          (element) => element.key !== value,
        );
      } else {
        let itemData = { key: value, term_data: [] };
        newtaxonomyData.push(itemData);
      }
    } else {
      let itemData = { key: value, term_data: [] };
      newtaxonomyData.push(itemData);
    }
    updateFilterQueryData("taxonomy_data", newtaxonomyData);
  };
  const customFieldKeyFunc = (value, checkCustomField, groupIndex,index) => {
    //console.log(value, checkCustomField, index);
    let updateField = [];
    // if (checkCustomField == "key") {
    //   updateField = customFieldData.map((item, id) => {
        
    //     if (id === index) {
    //       return { ...item, custom_field_key: value };
    //     }

    //     return group;
    //   });
    // }
    if (checkCustomField === "key") {

    updateField = customFieldData.map((group, gIndex) => {

      if (gIndex === groupIndex) {

        return group.map((item, i) => {

          if (i === index) {
            return { ...item, custom_field_key: value,custom_field_value_list : [] };
          }

          return item;

        });

      }

      return group;

    });

  }
    if (checkCustomField === "value") {
      //let customFieldValueArray = [];
      // let valueArray = value.split(",").filter((item) => item.trim() !== "");
      // valueArray.forEach((item) => {
      //   item = item.trim();
      //   let isKeyPresent = false;
      //   customFieldData.forEach((field) => {
      //     isKeyPresent = field?.custom_field_value_list?.some(
      //       (ele) => ele.key == item
      //     );
      //   });
      //   if (!isKeyPresent) {
      //     let obj = {
      //       key: item,
      //     };
      //     customFieldValueArray.push(obj);
      //     0;
      //   } else {
      //     let ele = "";
      //     customFieldData.forEach((field) => {
      //       ele = field?.custom_field_value_list?.find(
      //         (val) => val.key == item
      //       );
      //     });
      //     customFieldValueArray.push(ele);
      //   }
      // });
      // updateField = customFieldData.map((item, id) => {
      //   if (id === index) {
          // return {
          //   ...item,
          //   //custom_field_value: value,
          //   custom_field_value_list: [
          //     ...(item.custom_field_value_list || []),
          //     value,
          //   ],
          // };
      //   }
      //   return item;
      // });


    updateField = customFieldData.map((group, gIndex) => {

      if (gIndex === groupIndex) {

        return group.map((item, i) => {

          if (i === index) {
            return {
            ...item,
            custom_field_value_list: [
              ...(item.custom_field_value_list || []),
              value,
            ],
          };
          }

          return item;

        });

      }

      return group;

    });
    }
    setCustomFieldData(updateField);
    updateFilterQueryData("custom_field_data", updateField);
  };

const getCompareLabel = (value) => {
  const match = customFieldCompareOperators?.find(
    (item) => item.value === value
  );
  return match ? match.label : "";
};

  const handleCompareOperator = (value, groupIndex,index) => {
    // let updateField = customFieldData.map((item, id) => {
    //   if (id === index) {
    //     return { ...item, compare_operator: value };
    //   }
    //   return item;
    // });

    let updateField = customFieldData.map((group, gIndex) => {

      if (gIndex === groupIndex) {

        return group.map((item, i) => {

          if (i === index) {
           return { ...item, compare_operator: value };
          }

          return item;

        });

      }

      return group;

    });

    setCustomFieldData(updateField);
    updateFilterQueryData("custom_field_data", updateField);
  };
  const handleMetaType = (value, groupIndex,index) => {
    // let updateField = customFieldData.map((item, id) => {
    //   if (id === index) {
    //     return { ...item, meta_type: value };
    //   }
    //   return item;
    // });

   let updateField = customFieldData?.map((group, gIndex) => {

      if (gIndex === groupIndex) {
        return group.map((item, i) => {
          if (i === index) {
            return { ...item, meta_type: value };
          }
          return item;
        });

      }
      return group;

    });

    setCustomFieldData(updateField);
    updateFilterQueryData("custom_field_data", updateField);
  };
    const handleRelationType = (value, index) => {
    let updateField = customFieldData.map((item, id) => {
      if (id === index) {
        return { ...item, group_relation: value };
      }
      return item;
    });
    setCustomFieldData(updateField);
    updateFilterQueryData("custom_field_data", updateField);
  };

  const handleTaxoRelationType = (value, index) => {
    let updateTaxoData = taxonomyData.map((item, id) => {

      if (id === index) {
        return { ...item, group_relation: value };
      }
      return item;
    });
    setTaxonomyData(updateTaxoData);
    updateFilterQueryData("taxonomy_data", updateTaxoData);
  };

    const handleTaxoOperatorType = (value,groupIndex,taxoIndex) => {
    // let updateTaxoData = taxonomyData.map((item, id) => {
    //   if (id === index) {
    //     return { ...item, meta_type: value };
    //   }
    //   return item;
    // });

     let updateTaxoData = taxonomyData?.map((group, gIndex) => {

      if (gIndex === groupIndex) {
        return group.map((item, i) => {
          if (i === taxoIndex) {
            return { ...item, operator: value };
          }
          return item;
        });

      }
      return group;

    });
    setTaxonomyData(updateTaxoData);
    updateFilterQueryData("taxonomy_data", updateTaxoData);
  };

 const getTaxoRelation = (taxoKey ,index) => {

  if (!Array.isArray(taxonomyData) || taxonomyData.length === 0) {
    return "OR";
  }

  const found = taxonomyData.find(item => item?.key === taxoKey);

  return found?.group_relation ?? "OR";
};

 const getTaxoOperatorType = (taxoKey ,groupIndex,taxoIndex) => {

  if (!Array.isArray(taxonomyData) || taxonomyData.length === 0) {
    return "OR";
  }

const savedTaxo = taxonomyData
      ?.find((group, gindex) => gindex === groupIndex)
      ?.find((item, id) => id === taxoIndex);

  return savedTaxo?.operator ?? "OR";
};

const taxonomyExist=(taxoKey,groupIndex,taxoIndex)=>{
      if (!Array.isArray(taxonomyData) || taxonomyData.length === 0) {
        return false;
      }
  const found = taxonomyData
          ?.find((group, gindex) => gindex === groupIndex)
          ?.find((item, id) => id === taxoIndex);

      if(found?.term_data?.length > 1){
        return true;
      }
      return false;
}



  const addCustomField = (relation,groupIndex="") => {
    let newField = {
      custom_field_key: "0",
      // custom_field_value: "",
      custom_field_value_list: [],
      compare_operator: "=",
      meta_type: "CHAR",
      // group_relation:"OR",

    };
    
    setCustomFieldData((prevCustomFieldData) => {
    let updatedCustomFieldData = [...prevCustomFieldData];

    if (relation === "OR") {
      updatedCustomFieldData.push([newField]); 
    }
    if (relation === "AND") {
      updatedCustomFieldData[groupIndex].push(newField); 
    }

    updateFilterQueryData("custom_field_data", updatedCustomFieldData);

    return updatedCustomFieldData;
    });
  };
  const removeArray = (arr, index) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // part of the array after the specified index
    ...arr.slice(index + 1),
  ];
  const deleteCustomField = (groupIndex,index) => {
    let  cfDataCopy = JSON.parse(JSON.stringify(customFieldData));
    let updatedGroup = removeArray(cfDataCopy[groupIndex], index);
    cfDataCopy[groupIndex]= updatedGroup
      //console.log(cfDataCopy)

  if (cfDataCopy[groupIndex].length === 0) {
   cfDataCopy = removeArray(cfDataCopy,groupIndex);
  }

  //console.log(cfDataCopy)

    if (cfDataCopy?.length === 0) {
      setCheckDataSourceCustomField(false);
      updateFilterQueryData("data_source", {
        ...filter_layout_data.filter_query_data.data_source,
        custom_field: "false",
      });
    }
    setCustomFieldData([...cfDataCopy]);
    updateFilterQueryData("custom_field_data", cfDataCopy);
  };

  const deleteTaxonomy = (groupIndex,index) => {
    let  taxoDataCopy = JSON.parse(JSON.stringify(taxonomyData));
    let updatedGroup = removeArray(taxoDataCopy[groupIndex], index);
    taxoDataCopy[groupIndex]= updatedGroup
      //console.log(cfDataCopy)

  if (taxoDataCopy[groupIndex].length === 0) {
   taxoDataCopy = removeArray(taxoDataCopy,groupIndex);
  }
    setTaxonomyData([...taxoDataCopy])
    updateFilterQueryData("taxonomy_data", [...taxoDataCopy]);
  };


const deleteCustomFieldValue = (groupIndex,index, valueIndex) => {
  const layoutCopy = JSON.parse(JSON.stringify(customFieldData));

  let  updateField = layoutCopy?.map((group, gIndex) => {

      if (gIndex === groupIndex) {
        return group?.map((item, id) => {

          if (id === index) {
              return {
              ...item,
              custom_field_value_list: item.custom_field_value_list.filter(
                (_, i) => i !== valueIndex
              ),
            };
          }
          return item;

        });

      }
      return group;

    });

  setCustomFieldData(updateField);
  updateFilterQueryData("custom_field_data", updateField);
};
  const onChangeOrderByMeta = (e) => {
    setOrderByMeta(e.target.checked);
    let value = e.target.checked.toString();
    commitFilterQueryPatch((filterQuery) => {
      filterQuery.order_by_meta = value;
    });
  };
  const orderByMetaKeyFunc = (val) => {
    setOrderByMetaKey(val);
    commitFilterQueryPatch((filterQuery) => {
      filterQuery.meta_key = val;
    });
  };
  const orderByMetaValFunc = (val) => {
    setOrderByMetaVal(val);
    commitFilterQueryPatch((filterQuery) => {
      filterQuery.meta_value = val;
    });
  };

  const TemrsRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };
  function NestedTerms({
    taxoKey,
    childrenData,
    expandedItems,
    toggleExpand,
    handleTerm,
    handleTermChecked,
    groupIndex,
    savedTaxoIndex
  }) {
    if (!Array.isArray(childrenData) || childrenData.length === 0) return null;
    return (
      // <ul className="children">
      <>
        {childrenData.map((child) => {
          const hasChildren =
            Array.isArray(child?.children_data) &&
            child.children_data.length > 0;
          const hasChildClass =
            Array.isArray(child?.children_data) &&
            child.children_data.length > 0
              ? "tc-caf-has-child"
              : "";
          const isExpanded = expandedItems.includes(child.id);
          return (
            <li
              key={child?.id}
              className={`cat-item cat-item-${child?.id} ${hasChildClass}`}
              count={child?.total_count}
              term-id={child?.id}
            >
              <div className="trusty-manage-bar-sec-label">
                <label htmlFor={`${taxoKey}-list-id${child?.id}`}>
                  <input
                    className={`${taxoKey}-list check`}
                    type="checkbox"
                    term-name={child?.name}
                    name={`${taxoKey}[]`}
                    id={`${taxoKey}-list-id${child?.id}`}
                    value={`${taxoKey}___${child?.id}`}
                    onChange={(e) => handleTerm(e,child,groupIndex,savedTaxoIndex)}
                    checked={handleTermChecked(child,groupIndex,savedTaxoIndex)}
                  />
                  {child?.name} {`(${child?.total_count})`}
                </label>

                {hasChildren && (
                  <i
                    className={`fa ${
                      isExpanded ? "fa-angle-up" : "fa-angle-down"
                    } caf-builder-plus`}
                    aria-hidden="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(child.id);
                    }}
                    style={{ cursor: "pointer" }}
                  ></i>
                )}
              </div>

              {hasChildren && (
                <ul
                  className={`children ${
                    isExpanded ? "tc_caf_active_list" : ""
                  }`}
                >
                  {/* <NestedTerms taxoKey={taxoKey} childrenData={child.children_data} /> */}
                  <NestedTerms
                    taxoKey={taxoKey}
                    childrenData={child.children_data}
                    expandedItems={expandedItems}
                    toggleExpand={toggleExpand}
                    handleTerm={handleTerm}
                    handleTermChecked={handleTermChecked}
                    groupIndex={groupIndex}
                    savedTaxoIndex={savedTaxoIndex}
                  />
                </ul>
              )}
            </li>
          );
        })}
      </>
      // </ul>
    );
  }
  const TaxonomyChecked = (taxoKey) => {
    return (
      Array.isArray(taxonomyData) &&
      taxonomyData.some((taxo) => taxo.key === taxoKey)
    );
  };
  const handleTermChecked = (term,groupIndex ,taxoIndex) => {
      const group = taxonomyData?.[groupIndex];
      if (!group) return false;
      const item = group?.[taxoIndex];

      if (!item || !item.term_data) return false;

      const isExist = item?.term_data?.some((obj) => obj.key === term?.id);
      return isExist;
  };
  // const handleTerm =(e,taxonomy,term)=>{
  //   const checked = e.target.checked;
  // let newtaxonomyData = taxonomyData;
  //    if(checked){
  //      newtaxonomyData?.map((data, index) => {
  //           if (data.key == taxonomy) {
  //             let termData = [...data.term_data];
  //             let newObject = {
  //               key: term?.id,
  //               value: term?.name,
  //             };
  //             const isValuePresent = termData?.some((obj) => obj.key == term?.id);
  //             if (!isValuePresent) {
  //               termData.push(newObject);
  //               data.term_data= termData;
  //             }
  //           }
  //         });
  //    }else{
  //     newtaxonomyData?.map((data, index) => {
  //           if (data.key == taxonomy) {
  //             data.term_data = [...data.term_data.filter((ele) => ele.key !== term?.id)];
  //           }
  //         });
  //    }
  // updateFilterQueryData("taxonomy_data", newtaxonomyData);
  // }
  // const toggleExpand = (id) => {
  //     setExpandedItems((prev) =>
  //       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  //     );
  // };

  const handleTerm = (e, term ,groupIndex ,taxoIndex) => {

    const checked = e.target.checked;
    let updateTaxoData = [...taxonomyData];
    if (checked) {
        updateTaxoData = taxonomyData?.map((group, gIndex) => {

          if (gIndex === groupIndex) {

            return group.map((item, i) => {

              if (i === taxoIndex) {

                const termData = [...item.term_data];

                const isValuePresent = termData.some(
                  (obj) => obj.key === term?.id
                );

                if (!isValuePresent) {
                  termData.push({
                    key: term?.id,
                    value: term?.name
                  });
                }

                return {
                  ...item,
                  term_data: termData
                };
              }

              return item;
            });

          }

          return group;

        });
      
      } else {
        updateTaxoData = taxonomyData?.map((group, gIndex) => {

          if (gIndex === groupIndex) {

            return group.map((item, i) => {

              if (i === taxoIndex) {

                let termData = item.term_data.filter(
                  (obj) => obj.key !== term?.id
                );
                if (termData.length === 0) {
                  termData = [];
                }
                return {
                  ...item,
                  term_data: termData
                };
              }

              return item;
            });

          }
          return group;

        });

    }

    setTaxonomyData(updateTaxoData)
    updateFilterQueryData("taxonomy_data", updateTaxoData);
  };

 const addTaxonomy=(taxonomy,relation,groupIndex="")=>{
  let newtaxonomyData = [...taxonomyData];
  if(relation === "OR"){
    let group =[];
          group.push({
          key: taxonomy,
          term_data: [],
          operator: "OR",
        });
      newtaxonomyData.push(group) 
  }
  if(relation === "AND" && groupIndex !==""){
    newtaxonomyData[groupIndex].push(
    {
          key: taxonomy,
          term_data: [],
          operator: "OR",
    })
  }
    setTaxonomyData(newtaxonomyData)
    updateFilterQueryData("taxonomy_data", newtaxonomyData);
 }
 //console.log(taxonomyData) 
  const toggleExpand = (id) => {
    setExpandedItems((prev) => {
      const newArray = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      return Array.from(new Set(newArray));
    });
  };
  const TaxoToggleExpand = (taxokey) => {
    setFirstRender(false);
    setExpandedTaxoItems((prev) => {
      const newArray = prev.includes(taxokey)
        ? prev.filter((x) => x !== taxokey)
        : [...prev, taxokey];
      return Array.from(new Set(newArray));
    });
  };

  const getAllTermsRecursive = (termList) => {
    let all = [];
    if (Array.isArray(termList) && termList.length > 0) {
      termList.forEach((term) => {
        all.push({ key: term.id, value: term.name });
        if (
          Array.isArray(term.children_data) &&
          term.children_data.length > 0
        ) {
          all = [...all, ...getAllTermsRecursive(term.children_data)];
        }
      });
    }
    return all;
  };


  const handleSelectAll = (taxonomy ,groupIndex ,taxoIndex) => {
    //firstRender.current = false;
    // setExpandedTaxoItems((prev) => {
    //   const newArray = prev.includes(`${groupIndex}${taxoIndex}`)
    //     ? prev.filter((x) => x !== `${groupIndex}${taxoIndex}`)
    //     : [...prev, `${groupIndex}${taxoIndex}`];
    //   return Array.from(new Set(newArray));
    // });

    let updatedTaxoData = [...taxonomyData];

    const taxItem = taxonomyListArray.find((item) => item.key === taxonomy);

    updatedTaxoData = taxonomyData?.map((group, gIndex) => {

      if (gIndex === groupIndex) {

        return group.map((item, i) => {

          if (i === taxoIndex) {
            let allTerms = getAllTermsRecursive(taxItem?.term_data).map((term) => ({
              key: term?.key ?? term?.id,
              value: term?.value ?? term?.name ?? "",
            }));
                const merged = [...item.term_data, ...allTerms];
                const unique = Array.from(new Map(merged.map(trm => [trm.key, trm])).values());
            return {
              ...item,
              term_data: unique
            };
          }

          return item;
        });

      }

      return group;

    });
    updateFilterQueryData("taxonomy_data", updatedTaxoData);
  };

  const handleSelectNone = (taxonomy,groupIndex ,taxoIndex) => {
    //firstRender.current = false;
    //  setExpandedTaxoItems((prev) => {
    //   const newArray = prev.includes(`${groupIndex}${taxoIndex}`)
    //     ? prev.filter((x) => x !== `${groupIndex}${taxoIndex}`)
    //     : [...prev, `${groupIndex}${taxoIndex}`];
    //   return Array.from(new Set(newArray));
    // });
    let updatedTaxoData = taxonomyData?.map((group, gIndex) => {

    if (gIndex === groupIndex) {

      return group.map((item, i) => {

        if (i === taxoIndex) {
          return {
            ...item,
            term_data: [],
          };
        }

        return item;
      });

    }

    return group;

  });
    updateFilterQueryData("taxonomy_data", updatedTaxoData);
  };

  const isAllSelected = (taxonomyKey,groupIndex ,savedTaxoIndex) => {

    const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
      if (!taxItem) return false;

    const savedTerms = taxonomyData
      ?.find((group, gindex) => gindex === groupIndex)
      ?.find((item, id) => id === savedTaxoIndex)
      ?.term_data;
    
      if (!savedTerms || savedTerms?.length === 0) return false;

      const allTerms = getAllTermsRecursive(taxItem?.term_data);

        return allTerms?.every((term) =>
          savedTerms?.some((saved) => saved.key === term.key),
        );
  };

  const isAnySelected = (taxonomyKey,groupIndex ,savedTaxoIndex) => {
    const taxItem = taxonomyListArray.find((item) => item.key === taxonomyKey);
    if (!taxItem) return false;
     const savedTerms = taxonomyData
      ?.find((group, gindex) => gindex === groupIndex)
      ?.find((item, id) => id === savedTaxoIndex)
      ?.term_data;

    if (!savedTerms || savedTerms?.length === 0) return false;

    const allTerms = getAllTermsRecursive(taxItem?.term_data);

    if (!savedTerms || !savedTerms?.length === 0) return false;

    const hasAnyMatch = allTerms?.some((term) =>
      savedTerms?.some((saved) => saved.key === term.key),
    );
    if (hasAnyMatch) {
      return true;
    } else {
      false;
    }
  };

  // useEffect(() => {
  //   const handleMouseMove = () => {
  //     if (firstRender.current) {
  //       firstRender.current = false;
  //       window.removeEventListener("mousemove", handleMouseMove);
  //     }
  //   };
  //   setTimeout(()=>{
  //   window.addEventListener("mousemove", handleMouseMove);
  //   return () => window.removeEventListener("mousemove", handleMouseMove);
  //     },500)
  // }, [taxonomyListArray]);
// console.log(customFieldData)

//console.log(taxonomyListArray)
  return (
    <div className="caf-layout-filter-with-query-container">
      <div className="caf-layout-filter-with-query-inner-section">
        <div className="caf-layout-filter-with-query-image-section">
          <div className="text-main">
            <h1 className="caf-layout-filter-with-query-image-title">
            Build Your Query 
            </h1>
            <div className="caf-layout-filter-with-query-image-desc">
            Build your query by defining conditions based on categories, tags and custom fields.
            </div>
          </div>
          <div className="filter-img">
            <BuilderBuildYourQueryIcon className="caf-build-your-query-image" alt="Build your query" />
            {/* <img src={bubble} alt="caf-logo" /> */}
          </div>
        </div>

        <div className="caf-layout-filter-with-query-content-section">
          {!isLoading ? (
            <div className="caf-layout-filter-with-query-content-inner-section">
              <h1>Build Your Query</h1>

              <div className="caf-layout-filter-with-query-data-source">
                <label>Filter By</label>
                <div className="caf-layout-filter-with-query-data-source-checkbox">
                  <div className="source-checkbox-taxonomy">
                    <Checkbox
                      checked={checkDataSourceTaxonomy}
                      onChange={(e) =>
                        handleDataSource(e.target.checked, "taxo")
                      }
                    />
                    <label>Taxonomy</label>
                  </div>
                  <FilterQueryCustomFieldSource
                    checked={checkDataSourceCustomField}
                    onChange={(checked) => handleDataSource(checked, "custom")}
                  />
                </div>
              </div>

              {checkDataSourceTaxonomy === true && (
                <>
                  <div className="module-content-tab-row">
                    <label>Taxonomy</label>
                    <div className="tc-caf-each-tax-data-query-wrapper">
                    {
                    Array.isArray(taxonomyData) && taxonomyData.length > 0 ? (
                    taxonomyData?.map((group, groupIndex) => {
                          return (
                            <>
                              {group?.map((savedTaxo, savedTaxoIndex) => {
                                return (
                                  <>
                                  {Array.isArray(taxonomyListArray) && taxonomyListArray?.map((taxo, indx) => {
                                  const isActiveClass =
                                  firstRender === true
                                    ? isAnySelected(taxo.key,groupIndex,savedTaxoIndex) ||
                                      expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)
                                    : expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)
                                    return (
                                      <>
                                    {taxo?.key === savedTaxo?.key && (
                                    <ul
                                        className={`tc-caf-each-tax-data ${taxo.key} ${isActiveClass ? "toggle-active" : ""}`}
                                        data-name={taxo.key}
                                        key={`${taxo.key}-${indx}`}
                                      >
                                        <li className="caf-term-title-main">
                                          <div className="tc-caf-taxo-name-left-wrapper">
                                            <div
                                              key={taxo.key}
                                              className="tc-caf-all-check-uncheck-main"
                                            >
                                              <label className="tc-caf-all-check-uncheck-wrapper">
                                                <input
                                                  key={`${groupIndex}${savedTaxoIndex}${indx}`}
                                                  type="checkbox"
                                                  className="tc-caf-all-check-uncheck-btn"
                                                  checked={isAllSelected(taxo.key,groupIndex ,savedTaxoIndex)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      handleSelectAll(taxo.key ,groupIndex ,savedTaxoIndex);
                                                    } else {
                                                      handleSelectNone(taxo.key,groupIndex ,savedTaxoIndex);
                                                    }
                                                  }}
                                                />
                                              </label>
                                            </div>
                                            <h2
                                              style={{
                                                display: "flex",
                                                width: "100%",
                                                fontWeight: 600,
                                                textTransform: "capitalize",
                                                padding: 0,
                                                margin: 0,
                                                alignItems: "center",
                                              }}
                                            >
                                              <span className="caf-taxo-label-text">{taxo?.label}</span>
                                              <div
                                                className={
                                                  (savedTaxo?.term_data?.length || 0) > 0
                                                    ? "caf-selected-terms-count-wrapper"
                                                    : "caf-selected-terms-count-wrapper caf-warning-term"
                                                }
                                              >
                                                {(savedTaxo?.term_data?.length || 0) > 0 ? (
                                                  <>
                                                    <span className="caf-selected-terms-count">
                                                      {"("}
                                                      {savedTaxo?.term_data?.length}
                                                    </span>
                                                    <span className="caf-selected-terms-count-suffix">
                                                      Selected{")"}
                                                    </span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <img
                                                      src={warningIcon}
                                                      alt=""
                                                      className="caf-fl-query-warning-icon"
                                                    />
                                                    <span className="caf-selected-terms-count-suffix">
                                                      Select Term
                                                    </span>
                                                    
                                                  </>
                                                )}
                                              </div>

                                            </h2>
                                          </div>
                                          <div className="caf-terms-cat-btn">
                                            {(
                                              firstRender === true
                                                ? isAnySelected(taxo.key,groupIndex,savedTaxoIndex) ||
                                                //   expandedTaxoItems.includes(taxo.key)
                                                // : expandedTaxoItems.includes(taxo.key)
                                                  expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)
                                                : expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)
                                            ) ? (
                                              <FontAwesomeIcon
                                                icon={faChevronUp}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  TaxoToggleExpand(`${groupIndex}${savedTaxoIndex}`);
                                                }}
                                                style={{ cursor: "pointer" }}
                                              />
                                            ) : (
                                              <FontAwesomeIcon
                                                icon={faChevronDown}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  TaxoToggleExpand(`${groupIndex}${savedTaxoIndex}`);
                                                }}
                                                style={{ cursor: "pointer" }}
                                              />
                                            )}
                                            <BuilderDeleteIcon
                                              onClick={() => deleteTaxonomy(groupIndex,savedTaxoIndex)}
                                              className="caf-filter-query-delete-taxo-cf-btn"
                                            />
                                          </div>
                                        </li>
                                        {Array.isArray(taxo?.term_data) &&
                                          taxo.term_data.length > 0 && (
                                            <>
                                              {(() => {
                                                const isActive =
                                                  firstRender === true
                                                    ? isAnySelected(taxo.key,groupIndex,savedTaxoIndex) ||
                                                      expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)
                                                    : expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)

                                                if (
                                                  isActive &&
                                                  !expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)
                                                ) {
                                                  setExpandedTaxoItems((prev) => {
                                                    const newArray = [...prev, `${groupIndex}${savedTaxoIndex}`];
                                                    return Array.from(new Set(newArray));
                                                  });
                                                }

                                                return (
                                                  <div
                                                    className={`tc-caf-taxo-term-list-section ${
                                                      isActive ? "active-term-list" : ""
                                                    }`}
                                                  >
                                                    {taxo.term_data.map((term) => {
                                                      const hasChildren =
                                                        Array.isArray(
                                                          term?.children_data,
                                                        ) &&
                                                        term.children_data.length > 0;
                                                      const hasChildClass = hasChildren
                                                        ? "tc-has-child"
                                                        : "";
                                                      const isExpanded =
                                                        expandedItems.includes(term.id);

                                                      return (
                                                        <li
                                                          key={`${groupIndex}${savedTaxoIndex}${indx}${term?.id}`}
                                                          className={`cat-item cat-item-${term?.id} ${hasChildClass}`}
                                                          count={term?.total_count}
                                                          term-id={term?.id}
                                                        >
                                                          <div className="trusty-manage-bar-sec-label">
                                                            <label
                                                              htmlFor={`${groupIndex}${taxo?.key}-list-id${savedTaxoIndex}${term?.id}`}
                                                            >
                                                              <input
                                                                className={`${taxo?.key}-list check`}
                                                                type="checkbox"
                                                                term-name={term?.name}
                                                                name={`${taxo.key}[]`}
                                                                id={`${groupIndex}${taxo?.key}-list-id${savedTaxoIndex}${term?.id}`}
                                                                value={`${taxo?.key}___${term?.id}`}
                                                                onChange={(e) =>
                                                                  handleTerm(
                                                                    e,
                                                                    term,
                                                                    groupIndex,
                                                                    savedTaxoIndex
                                                                  )
                                                                }
                                                                checked={handleTermChecked(
                                                                  term,
                                                                  groupIndex,
                                                                  savedTaxoIndex
                                                                )}
                                                              />
                                                              {term?.name} (
                                                              {term?.total_count})
                                                            </label>

                                                            {hasChildren && (
                                                              <i
                                                                className={`fa ${
                                                                  isExpanded
                                                                    ? "fa-angle-up"
                                                                    : "fa-angle-down"
                                                                } caf-builder-plus`}
                                                                aria-hidden="true"
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  toggleExpand(term.id);
                                                                }}
                                                                style={{
                                                                  cursor: "pointer",
                                                                }}
                                                              ></i>
                                                            )}
                                                          </div>

                                                          {hasChildren && (
                                                            <ul
                                                              className={`children ${
                                                                isExpanded
                                                                  ? "tc_caf_active_list"
                                                                  : ""
                                                              }`}
                                                            >
                                                              <NestedTerms
                                                                taxoKey={taxo.key}
                                                                childrenData={
                                                                  term.children_data
                                                                }
                                                                expandedItems={
                                                                  expandedItems
                                                                }
                                                                toggleExpand={
                                                                  toggleExpand
                                                                }
                                                                handleTerm={handleTerm}
                                                                handleTermChecked={
                                                                  handleTermChecked
                                                                }
                                                                groupIndex={groupIndex}
                                                                savedTaxoIndex={savedTaxoIndex}
                                                              />
                                                            </ul>
                                                          )}
                                                        </li>
                                                      );
                                                    })}
                                            <div className="caf-filter-query-custom-field-adv-opt-wrapper">
                                              <div className="caf-filter-query-custom-field-adv-opt-top-bar"
                                              onClick={() => toggleTaxoAdv(`${groupIndex}${savedTaxoIndex}`)}
                                              >
                                                <span className="caf-filter-query-adv-opt-label">
                                                  Advanced Options
                                                </span>
                                                <FontAwesomeIcon
                                                  icon={openTaxoAdv[`${groupIndex}${savedTaxoIndex}`] ? faChevronUp : faChevronDown}
                                                  style={{ cursor: "pointer" }}
                                                  className="caf-filter-query-adv-opt-toggle-btn"   
                                                />
                                              </div>
                                              <div className="caf-filter-query-meta-type-wrapper"
                                              style={{ display: openTaxoAdv[`${groupIndex}${savedTaxoIndex}`] ? "flex" : "none" }}
                                              >
                                              <label>Operator</label>
                                              <Select
                                                className="caf-filter-query-meta-type"
                                                options={[
                                                  {
                                                    label:"AND",
                                                    value:"AND",
                                                  },
                                                  {
                                                    label:"OR",
                                                    value:"OR",
                                                  },
                                                ]}
                                                disabled={!taxonomyExist(taxo?.key,groupIndex ,savedTaxoIndex)}
                                                onChange={(value) => handleTaxoOperatorType(value, groupIndex ,savedTaxoIndex)}
                                                style={{ width: "auto" }}
                                                value={getTaxoOperatorType(taxo?.key,groupIndex ,savedTaxoIndex)}
                                              />
                                            </div>
                                            </div>
                                                  </div>
                                                );
                                              })()}
                                            
                                            </>
                                          )}
                                        {Array.isArray(taxo?.term_data) &&
                                          taxo.term_data.length === 0 &&
                                          (() => {
                                            const isActive =
                                              firstRender === true
                                                ? isAnySelected(taxo.key,groupIndex,savedTaxoIndex) ||
                                                  expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)
                                                  : expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)

                                            if (
                                              isActive &&
                                              !expandedTaxoItems.includes(`${groupIndex}${savedTaxoIndex}`)
                                            ) {
                                              setExpandedTaxoItems((prev) => {
                                                const newArray = [...prev, `${groupIndex}${savedTaxoIndex}`];
                                                return Array.from(new Set(newArray));
                                              });
                                            }

                                            return (
                                              <div
                                                className={`tc-caf-taxo-term-list-section ${
                                                  isActive ? "active-term-list" : ""
                                                }`}
                                              >
                                                <li className="tc-cat-item-none">
                                                  No Categories
                                                </li>
                                              </div>
                                            );
                                          })()} 

                                     
                                          <div className="caf-filter-query-group-relation-wrapper">
                                            <div className="caf-filter-query-group-relation-before">
                                              <Select
                                                className="caf-filter-query-group-relation"
                                                disabled={true}
                                                suffixIcon={null} 
                                                options={[
                                                  {
                                                    label:"OR",
                                                    value:"OR",
                                                  },
                                                  {
                                                    label:"AND",
                                                    value:"AND",
                                                  },
                                                ]}
                                                onChange={(value) => handleTaxoRelationType(value, indx)}
                                                
                                                value={"AND"}
                                              />
                                            </div>
                                          </div>
                                        
                                      </ul>

                                        )}
                                      </>
                                    );
                                  })}
                                  </>
                                );
                              })}
                            <div className="select-layout-btn">
                              <Select
                                className="caf-filter-query-taxo-list-drp"
                                options={taxonomyPickerSelectOptions}
                                onChange={(value) => addTaxonomy(value ,"AND" ,groupIndex)}
                                value={"0"}
                              />
                            </div>

                           <div style={{textAlign:"center"}}>-------------OR-----------</div>
                    
                            </>
                          );
                        })
                      ): (
                        <li className="tc-taxo-item-none">No Taxonomy</li>
                      )

                    }
                    </div>
                    {taxonomyListArray?.length > 0 && (
                      <div className="select-layout-btn">
                        <Select
                          className="caf-filter-query-taxo-list-drp"
                          options={taxonomyPickerSelectOptions}
                          onChange={(value) => addTaxonomy(value ,"OR")}
                          value={"0"}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {canUseFilterCustomField() && checkDataSourceCustomField === true && (
                <>
                  <div className="caf-custom-field-data-container">

                    {customFieldData?.length > 0 && (
                      <>
                    <label className="setting-label-main">Select Custom Field</label>
                      <div className="caf-filter-custom-field-items-wrapper">
                     {customFieldData?.map((group, groupIndex) => {
                        return ( 
                          <>
                          {group?.map((item, index) => {
                            return (

                              <div
                                key={index}
                                className={`caf-filter-custom-field-single-row ${
                                  (openCfRows[`${groupIndex}${index}`] ?? true) ? "toggle-active" : ""
                                } ${item?.custom_field_key === "0" ? "warning-cf-row" : ""}`}
                              >
                                <div className="caf-filter-label-inner-row-top-bar">
                                  <div className="caf-fl-query-cf-left-col">
                                      {/* {customFieldData.length > 1 && index > 0 &&(
                                      <span className="caf-fl-query-cf-group-realtion">
                                        {customFieldData[index-1]?.group_relation}
                                      </span>
                                      )} */}
                                    <strong className="caf-fl-query-cf-name">
                                      {item?.custom_field_key === "0" ? (
                                        <>
                                          <img
                                            src={warningIcon}
                                            alt=""
                                            className="caf-fl-query-warning-icon"
                                          />{" "}
                                          Select Custom Field{" "}
                                        </>
                                      ) : (
                                        item?.custom_field_key
                                      )}
                                    </strong>
                                    {item?.custom_field_key !== "0" && (
                                      <>
                                    <span className="caf-fl-query-cf-compare-label">
                                      {getCompareLabel(item?.compare_operator)}
                                    </span>
                                    {item?.custom_field_value_list?.length > 0 ? (
                                        <strong className="caf-fl-query-cf-value">
                                          {item.custom_field_value_list.join(" , ")}
                                        </strong>
                                      ):(
                                        <>
                                        <span className="caf-fl-query-cf-value warning-cf-value">
                                          <img
                                            src={warningIcon}
                                            alt=""
                                            className="caf-fl-query-warning-icon"
                                          />{" "}
                                          Add Values
                                        </span>
                                        </>
                                      )}
                                    </>
                                    )}
                                  </div>
                                  <div className="caf-fl-query-cf-right-col">
                                  <FontAwesomeIcon
                                    icon={(openCfRows[`${groupIndex}${index}`] ?? true) ? faChevronUp : faChevronDown}
                                    className="caf-fl-query-cf-fields-collapse-btn"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => toggleCfRow(`${groupIndex}${index}`)}
                                  />
                                    <BuilderDeleteIcon
                                      onClick={() => deleteCustomField(groupIndex,index)}
                                      className="caf-filter-query-delete-taxo-cf-btn"
                                    />
                                  </div>
                                </div>
                                <div className="caf-fl-query-cf-fields-collapse-wrapper"
                                style={{ display: (openCfRows[`${groupIndex}${index}`] ?? true) ? "flex" : "none" }}
                                >
                                  <div className="caf-fl-query-cf-fields-wrapper">
                                    {/* <Input
                                          onChange={(e) =>
                                            customFieldKeyFunc(e.target.value, "key", index)
                                          }
                                          value={item.custom_field_key}
                                          style={{ width: "33.33%" }}
                                        /> */}
                                    <Select
                                      className="caf-filter-query-custom-field-select caf-header-dropdown"
                                      options={metaKeys}
                                      onChange={(value) =>
                                        customFieldKeyFunc(value, "key",groupIndex,index)
                                      }
                                      style={{ width: "50%" }}
                                      value={item?.custom_field_key}
                                    />
                                    <Select
                                      className="caf-filter-query-compare caf-header-dropdown"
                                      options={customFieldCompareOperators}
                                      onChange={(value) =>
                                        handleCompareOperator(value, groupIndex,index)
                                      }
                                      style={{ width: "50%" }}
                                      value={item?.compare_operator}
                                      disabled={item?.custom_field_key === "0" ? true : false}
                                    />
                                    {/* <Input
                                          onChange={(e) =>
                                            customFieldKeyFunc(e.target.value, "value", index)
                                          }
                                          value={item.custom_field_value}
                                          style={{ width: "33.33%" }}
                                        /> */}
                                  </div>
                                  <div className="caf-filter-query-custom-field-adv-opt-wrapper">
                                    <div className="caf-filter-query-custom-field-adv-opt-top-bar"
                                    onClick={() => toggleCfAdv(`${groupIndex}${index}`)}
                                    >
                                      <span className="caf-filter-query-adv-opt-label">
                                        Advanced Options
                                      </span>
                                      <FontAwesomeIcon
                                        icon={openCfAdv[`${groupIndex}${index}`] ? faChevronUp : faChevronDown}
                                        style={{ cursor: "pointer" }}
                                        className="caf-filter-query-adv-opt-toggle-btn"   
                                      />
                                    </div>
                                    <div className="caf-filter-query-meta-type-wrapper"
                                    style={{ display: openCfAdv[`${groupIndex}${index}`] ? "flex" : "none" }}
                                    >
                                      <label>Meta Type</label>
                                    <Select
                                      className="caf-filter-query-meta-type"
                                      options={customFieldMetaTypes}
                                      onChange={(value) => handleMetaType(value, groupIndex,index)}
                                      style={{ width: "auto" }}
                                      value={item?.meta_type}
                                      disabled={item?.custom_field_key === "0" ? true : false}
                                    />
                                  </div>
                                  </div>
                                  <div className="caf-filter-query-multi-value-field-wrapper">
                                  <label className="caf-filter-query-multi-value-field-label">Add Value</label>
                                    <div className="caf-filter-query-multi-value-field-input-wrapper">
                                      <input
                                        // onChange={(e) =>
                                        //   customFieldKeyFunc(e.target.value, "value", index)
                                        // }
                                        //value={item.custom_field_value}
                                        style={{ width: "100%" }}
                                        className="caf-filter-query-multi-value-field"
                                        type="text"
                                        disabled={item?.custom_field_key === "0" ? true : false}
                                      />
                                      <Button
                                        // style={{ width: "auto" }}
                                        title="Add"
                                        icon={<PlusCircleFilled />}
                                        className="caf-filter-query-add-value-btn"
                                        onClick={(e) => {
                                          let input = e.currentTarget
                                            .closest(
                                              ".caf-filter-query-multi-value-field-wrapper",
                                            )
                                            .querySelector("input");
                                            if(input.value!==""){
                                              if (item?.custom_field_key === "0") {
                                                return; 
                                              }
                                                customFieldKeyFunc(
                                                  input.value,
                                                  "value",
                                                 groupIndex,
                                                 index
                                                );
                                                input.value = "";
                                              }
                                        }}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                    {item?.custom_field_value_list?.length > 0 && <label className="caf-filter-query-multi-value-field-label">Values</label>}
                                    <div className="caf-filter-query-multi-value-results">
                                      {/* {console.log(item)} */}
                                      {Object?.keys(item)?.map((key) => {
                                        if (
                                          key === "custom_field_value_list" &&
                                          item[key]?.length > 0
                                        ) {
                                          return item[key]?.map((val, idx) => (
                                            <div
                                              key={idx}
                                              className="caf-filter-query-cf-value-item"
                                            >
                                              <span className="caf-filter-query-cf-value">
                                                {val}
                                              </span>
                                              <BuilderDeleteIcon
                                                onClick={() => deleteCustomFieldValue(groupIndex,index ,idx)}
                                              />
                                            </div>
                                          ));
                                        }
                                        return null;
                                      })}
                                    </div>
                                  </div>
                                </div>
                                
                                  {/* {customFieldData.length > 1 && index !== customFieldData.length - 1 && ( */}
                                    <div className="caf-filter-query-group-relation-wrapper">
                                      <div className="caf-filter-query-group-relation-before">
                                        <Select
                                          className="caf-filter-query-group-relation"
                                          disabled={true}
                                          suffixIcon={null} 
                                          options={[
                                            // {
                                            //   label:"OR",
                                            //   value:"OR",
                                            // },
                                            {
                                              label:"AND",
                                              value:"AND",
                                            },
                                          ]}
                                          onChange={(value) => handleRelationType(value, index)}
                                          value={"AND"}
                                        />
                                      </div>
                                    </div>
                                  {/* )} */}
                              </div>
                            );
                          })}
                            <div className="select-layout-btn">
                            <span 
                            className="caf-filter-query-add-new-cf-btn"
                            onClick={()=>addCustomField("AND",groupIndex)}
                            >Add Custom Field</span>
                            </div>

                           <div style={{textAlign:"center"}}>-------------OR-----------</div>
                          </>
                         );
                      })}

                      </div>
                      </>
                    )}
                  </div>
                  {checkDataSourceCustomField && (
                    <div className="select-layout-btn">
                      {/* <Button
                        type="primary"
                        size="small"
                        onClick={addCustomField}
                        className="caf-filter-query-add-new-cf-btn"
                      >
                        Add Custom Field
                      </Button> */}
                      <span 
                      className="caf-filter-query-add-new-cf-btn"
                      onClick={()=>addCustomField("OR")}
                      >Add Custom Field</span>
                    </div>
                  )}
                </>
              )}

              {/* {checkDataSourceCustomField && customFieldData?.length === 0 && (
                <div className="module-content-tab-row">
                  Custom Field Not Found!
                </div>
              )} */}

              {/* <div class="module-content-tab-row">
                <label>Select Taxonomy Relation</label>
                <Select
                  className="caf-select-post-type caf-header-dropdown"
                  defaultValue={taxonomyRelation}
                  options={[
                    {
                      label: "OR",
                      value: "OR",
                    },
                    {
                      label: "AND",
                      value: "AND",
                    },
                  ]}
                  onChange={(e) => handleTaxonomyRelation(e, "taxo")}
                  style={{ width: "200px" }}
                  value={taxonomyRelation}
                />
              </div>
              <div className="module-content-tab-row">
                <label>Select Category Relation</label>
                <Select
                  className="caf-select-post-type caf-header-dropdown"
                  defaultValue={categoryRelation}
                  options={[
                    {
                      label: "IN",
                      value: "IN",
                    },
                    {
                      label: "NOT IN",
                      value: "NOT IN",
                    },
                    {
                      label: "AND",
                      value: "AND",
                    },
                    {
                      label: "EXISTS",
                      value: "EXISTS",
                    },
                    {
                      label: "NOT EXISTS",
                      value: "NOT EXISTS",
                    },
                  ]}
                  onChange={(e) => handleTaxonomyRelation(e, "category")}
                  style={{ width: "200px" }}
                  value={categoryRelation}
                />
              </div>
              {canUseFilterCustomField() && checkDataSourceCustomField === true && (
                <div className="module-content-tab-row">
                  <label>Select Meta Relation</label>
                  <Select
                    className="caf-select-post-type caf-header-dropdown"
                    defaultValue={metaRelation}
                    options={[
                      {
                        label: "IN",
                        value: "IN",
                      },
                      {
                        label: "NOT IN",
                        value: "NOT IN",
                      },
                      {
                        label: "AND",
                        value: "AND",
                      },
                      {
                        label: "OR",
                        value: "OR",
                      },
                      {
                        label: "EXISTS",
                        value: "EXISTS",
                      },
                      {
                        label: "NOT EXISTS",
                        value: "NOT EXISTS",
                      },
                    ]}
                    onChange={(e) => handleTaxonomyRelation(e, "meta")}
                    style={{ width: "200px" }}
                    value={metaRelation}
                  />
                </div>
              )} */}

              {/* {checkDataSourceCustomField === true && (
                <>
              <div className="module-content-tab-row">
                <label>Select Order By Meta</label>
                  <Checkbox
                    checked={orderByMeta}
                    onChange={onChangeOrderByMeta}
                    className="module-content-tab-row-order-by-meta"
                  >
                    Meta Key
                </Checkbox>
              </div>
              {orderByMeta === true && (
                <>
                <div className="module-content-tab-row">
                  <label>Enter Meta Key</label>
                  <Input
                    onChange={(e) => orderByMetaKeyFunc(e.target.value)}
                    value={orderByMetaKey}
                  />
                </div>
                <div className="module-content-tab-row">
                  <label>Enter Meta Value</label>
                  <Input
                    onChange={(e) => orderByMetaValFunc(e.target.value)}
                    value={orderByMetaVal}
                  />
                </div>
              </>
              )}
              </>
            )} */}
              {/* <div className="select-layout-btn">
                <Button
                  type="primary"
                  icon={<RightOutlined />}
                  iconPosition={"end"}
                  size="large"
                  // onClick={handleSelectLayout}
                >
                  Select Layout
                </Button>
              </div> */}
            </div>
          ) : (
            <Skeleton active />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterWithQuery;
