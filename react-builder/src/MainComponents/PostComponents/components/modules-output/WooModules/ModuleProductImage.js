import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  generateImageModuleCSS,
  generateImageModuleTagCSS,
} from "../../../../utils/functions";
import {
  getBuilderPlaceholderImageUrl,
  resolveFeaturedImagePreviewUrl,
} from "../../../../utils/builderPlaceholderImage";
import { useWooProductCardVariation, resolveVariationDisplayImageSrc } from "../../woocommerce/WooProductCardVariationContext";

const GALLERY_HOVER_INTERVAL_MS = 1000;
const GALLERY_SLIDE_MS = 500;

function resolveProductImageSource(storedValue) {
  return storedValue === "gallery" ? "gallery" : "featured_image";
}

function getSizedImageUrl(imageData, imageSize) {
  if (!imageData || typeof imageData !== "object") {
    return "";
  }
  if (imageSize && imageData[imageSize]) {
    return imageData[imageSize];
  }
  return "";
}

function resolveGalleryImageUrls(settings, postData) {
  const imageSize = settings?.image_size || "medium_large";
  const limit = Math.max(1, parseInt(settings?.gallery_image_limit, 10) || 2);
  const galleryImages = Array.isArray(postData?.gallery_images)
    ? postData.gallery_images
    : [];
  const placeholder =
    settings?.placeholder_image || getBuilderPlaceholderImageUrl();

  if (galleryImages.length > 0) {
    const galleryUrls = galleryImages
      .slice(0, limit)
      .map((galleryImage) => getSizedImageUrl(galleryImage, imageSize))
      .filter(Boolean);

    if (galleryUrls.length > 0) {
      return galleryUrls;
    }
  }

  const featuredImage = resolveFeaturedImagePreviewUrl(settings, postData);
  return [featuredImage || placeholder];
}

function resolveProductImageUrls(settings, postData) {
  if (resolveProductImageSource(settings?.image_source) === "gallery") {
    return resolveGalleryImageUrls(settings, postData);
  }

  const fallback =
    settings?.placeholder_image || getBuilderPlaceholderImageUrl();
  const featuredImage = resolveFeaturedImagePreviewUrl(settings, postData);
  return [featuredImage || fallback];
}

function shouldUseGallerySlider(settings, images) {
  return (
    resolveProductImageSource(settings?.image_source) === "gallery" &&
    Array.isArray(images) &&
    images.length > 1
  );
}

function resolveAutoScrollDelayMs(settings) {
  const parsed = parseInt(settings?.auto_scroll_delay, 10);
  if (!Number.isFinite(parsed) || parsed < 100) {
    return GALLERY_HOVER_INTERVAL_MS;
  }
  return parsed;
}

function getModuleImageStyles({
  rowindex,
  columnindex,
  moduleindex,
  styleDefault,
  selectedDevice,
  settings,
  postData,
}) {
  return `
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}{
      ${generateImageModuleCSS(
        styleDefault,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover{
      ${generateImageModuleCSS(
        styleDefault,
        "hover",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img{
      ${generateImageModuleTagCSS(
        styleDefault,
        "default",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} img:hover{
      ${generateImageModuleTagCSS(
        styleDefault,
        "hover",
        selectedDevice,
        settings,
        postData,
      )}
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-woo-product-image-slider{
      position: relative;
      width: 100%;
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-woo-product-image-viewport{
      position: relative;
      width: 100%;
      overflow: hidden;
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-woo-product-image-sizer{
      display: block;
      width: 100%;
      visibility: hidden;
      pointer-events: none;
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-woo-product-image-slides{
      position: absolute;
      inset: 0;
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform ${GALLERY_SLIDE_MS}ms ease;
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-woo-product-image-slides.is-resetting{
      transition: none;
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-woo-product-image-slide{
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      object-position: center;
      pointer-events: none;
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-woo-product-image-dots{
      position: absolute;
      left: 0;
      right: 0;
      bottom: 10px;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      pointer-events: auto;
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-woo-product-image-dot{
      display: block;
      flex: 0 0 auto;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgb(177 170 170 / 50%);
      box-shadow: 0 0 1px rgba(0, 0, 0, 0.35);
      transition: background ${GALLERY_SLIDE_MS}ms ease;
      cursor: pointer;
    }
    .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-woo-product-image-dot.is-active{
      background: #ffffff;
    }
  `;
}

