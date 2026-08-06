import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    layoutsList: [],
    filteredLayoutList: [],
    trashLayoutsList: [],
    filteredTrashLayoutList: [],

    currentPage: 1,
    totalPage: 1,
    trashCurrentPage: 1,
    trashTotalPage: 1,

    totalFilters: 0,
    totalTrashFilters: 0,

    selectedItems: [],
    selectedTrashItems: [],

    selectAll: false,
    selectTrashAll: false,

    selectedTab: "filters",

    filtersLoading: true,
    trashLoading: true,
};

const layoutsSlice = createSlice({
    name: "layouts",
    initialState,
    reducers: {
        setLayouts(state, action) {
            state.layoutsList = action.payload;
            state.filteredLayoutList = action.payload;
        },

        setTrashLayouts(state, action) {
            state.trashLayoutsList = action.payload;
            state.filteredTrashLayoutList = action.payload;
        },

        setFiltersLoading(state, action) {
            state.filtersLoading = action.payload;
        },

        setTrashLoading(state, action) {
            state.trashLoading = action.payload;
        },

        setSelectedTab(state, action) {
            state.selectedTab = action.payload;
        },

        setPagination(state, action) {
            const { currentPage, totalPage } = action.payload;
            state.currentPage = currentPage;
            state.totalPage = totalPage;
        },

        setTrashPagination(state, action) {
            const { trashCurrentPage, trashTotalPage } = action.payload;
            state.trashCurrentPage = trashCurrentPage;
            state.trashTotalPage = trashTotalPage;
        },

        setSelectedItems(state, action) {
            state.selectedItems = action.payload;
        },

        setSelectedTrashItems(state, action) {
            state.selectedTrashItems = action.payload;
        },

        setSelectAll(state, action) {
            state.selectAll = action.payload;
        },

        setSelectTrashAll(state, action) {
            state.selectTrashAll = action.payload;
        },

        setTotalFilters(state, action) {
            state.totalFilters = action.payload;
        },

        setTotalTrashFilters(state, action) {
            state.totalTrashFilters = action.payload;
        },

        setFilteredLayouts(state, action) {
            state.filteredLayoutList = action.payload;
        },

        setFilteredTrashLayouts(state, action) {
            state.filteredTrashLayoutList = action.payload;
        },

        resetFilterSelection(state) {
            state.selectedItems = [];
            state.selectAll = false;
        },

        resetTrashSelection(state) {
            state.selectedTrashItems = [];
            state.selectTrashAll = false;
        },
    },
});

export const {
    setLayouts,
    setTrashLayouts,
    setFiltersLoading,
    setTrashLoading,
    setSelectedTab,
    setPagination,
    setTrashPagination,
    setSelectedItems,
    setSelectedTrashItems,
    setSelectAll,
    setSelectTrashAll,
    setTotalFilters,
    setTotalTrashFilters,
    setFilteredLayouts,
    setFilteredTrashLayouts,
    resetFilterSelection,
    resetTrashSelection,
} = layoutsSlice.actions;

export default layoutsSlice.reducer;