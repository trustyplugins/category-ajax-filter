import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import apiClient from "../../../../api/client";
import { apiEndpoints } from "../../../../api/endpoints";

import {
  findBestMatchingVariation,
  isAttributeOptionAvailable,
  isAttributeOptionGloballyAvailable,
} from "../../../../shared/variationMatrixMatch";

const WooProductCardVariationContext = createContext(null);

function findMatchingVariation(matrix, selections) {
  return findBestMatchingVariation(matrix, selections);
}

export function findFirstCompatibleSlug(matrix, selections, taxonomy, slugOrder = []) {
  const tax = String(taxonomy || "").trim();
  if (!tax || !matrix?.variations?.length) {
    return "";
  }

  const candidates = [];
  slugOrder.forEach((slug) => {
    const value = String(slug || "").trim();
    if (value && candidates.indexOf(value) === -1) {
      candidates.push(value);
    }
  });
  matrix.variations.forEach((row) => {
    const value = String(row?.attributes?.[tax] || "").trim();
    if (value && candidates.indexOf(value) === -1) {
      candidates.push(value);
    }
  });

  for (let i = 0; i < candidates.length; i += 1) {
    const slug = candidates[i];
    if (isAttributeOptionAvailable(matrix, selections, tax, slug)) {
      return slug;
    }
  }

  return "";
}

export function reconcileSelections(matrix, selections, changedTaxonomy, slugOrderByTax = {}) {
  const next = selections && typeof selections === "object" ? { ...selections } : {};
  if (!matrix?.attributes?.length) {
    return next;
  }

  const changedTax = String(changedTaxonomy || "").trim();
  const attributes = matrix.attributes
    .map((taxonomy) => String(taxonomy || "").trim())
    .filter(Boolean);
  const taxesToFix = changedTax
    ? attributes.filter((tax) => tax !== changedTax)
    : attributes;

  let changed = true;
  while (changed) {
    changed = false;
    taxesToFix.forEach((tax) => {
      const slug = String(next[tax] || "").trim();
      if (!slug) {
        return;
      }
      if (isAttributeOptionAvailable(matrix, next, tax, slug)) {
        return;
      }

      const replacement = findFirstCompatibleSlug(
        matrix,
        next,
        tax,
        slugOrderByTax[tax] || []
      );
      if (replacement) {
        if (replacement !== slug) {
          next[tax] = replacement;
          changed = true;
        }
        return;
      }

      delete next[tax];
      changed = true;
    });
  }

  return next;
}

function pruneInvalidSelections(matrix, selections) {
  const next = selections && typeof selections === "object" ? { ...selections } : {};
  if (!matrix?.attributes?.length) {
    return next;
  }

  let changed = true;
  while (changed) {
    changed = false;
    matrix.attributes.forEach((taxonomy) => {
      const tax = String(taxonomy || "").trim();
      const slug = String(next[tax] || "").trim();
      if (!tax || !slug) {
        return;
      }
      if (isAttributeOptionAvailable(matrix, next, tax, slug)) {
        return;
      }
      delete next[tax];
      changed = true;
    });
  }

  return next;
}

/**
 * Overlay filter attribute selections onto card defaults.
 * filterSlugMap: { taxonomy: [slug, ...] } — first available slug wins.
 */