function ModuleProductImage({
  postData,
  settings,
  styleDefault,
  module,
  rowindex,
  columnindex,
  moduleindex,
  selectedDevice,
  indexes,
  setIndexes = () => {},
}) {
  const variationCtx = useWooProductCardVariation();
  const images = useMemo(() => {
    const baseImages = resolveProductImageUrls(settings, postData);
    // Featured image only — gallery sliders keep their own slide set.
    if (resolveProductImageSource(settings?.image_source) === "gallery") {
      return baseImages;
    }

    const fallback = baseImages[0] || "";
    const nextSrc = resolveVariationDisplayImageSrc(variationCtx, fallback);
    if (nextSrc && nextSrc !== fallback) {
      return [nextSrc];
    }
    // When selection is complete with no variation image, keep parent/base.
    if (variationCtx?.matrix && nextSrc) {
      return [nextSrc];
    }

    return baseImages;
  }, [
    settings,
    postData,
    variationCtx?.isComplete,
    variationCtx?.resolvedVariation?.image?.src,
    variationCtx?.matrix?.parent_image?.src,
  ]);
  const useSlider = shouldUseGallerySlider(settings, images);
  const autoScrollEnabled = settings?.auto_scroll === "true";
  const autoScrollDelayMs = resolveAutoScrollDelayMs(settings);
  const trackSlides = useSlider ? [...images, images[0]] : null;
  const [slideIndex, setSlideIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);
  const hoverTimerRef = useRef(null);
  const slidesTrackRef = useRef(null);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearInterval(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const jumpToIndexWithoutAnimation = (index) => {
    setEnableTransition(false);
    setSlideIndex(index);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setEnableTransition(true);
      });
    });
  };

  // Dot click: instant jump (no 500ms slide delay).
  const goToSlide = (index) => {
    if (!useSlider || index < 0 || index >= images.length) {
      return;
    }

    const currentRealIndex =
      slideIndex >= images.length ? 0 : slideIndex;
    if (index === currentRealIndex && slideIndex < images.length) {
      return;
    }

    jumpToIndexWithoutAnimation(index);
  };

  useEffect(() => {
    jumpToIndexWithoutAnimation(0);
    clearHoverTimer();
  }, [
    postData?.id,
    postData?.value,
    settings?.image_size,
    settings?.gallery_image_limit,
    settings?.image_source,
    settings?.auto_scroll,
    settings?.auto_scroll_delay,
    images.length,
  ]);

  useEffect(() => {
    if (!autoScrollEnabled) {
      clearHoverTimer();
    }
  }, [autoScrollEnabled]);

  useEffect(() => () => clearHoverTimer(), []);

  const realIndex =
    images.length > 0 && slideIndex >= images.length ? 0 : slideIndex;
  const currentImage = images[realIndex] || getBuilderPlaceholderImageUrl();

  const customClass = settings?.custom_class || "";
  const postUrl = postData?.url || "";
  const visibility = settings?.visibility || {};
  const hideClass =
    visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
  const isActive =
    indexes?.type === "module" &&
    indexes?.rowindex === rowindex &&
    indexes?.columnindex === columnindex &&
    indexes?.moduleindex === moduleindex;
  const moduleClassName = `caf-builder-module-main caf-module-${module.key} caf-module-${moduleindex} ${customClass} ${
    isActive ? "active" : ""
  } ${hideClass}`;
  const moduleStyles = getModuleImageStyles({
    rowindex,
    columnindex,
    moduleindex,
    styleDefault,
    selectedDevice,
    settings,
    postData,
  });

  const handleSelect = (event) => {
    if (event) {
      event.preventDefault();
    }
    setIndexes({
      type: "module",
      rowindex,
      columnindex,
      moduleindex,
      module,
    });
  };

  const handleHoverEnter = () => {
    if (!useSlider || !autoScrollEnabled) {
      return;
    }
    clearHoverTimer();
    hoverTimerRef.current = setInterval(() => {
      setEnableTransition(true);
      setSlideIndex((prev) => (prev >= images.length ? prev : prev + 1));
    }, autoScrollDelayMs);
  };

  const handleHoverLeave = () => {
    if (!useSlider || !autoScrollEnabled) {
      return;
    }
    clearHoverTimer();
    jumpToIndexWithoutAnimation(0);
  };

  const handleTrackTransitionEnd = (event) => {
    if (event.target !== slidesTrackRef.current) {
      return;
    }
    if (slideIndex >= images.length) {
      jumpToIndexWithoutAnimation(0);
    }
  };

  const handleDotClick = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    goToSlide(index);
  };

  const handleDotMouseDown = (event) => {
    // Prevent WP admin button/focus styles from stealing focus and hiding dots.
    event.preventDefault();
    event.stopPropagation();
  };

  const mediaContent = useSlider ? (
    <div
      className="caf-woo-product-image-slider"
      data-caf-hover-gallery="true"
      data-auto-scroll={autoScrollEnabled ? "true" : "false"}
      data-interval={autoScrollDelayMs}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
    >
      <div className="caf-woo-product-image-viewport">
        <img
          src={images[0]}
          width="100%"
          alt=""
          className="caf-woo-product-image-sizer"
          aria-hidden="true"
        />
        <div
          ref={slidesTrackRef}
          className={`caf-woo-product-image-slides${
            enableTransition ? "" : " is-resetting"
          }`}
          style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {trackSlides.map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              src={imageUrl}
              width="100%"
              alt=""
              className="caf-woo-product-image-slide"
            />
          ))}
        </div>
      </div>
      <div className="caf-woo-product-image-dots" aria-hidden="true">
        {images.map((_, index) => (
          <span
            key={`dot-${index}`}
            className={`caf-woo-product-image-dot${
              index === realIndex ? " is-active" : ""
            }`}
            onMouseDown={handleDotMouseDown}
            onClick={(event) => handleDotClick(event, index)}
          />
        ))}
      </div>
    </div>
  ) : (
    <img src={currentImage} width="100%" alt="" />
  );

  if (settings?.link?.visibility) {
    const href =
      settings?.link?.type === "custom-url"
        ? settings?.link?.customlink || "#"
        : postUrl;
    const target =
      settings?.link?.target === "new-tab" ? "_blank" : "_self";

    return (
      <a
        href={href}
        target={target}
        className={moduleClassName}
        onClick={handleSelect}
      >
        {mediaContent}
        <style>{moduleStyles}</style>
      </a>
    );
  }

  return (
    <div onClick={handleSelect} className={moduleClassName}>
      {mediaContent}
      <style>{moduleStyles}</style>
    </div>
  );
}

export default ModuleProductImage;
