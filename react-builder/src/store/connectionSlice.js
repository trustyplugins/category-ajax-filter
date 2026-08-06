import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connection",
  initialState: {
    lost: false,
    retryFailed: false,
    retrying: false,
  },
  reducers: {
    setConnectionLost(state, action) {
      state.lost = action.payload;
      if (action.payload) {
        state.retryFailed = false;
      }
    },
    setConnectionRetryFailed(state, action) {
      state.retryFailed = action.payload;
    },
    setConnectionRetrying(state, action) {
      state.retrying = action.payload;
    },
    clearConnection(state) {
      state.lost = false;
      state.retryFailed = false;
      state.retrying = false;
    },
  },
});

export const {
  setConnectionLost,
  setConnectionRetryFailed,
  setConnectionRetrying,
  clearConnection,
} = connectionSlice.actions;

export default connectionSlice.reducer;