export function mergeFilterSlugMapIntoSelections(matrix, baseSelections, filterSlugMap) {
  const next =
    baseSelections && typeof baseSelections === "object" ? { ...baseSelections } : {};
  if (!matrix?.attributes?.length || !filterSlugMap || typeof filterSlugMap !== "object") {
    return reconcileSelections(matrix, next, "", {});
  }

  const pending = {};
  matrix.attributes.forEach((taxonomy) => {
    const tax = String(taxonomy || "").trim();
    const candidates = filterSlugMap[tax];
    if (!tax || !Array.isArray(candidates) || !candidates.length) {
      return;
    }
    // Clear conflicting defaults for filter-driven attributes.
    delete next[tax];
    pending[tax] = candidates;
  });

  let progress = true;
  while (progress) {
    progress = false;
    Object.keys(pending).forEach((tax) => {
      if (next[tax]) {
        return;
      }
      const candidates = pending[tax];
      for (let i = 0; i < candidates.length; i += 1) {
        const rawSlug = String(candidates[i] || "").trim();
        if (!rawSlug) {
          continue;
        }
        const matchedRow = (matrix.variations || []).find(
          (row) =>
            String(row?.attributes?.[tax] || "").trim().toLowerCase() ===
            rawSlug.toLowerCase()
        );
        const slug = matchedRow
          ? String(matchedRow.attributes[tax]).trim()
          : rawSlug;
        const existsOnProduct = Boolean(matchedRow);
        if (!existsOnProduct) {
          continue;
        }
        if (!isAttributeOptionAvailable(matrix, next, tax, slug)) {
          continue;
        }
        next[tax] = slug;
        progress = true;
        break;
      }
    });
  }

  return reconcileSelections(matrix, next, "", {});
}

/**
 * Convert filter term IDs → slugs using the product's category/term payload.
 * filterTermIdsByTax: { taxonomy: [termId, ...] }
 */
export function resolveFilterSlugMapForPost(postData, filterTermIdsByTax) {
  const map = {};
  if (!filterTermIdsByTax || typeof filterTermIdsByTax !== "object") {
    return map;
  }

  Object.keys(filterTermIdsByTax).forEach((taxonomy) => {
    const tax = String(taxonomy || "").trim();
    const ids = filterTermIdsByTax[tax];
    if (!tax || !Array.isArray(ids) || !ids.length) {
      return;
    }

    const terms = Array.isArray(postData?.categories?.[tax])
      ? postData.categories[tax]
      : [];

    const slugs = [];
    ids.forEach((rawId) => {
      const id = Number(rawId);
      if (!Number.isFinite(id) || id <= 0) {
        return;
      }
      const match = terms.find(
        (term) => Number(term?.term_id ?? term?.id ?? term?.key) === id
      );
      const slug = match?.slug ? String(match.slug).trim() : "";
      if (slug && slugs.indexOf(slug) === -1) {
        slugs.push(slug);
      }
    });

    if (slugs.length) {
      map[tax] = slugs;
    }
  });

  return map;
}

function buildInitialSelections(matrix, filterSlugMap = null) {
  const defaults =
    matrix?.defaults && typeof matrix.defaults === "object"
      ? { ...matrix.defaults }
      : {};
  const merged = mergeFilterSlugMapIntoSelections(matrix, defaults, filterSlugMap);
  return matrix ? reconcileSelections(matrix, merged, "", {}) : merged;
}

