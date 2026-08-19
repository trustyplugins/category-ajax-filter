import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  inputValue: "",
  filterLayouts: false,
  filterLayoutsAvail: [],
  activeClass: "caf-filter-inactive",
  layoutKey: "",
  layoutTitle: "",
  layoutIndex: "",
  clickHeaderSettingIcon: false,
  updatedInitialData: [],
  extra_data: {},
};

const filterBuilderSlice = createSlice({
  name: "filterBuilder",
  initialState,
  reducers: {
    setInputValue(state, action) {
      state.inputValue = action.payload;
    },
    setFilterLayouts(state, action) {
      state.filterLayouts = action.payload;
    },
    setFilterLayoutsAvail(state, action) {
      state.filterLayoutsAvail = action.payload;
    },
    setActiveClass(state, action) {
      state.activeClass = action.payload;
    },
    setLayoutIndex(state, action) {
      state.layoutIndex = action.payload;
    },
    setLayoutTitle(state, action) {
      state.layoutTitle = action.payload;
    },
    setLayoutKey(state, action) {
      state.layoutKey = action.payload;
    },
    setClickHeaderSettingIcon(state, action) {
      state.clickHeaderSettingIcon = action.payload;
    },
    setUpdatedInitialData(state, action) {
      state.updatedInitialData = action.payload;
    },
    setExtraData(state, action) {
      state.extra_data = action.payload;
    },
    setFilterBuilderMeta(state, action) {
      const { layoutIndex, layoutTitle, layoutKey } = action.payload;
      state.layoutIndex = layoutIndex;
      state.layoutTitle = layoutTitle;
      state.layoutKey = layoutKey;
    },
    setFilterBuilderState(state, action) {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  setInputValue,
  setFilterLayouts,
  setFilterLayoutsAvail,
  setActiveClass,
  setLayoutIndex,
  setLayoutTitle,
  setLayoutKey,
  setClickHeaderSettingIcon,
  setUpdatedInitialData,
  setExtraData,
  setFilterBuilderMeta,
  setFilterBuilderState,
} = filterBuilderSlice.actions;

export default filterBuilderSlice.reducer;
