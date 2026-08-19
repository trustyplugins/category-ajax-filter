import React, { useEffect, useState } from "react";
import { generateCSS } from "../../../utils/functions";
import parse from "html-react-parser";
import { isCafSvgIconUrl, isCafUploadedIconUrl } from "../../../shared/cafUploadedIcon";
import {
  isPostPrefixEnabled,
  isPostSuffixEnabled,
} from "../settingTabContent/ModuleContentData/shared/postModuleTier";

/** WordPress local datetime `Y-m-d H:i:s` from REST / preview payloads. */
function parseMysqlLocalDateTime(str) {
  if (!str || typeof str !== "string") {
    return null;
  }
  const m = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:\s(\d{2}):(\d{2}):(\d{2}))?$/);
  if (!m) {
    return null;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const hh = m[4] != null ? Number(m[4]) : 0;
  const mi = m[5] != null ? Number(m[5]) : 0;
  const ss = m[6] != null ? Number(m[6]) : 0;
  const out = new Date(y, mo, d, hh, mi, ss);
  return Number.isNaN(out.getTime()) ? null : out;
}

/** Day-first numeric date from `get_the_date( 'd-m-y' )` etc. */
function parseDayFirstNumericDate(str) {
  if (!str || typeof str !== "string") {
    return null;
  }
  const s = str.trim();
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s|$)/);
  if (!m) {
    return null;
  }
  let day = Number(m[1]);
  let month = Number(m[2]);
  let year = Number(m[3]);
  if (year < 100) {
    year += 2000;
  }
  const out = new Date(year, month - 1, day);
  return Number.isNaN(out.getTime()) ? null : out;
}

function parsePostInstant(postData) {
  if (!postData || typeof postData !== "object") {
    return null;
  }
  const mysql =
    parseMysqlLocalDateTime(postData.post_date) ||
    parseMysqlLocalDateTime(postData.post_date_local) ||
    parseMysqlLocalDateTime(postData.date_raw);
  if (mysql) {
    return mysql;
  }
  const isoTry = postData.date;
  if (typeof isoTry === "string" && /^\d{4}-\d{2}-\d{2}/.test(isoTry.trim())) {
    const d = new Date(isoTry);
    if (!Number.isNaN(d.getTime())) {
      return d;
    }
  }
  const fromDisplay = parseDayFirstNumericDate(postData.date);
  if (fromDisplay) {
    return fromDisplay;
  }
  if (typeof postData.date === "string" || typeof postData.date === "number") {
    const d = new Date(postData.date);
    if (!Number.isNaN(d.getTime())) {
      return d;
    }
  }
  return null;
}

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Subset of PHP date() tokens for the "Custom format" field (matches server-side get_the_date). */
function formatPhpStyleCustom(parsed, pattern) {
  if (!parsed || !pattern) {
    return "";
  }
  const pad = (n, len = 2) => String(n).padStart(len, "0");
  let i = 0;
  let out = "";
  while (i < pattern.length) {
    const c = pattern[i];
    if (c === "\\" && i + 1 < pattern.length) {
      out += pattern[i + 1];
      i += 2;
      continue;
    }
    switch (c) {
      case "d":
        out += pad(parsed.getDate());
        break;
      case "j":
        out += String(parsed.getDate());
        break;
      case "m":
        out += pad(parsed.getMonth() + 1);
        break;
      case "n":
        out += String(parsed.getMonth() + 1);
        break;
      case "Y":
        out += String(parsed.getFullYear());
        break;
      case "y":
        out += String(parsed.getFullYear()).slice(-2);
        break;
      case "F":
        out += MONTH_LONG[parsed.getMonth()];
        break;
      case "M":
        out += MONTH_SHORT[parsed.getMonth()];
        break;
      case "H":
        out += pad(parsed.getHours());
        break;
      case "G":
        out += String(parsed.getHours());
        break;
      case "i":
        out += pad(parsed.getMinutes());
        break;
      case "s":
        out += pad(parsed.getSeconds());
        break;
      default:
        out += c;
    }
    i += 1;
  }
  return out;
}