export function WooProductCardVariationProvider({
  postData,
  filterTermIdsByTax = null,
  filterSlugMap = null,
  children,
}) {
  const matrix = postData?.variation_card_context || null;
  const resolvedFilterSlugMap = useMemo(() => {
    if (filterSlugMap && typeof filterSlugMap === "object") {
      return filterSlugMap;
    }
    return resolveFilterSlugMapForPost(postData, filterTermIdsByTax);
  }, [filterSlugMap, filterTermIdsByTax, postData]);

  const filterMapSignature = useMemo(() => {
    try {
      return JSON.stringify(resolvedFilterSlugMap || {});
    } catch (error) {
      return "";
    }
  }, [resolvedFilterSlugMap]);

  const [selections, setSelections] = useState(() =>
    matrix ? buildInitialSelections(matrix, resolvedFilterSlugMap) : {}
  );

  useEffect(() => {
    setSelections(
      matrix ? buildInitialSelections(matrix, resolvedFilterSlugMap) : {}
    );
  }, [postData?.id, matrix, filterMapSignature]);

  const setSelection = useCallback(
    (taxonomy, slug, slugOrder = []) => {
      const tax = String(taxonomy || "").trim();
      const value = String(slug || "").trim();
      if (!tax) {
        return;
      }
      setSelections((prev) => {
        const draft = { ...prev };
        if (!value) {
          delete draft[tax];
        } else {
          if (
            matrix &&
            !isAttributeOptionGloballyAvailable(matrix, tax, value)
          ) {
            return prev;
          }
          draft[tax] = value;
        }
        if (!matrix) {
          return draft;
        }
        return reconcileSelections(matrix, draft, tax, { [tax]: slugOrder });
      });
    },
    [matrix]
  );

  const resolvedVariation = useMemo(
    () => (matrix ? findMatchingVariation(matrix, selections) : null),
    [matrix, selections]
  );

  const isComplete = useMemo(() => {
    if (!matrix?.attributes?.length) {
      return false;
    }
    return matrix.attributes.every((tax) => Boolean(selections[tax]));
  }, [matrix, selections]);

  const isOptionAvailable = useCallback(
    (taxonomy, slug) => {
      if (!matrix) {
        return true;
      }
      return isAttributeOptionGloballyAvailable(matrix, taxonomy, slug);
    },
    [matrix]
  );

  const isOptionCompatible = useCallback(
    (taxonomy, slug) => {
      if (!matrix) {
        return true;
      }
      if (!isAttributeOptionGloballyAvailable(matrix, taxonomy, slug)) {
        return false;
      }
      return isAttributeOptionAvailable(matrix, selections, taxonomy, slug);
    },
    [matrix, selections]
  );

  const value = useMemo(
    () => ({
      matrix,
      selections,
      setSelection,
      resolvedVariation,
      isComplete,
      isOptionAvailable,
      isOptionCompatible,
      postData: postData || null,
    }),
    [
      matrix,
      selections,
      setSelection,
      resolvedVariation,
      isComplete,
      isOptionAvailable,
      isOptionCompatible,
      postData,
    ]
  );

  return (
    <WooProductCardVariationContext.Provider value={value}>
      {children}
    </WooProductCardVariationContext.Provider>
  );
}

function variationContextNeedsRefresh(context) {
  if (!context || typeof context !== "object") {
    return true;
  }
  // Older matrices (pre image sync) lack parent_image — refetch for preview consistency.
  if (!Object.prototype.hasOwnProperty.call(context, "parent_image")) {
    return true;
  }
  return false;
}

function getLayoutSignature(layoutInitialData) {
  if (!Array.isArray(layoutInitialData) || layoutInitialData.length === 0) {
    return "";
  }
  try {
    return JSON.stringify(layoutInitialData);
  } catch (error) {
    return String(layoutInitialData.length);
  }
}

/**
 * Ensures post builder preview has variation_card_context (posts list API omits it).
 */
