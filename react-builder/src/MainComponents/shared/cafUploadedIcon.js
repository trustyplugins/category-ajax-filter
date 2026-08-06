import React, { memo, useEffect, useState } from "react";

/** Allowed uploaded icon/image extensions (builder media picker). */
export const CAF_UPLOADED_ICON_EXTENSIONS = ["svg", "png", "jpg", "jpeg"];

/** wp.media library.type filter for uploaded icons. */
export const CAF_UPLOADED_ICON_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/svg+xml",
];

const getUrlPath = (url) =>
  String(url || "")
    .toLowerCase()
    .split("?")[0]
    .split("#")[0];

export const getCafUploadedIconExtension = (url) => {
  const path = getUrlPath(url);
  const match = path.match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
};

export const isCafUploadedIconUrl = (url) =>
  CAF_UPLOADED_ICON_EXTENSIONS.includes(getCafUploadedIconExtension(url));

export const isCafSvgIconUrl = (url) => getCafUploadedIconExtension(url) === "svg";

const svgCache = new Map();

/**
 * Renders an uploaded builder icon: inline SVG when possible, otherwise <img>.
 */
export const CafUploadedIcon = memo(({ src, className = "", style }) => {
  const [svg, setSvg] = useState(null);
  const isSvg = isCafSvgIconUrl(src);

  useEffect(() => {
    if (!src || !isSvg) {
      setSvg(null);
      return undefined;
    }

    if (svgCache.has(src)) {
      const cachedSvg = svgCache.get(src);
      setSvg((prev) => (prev === cachedSvg ? prev : cachedSvg));
      return undefined;
    }

    let cancelled = false;
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        if (cancelled) return;
        svgCache.set(src, text);
        setSvg(text);
      })
      .catch(() => {
        if (!cancelled) setSvg(null);
      });

    return () => {
      cancelled = true;
    };
  }, [src, isSvg]);

  if (!src || !isCafUploadedIconUrl(src)) {
    return null;
  }

  if (!isSvg) {
    return <img src={src} className={className} style={style} alt="" />;
  }

  if (!svg) {
    return null;
  }

  return (
    <span
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});

CafUploadedIcon.displayName = "CafUploadedIcon";
