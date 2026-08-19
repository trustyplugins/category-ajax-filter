import { configureStore } from "@reduxjs/toolkit";
import builderReducer from "./builderSlice";
import layoutsReducer from "./layoutsSlice";
import filterBuilderReducer from "./filterBuilderSlice";
import importExportReducer from "./importExportSlice";
import connectionReducer from "./connectionSlice";

export const store = configureStore({
    reducer: {
        builder: builderReducer,
        layouts: layoutsReducer,
        filterBuilder: filterBuilderReducer,
        importExport: importExportReducer,
        connection: connectionReducer,
    },
});
