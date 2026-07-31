const getCafAjax = () =>
  typeof window !== "undefined" && window.tc_caf_ajax ? window.tc_caf_ajax : {};

let restNonce = getCafAjax().rest_nonce || "";
let refreshPromise = null;

export function getRestNonce() {
  return restNonce;
}

export function applyRestNonce(nonce, apiClient) {
  restNonce = nonce;
  if (typeof window !== "undefined" && window.tc_caf_ajax) {
    window.tc_caf_ajax.rest_nonce = nonce;
  }
  if (apiClient?.defaults?.headers) {
    apiClient.defaults.headers["X-WP-Nonce"] = nonce;
  }
}

export function isAuthError(error) {
  const status = error?.response?.status;
  if (status === 401) {
    return true;
  }
  if (status === 403) {
    const code = error?.response?.data?.code;
    return (
      !code ||
      code === "rest_cookie_invalid_nonce" ||
      code === "rest_forbidden" ||
      code === "rest_not_logged_in"
    );
  }
  return false;
}

export function isConnectionError(error) {
  if (!error?.response) {
    return true;
  }
  return isAuthError(error);
}

export async function refreshRestNonce(apiClient) {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const cafAjax = getCafAjax();
    const siteBaseUrl = cafAjax.site_base_url || "";
    const ajaxUrl =
      cafAjax.ajax_url ||
      (siteBaseUrl ? `${siteBaseUrl}/wp-admin/admin-ajax.php` : "/wp-admin/admin-ajax.php");

    const response = await fetch(`${ajaxUrl}?action=rest-nonce`, {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh REST nonce");
    }

    const nonce = (await response.text()).trim();
    if (!nonce) {
      throw new Error("Empty REST nonce");
    }

    applyRestNonce(nonce, apiClient);
    return nonce;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
