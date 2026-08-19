const fs = require("fs");
const path = require("path");

function generateIconComponent({ name, defaultClassName, svgPath, outPath, idPrefix }) {
  let svg = fs.readFileSync(svgPath, "utf8").trim();
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";
  const ids = [...svg.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  ids.forEach((id) => {
    const prefixed = idPrefix + id;
    const re = new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    svg = svg.replace(re, prefixed);
  });
  const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

  const content = `import React from "react";

function ${name}({
  className = "",
  alt = "",
  ...rest
}) {
  const mergedClassName = ["${defaultClassName}", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={mergedClassName}
      viewBox="${viewBox}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      aria-label={alt}
      role="img"
      {...rest}
      dangerouslySetInnerHTML={{ __html: svgInner }}
    />
  );
}

const svgInner = ${JSON.stringify(inner)};

export default ${name};
`;

  fs.writeFileSync(outPath, content);
  console.log("Wrote", outPath);
}

const base = path.join(__dirname, "..", "src", "MainComponents");

generateIconComponent({
  name: "BuilderElementorLogoIcon",
  defaultClassName: "caf-builder-elementor-logo-icon caf-elementor-loop-card-icon",
  svgPath: path.join(__dirname, "..", "public", "Elementor-logo.svg"),
  outPath: path.join(base, "BuilderElementorLogoIcon.js"),
  idPrefix: "caf-el-card-",
});
