import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { ColorPicker, Skeleton, Button } from "antd";
import DevicePreviewIframe from "../PreviewComponents/DevicePreviewIframe";
import PostBuilderPreviewChrome from "./PostBuilderPreviewChrome";
import MobilePreviewFrameIcon from "../MobilePreviewFrameIcon";
import tabletFrame from "../images/tablet.svg";
import { normalizeColorPickerValue, getColorPickerModes } from "../utils/colorPicker";
import {
  ArrowsAltOutlined,
  QuestionCircleFilled,
  QuestionCircleOutlined,
  ShrinkOutlined,
  RightOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  EyeInvisibleFilled,
  EyeFilled
} from "@ant-design/icons";
import { Col, Input, Row, Slider, Select, Space } from "antd";
import { resolvePostExtraDataFromBuilderData } from "../utils/builderDataAdapters";
import { selectBuilderPostPreviewData } from "../../store/selectors";
import { setBgColor, setFooterSlider } from "../../store/builderSlice";
import { resolveBuilderPreviewDevice } from "../utils/builderPreviewDevice";
const { Option } = Select;
const MainArea = (props) => {
  const dispatch = useDispatch();
  const mainBuilderDataRef = useRef(props.mainBuilderData);

  useEffect(() => {
    mainBuilderDataRef.current = props.mainBuilderData;
  }, [props.mainBuilderData]);
  const resolvedPostExtraData = resolvePostExtraDataFromBuilderData(
    props.mainBuilderData
  );
  const builderPostPreviewData = useSelector(selectBuilderPostPreviewData);
  const effectiveSinglePostData =
    builderPostPreviewData &&
    typeof builderPostPreviewData === "object" &&
    !Array.isArray(builderPostPreviewData) &&
    Object.keys(builderPostPreviewData).length > 0
      ? builderPostPreviewData
      : resolvedPostExtraData.single_post_data || {};
   //console.log("mainArea",props)
  const initialdata = [
    ...props.mainBuilderData?.post_layout_data?.initial_data,
  ];
  const [colorHex, setColorHex] = useState(resolvedPostExtraData?.bg_color);
  const [fullScreen, setFullScreen] = useState(false);
  const [suffix, setSuffix] = useState(
    resolvedPostExtraData?.slider_data?.suffix ?? "%"
  );
  const [selectedDevice, setSelectedDevice] = useState(() =>
    resolveBuilderPreviewDevice(props.mainBuilderData)
  );
  const [previewState, setPreviewState] = useState("1");
  const [previewWidth, setPreviewWidth] = useState(
    resolvedPostExtraData?.slider_data?.value ?? "25"
  );
  const [desktopPreviewWidth, setDesktopPreviewWidth] = useState(
    resolvedPostExtraData?.slider_data?.value ?? "25"
  );
  const [desktopPreviewSuffix, setDesktopPreviewSuffix] = useState(
    resolvedPostExtraData?.slider_data?.suffix ?? "%"
  );
  const desktopPreviewWidthRef = useRef(
    resolvedPostExtraData?.slider_data?.value ?? "25"
  );
  const desktopPreviewSuffixRef = useRef(
    resolvedPostExtraData?.slider_data?.suffix ?? "%"
  );
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isInside, setIsInside] = useState(false);
  const isCompactDevice = selectedDevice === "mobile" || selectedDevice === "tablet";
  const effectivePreviewWidth = isCompactDevice ? "100" : previewWidth;
  const effectiveSuffix = isCompactDevice ? "%" : suffix;
  const commitBuilderPatch = (mutator) => {
    const nextBuilder = structuredClone(props.mainBuilderData || {});
    if (!nextBuilder.post_layout_data) {
      nextBuilder.post_layout_data = {};
    }
    if (!nextBuilder.post_layout_data.extra_data) {
      nextBuilder.post_layout_data.extra_data = {};
    }
    if (!nextBuilder.common_data) {
      nextBuilder.common_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data) {
      nextBuilder.common_data.preview_template_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data.misc_preview_data) {
      nextBuilder.common_data.preview_template_data.misc_preview_data = {};
    }
    if (!nextBuilder.common_data.preview_template_data.misc_preview_data.container) {
      nextBuilder.common_data.preview_template_data.misc_preview_data.container = {};
    }
    if (
      !nextBuilder.common_data.preview_template_data.misc_preview_data.container
        .style
    ) {
      nextBuilder.common_data.preview_template_data.misc_preview_data.container.style =
        {};
    }
    if (
      !nextBuilder.common_data.preview_template_data.misc_preview_data.container
        .style.desktop
    ) {
      nextBuilder.common_data.preview_template_data.misc_preview_data.container.style.desktop =
        {};
    }
    if (
      !nextBuilder.common_data.preview_template_data.misc_preview_data.container
        .style.desktop.default
    ) {
      nextBuilder.common_data.preview_template_data.misc_preview_data.container.style.desktop.default =
        {};
    }
    mutator(nextBuilder);
    props.updatedBuilderData(nextBuilder);
    const extr = nextBuilder.post_layout_data?.extra_data;
    if (extr?.bg_color != null && extr.bg_color !== "") {
      dispatch(setBgColor(extr.bg_color));
    }
    const sd = extr?.slider_data;
    if (sd && typeof sd === "object") {
      dispatch(
        setFooterSlider({
          value: String(sd.value ?? "25"),
          suffix: sd.suffix ?? "%",
        })
      );
    }
  };
  useEffect(() => {
    if (props.newSliderval?.suffix) {
      setSuffix(props.newSliderval?.suffix);
    }
    if (props.newSliderval?.value) {
      setPreviewWidth(props.newSliderval?.value);
    }
  }, [props.newSliderval]);

  useEffect(() => {
    if (resolvedPostExtraData?.bg_color) {
      setColorHex(resolvedPostExtraData.bg_color);
    } else {
      setColorHex("#00000000");
    }
  }, [resolvedPostExtraData?.bg_color]);

  const setColorHexFun = (value) => {
    const nextColor = normalizeColorPickerValue(value);
    setColorHex(nextColor);
    commitBuilderPatch((nextBuilder) => {
      nextBuilder.post_layout_data.extra_data.bg_color = nextColor;
      nextBuilder.common_data.preview_template_data.misc_preview_data.container.style.desktop.default.backgroundColor =
        nextColor;
    });
  };

  const handleFullScreenChange = () => {
    setFullScreen(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("msfullscreenchange", handleFullScreenChange);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullScreenChange
      );
    };
  }, []);
  const handleFullScreen = () => {
    var elem = document.documentElement;

    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      // Document is not in fullscreen mode, request fullscreen.
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
      }
    } else {
      // Document is in fullscreen mode, exit fullscreen.
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
      }
    }
  };

  const onSelectChange = (val) => {
    if (isCompactDevice) return;
    setSuffix(val);
    setDesktopPreviewSuffix(val);
    desktopPreviewSuffixRef.current = val;
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.post_layout_data.extra_data.slider_data) {
        nextBuilder.post_layout_data.extra_data.slider_data = {};
      }
      nextBuilder.post_layout_data.extra_data.slider_data.suffix = val;
    });
  };

  const onChangeSlider = (val) => {
    if (isCompactDevice) return;
    setPreviewWidth(val);
    setDesktopPreviewWidth(val);
    desktopPreviewWidthRef.current = val;
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.post_layout_data.extra_data.slider_data) {
        nextBuilder.post_layout_data.extra_data.slider_data = {};
      }
      nextBuilder.post_layout_data.extra_data.slider_data.value = val;
      nextBuilder.post_layout_data.extra_data.slider_data.suffix = suffix;
    });
  };
  const onChangeNumber = (e) => {
    if (isCompactDevice) return;
    const value = e?.target?.value;
    setPreviewWidth(value);
    setDesktopPreviewWidth(value);
    desktopPreviewWidthRef.current = value;
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.post_layout_data.extra_data.slider_data) {
        nextBuilder.post_layout_data.extra_data.slider_data = {};
      }
      nextBuilder.post_layout_data.extra_data.slider_data.value = value;
      nextBuilder.post_layout_data.extra_data.slider_data.suffix = suffix;
    });
  };
  const selectAfter = (
    <Select
      defaultValue={suffix}
      onChange={onSelectChange}
      value={suffix}
      disabled={isCompactDevice}
      options={[
        {
          value: "px",
          label: "PX",
        },
        {
          value: "%",
          label: "%",
        },
      ]}
    />
  );
  const handleSelectLayout = () => {
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.post_layout_data.breadcrumb_data) {
        nextBuilder.post_layout_data.breadcrumb_data = {};
      }
      nextBuilder.post_layout_data.breadcrumb_data.select_builder = "true";
    });
    props.setSelectType("post-preview");
    props.setCurrStep("3");
  };
  
  const handleBack = () => {
    props.setSelectType("filter");
    props.setCurrStep("1");
  }
  const onEyeClick = (val) => {
    setPreviewState(val);
    props.previewState(val);
  }

  window.onresize = function () {
    setScreenWidth(window.innerWidth);
  };
  const handleDeviceChange = (val) => {
    if (val === "desktop") {
      const restoredWidth = desktopPreviewWidthRef.current ?? desktopPreviewWidth;
      const restoredSuffix = desktopPreviewSuffixRef.current ?? desktopPreviewSuffix;
      setSelectedDevice(val);
      setPreviewWidth(restoredWidth);
      setSuffix(restoredSuffix);
      setDesktopPreviewWidth(restoredWidth);
      setDesktopPreviewSuffix(restoredSuffix);
      props.setSelectedDevice(val);
      commitBuilderPatch((nextBuilder) => {
        if (!nextBuilder.post_layout_data.extra_data.slider_data) {
          nextBuilder.post_layout_data.extra_data.slider_data = {};
        }
        nextBuilder.common_data.builder_preview_device = val;
        nextBuilder.post_layout_data.extra_data.slider_data.value = restoredWidth;
        nextBuilder.post_layout_data.extra_data.slider_data.suffix = restoredSuffix;
      });
      return;
    }

    if (selectedDevice === "desktop") {
      desktopPreviewWidthRef.current = previewWidth;
      desktopPreviewSuffixRef.current = suffix;
      setDesktopPreviewWidth(previewWidth);
      setDesktopPreviewSuffix(suffix);
    }
    setSelectedDevice(val);
    props.setSelectedDevice(val);
    commitBuilderPatch((nextBuilder) => {
      if (!nextBuilder.post_layout_data.extra_data.slider_data) {
        nextBuilder.post_layout_data.extra_data.slider_data = {};
      }
      nextBuilder.common_data.builder_preview_device = val;
    });
  }

  const postBuilderPreview = (
    <PostBuilderPreviewChrome
      effectiveSinglePostData={effectiveSinglePostData}
      previewWidth={effectivePreviewWidth}
      suffix={effectiveSuffix}
      initialdata={initialdata}
      selectedDevice={selectedDevice}
      indexes={props.indexes}
      setIndexes={props.setIndexes}
      customCSS={props.customCSS}
      onExtraData={props.onExtraData}
      mainBuilderData={props.mainBuilderData}
      onSettingChange={(freshItems) => {
        if (!Array.isArray(freshItems) || typeof props.updatedBuilderData !== "function") {
          return;
        }
        const nextBuilder = structuredClone(mainBuilderDataRef.current || {});
        if (!nextBuilder.post_layout_data) {
          nextBuilder.post_layout_data = {};
        }
        nextBuilder.post_layout_data.initial_data = freshItems;
        props.updatedBuilderData(nextBuilder);
      }}
    />
  );

  //console.log(props,props.mainBuilderData.post_layout_data.extra_data.single_post_data,props.mainBuilderData.common_data.post_type);
  return (
    <div className={`caf-builder-mainarea caf-bl-post caf-device-${selectedDevice} ${
      isInside ? "inside-active" : "outside-active"
    }`} style={{ background: colorHex }} onMouseEnter={() => setIsInside(true)}
    onMouseLeave={() => setIsInside(false)}>
      <svg aria-hidden="true" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotPattern-blog" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="1" fill="var(--dot-color, #e0e0e0)"></circle>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern-blog)"></rect>
      </svg>
      <div
        className={`caf-builder-post-preview-wrapper${
          selectedDevice === "mobile" || selectedDevice === "tablet"
            ? " caf-device-frame-stage"
            : ""
        }`}
      >
        {selectedDevice === "mobile" ? (
          <div className="caf-mobile-preview-frame-shell">
            <MobilePreviewFrameIcon alt="Mobile preview frame" />
            <div className="caf-mobile-preview-frame-screen caf-post-builder-preview-frame-screen">
              <DevicePreviewIframe
                iframeClassName="caf-mobile-preview-iframe"
                bodyClassName="caf-mobile-preview-iframe-body caf-post-builder-preview-iframe-body"
                rootId="caf-post-builder-mobile-preview-iframe-root"
                title="Post builder mobile preview"
              >
                <div className="caf-bl-post">{postBuilderPreview}</div>
              </DevicePreviewIframe>
            </div>
          </div>
        ) : selectedDevice === "tablet" ? (
          <div className="caf-tablet-preview-portrait-wrap">
            <div className="caf-tablet-preview-portrait-inner">
              <img
                src={tabletFrame}
                alt=""
                className="caf-tablet-preview-frame-image-portrait"
              />
              <div className="caf-tablet-preview-frame-screen-portrait caf-post-builder-preview-frame-screen">
                <DevicePreviewIframe
                  iframeClassName="caf-tablet-preview-iframe"
                  bodyClassName="caf-tablet-preview-iframe-body caf-post-builder-preview-iframe-body"
                  rootId="caf-post-builder-tablet-preview-iframe-root"
                  title="Post builder tablet preview"
                >
                  <div className="caf-bl-post">{postBuilderPreview}</div>
                </DevicePreviewIframe>
              </div>
            </div>
          </div>
        ) : (
          postBuilderPreview
        )}
      </div>
      {/* <div className="caf-builder-mainarea-footer-bar">
        <div className="manage-footer-bar">
              <Select
            defaultValue={selectedDevice}
            style={{
              width: 65,
            }}
            className="caf-post-layout-builder-footer-device-selection"
            onChange={handleDeviceChange}
            options={[
              {
                value: "desktop",
                label: <DesktopOutlined />,
              },
              // {
              //   value: "tablet",
              //   label: <TabletOutlined />,
              // },
              {
                value: "mobile",
                label: <MobileOutlined />,
              },
            ]}
          />
          <div className="main-area-slider" style={{ width: "50%" }}>
            <div className={`caf-builder-setting-row-label`}>
              <Space orientation="vertical"></Space>
              <Row>
                <Col span={screenWidth <= 1200 ? 10 : 12}>
                  <Slider
                    min={0}
                    max={100}
                    onChange={onChangeSlider}
                    value={parseInt(previewWidth)}
                  />
                </Col>
                <Col
                  span={
                    screenWidth <= 1200
                      ? 14
                      : screenWidth <= 1500
                      ? 10
                      : screenWidth <= 1600
                      ? 8
                      : 5
                  }
                >
                  <Space.Compact
                    style={{
                      margin: "0 0px 0 10px",
                      width: "100%",
                    }}
                  >
                    <Input
                      value={parseInt(previewWidth)}
                      onChange={onChangeNumber}
                      type="number"
                    />
                    {selectAfter}
                  </Space.Compact>
                </Col>
              </Row>
            </div>
          </div>
          <div className="full-screen-icon">
            {fullScreen ? (
              <ShrinkOutlined onClick={handleFullScreen} title="ExitScreen" />
            ) : (
              <ArrowsAltOutlined
                onClick={handleFullScreen}
                title="FullScreen"
              />
            )}
          </div>
          <div className="color-bar">
            <ColorPicker
              className="custom-color-mainarea"
              value={colorHex}
              mode={getColorPickerModes()}
              // format="rgb"
              onChange={setColorHexFun}
              placement="topRight"
            />
          </div>
          <div className="help-icon">
            <QuestionCircleOutlined title="Help" />
          </div>
          <div className="select-layout-btn">
            <Button
              type="primary"
              icon={<RightOutlined />}
              iconPosition={"end"}
              size="large"
              onClick={handleSelectLayout}
            >
              Select Layout
            </Button>
          </div>
        </div>
      </div> */}

      <div className="caf-builder-mainarea-footer-bar">
        <div className="manage-footer-bar">
          <div className="caf-builder-footer-back-btn" onClick={handleBack}>Back</div>
          <div className="caf-builder-footer-center-box">
            <div className="caf-builder-footer-device-section">
              <Select
                value={selectedDevice}
                style={{
                  width: 65,
                }}
                onChange={handleDeviceChange}
                options={[
                  {
                    value: "desktop",
                    label: <DesktopOutlined />,
                  },
                  {
                    value: "tablet",
                    label: <TabletOutlined />,
                  },
                  {
                    value: "mobile",
                    label: <MobileOutlined />,
                  },
                ]}
              />
            </div>
            <div className="caf-builder-footer-slider-section">
              <Slider
                value={parseInt(effectivePreviewWidth)}
                disabled={isCompactDevice}
                onChange={onChangeSlider}
              />
              <Space.Compact
                style={{
                  margin: "0 0px 0 10px",
                  width: "100%",
                }}
              >
                <Input
                  value={parseInt(effectivePreviewWidth)}
                  onChange={onChangeNumber}
                  type="number"
                  disabled={isCompactDevice}
                />
                {selectAfter}
              </Space.Compact>
              <ColorPicker
                className="footer-bg-color"
                value={colorHex}
                mode={["single"]}
                onChange={setColorHexFun}
                placement="top"
              />
              {previewState == "1" ? (
                <EyeFilled className="eye-icon" onClick={() => onEyeClick('0')} />
              ) : (
                <EyeInvisibleFilled className="eye-icon" onClick={() => onEyeClick('1')} />
              )}
            </div>
          </div>
          <div className="caf-builder-footer-next-btn" onClick={handleSelectLayout}>Next</div>

        </div>
      </div>
    </div>
  );
};

export default MainArea;