function formatParsedDate(parsed, formatKey) {
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return "";
  }
  const f = String(formatKey || "F j, Y").trim();
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  const yy = String(year).slice(-2);

  if (f === "d/m/Y") {
    return `${day}/${month}/${year}`;
  }
  if (f === "m/d/Y") {
    return `${month}/${day}/${year}`;
  }
  if (f === "Y-m-d") {
    return `${year}-${month}-${day}`;
  }
  if (f === "d-m-Y" || f === "d-m-y") {
    return `${day}-${month}-${f.endsWith("y") ? yy : year}`;
  }
  if (f === "F j, Y") {
    return `${MONTH_LONG[parsed.getMonth()]} ${parsed.getDate()}, ${year}`;
  }
  if (f === "custom") {
    return "";
  }
  if (/[dDmMnYyFGHis]/.test(f)) {
    return formatPhpStyleCustom(parsed, f);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function ModuleDate({
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
  const [date, setDate] = useState(postData?.date || "—");
  const [svgPrefixContent, setSvgPrefixContent] = useState(null);
  const [svgSuffixContent, setSvgSuffixContent] = useState(null);

  const dynWrapper =
    styleDefault?.[selectedDevice]?.default?.justifyContent ?? "flex-start";
  // const [svgContent, setSvgContent] = useState(null);
  // useEffect(() => {
  //   const iconUrl = settings?.icons?.icon?.url;
  //   if (!iconUrl || !isCafSvgIconUrl(iconUrl)) {
  //     setSvgContent(null);
  //     return;
  //   }
  //   // console.log('work')
  //   fetch(iconUrl)
  //     .then((res) => res.text())
  //     .then((svgText) => {
  //       const parser = new DOMParser();
  //       const doc = parser.parseFromString(svgText, "image/svg+xml");
  //       const svg = doc.querySelector("svg");
  //       if (svg) {
  //         // Apply dynamic color or fallback
  //         const iconColor = settings?.icons?.color || "currentColor";
  //         svg.querySelectorAll("*").forEach((el) => {
  //           el.setAttribute("fill", iconColor);
  //         });
  //         setSvgContent(svg.outerHTML);
  //       }
  //     })
  //     .catch((err) => console.error("SVG Load Error:", err));
  // }, [settings?.icons?.icon?.url, settings?.icons?.color]);

  useEffect(() => {
    const parsed = parsePostInstant(postData);
    const requestedFormat =
      settings?.date_format === "custom"
        ? (settings?.custom_format || "").trim() || "d-m-Y H:i"
        : settings?.date_format || "F j, Y";
    if (!parsed) {
      setDate(postData?.date ? String(postData.date) : "—");
      return;
    }
    setDate(formatParsedDate(parsed, requestedFormat));
  }, [
    settings?.date_format,
    settings?.custom_format,
    postData?.date,
    postData?.post_date,
  ]);

  useEffect(() => {
    const iconUrl = settings?.prefix?.icons?.icon?.url;
    if (!iconUrl || !isCafSvgIconUrl(iconUrl)) {
      setSvgPrefixContent(null);
      return;
    }

    fetch(iconUrl)
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (svg) {
          // Apply dynamic color or fallback
          const iconColor =
            settings?.prefix?.icons?.icon?.color || "currentColor";
          svg.querySelectorAll("*").forEach((el) => {
            el.setAttribute("fill", iconColor);
          });
          setSvgPrefixContent(svg.outerHTML);
        }
      })
      .catch((err) => console.error("SVG Load Error:", err));
  }, [settings?.prefix?.icons?.icon?.url]);

  useEffect(() => {
    const iconUrl = settings?.suffix?.icons?.icon?.url;
    if (!iconUrl || !isCafSvgIconUrl(iconUrl)) {
      setSvgSuffixContent(null);
      return;
    }

    fetch(iconUrl)
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");

        if (svg) {
          // Apply dynamic color or fallback
          const iconColor =
            settings?.suffix?.icons?.icon?.color || "currentColor";

          svg.querySelectorAll("*").forEach((el) => {
            el.setAttribute("fill", iconColor);
          });

          setSvgSuffixContent(svg.outerHTML);
        }
      })
      .catch((err) => console.error("SVG Load Error:", err));
  }, [settings?.suffix?.icons?.icon?.url]);

  const custom_class = settings?.custom_class || "";
  const visibility = settings?.visibility || {};
  const hideClass =
  visibility?.[selectedDevice] === "true" ? "caf-hide-element" : "";
  return (
    <>
      <div
        onClick={() =>
          setIndexes({
            type: "module",
            rowindex,
            columnindex,
            moduleindex,
            module,
          })
        }
        className={`caf-builder-module-main caf-module-${
          module.key
        } caf-module-${moduleindex} ${custom_class} ${
          indexes?.type === "module" &&
          indexes?.rowindex === rowindex &&
          indexes?.columnindex === columnindex &&
          indexes?.moduleindex === moduleindex
            ? "active"
            : ""
        } ${hideClass}`}
      >
        {isPostPrefixEnabled(settings) && (
          <>
            <div className="caf-builder-prefix-col">
              {settings?.prefix?.meta_type === "text" &&
                parse(`${settings?.prefix?.meta_text}`)}
              {settings?.prefix?.meta_type === "icon" &&
                settings?.prefix?.icons?.visibility &&
                settings?.prefix?.icons?.type === "icon" &&
                settings?.prefix?.icons?.icon !== "" && (
                  <i
                    data-icon-name={settings?.prefix?.icons?.icon}
                    className={settings?.prefix?.icons?.icon}
                  ></i>
                )}
              {settings?.prefix?.meta_type === "icon" &&
              settings?.prefix?.icons?.visibility &&
              settings?.prefix?.icons?.type === "svg" &&
              settings?.prefix?.icons?.icon?.url !== "" &&
              (isCafSvgIconUrl(settings?.prefix?.icons?.icon?.url) &&
                    svgPrefixContent ? (
                      <span
                  className="svg-dynamic"
                  dangerouslySetInnerHTML={{ __html: svgPrefixContent }}
                />
                    ) : isCafUploadedIconUrl(settings?.prefix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={settings?.prefix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
            </div>
          </>
        )}

        {isPostSuffixEnabled(settings) ? (
          <>
            {isPostPrefixEnabled(settings) ? (
              <div
                className={`caf-builder-date-suffix-wrapper caf-layout-${dynWrapper}`}
              >
                <div className="caf-builder-date-value">{date}</div>
                <div className="caf-builder-suffix-col">
                  {settings?.suffix?.meta_type === "text" &&
                    settings?.suffix?.meta_text &&
                    parse(`${settings?.suffix?.meta_text}`)}

                  {settings?.suffix?.meta_type === "icon" &&
                    settings?.suffix?.icons?.visibility &&
                    settings?.suffix?.icons?.type === "icon" &&
                    settings?.suffix?.icons?.icon !== "" && (
                      <i
                        data-icon-name={settings?.suffix?.icons?.icon}
                        className={settings?.suffix?.icons?.icon}
                      ></i>
                    )}
                  {settings?.suffix?.meta_type === "icon" &&
                  settings?.suffix?.icons?.visibility &&
                  settings?.suffix?.icons?.type === "svg" &&
                  settings?.suffix?.icons?.icon?.url !== "" &&
                  (isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                      className="svg-dynamic"
                      dangerouslySetInnerHTML={{ __html: svgSuffixContent }}
                    />
                    ) : isCafUploadedIconUrl(settings?.suffix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={settings?.suffix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
                </div>
              </div>
            ) : (
              <>
                <div className="caf-builder-date-value">{date}</div>
                <div className="caf-builder-suffix-col">
                  {settings?.suffix?.meta_type === "text" &&
                    settings?.suffix?.meta_text &&
                    parse(`${settings?.suffix?.meta_text}`)}

                  {settings?.suffix?.meta_type === "icon" &&
                    settings?.suffix?.icons?.visibility &&
                    settings?.suffix?.icons?.type === "icon" &&
                    settings?.suffix?.icons?.icon !== "" && (
                      <i
                        data-icon-name={settings?.suffix?.icons?.icon}
                        className={settings?.suffix?.icons?.icon}
                      ></i>
                    )}
                  {settings?.suffix?.meta_type === "icon" &&
                  settings?.suffix?.icons?.visibility &&
                  settings?.suffix?.icons?.type === "svg" &&
                  settings?.suffix?.icons?.icon?.url !== "" &&
                  (isCafSvgIconUrl(settings?.suffix?.icons?.icon?.url) &&
                    svgSuffixContent ? (
                      <span
                      className="svg-dynamic"
                      dangerouslySetInnerHTML={{ __html: svgSuffixContent }}
                    />
                    ) : isCafUploadedIconUrl(settings?.suffix?.icons?.icon?.url) ? (
                      <img
                        className="svg-dynamic"
                        src={settings?.suffix?.icons?.icon?.url}
                        alt=""
                      />
                    ) : null)}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {isPostPrefixEnabled(settings) ? (
              <div className="caf-builder-date-value">{date}</div>
            ) : (
              <>{date}</>
            )}
          </>
        )}

        {/* Before icon */}
        {/* {settings?.icons?.position === "before-date" &&
          settings?.icons?.icon &&
          settings?.icons?.visibility && (
            <>
              {settings?.icons?.type === "icon" ? (
                <i
                  data-icon-name={settings.icons.icon}
                  value={settings.icons.icon}
                  class={settings.icons.icon}
                  style={{ marginRight: "5px" }}
                ></i>
              ) : (
                <>
                  {isCafUploadedIconUrl(settings?.icons?.icon?.url) &&
                  svgContent ? (
                    <span
                      className="svg-dynamic"
                      style={{ marginRight: "5px" }}
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : (
                    <img
                      src={settings.icons.icon.url}
                      alt=""
                      style={{ width: "20px", marginRight: "5px" }}
                    />
                  )}
                </>
              )}
            </>
          )} */}

        {/* Render formatted date */}
        {/* {date} */}

        {/* After icon */}
        {/* {settings?.icons?.position === "after-date" &&
          settings?.icons?.icon &&
          settings?.icons?.visibility && (
            <>
              {settings?.icons?.type === "icon" ? (
                <i
                  data-icon-name={settings.icons.icon}
                  value={settings.icons.icon}
                  class={settings.icons.icon}
                  style={{ marginLeft: "5px" }}
                ></i>
              ) : (
                <>
                  {isCafUploadedIconUrl(settings?.icons?.icon?.url) &&
                  svgContent ? (
                    <span
                      className="svg-dynamic"
                      style={{ marginLeft: "5px" }}
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : (
                    <img
                      src={settings.icons.icon.url}
                      alt=""
                      style={{ width: "20px", marginLeft: "5px" }}
                    />
                  )}
                </>
              )}
            </>
          )} */}

        <style>
          {`
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} {
              ${generateCSS(styleDefault, "default", selectedDevice, settings, postData)}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex}:hover {
              ${generateCSS(styleDefault, "hover", selectedDevice, settings, postData)}
            }
            .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-date-suffix-wrapper{
              ${generateCSS(
                styleDefault?.meta,
                "default",
                selectedDevice,
                settings,
                postData
              )}
            }
            .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-date-suffix-wrapper:hover{
              ${generateCSS(
                styleDefault?.meta,
                "hover",
                selectedDevice,
                settings,
                postData
              )}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col{
              ${generateCSS(
                styleDefault?.prefix,
                "default",
                selectedDevice,
                settings,
                postData
              )}
            }
            .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-prefix-col:hover{
              ${generateCSS(
                styleDefault?.prefix,
                "hover",
                selectedDevice,
                settings,
                postData
              )}
            }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col{
            ${generateCSS(
              styleDefault?.suffix,
              "default",
              selectedDevice,
              settings,
              postData
            )}
          }
          .caf-bl-post .caf-row-${rowindex} .caf-column-${columnindex} .caf-module-${moduleindex} .caf-builder-suffix-col:hover{
            ${generateCSS(
              styleDefault?.suffix,
              "hover",
              selectedDevice,
              settings,
              postData
            )}
          }
            `}
        </style>
      </div>
    </>
  );
}

export default ModuleDate;
