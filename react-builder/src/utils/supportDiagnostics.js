import apiClient from "../api/client";
import { apiEndpoints } from "../api/endpoints";

export function generateCafErrorId() {
  const part = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `CAF-${part}`;
}

export function getSupportEnvironment() {
  const ajax = typeof window !== "undefined" ? window.tc_caf_ajax || {} : {};
  const env = ajax.support_env || {};

  return {
    pluginVersion: env.plugin_version || "unknown",
    wpVersion: env.wp_version || "unknown",
    phpVersion: env.php_version || "unknown",
    theme: env.theme || "unknown",
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    page:
      typeof window !== "undefined" ? window.location.pathname : "unknown",
  };
}

export function buildSupportReport({
  errorId,
  error,
  errorInfo,
  type,
  section,
  moduleKey,
  moduleLabel,
}) {
  const environment = getSupportEnvironment();
  const stack = error?.stack ? String(error.stack).slice(0, 4000) : "";
  const componentStack = errorInfo?.componentStack
    ? String(errorInfo.componentStack).slice(0, 4000)
    : "";

  return {
    errorId,
    timestamp: new Date().toISOString(),
    type: type || "section",
    section: section || "",
    moduleKey: moduleKey || "",
    moduleLabel: moduleLabel || "",
    message: String(error?.message || "Unknown error"),
    stack,
    componentStack,
    environment,
  };
}

export function formatSupportReportForCopy(report) {
  if (!report) {
    return "";
  }

  const lines = [
    "=== CAF Support Report ===",
    `Error ID: ${report.errorId}`,
    `Time: ${report.timestamp}`,
    `Type: ${report.type}`,
  ];

  if (report.section) {
    lines.push(`Section: ${report.section}`);
  }
  if (report.moduleKey) {
    lines.push(`Module: ${report.moduleKey}${report.moduleLabel ? ` (${report.moduleLabel})` : ""}`);
  }

  lines.push(
    "",
    "--- Error ---",
    report.message,
    "",
    "--- Environment ---",
    `Plugin: ${report.environment?.pluginVersion}`,
    `WordPress: ${report.environment?.wpVersion}`,
    `PHP: ${report.environment?.phpVersion}`,
    `Theme: ${report.environment?.theme}`,
    `Page: ${report.environment?.page}`,
    `Browser: ${report.environment?.userAgent}`,
    "",
    "--- Stack trace ---",
    report.stack || "(none)",
    "",
    "--- Component stack ---",
    report.componentStack || "(none)"
  );

  return lines.join("\n");
}

export async function copySupportReport(report) {
  const text = formatSupportReportForCopy(report);

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export async function persistClientError(report) {
  try {
    await apiClient.post(apiEndpoints.logClientError, report);
  } catch (_error) {
    // Local logging is best-effort only.
  }
}
