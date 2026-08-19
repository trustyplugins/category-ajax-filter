/**
 * Verifies default-state CSS parity and hover delta-only behavior.
 */
const path = require("path");
const vm = require("vm");

const functionsPath = path.join(
  __dirname,
  "..",
  "src",
  "MainComponents",
  "utils",
  "functions.js"
);

const source = require("fs").readFileSync(functionsPath, "utf8");
const sandbox = { module: { exports: {} }, exports: {} };
vm.runInNewContext(source, sandbox, { filename: functionsPath });
const api = sandbox.module.exports;

const sampleStyle = {
  desktop: {
    default: {
      width: "100%",
      color: "rgb(30,30,30)",
      backgroundColor: "rgb(255,255,255)",
      paddingTop: "10px",
    },
    hover: {
      backgroundColor: "rgb(246,247,251)",
    },
  },
  tablet: { default: {}, hover: {} },
  mobile: { default: {}, hover: {} },
};

const defaultCss = api.generateCSS(sampleStyle, "default", "desktop", {}, {});
const hoverCss = api.generateCSS(sampleStyle, "hover", "desktop", {}, {});

const defaultProps = new Set(
  defaultCss
    .split(";")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r.split(":")[0])
);

const hoverProps = hoverCss
  .split(";")
  .map((r) => r.trim())
  .filter(Boolean)
  .map((r) => r.split(":")[0]);

let failed = false;

if (!defaultCss.includes("width:100%") || !defaultCss.includes("color:rgb(30,30,30)")) {
  console.error("FAIL: default CSS missing expected properties");
  failed = true;
}

if (hoverCss.includes("width:100%") || hoverCss.includes("color:rgb(30,30,30)")) {
  console.error("FAIL: hover CSS should not repeat unchanged default properties");
  failed = true;
}

if (!hoverCss.includes("background-color:rgb(246,247,251)")) {
  console.error("FAIL: hover CSS missing explicit hover override");
  failed = true;
}

const emptyHover = api.generateCSS(
  { desktop: { default: sampleStyle.desktop.default, hover: {} }, tablet: { default: {}, hover: {} }, mobile: { default: {}, hover: {} } },
  "hover",
  "desktop",
  {},
  {}
);
if (emptyHover !== "") {
  console.error("FAIL: empty hover should emit no CSS, got:", emptyHover);
  failed = true;
}

const focusCss = api.generateFilterFocusCSS(
  "input",
  "desktop",
  {
    input: {
      desktop: {
        default: { width: "100%", borderTopWidth: "1px" },
        selected: { borderTopColor: "rgb(0,0,0)", width: "50%" },
      },
      tablet: { default: {}, selected: {} },
      mobile: { default: {}, selected: {} },
    },
  }
);

if (focusCss.includes("width:50%")) {
  console.error("FAIL: focus CSS should strip layout keys from selected state");
  failed = true;
}

if (!focusCss.includes("border-top-color:rgb(0,0,0)")) {
  console.error("FAIL: focus CSS should keep non-layout selected overrides");
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log("Behavior checks passed.");
console.log("default props:", [...defaultProps].join(", "));
console.log("hover props:", hoverProps.join(", "));
