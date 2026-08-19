export function getBuilderPlaceholderImageUrl() {
  const base =
    typeof window !== "undefined" && window.tc_caf_ajax?.plugin_path
      ? window.tc_caf_ajax.plugin_path
      : "";

  return `${base}assets/unnamed.jpg`;
}

export function isBuilderDefaultPlaceholderImage(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  return (
    url.includes("assets/unnamed.jpg") || url.includes("assets/img/unnamed.jpg")
  );
}

export function resolveFeaturedImagePreviewUrl(settings, postData) {
  const placeholder =
    settings?.placeholder_image || getBuilderPlaceholderImageUrl();

  if (!postData || typeof postData !== "object") {
    return placeholder;
  }

  const sizedUrl =
    settings?.image_size && postData?.imageArray?.[settings.image_size];

  if (sizedUrl) {
    return sizedUrl;
  }

  if (postData?.image) {
    return postData.image;
  }

  return placeholder;
}
