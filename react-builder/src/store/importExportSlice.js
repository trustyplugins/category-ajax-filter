import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const sanitizeImportFileMeta = (file) => {
  if (!file || typeof file !== "object") {
    return null;
  }
  return {
    uid: String(file.uid || `import-${Date.now()}`),
    name: String(file.name || "layout.json"),
    type: String(file.type || ""),
    size: Number(file.size || 0),
    lastModified: Number(file.lastModified || 0),
    status: "done",
  };
};

export const fetchLibraryTemplates = createAsyncThunk(
  "importExport/fetchLibraryTemplates",
  async (_, { rejectWithValue }) => {
    const ajaxUrl = window?.tc_caf_ajax?.ajax_url;
    const nonce = window?.tc_caf_ajax?.nonce;

    if (ajaxUrl && nonce) {
      try {
        const body = new URLSearchParams();
        body.append("action", "tc_caf_get_import_library_templates");
        body.append("nonce", nonce);

        const response = await fetch(ajaxUrl, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body: body.toString(),
        });

        const result = await response.json();

        const templates = Array.isArray(result?.data?.templates)
          ? result.data.templates
          : Array.isArray(result?.data)
            ? result.data
            : [];

        if (result?.success) {
          return templates;
        }

        const message =
          result?.data?.message || "No import library templates found.";
        const diagnostics = result?.data?.diagnostics;

        if (diagnostics && typeof diagnostics === "object") {
          const detailParts = [];
          if (diagnostics.http_code) {
            detailParts.push(`HTTP ${diagnostics.http_code}`);
          }
          if (diagnostics.server_code) {
            detailParts.push(String(diagnostics.server_code));
          }
          if (detailParts.length > 0) {
            return rejectWithValue(`${message} (${detailParts.join(", ")})`);
          }
        }

        return rejectWithValue(message);
      } catch (error) {
        return rejectWithValue(
          error?.message || "Unable to fetch library templates."
        );
      }
    }

    return rejectWithValue("Import library is not available.");
  }
);

const extractLibraryTemplateFromResponse = (result) => {
  const data = result?.data;
  if (!data || typeof data !== "object") {
    return null;
  }

  let payload = data.payload;
  if (payload && typeof payload === "object" && payload.payload && typeof payload.payload === "object") {
    payload = payload.payload;
  }

  if (payload && typeof payload === "object") {
    return { ...data, payload };
  }

  if (
    data.common_data ||
    data.module_data ||
    data.filter_layout_data ||
    data.post_layout_data
  ) {
    return { ...data, payload: data };
  }

  return null;
};

export async function fetchLibraryTemplatePayload(templateId) {
  const ajaxUrl = window?.tc_caf_ajax?.ajax_url;
  const nonce = window?.tc_caf_ajax?.nonce;
  const id = String(templateId || "").trim();

  if (!ajaxUrl || !nonce) {
    throw new Error("Import library is not available.");
  }

  if (!id) {
    throw new Error("Template ID is required.");
  }

  const body = new URLSearchParams();
  body.append("action", "tc_caf_get_import_library_template");
  body.append("nonce", nonce);
  body.append("template_id", id);

  const response = await fetch(ajaxUrl, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: body.toString(),
  });

  let result;
  try {
    result = await response.json();
  } catch (error) {
    throw new Error(
      `Template payload is not available. (HTTP ${response.status || 0})`
    );
  }

  const template = extractLibraryTemplateFromResponse(result);
  if (result?.success && template?.payload) {
    return template;
  }

  const message =
    result?.data?.message || "Template payload is not available.";
  throw new Error(message);
}

const initialState = {
  ui: {
    isOpen: false,
    activeTab: "import",
    activeImportSource: "library",
    activeExportScope: "full_layout",
    activeLayoutSettingsExportMode: "everything",
    activeLayoutSettingsExportOption: "everything",
    activeLayoutSettingsCustomOptions: [],
    activeSection: "full_filter_layout",
    activeFilterLibraryTab: "full_filter",
    activeLayoutSettingsLibraryTab: "pagination",
    selectedTemplateId: null,
    previewTemplateId: null,
  },
  data: {
    libraryTemplates: [],
    loadingTemplates: false,
    templatesError: "",
    selectedFile: null,
    selectedFileJson: null,
    availableImportScopes: [],
    selectedImportScope: "full_layout",
  },
  jobs: {
    importStatus: "idle",
    exportStatus: "idle",
    progress: 0,
    resultMessage: "",
    lastImportedLayoutMeta: null,
  },
};

