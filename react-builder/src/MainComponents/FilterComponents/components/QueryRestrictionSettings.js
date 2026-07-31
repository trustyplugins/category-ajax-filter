import React, { useEffect, useMemo, useRef, useState } from "react";
import { Select, Skeleton, Spin, Switch } from "antd";
import apiClient from "../../../api/client";
import { apiEndpoints } from "../../../api/endpoints";
import { getTaxonomyPickerSelectOptions } from "./settingTabContent/ModuleContentData/taxonomyPickerSections";

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const INCLUDE_BY_OPTIONS = [
  { label: "None", value: "" },
  { label: "Terms", value: "terms" },
];

const EXCLUDE_BY_OPTIONS = [
  { label: "None", value: "" },
  { label: "Terms", value: "terms" },
  { label: "Specific posts", value: "posts" },
];

const emptyInclude = () => ({
  by: "",
  taxonomy: "",
  term_data: [],
});

const emptyExclude = () => ({
  by: "",
  taxonomy: "",
  term_data: [],
  post_data: [],
});

/**
 * Normalize saved restriction + migrate legacy taxonomy_data shape.
 */
export const normalizeQueryRestriction = (raw) => {
  const source = raw && typeof raw === "object" ? raw : {};
  const enabled = source.enabled === true || source.enabled === "true";

  let include = source.include && typeof source.include === "object"
    ? {
        by: source.include.by === "terms" ? "terms" : "",
        taxonomy: String(source.include.taxonomy || ""),
        term_data: ensureArray(source.include.term_data).map((term) => ({
          key: term?.key ?? term?.id,
          name: term?.name || term?.label || "",
        })),
      }
    : emptyInclude();

  let exclude = source.exclude && typeof source.exclude === "object"
    ? {
        by:
          source.exclude.by === "terms" || source.exclude.by === "posts"
            ? source.exclude.by
            : "",
        taxonomy: String(source.exclude.taxonomy || ""),
        term_data: ensureArray(source.exclude.term_data).map((term) => ({
          key: term?.key ?? term?.id,
          name: term?.name || term?.label || "",
        })),
        post_data: ensureArray(source.exclude.post_data).map((post) => ({
          value: String(post?.value ?? post?.id ?? ""),
          label: post?.label || post?.title || String(post?.value ?? post?.id ?? ""),
        })),
      }
    : emptyExclude();

  const legacy = ensureArray(source.taxonomy_data);
  if (!include.by && legacy.length > 0) {
    const row =
      legacy.find((item) => ensureArray(item?.term_data).length > 0) ||
      legacy[0];
    if (row?.key) {
      include = {
        by: "terms",
        taxonomy: String(row.key),
        term_data: ensureArray(row.term_data).map((term) => ({
          key: term?.key ?? term?.id,
          name: term?.name || term?.label || "",
        })),
      };
    }
  }

  return { enabled, include, exclude };
};

const flattenTerms = (nodes, out = []) => {
  ensureArray(nodes).forEach((node) => {
    if (!node || typeof node !== "object") return;
    const id = node.id ?? node.key;
    if (id === undefined || id === null || id === "") return;
    out.push({
      id,
      key: id,
      name: node.name || node.label || String(id),
    });
    if (node.children_data || node.children) {
      flattenTerms(node.children_data || node.children, out);
    }
  });
  return out;
};

const serializeRestriction = (next) => ({
  enabled: next.enabled ? "true" : "false",
  include: {
    by: next.include?.by === "terms" ? "terms" : "",
    taxonomy: String(next.include?.taxonomy || ""),
    term_data: ensureArray(next.include?.term_data),
  },
  exclude: {
    by:
      next.exclude?.by === "terms" || next.exclude?.by === "posts"
        ? next.exclude.by
        : "",
    taxonomy: String(next.exclude?.taxonomy || ""),
    term_data: ensureArray(next.exclude?.term_data),
    post_data: ensureArray(next.exclude?.post_data),
  },
});

const mapPostsPayloadToOptions = (payload) => {
  const list = Array.isArray(payload?.posts_list) ? payload.posts_list : [];
  return list.map((item) => ({
    label: item.label || item.title || String(item.value),
    value: String(item.value),
  }));
};

/**
 * Layout-level query restriction — Include / Exclude blocks.
 */
