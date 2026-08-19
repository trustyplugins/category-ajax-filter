import { createContext, useContext } from "react";

export const PreviewFacetCountsContext = createContext({
  dynamicTermCountsEnabled: false,
  facetCounts: null,
});

export const usePreviewFacetCounts = () => useContext(PreviewFacetCountsContext);
