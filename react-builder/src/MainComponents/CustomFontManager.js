import React, { useCallback, useEffect, useState } from "react";
import { Upload, Button, Input, Tooltip, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import BuilderDeleteIcon from "./BuilderDeleteIcon";
import apiClient from "../api/client";
import { apiEndpoints } from "../api/endpoints";
import { detectFontFamilyFromFile } from "./utils/detectFontFamily";
import {
  CUSTOM_FONT_ACCEPT,
  fetchCustomFonts,
  notifyCustomFontsUpdated,
  validateCustomFontFile,
} from "./utils/customFonts";
import { globalFontFamilyTooltipContent } from "./constants/globalFontFamilyTooltip";
import { canUseFeature } from "../tier/capabilities";

function CustomFontManager() {
  const canUseCustomFonts = canUseFeature("custom_fonts");
  const [customFonts, setCustomFonts] = useState([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [customFontUploadName, setCustomFontUploadName] = useState("");
  const [customFontUploadFile, setCustomFontUploadFile] = useState(null);
  const [customFontUploading, setCustomFontUploading] = useState(false);
  const [customFontDetectingName, setCustomFontDetectingName] = useState(false);
  const [customFontDeletingSlug, setCustomFontDeletingSlug] = useState("");

  const loadCustomFonts = useCallback(async () => {
    if (!canUseCustomFonts) {
      return;
    }

    setFontsLoading(true);
    try {
      const fonts = await fetchCustomFonts();
      setCustomFonts(fonts);
      notifyCustomFontsUpdated(fonts);
    } catch (error) {
      console.error("Error loading custom fonts:", error);
    } finally {
      setFontsLoading(false);
    }
  }, [canUseCustomFonts]);

  useEffect(() => {
    loadCustomFonts();
  }, [loadCustomFonts]);

  const handleCustomFontFileSelect = async (file) => {
    if (!canUseCustomFonts) {
      return false;
    }

    const fileError = validateCustomFontFile(file);
    if (fileError) {
      message.error(fileError);
      return false;
    }

    setCustomFontUploadFile(file);
    setCustomFontDetectingName(true);
    try {
      const detectedName = await detectFontFamilyFromFile(file);
      if (detectedName) {
        setCustomFontUploadName(detectedName);
      }
    } catch (error) {
      console.error("Font family detection failed:", error);
    } finally {
      setCustomFontDetectingName(false);
    }

    return false;
  };

  const handleCustomFontUpload = async () => {
    if (!canUseCustomFonts) {
      return;
    }

    const fileError = validateCustomFontFile(customFontUploadFile);
    if (fileError) {
      message.error(fileError);
      return;
    }

    const family = customFontUploadName.trim();
    const formData = new FormData();
    if (family) {
      formData.append("family", family);
    }
    formData.append("file", customFontUploadFile);

    setCustomFontUploading(true);
    try {
      const response = await apiClient.post(apiEndpoints.customFonts, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedFonts = Array.isArray(response?.data?.fonts)
        ? response.data.fonts
        : [];
      setCustomFonts(uploadedFonts);
      notifyCustomFontsUpdated(uploadedFonts);
      setCustomFontUploadName("");
      setCustomFontUploadFile(null);
      message.success("Custom font uploaded successfully.");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Custom font upload failed.";
      message.error(errorMessage);
    } finally {
      setCustomFontUploading(false);
    }
  };

  const handleCustomFontDelete = async (font) => {
    if (!canUseCustomFonts || !font?.slug) {
      return;
    }

    setCustomFontDeletingSlug(font.slug);
    try {
      const response = await apiClient.delete(
        apiEndpoints.customFontBySlug(font.slug)
      );
      const uploadedFonts = Array.isArray(response?.data?.fonts)
        ? response.data.fonts
        : [];
      setCustomFonts(uploadedFonts);
      notifyCustomFontsUpdated(uploadedFonts);
      message.success("Custom font removed.");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Could not delete custom font.";
      message.error(errorMessage);
    } finally {
      setCustomFontDeletingSlug("");
    }
  };

  return (
    <div className="caf-misc-setting-page-popup-container">
      <div className="caf-main-setting-page-popup-content">
        <div className="caf-main-setting-page-popup-form-section">
          <section className="caf-main-setting-section">
            <h3 className="caf-main-setting-section-title">Custom Fonts</h3>
            <div className="caf-main-setting-section-body">
            <div className="caf-main-setting-page data-field">
              <Tooltip
                classNames={{ root: "caf-builder-tooltip" }}
                placement="topLeft"
                title={globalFontFamilyTooltipContent}
              >
                <p className="caf-main-setting-page description">
                  Upload TTF font files to use them in the Global Font Family
                  selector for your layouts.
                </p>
              </Tooltip>

              <Upload
                accept={CUSTOM_FONT_ACCEPT}
                maxCount={1}
                disabled={!canUseCustomFonts}
                beforeUpload={(file) => {
                  handleCustomFontFileSelect(file);
                  return false;
                }}
                onRemove={() => {
                  setCustomFontUploadFile(null);
                  setCustomFontUploadName("");
                }}
                fileList={
                  customFontUploadFile
                    ? [
                        {
                          uid: "-1",
                          name: customFontUploadFile.name,
                          status: "done",
                        },
                      ]
                    : []
                }
              >
                <Button icon={<UploadOutlined />} disabled={!canUseCustomFonts}>
                  Choose TTF File
                </Button>
              </Upload>

              <Input
                className="caf-main-setting-page data-field-input"
                style={{ marginTop: 12 }}
                placeholder={
                  customFontDetectingName
                    ? "Detecting font family..."
                    : "Font family (auto-detected from file)"
                }
                value={customFontUploadName}
                onChange={(event) => setCustomFontUploadName(event.target.value)}
                maxLength={80}
                disabled={!canUseCustomFonts || customFontDetectingName}
              />

              <Button
                type="primary"
                style={{ marginTop: 12 }}
                loading={
                  customFontUploading || customFontDetectingName || fontsLoading
                }
                disabled={
                  !canUseCustomFonts ||
                  !customFontUploadFile ||
                  customFontDetectingName
                }
                onClick={handleCustomFontUpload}
              >
                Upload Font
              </Button>

              {customFonts.length > 0 && (
                <div className="caf-custom-font-list">
                  {customFonts.map((font) => (
                    <div className="caf-custom-font-list-item" key={font.slug}>
                      <span>{font.family}</span>
                      <span
                        className={`caf-layout-delete-layout-btn${
                          customFontDeletingSlug === font.slug
                            ? " is-disabled"
                            : ""
                        }`}
                        title="Remove font"
                        onClick={() => {
                          if (customFontDeletingSlug === font.slug) {
                            return;
                          }
                          handleCustomFontDelete(font);
                        }}
                      >
                        <BuilderDeleteIcon className="caf-layout-list-delete-icon" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CustomFontManager;
