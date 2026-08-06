import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeClass: "caf-pop-inactive",
  customLayouts: false,
  customLayoutsAvail: [],
  layoutIndex: "",
  layoutTitle: "",
  layoutKey: "",
  postData: [],
  inData: [],
  customCSS: "",
  value: "post",
  selectedPostId: "",
  clickSetting: false,
  bgColor: "",
  footerSlider: { value: "25", suffix: "%" },
  newSliderval: { value: "25", suffix: "%" },
};

const builderSlice = createSlice({
  name: "builder",
  initialState,
  reducers: {
    setActiveClass(state, action) {
      state.activeClass = action.payload;
    },
    setCustomLayouts(state, action) {
      state.customLayouts = action.payload;
    },
    setCustomLayoutsAvail(state, action) {
      state.customLayoutsAvail = action.payload;
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
    setPostData(state, action) {
      state.postData = action.payload;
    },
    setInData(state, action) {
      state.inData = action.payload;
    },
    setCustomCSS(state, action) {
      state.customCSS = action.payload;
    },
    setValue(state, action) {
      state.value = action.payload;
    },
    setSelectedPostId(state, action) {
      state.selectedPostId = action.payload;
    },
    setClickSetting(state, action) {
      state.clickSetting = action.payload;
    },
    setBgColor(state, action) {
      state.bgColor = action.payload;
    },
    setFooterSlider(state, action) {
      state.footerSlider = action.payload;
      state.newSliderval = action.payload;
    },
    setNewSliderval(state, action) {
      state.newSliderval = action.payload;
    },
    setBuilderMeta(state, action) {
      const { layoutIndex, layoutTitle, layoutKey } = action.payload;
      state.layoutIndex = layoutIndex;
      state.layoutTitle = layoutTitle;
      state.layoutKey = layoutKey;
    },
  },
});

export const {
  setActiveClass,
  setCustomLayouts,
  setCustomLayoutsAvail,
  setLayoutIndex,
  setLayoutTitle,
  setLayoutKey,
  setPostData,
  setInData,
  setCustomCSS,
  setValue,
  setSelectedPostId,
  setClickSetting,
  setBgColor,
  setFooterSlider,
  setNewSliderval,
  setBuilderMeta,
} = builderSlice.actions;

export default builderSlice.reducer;