export function PostVariationPreviewProvider({
  postData,
  layoutInitialData,
  children,
}) {
  const [resolvedPostData, setResolvedPostData] = useState(postData || {});
  const layoutInitialDataRef = useRef(layoutInitialData);
  layoutInitialDataRef.current = layoutInitialData;
  const layoutSignature = getLayoutSignature(layoutInitialData);

  useEffect(() => {
    setResolvedPostData((prev) => {
      const next = postData || {};
      const nextId = Number(next?.id ?? next?.value ?? 0);
      const prevId = Number(prev?.id ?? prev?.value ?? 0);
      // Keep fetched variation matrix when the same preview post is re-passed.
      if (
        nextId > 0 &&
        nextId === prevId &&
        prev?.variation_card_context &&
        !next?.variation_card_context
      ) {
        return {
          ...next,
          variation_card_context: prev.variation_card_context,
        };
      }
      return next;
    });
  }, [postData]);

  useEffect(() => {
    const postId = Number(postData?.id ?? postData?.value ?? 0);
    if (!postId || !layoutSignature) {
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.post(apiEndpoints.getPreviewPosts(), {
          query_data: {
            query: {
              post_type: "product",
              post__in: [postId],
              posts_per_page: 1,
              post_status: "publish",
            },
            post_layout_data: {
              initial_data: layoutInitialDataRef.current,
            },
          },
        });
        const payload = typeof data === "string" ? JSON.parse(data) : data;
        const previewPost = payload?.posts_list?.[0];
        if (cancelled || !previewPost?.variation_card_context) {
          // Keep a fresh incoming matrix if preview has no swatches/matrix.
          if (
            !cancelled &&
            postData?.variation_card_context &&
            !variationContextNeedsRefresh(postData.variation_card_context)
          ) {
            setResolvedPostData((prev) => ({
              ...prev,
              ...(postData || {}),
              variation_card_context: postData.variation_card_context,
            }));
          }
          return;
        }
        setResolvedPostData((prev) => ({
          ...prev,
          ...previewPost,
          variation_card_context: previewPost.variation_card_context,
        }));
      } catch (error) {
        // Preview falls back to parent product price/image when context is unavailable.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postData?.id, postData?.value, layoutSignature]);

  return (
    <WooProductCardVariationProvider postData={resolvedPostData}>
      {children}
    </WooProductCardVariationProvider>
  );
}

export function useWooProductCardVariation() {
  return useContext(WooProductCardVariationContext);
}

/**
 * Resolve card image URL for the current variation selection (builder preview + modules).
 *
 * @param {object|null} variationCtx From useWooProductCardVariation().
 * @param {string} fallbackSrc Parent / featured image URL.
 * @returns {string}
 */
export function resolveVariationDisplayImageSrc(variationCtx, fallbackSrc = "") {
  const fallback = String(fallbackSrc || "").trim();
  if (
    variationCtx?.isComplete &&
    variationCtx?.resolvedVariation?.image?.src
  ) {
    const src = String(variationCtx.resolvedVariation.image.src).trim();
    if (src) {
      return src;
    }
  }
  const parentSrc = String(variationCtx?.matrix?.parent_image?.src || "").trim();
  if (!variationCtx?.isComplete && fallback) {
    return fallback;
  }
  return fallback || parentSrc;
}

export function formatVariationPriceText(pricePayload, showPrice = "default") {
  if (!pricePayload || typeof pricePayload !== "object") {
    return "";
  }
  const mode = String(showPrice || "default");
  if (mode === "lowest_price" && pricePayload.lowest_price) {
    return String(pricePayload.lowest_price);
  }
  if (mode === "highest_price" && pricePayload.highest_price) {
    return String(pricePayload.highest_price);
  }
  return String(pricePayload.default || pricePayload.display_price || "");
}

export function shouldShowVariationRegularPriceAffix(pricePayload, mainPriceText) {
  if (!pricePayload || typeof pricePayload !== "object") {
    return false;
  }

  const sale = pricePayload.sale_price;
  if (
    sale === null ||
    sale === undefined ||
    sale === "" ||
    sale === false
  ) {
    return false;
  }

  const affix = String(pricePayload.regular_affix || "").trim();
  if (!affix) {
    return false;
  }

  const main = String(mainPriceText || "").trim();
  if (main && affix === main) {
    return false;
  }

  return true;
}

export function resolveVariationRegularPriceAffix(pricePayload, showPrice = "default") {
  if (!pricePayload || typeof pricePayload !== "object") {
    return "";
  }

  const mainText = formatVariationPriceText(pricePayload, showPrice);
  if (!shouldShowVariationRegularPriceAffix(pricePayload, mainText)) {
    return "";
  }

  return String(pricePayload.regular_affix || "").trim();
}

export {
  isAttributeOptionGloballyAvailable,
  isAttributeOptionAvailable,
} from "../../../../shared/variationMatrixMatch";