export default function QueryRestrictionSettings({
  value,
  postType,
  onChange,
}) {
  const restriction = useMemo(() => normalizeQueryRestriction(value), [value]);
  const [taxonomyList, setTaxonomyList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [loadingTax, setLoadingTax] = useState(false);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [postSearchText, setPostSearchText] = useState("");
  const postSearchTimerRef = useRef(null);
  const postSearchRequestRef = useRef(0);
  const selectedPostsRef = useRef([]);

  const needsTaxonomies =
    restriction.enabled &&
    (restriction.include.by === "terms" || restriction.exclude.by === "terms");
  const needsPosts =
    restriction.enabled && restriction.exclude.by === "posts";

  useEffect(() => {
    selectedPostsRef.current = ensureArray(restriction.exclude.post_data).map(
      (p) => ({
        label: p.label || String(p.value),
        value: String(p.value),
      })
    );
  }, [restriction.exclude.post_data]);

  const mergePostOptions = (fetched) => {
    const byValue = new Map();
    selectedPostsRef.current.forEach((opt) => {
      if (opt?.value) byValue.set(String(opt.value), opt);
    });
    ensureArray(fetched).forEach((opt) => {
      if (opt?.value) byValue.set(String(opt.value), opt);
    });
    return Array.from(byValue.values());
  };

  const fetchPostsOptions = async (search = "") => {
    if (!postType) return;
    const requestId = ++postSearchRequestRef.current;
    setFetchingPosts(true);
    try {
      const res = await apiClient.get(
        apiEndpoints.getPostsListSearch(postType, search, 30)
      );
      const payload =
        typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      if (requestId !== postSearchRequestRef.current) return;
      if (payload?.status === "success") {
        setPostsList(mergePostOptions(mapPostsPayloadToOptions(payload)));
      }
    } catch (error) {
      console.error("Query restriction posts load failed:", error);
    } finally {
      if (requestId === postSearchRequestRef.current) {
        setFetchingPosts(false);
      }
    }
  };

  useEffect(() => {
    if (!postType || !needsTaxonomies) return;
    let cancelled = false;
    const load = async () => {
      setLoadingTax(true);
      try {
        const res = await apiClient.get(
          apiEndpoints.getTaxonomyRecursiveData(postType)
        );
        if (!cancelled && res.data?.status === "success") {
          const list = Array.isArray(res.data.taxonomy_list)
            ? res.data.taxonomy_list.filter((item) => !item?.is_woo_virtual)
            : [];
          setTaxonomyList(list);
        }
      } catch (error) {
        console.error("Query restriction taxonomy load failed:", error);
      } finally {
        if (!cancelled) setLoadingTax(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [postType, needsTaxonomies]);

  useEffect(() => {
    if (!postType || !needsPosts) return undefined;
    setPostSearchText("");
    fetchPostsOptions("");
    return () => {
      if (postSearchTimerRef.current) {
        clearTimeout(postSearchTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postType, needsPosts]);

  const taxonomyOptions = useMemo(() => {
    const opts = getTaxonomyPickerSelectOptions(taxonomyList, "Select taxonomy");
    return opts.filter((opt) => opt.value !== "0");
  }, [taxonomyList]);

  const getTermOptions = (taxonomyKey) => {
    const tax = taxonomyList.find(
      (item) => String(item.key) === String(taxonomyKey)
    );
    return flattenTerms(tax?.term_data || []).map((term) => ({
      label: term.name,
      value: String(term.key),
    }));
  };

  const commit = (next) => {
    onChange(serializeRestriction(next));
  };

  const patch = (mutator) => {
    const draft = {
      enabled: restriction.enabled,
      include: { ...restriction.include, term_data: [...restriction.include.term_data] },
      exclude: {
        ...restriction.exclude,
        term_data: [...restriction.exclude.term_data],
        post_data: [...restriction.exclude.post_data],
      },
    };
    mutator(draft);
    commit(draft);
  };

  const handleEnable = (checked) => {
    patch((draft) => {
      draft.enabled = checked;
      if (!checked) {
        draft.include = emptyInclude();
        draft.exclude = emptyExclude();
      }
    });
  };

  const handlePostSearch = (searchText) => {
    const next = String(searchText || "");
    setPostSearchText(next);
    if (postSearchTimerRef.current) {
      clearTimeout(postSearchTimerRef.current);
    }
    // Keep selected values visible while searching; hide stale unmatched options.
    setPostsList(selectedPostsRef.current);
    postSearchTimerRef.current = setTimeout(() => {
      fetchPostsOptions(next.trim());
    }, 350);
  };

  const renderTermsPickers = (side) => {
    const block = side === "include" ? restriction.include : restriction.exclude;
    const termOptions = block.taxonomy ? getTermOptions(block.taxonomy) : [];
    const selectedTermValues = ensureArray(block.term_data).map((t) =>
      String(t.key)
    );

    return (
      <div style={{ marginTop: 8 }}>
        <Select
          allowClear
          placeholder="Select taxonomy"
          style={{ width: "100%", marginBottom: 8 }}
          options={taxonomyOptions}
          value={block.taxonomy || undefined}
          onChange={(taxKey) => {
            patch((draft) => {
              const target = side === "include" ? draft.include : draft.exclude;
              target.taxonomy = taxKey ? String(taxKey) : "";
              target.term_data = [];
            });
          }}
          optionFilterProp="label"
        />
        {block.taxonomy ? (
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="Select terms"
            style={{ width: "100%" }}
            options={termOptions}
            value={selectedTermValues}
            onChange={(values) => {
              patch((draft) => {
                const target =
                  side === "include" ? draft.include : draft.exclude;
                target.term_data = ensureArray(values).map((val) => {
                  const fromList = termOptions.find(
                    (t) => String(t.value) === String(val)
                  );
                  return {
                    key: Number.isFinite(Number(val)) ? Number(val) : val,
                    name: fromList?.label || String(val),
                  };
                });
              });
            }}
            optionFilterProp="label"
            maxTagCount="responsive"
          />
        ) : null}
      </div>
    );
  };

  return (
    <div className="caf-main-setting-page data-field caf-query-restriction-settings">
      <label className="caf-main-setting-page label">Query Restriction</label>
      <div
        className="caf-query-restriction-enable"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.85 }}>
          Limit which posts can appear
        </span>
        <Switch checked={restriction.enabled} onChange={handleEnable} />
      </div>

      {restriction.enabled && (
        <>
          <p style={{ fontSize: 11, margin: "0 0 10px", opacity: 0.75 }}>
            Use include, exclude, or both. Filters only narrow further within
            this pool. Separate from Build Your Query.
          </p>

          {loadingTax && (
            <Skeleton active paragraph={{ rows: 2 }} title={false} />
          )}

          <div style={{ marginBottom: 12 }}>
            <label className="caf-main-setting-page label">Include by</label>
            <Select
              style={{ width: "100%" }}
              options={INCLUDE_BY_OPTIONS}
              value={restriction.include.by}
              onChange={(by) => {
                patch((draft) => {
                  draft.include =
                    by === "terms"
                      ? { by: "terms", taxonomy: "", term_data: [] }
                      : emptyInclude();
                });
              }}
            />
            {restriction.include.by === "terms" && renderTermsPickers("include")}
          </div>

          <div>
            <label className="caf-main-setting-page label">Exclude by</label>
            <Select
              style={{ width: "100%" }}
              options={EXCLUDE_BY_OPTIONS}
              value={restriction.exclude.by}
              onChange={(by) => {
                patch((draft) => {
                  if (by === "terms") {
                    draft.exclude = {
                      by: "terms",
                      taxonomy: "",
                      term_data: [],
                      post_data: [],
                    };
                  } else if (by === "posts") {
                    draft.exclude = {
                      by: "posts",
                      taxonomy: "",
                      term_data: [],
                      post_data: [],
                    };
                  } else {
                    draft.exclude = emptyExclude();
                  }
                });
              }}
            />
            {restriction.exclude.by === "terms" &&
              renderTermsPickers("exclude")}
            {restriction.exclude.by === "posts" && (
              <div style={{ marginTop: 8 }}>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  searchValue={postSearchText}
                  onSearch={handlePostSearch}
                  filterOption={false}
                  defaultActiveFirstOption={false}
                  notFoundContent={
                    fetchingPosts ? (
                      <div style={{ padding: 8, textAlign: "center" }}>
                        <Spin size="small" />
                      </div>
                    ) : postSearchText ? (
                      "No posts found"
                    ) : (
                      "Type to search posts"
                    )
                  }
                  placeholder="Type to search posts…"
                  style={{ width: "100%" }}
                  options={postsList}
                  value={restriction.exclude.post_data.map((p) =>
                    String(p.value)
                  )}
                  onChange={(values) => {
                    setPostSearchText("");
                    patch((draft) => {
                      draft.exclude.post_data = ensureArray(values).map(
                        (val) => {
                          const found = postsList.find(
                            (p) => String(p.value) === String(val)
                          );
                          const prev = restriction.exclude.post_data.find(
                            (p) => String(p.value) === String(val)
                          );
                          return {
                            value: String(val),
                            label: found?.label || prev?.label || String(val),
                          };
                        }
                      );
                    });
                  }}
                  onDropdownVisibleChange={(open) => {
                    if (open && postsList.length <= selectedPostsRef.current.length) {
                      fetchPostsOptions(postSearchText.trim());
                    }
                  }}
                  maxTagCount="responsive"
                  optionFilterProp="label"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
