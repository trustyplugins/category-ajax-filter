import axios from "axios";
import { getRestNonce, isConnectionError } from "./sessionManager";
import { store } from "../store/store";
import { setConnectionLost } from "../store/connectionSlice";

const cafAjax =
  typeof window !== "undefined" && window.tc_caf_ajax
    ? window.tc_caf_ajax
    : {};

const siteBaseUrl = cafAjax.site_base_url || "";

const apiBaseUrl = cafAjax.rest_api_base
  ? String(cafAjax.rest_api_base).replace(/\/?$/, "/")
  : siteBaseUrl
    ? `${siteBaseUrl}/wp-json/caf-custom-builder/v1/`
    : "/wp-json/caf-custom-builder/v1/";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "X-WP-Nonce": getRestNonce(),
  },
});

apiClient.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {};
  }
  config.headers["X-WP-Nonce"] = getRestNonce();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isConnectionError(error)) {
      store.dispatch(setConnectionLost(true));
    }
    return Promise.reject(error);
  }
);

export { refreshRestNonce, isConnectionError } from "./sessionManager";
export const getSiteBaseUrl = () => siteBaseUrl;
export const getApiBaseUrl = () => apiBaseUrl;

export default apiClient;
