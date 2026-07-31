export const apiEndpoints = Object.freeze({
  getPostTypes: "get-post-types",
  getPostsList: (postType) =>
    `get-posts-list?post_type=${encodeURIComponent(postType)}`,
  getPostsListSearch: (postType, search = "", perPage = 40) => {
    const params = new URLSearchParams({
      post_type: postType,
      per_page: String(perPage),
      lite: "1",
    });
    if (search) {
      params.set("search", search);
    }
    return `get-posts-list?${params.toString()}`;
  },

  saveBuilderLayout: "save-builder-layout/",
  updateBuilderLayout: "update-builder-layout/",
  renameBuilderLayoutLabel: "rename-builder-layout-label/",
  getPreviewPosts: () => "get-preview-posts/",
  verifyTaxonomyTerms: (taxonomy) =>
    `verify-taxonomy-terms?taxonomy=${JSON.stringify(taxonomy)}`,
  getDateByFormat: (id, format) =>
    `get-date/?id=${id}&format=${encodeURIComponent(format)}`,
  getTaxonomyRecursiveData: (postType) =>
    `get-taxo-data-with-recursive-method/?post-type=${encodeURIComponent(
      postType
    )}`,
  getContentLength: "get-content-length",
  getCfFieldValue: "get-cf-field-value/",
  getCfFieldList: "get-cf-list/",
  getWooProductPriceRange: "get-woo-product-price-range/",
  getWooProductMetaRange: (metaKey) =>
    `get-woo-product-meta-range/?meta_key=${encodeURIComponent(metaKey)}`,
  getWooAttributeTermVisuals: (taxonomy) =>
    `get-woo-attribute-term-visuals/?taxonomy=${encodeURIComponent(taxonomy)}`,
  postTypesByBuilderIndex: (builderIndex) =>
    `post-types/?builder_index=${builderIndex}`,
  postsByTypeAndBuilderIndex: (postType, builderIndex) =>
    `get-posts?post_type=${encodeURIComponent(postType)}&&builder_index=${builderIndex}`,
  saveBuilderLayout2: "save-builder-layout2/",
  renameLayoutLabel: "rename-layout-label/",
  renameFilterLayoutLabel: "rename-filter-layout-label/",
  saveFilterLayout: "save-filter-layout/",
  optionsByBuilderIndex: (builderIndex) =>
    `options/?builder_index=${builderIndex}`,
  getFilterOptionsByBuilderIndex: (builderIndex) =>
    `get-filter-options/?builder_index=${builderIndex}`,

  layouts: "layouts",
  addOptions: (title) => `add-options/?title=${encodeURIComponent(title)}`,
  deleteOptions: (index) => `delete-options/?index=${index}`,

  filterLayouts: "filter-layouts",
  addFilterOptions: (title) =>
    `add-filter-options/?title=${encodeURIComponent(title)}`,
  deleteFilterOptions: (index) => `delete-filter-options/?index=${index}`,

  getLayoutsList: (page,keyword) => `get-layouts-list?page=${page}&search=${keyword}`,
  getTrashLayoutsList: (page,keyword) => `get-trash-layouts-list?page=${page}&search=${keyword}`,
  moveToTrash: "move-to-trash",
  bulkLayoutsRestore: "bulk-layouts-restore",
  bulkLayoutsDeletePermanent: "bulk-layouts-delete-permanent",

  getLayoutData: "get-layout-data",
  deleteLayout: "delete-layout",
  deleteBuilderLayout: (index) => `delete-builder-layout?index=${index}`,
  restoreLayout: "restore-layout",
  restoreBuilderLayout: (index) => `restore-builder-layout?index=${index}`,
  deleteLayoutPermanent: "delete-layout-permanent",
  deleteBuilderLayoutPermanent: (index) =>
    `delete-builder-layout-permanent?index=${index}`,
  cloneLayout: "clone-layout",
  cloneBuilderLayout: (index) => `clone-builder-layout?index=${index}`,
  exportDefaultLayout: "export-default-layout",
  exportBuilderLayout: "export-builder-layout",

  customFonts: "custom-fonts/",
  customFontBySlug: (slug) => `custom-fonts/${encodeURIComponent(slug)}`,

  logClientError: "log-client-error",
});
