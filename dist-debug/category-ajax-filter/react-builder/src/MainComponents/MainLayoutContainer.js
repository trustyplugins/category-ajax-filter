import React, { useCallback, useEffect, useRef, useState } from "react";
import BuilderErrorBoundary from "../components/BuilderErrorBoundary";
import ConnectionLostBanner from "../components/ConnectionLostBanner";
import Header from "./Header";
import SelectFilterPostPage from "./SelectFilterPostPage";
import PostBuilderContainer from "./PostComponents/PostBuilderContainer";
import FilterContainer from "./FilterComponents/FilterContainer";
import PostPreviewLayout from "./PreviewComponents/PostPreviewLayout";
import { resolvePostExtraDataFromBuilderData, isBuilderLayoutDocument } from "./utils/builderDataAdapters";
import { resetBuilderPreviewDeviceForOpen } from "./utils/builderPreviewDevice";
import { migrateLayoutDocument } from "../layoutSchema/migrateLayoutDocument";
import { getMaxStoredBuilderRevisions } from "../tier/capabilities";

function LayoutContainer(props) {
  const REVISION_DEBOUNCE_MS = 12000;
  const MAX_DIFF_SCAN = 800;
  const REVISION_STORAGE_PREFIX = "caf_builder_revisions_v1";
  const createRevisionEntry = (data, label = "Builder change") => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    label,
    data: structuredClone(data),
  });
  const getRevisionIndexById = (items, id) =>
    items.findIndex((entry) => entry.id === id);
  const getRevisionStorageKey = (data) => {
    const layoutKey = data?.common_data?.layout_key || "unknown";
    const layoutIndex = data?.common_data?.layout_index || "na";
    return `${REVISION_STORAGE_PREFIX}:${layoutKey}:${layoutIndex}`;
  };
  const loadStoredRevisions = (data) => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(getRevisionStorageKey(data));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.revisions) || parsed.revisions.length === 0) {
        return null;
      }
      const normalized = parsed.revisions
        .filter((item) => item?.id && item?.data)
        .slice(-getMaxStoredBuilderRevisions())
        .map((item) => ({
          ...item,
          data: migrateLayoutDocument(item.data).doc,
        }));
      return {
        revisions: normalized,
        currentRevisionId: parsed.currentRevisionId || "",
      };
    } catch (error) {
      return null;
    }
  };
  const toFriendlyRevisionLabel = (path = []) => {
    if (!Array.isArray(path) || path.length === 0) return "Builder change";
    const raw = path.filter(Boolean).map(String);
    const styleIndex = raw.findIndex((segment) => segment === "style");
    if (styleIndex >= 0) {
      const property = raw[raw.length - 1] || "property";
      const context =
        raw.includes("filter_layout_data") || raw.includes("post_layout_data")
          ? "Module style"
          : "Style";
      return `${context} > ${property}`;
    }
    if (raw.includes("settings")) {
      const property = raw[raw.length - 1] || "settings";
      return `Settings > ${property}`;
    }
    if (raw.includes("initial_data")) {
      return "Layout structure updated";
    }
    if (raw.includes("extra_data")) {
      const property = raw[raw.length - 1] || "extra data";
      return `Extra data > ${property}`;
    }
    if (raw.includes("common_data")) {
      const property = raw[raw.length - 1] || "common data";
      return `Common data > ${property}`;
    }
    return `Updated ${raw[raw.length - 1] || "builder data"}`;
  };
  const findFirstChangedPath = (prev, next) => {
    let scanned = 0;
    const walk = (a, b, trail) => {
      if (scanned >= MAX_DIFF_SCAN) return null;
      scanned += 1;
      if (Object.is(a, b)) return null;
      const aIsObj = a && typeof a === "object";
      const bIsObj = b && typeof b === "object";
      if (!aIsObj || !bIsObj) {
        return trail;
      }
      if (Array.isArray(a) !== Array.isArray(b)) {
        return trail;
      }
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return [...trail, "length"];
        for (let i = 0; i < a.length; i += 1) {
          const hit = walk(a[i], b[i], [...trail, `[${i}]`]);
          if (hit) return hit;
        }
        return null;
      }
      const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
      for (const key of keys) {
        if (!(key in (a || {})) || !(key in (b || {}))) {
          return [...trail, key];
        }
        const hit = walk(a[key], b[key], [...trail, key]);
        if (hit) return hit;
      }
      return null;
    };
    return walk(prev, next, []);
  };
  const getRevisionLabel = (prev, next) => {
    const rootCandidates = ["filter_layout_data", "post_layout_data", "common_data"];
    let changedPath = null;
    for (const rootKey of rootCandidates) {
      const prevChunk = prev?.[rootKey];
      const nextChunk = next?.[rootKey];
      if (JSON.stringify(prevChunk) !== JSON.stringify(nextChunk)) {
        const nestedPath = findFirstChangedPath(prevChunk, nextChunk);
        changedPath = nestedPath ? [rootKey, ...nestedPath] : [rootKey];
        break;
      }
    }
    if (!changedPath) {
      changedPath = findFirstChangedPath(prev, next);
    }
    if (!changedPath || changedPath.length === 0) return "Builder change";
    return toFriendlyRevisionLabel(changedPath);
  };
  const initialRevision = createRevisionEntry(
    props.mainBuilderData,
    "Initial state"
  );

  const [mainBuilderData, setMainBuilderData] = useState(props.mainBuilderData);
  const [currStep, setCurrStep] = useState("1");
  const [selectType, setSelectType] = useState("");
  const [previewState, setPreviewState] = useState("1");
  const [restoreVersion, setRestoreVersion] = useState(0);
  const [revisions, setRevisions] = useState(() => [initialRevision]);
  const [currentRevisionId, setCurrentRevisionId] = useState(
    initialRevision.id || ""
  );
  const currentRevisionIdRef = useRef(currentRevisionId);
  const debounceTimerRef = useRef(null);
  const pendingRevisionRef = useRef(null);

  useEffect(() => {
    currentRevisionIdRef.current = currentRevisionId;
  }, [currentRevisionId]);

  useEffect(() => {
    const { doc: openedLayout } = migrateLayoutDocument(
      resetBuilderPreviewDeviceForOpen(props.mainBuilderData)
    );
    setMainBuilderData(openedLayout);
    const stored = loadStoredRevisions(openedLayout);
    if (stored?.revisions?.length) {
      setRevisions(stored.revisions);
      const hasCurrent = stored.revisions.some(
        (entry) => entry.id === stored.currentRevisionId
      );
      const fallbackId = stored.revisions[stored.revisions.length - 1]?.id || "";
      setCurrentRevisionId(hasCurrent ? stored.currentRevisionId : fallbackId);
    } else {
      const seed = createRevisionEntry(openedLayout, "Loaded layout");
      setRevisions([seed]);
      setCurrentRevisionId(seed.id);
    }
    pendingRevisionRef.current = null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [props.mainBuilderData]);

  useEffect(() => {
    if (props.selectType === "filter-settings") {
      setCurrStep("1");
      setSelectType("filter");
      return;
    }

    if (props.selectType === "post-settings") {
      const extraData = resolvePostExtraDataFromBuilderData(
        props.mainBuilderData
      );

      if (extraData?.layout_source === "caf_builder") {
        setCurrStep("2");
        setSelectType("post");
      } else {
        // Filter only: no CAF post design or layout settings.
        setCurrStep("0");
        setSelectType("");
      }
      return;
    }

    if (props.selectType === "preview-settings") {
      const extraData = resolvePostExtraDataFromBuilderData(
        props.mainBuilderData
      );
      if (extraData?.layout_source === "caf_builder") {
        setCurrStep("3");
        setSelectType("post-preview");
      } else {
        setCurrStep("0");
        setSelectType("");
      }
      return;
    }

    setCurrStep("0");
    setSelectType("");
  }, [props.selectType, props.mainBuilderData]);

  const commitPendingRevision = useCallback(() => {
    const pending = pendingRevisionRef.current;
    if (!pending) return;
    setRevisions((prevRevisions) => {
      const activeIndex = getRevisionIndexById(
        prevRevisions,
        currentRevisionIdRef.current
      );
      const base =
        activeIndex >= 0
          ? prevRevisions.slice(0, activeIndex + 1)
          : [...prevRevisions];
      const prevData = base[base.length - 1]?.data;
      const dynamicLabel = getRevisionLabel(prevData, pending);
      const next = [...base, createRevisionEntry(pending, dynamicLabel)];
      const maxRevisions = getMaxStoredBuilderRevisions();
      const limited =
        next.length > maxRevisions
          ? next.slice(next.length - maxRevisions)
          : next;
      const latest = limited[limited.length - 1];
      if (latest?.id) {
        setCurrentRevisionId(latest.id);
      }
      return limited;
    });
    pendingRevisionRef.current = null;
  }, []);

  const updatedBuilderData = useCallback(
    (data) => {
      // Filter modules must commit via dispatchFilterLayoutChange. A bare rows
      // array would be treated as invalid by migrateLayoutDocument and wipe the layout.
      if (!isBuilderLayoutDocument(data)) {
        if (typeof console !== "undefined" && console.error) {
          console.error(
            "[CAF Builder] Ignored invalid layout update (expected full layout document)."
          );
        }
        return;
      }
      const { doc } = migrateLayoutDocument(data);
      setMainBuilderData((prev) => {
        const nextDoc = structuredClone(doc);
        pendingRevisionRef.current = structuredClone(doc);
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          commitPendingRevision();
          debounceTimerRef.current = null;
        }, REVISION_DEBOUNCE_MS);
        return nextDoc;
      });
    },
    [commitPendingRevision]
  );

  const handleRestoreRevision = useCallback((revisionId) => {
    pendingRevisionRef.current = null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const targetIndex = getRevisionIndexById(revisions, revisionId);
    if (targetIndex < 0) return;
    const target = revisions[targetIndex];
    if (!target?.data) return;
    const { doc } = migrateLayoutDocument(structuredClone(target.data));
    setMainBuilderData(doc);
    setCurrentRevisionId(target.id);
    currentRevisionIdRef.current = target.id;
    setRestoreVersion((prev) => prev + 1);
  }, [revisions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload = {
        revisions: revisions.slice(-getMaxStoredBuilderRevisions()),
        currentRevisionId,
      };
      window.sessionStorage.setItem(
        getRevisionStorageKey(mainBuilderData),
        JSON.stringify(payload)
      );
    } catch (error) {
      // Ignore storage quota/serialization errors to keep builder responsive.
    }
  }, [revisions, currentRevisionId, mainBuilderData]);

  useEffect(
    () => () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    },
    []
  );

  return (
    <div className="caf-layout-container-page">
      <div className="caf-inner-container">
        <div className="caf-layout-header-section">
          <Header
            selectType={selectType}
            setSelectType={setSelectType}
            currStep={currStep}
            setCurrStep={setCurrStep}
            mainBuilderData={mainBuilderData}
            updatedBuilderData={updatedBuilderData}
            closeAllPopUps={props.closeAllPopUps}
            previewState={setPreviewState}
            revisionHistory={revisions}
            currentRevisionId={currentRevisionId}
            onRestoreRevision={handleRestoreRevision}
          />
        </div>

        <ConnectionLostBanner />

        <div
          className={`caf-main-layout-content-section ${
            selectType === "post-preview" ? "layout-preview" : ""
          }`}
        >
          {selectType === "" ? (
            <BuilderErrorBoundary
              section="select"
              resetKey={`select-${restoreVersion}`}
            >
              <SelectFilterPostPage
                key={`select-${restoreVersion}`}
                currStep={currStep}
                setCurrStep={setCurrStep}
                selectType={selectType}
                setSelectType={setSelectType}
                updatedBuilderData={updatedBuilderData}
                mainBuilderData={mainBuilderData}
              />
            </BuilderErrorBoundary>
          ) : selectType === "post" ? (
            <BuilderErrorBoundary
              section="post"
              resetKey={`post-${restoreVersion}`}
            >
              <PostBuilderContainer
                key={`post-${restoreVersion}`}
                selectType={selectType}
                setSelectType={setSelectType}
                currStep={currStep}
                setCurrStep={setCurrStep}
                mainBuilderData={mainBuilderData}
                updatedBuilderData={updatedBuilderData}
              />
            </BuilderErrorBoundary>
          ) : selectType === "filter" ? (
            <BuilderErrorBoundary
              section="filter"
              resetKey={`filter-${restoreVersion}`}
            >
              <FilterContainer
                key={`filter-${restoreVersion}`}
                mainBuilderData={mainBuilderData}
                updatedBuilderData={updatedBuilderData}
                previewState={setPreviewState}
                previewVal={previewState}
                setSelectType={setSelectType}
                setCurrStep={setCurrStep}
                selectType={selectType}
                currStep={currStep}
              />
            </BuilderErrorBoundary>
          ) : (
            <BuilderErrorBoundary
              section="preview"
              resetKey={`preview-${restoreVersion}`}
            >
              <PostPreviewLayout
                key={`preview-${restoreVersion}`}
                mainBuilderData={mainBuilderData}
                updatedBuilderData={updatedBuilderData}
                setSelectType={setSelectType}
                setCurrStep={setCurrStep}
                selectType={selectType}
                currStep={currStep}
              />
            </BuilderErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}

export default LayoutContainer;