const importExportSlice = createSlice({
  name: "importExport",
  initialState,
  reducers: {
    openImportExportModal(state) {
      state.ui.isOpen = true;
    },
    closeImportExportModal(state) {
      state.ui.isOpen = false;
      state.ui.activeLayoutSettingsExportMode = "everything";
      state.ui.activeLayoutSettingsExportOption = "everything";
      state.ui.activeLayoutSettingsCustomOptions = [];
      state.data.selectedFile = null;
      state.data.selectedFileJson = null;
      state.data.availableImportScopes = [];
      state.data.selectedImportScope = "full_layout";
      state.jobs.importStatus = "idle";
      state.jobs.resultMessage = "";
    },
    setImportExportTab(state, action) {
      state.ui.activeTab = action.payload;
    },
    setImportSourceTab(state, action) {
      state.ui.activeImportSource = action.payload;
    },
    setImportExportSection(state, action) {
      state.ui.activeSection = action.payload;
      if (action.payload !== "filter") {
        state.ui.activeFilterLibraryTab = "full_filter";
      }
      if (action.payload !== "layout_settings") {
        state.ui.activeLayoutSettingsLibraryTab = "pagination";
      }
    },
    setFilterLibraryTab(state, action) {
      state.ui.activeFilterLibraryTab = action.payload;
    },
    setLayoutSettingsLibraryTab(state, action) {
      state.ui.activeLayoutSettingsLibraryTab = action.payload;
    },
    setSelectedTemplate(state, action) {
      state.ui.selectedTemplateId = action.payload;
    },
    setPreviewTemplate(state, action) {
      state.ui.previewTemplateId = action.payload;
    },
    setImportStatus(state, action) {
      state.jobs.importStatus = action.payload;
    },
    setExportStatus(state, action) {
      state.jobs.exportStatus = action.payload;
    },
    setImportExportProgress(state, action) {
      state.jobs.progress = action.payload;
    },
    setImportExportResultMessage(state, action) {
      state.jobs.resultMessage = action.payload;
    },
    setSelectedImportFile(state, action) {
      state.data.selectedFile = sanitizeImportFileMeta(action.payload);
    },
    clearSelectedImportFile(state) {
      state.data.selectedFile = null;
      state.data.selectedFileJson = null;
      state.data.availableImportScopes = [];
      state.data.selectedImportScope = "full_layout";
    },
    setSelectedFileJson(state, action) {
      state.data.selectedFileJson = action.payload;
    },
    setAvailableImportScopes(state, action) {
      state.data.availableImportScopes = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
    setSelectedImportScope(state, action) {
      state.data.selectedImportScope = action.payload;
    },
    setExportScopeTab(state, action) {
      state.ui.activeExportScope = action.payload;
    },
    setLayoutSettingsExportOption(state, action) {
      state.ui.activeLayoutSettingsExportOption = action.payload;
    },
    setLayoutSettingsExportMode(state, action) {
      state.ui.activeLayoutSettingsExportMode = action.payload;
      state.ui.activeLayoutSettingsExportOption = action.payload;
      if (action.payload === "everything") {
        state.ui.activeLayoutSettingsCustomOptions = [];
      }
    },
    setLayoutSettingsCustomOptions(state, action) {
      state.ui.activeLayoutSettingsCustomOptions = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibraryTemplates.pending, (state) => {
        state.data.loadingTemplates = true;
        state.data.templatesError = "";
      })
      .addCase(fetchLibraryTemplates.fulfilled, (state, action) => {
        state.data.loadingTemplates = false;
        state.data.libraryTemplates = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchLibraryTemplates.rejected, (state, action) => {
        state.data.loadingTemplates = false;
        state.data.templatesError =
          action.payload || action.error?.message || "Unable to load templates.";
      });
  },
});

export const {
  openImportExportModal,
  closeImportExportModal,
  setImportExportTab,
  setImportSourceTab,
  setImportExportSection,
  setFilterLibraryTab,
  setLayoutSettingsLibraryTab,
  setSelectedTemplate,
  setPreviewTemplate,
  setImportStatus,
  setExportStatus,
  setImportExportProgress,
  setImportExportResultMessage,
  setSelectedImportFile,
  clearSelectedImportFile,
  setSelectedFileJson,
  setAvailableImportScopes,
  setSelectedImportScope,
  setExportScopeTab,
  setLayoutSettingsExportOption,
  setLayoutSettingsExportMode,
  setLayoutSettingsCustomOptions,
} = importExportSlice.actions;

export default importExportSlice.reducer;
