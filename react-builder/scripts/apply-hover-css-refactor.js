/**
 * Refactors functions.js hover CSS generation to delta-only output (line-range safe).
 */
const fs = require("fs");
const path = require("path");
const { helpersBlock } = require("./refactor-hover-css-helpers");

const functionsPath = path.join(
  __dirname,
  "..",
  "src",
  "MainComponents",
  "utils",
  "functions.js"
);

const lines = fs.readFileSync(functionsPath, "utf8").split(/\r?\n/);

let lineOffset = 0;
if (!lines.some((line) => line.includes("export const getStyleLayers"))) {
  const helperLines = helpersBlock.replace(/\r\n/g, "\n").split("\n");
  lines.splice(133, 0, ...helperLines);
  lineOffset = helperLines.length;
}

function replaceRange(startLine, endLine, newBody) {
  const startIdx = startLine - 1 + lineOffset;
  const endIdx = endLine - 1 + lineOffset;
  const newLines = newBody.replace(/\r\n/g, "\n").split("\n");
  lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
}

// Process bottom-to-top so line numbers stay valid before each splice.
const replacements = [
  {
    start: 4321,
    end: 4499,
    body: `export const generateLinkParentCSS=(style, state, device ,settings) => {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      propertyFilter: (property) => property === "justify-content",
      onPropertyApplied: (currentStyleArr) => {
        currentStyleArr.push("width:100%;");
        return currentStyleArr;
      },
    });
    return normalizeGradientTextStyles(styleArr).join(" ");
};`,
  },
  {
    start: 4270,
    end: 4320,
    body: `export const generatePostPreviewElementCSS = (style, device, state) => {
    return buildStyleArrayFromLayers(style, device, state).join(" ");
};`,
  },
  {
    start: 4105,
    end: 4269,
    body: `export const generateLoaderContainerCSS=(style, device, state)=> {
    return buildStyleArrayFromLayers(style, device, state).join(" ");
};`,
  },
  {
    start: 3702,
    end: 4104,
    body: `export const generateGridLayoutCSS=(style, state, device ,settings,imgae_url)=> {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      settings,
      imageUrl: imgae_url,
    });
    return normalizeGradientTextStyles(styleArr).join(" ");
}`,
  },
  {
    start: 3538,
    end: 3701,
    body: `export const generatePreviewSingleCSS=(device, state,postPreviewData)=> {
    const style = postPreviewData?.style;
    if (!style) {
      return "";
    }
    const styleArr = buildStyleArrayFromLayers(style, device, state);
    return normalizeGradientTextStyles(styleArr).join(" ");
};`,
  },
  {
    start: 3402,
    end: 3537,
    body: `export const generateMiscContainerCSS =(style, device, state)=> {
    return buildStyleArrayFromLayers(style, device, state).join(" ");
};`,
  },
  {
    start: 3269,
    end: 3401,
    body: `export const generatePostPreviewCSS = (device, state,postPreviewData,selectedPostLayout)=> {
    const style = postPreviewData?.[selectedPostLayout]?.style;
    if (!style) {
      return "";
    }
    const styleArr = buildStyleArrayFromLayers(style, device, state);
    return normalizeGradientTextStyles(styleArr).join(" ");
};`,
  },
  {
    start: 3135,
    end: 3268,
    body: `export const generateFilterWrapperPreviewCSS=(device, state,filterPreviewData)=> {
    const style = filterPreviewData?.style;
    if (!style) {
      return "";
    }
    const styleArr = buildStyleArrayFromLayers(style, device, state);
    return normalizeGradientTextStyles(styleArr).join(" ");
};`,
  },
  {
    start: 2929,
    end: 3134,
    body: `export const generateFilterRowColCSS=(style, state, device) =>{
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      backgroundImageMode: "url-wrap",
    });
    return normalizeGradientTextStyles(normalizeBackgroundImageRules(styleArr)).join(" ");
}`,
  },
  {
    start: 2878,
    end: 2928,
    body: `export const generateSkinWrapperCSS= (state,device,styleDefault)=> {
    const styles = {};
    const stateBranch = styleDefault?.[state];
    if (!stateBranch) {
      return styles;
    }

    const applyMetaLayer = (layer) => {
      if (isStyleLayerEmpty(layer)) {
        return;
      }
      Object.keys(layer).forEach((item) => {
        if (item === "backgroundImage" || shouldSkipStyleValue(layer[item])) {
          return;
        }
        removeDuplicateSkinCss(styles, item);
        styles[item] = layer[item];
      });
    };

    if (device === "mobile" && state !== "hover") {
      applyMetaLayer(stateBranch.desktop?.meta);
    }
    applyMetaLayer(stateBranch[device]?.meta);
    return styles;
}`,
  },
  {
    start: 2591,
    end: 2704,
    body: `export const generateSkinCSS=(tab,state, device,styleDefault)=> {
    const style = styleDefault?.[tab];
    if (!style) {
      return {};
    }
    return buildSkinStyleFromLayers(style, device, state);
}`,
  },
  {
    start: 2173,
    end: 2584,
    body: `export const generateFilterPlaceholderCSS=(tab, state, device,styleDefault) =>{
    const style = styleDefault?.[tab];
    if (!style) {
      return "";
    }
    return buildStyleArrayFromLayers(style, device, state, {
      backgroundImageMode: "url-wrap",
      includeStyleKeys: placeholderStyleKeys,
    }).join(" ");
};`,
  },
  {
    start: 1931,
    end: 2166,
    body: `export const generateFilterLabelInnerCSS=(tab, state, device,styleDefault) =>{
    const style = styleDefault?.[tab];
    if (!style) {
      return "";
    }
    return normalizeGradientTextStyles(
      buildStyleArrayFromLayers(style, device, state, {
        backgroundImageMode: "url-wrap",
        includeKeys: filterLabelCssProperty,
      })
    ).join(" ");
}`,
  },
  {
    start: 1695,
    end: 1930,
    body: `export const generateFilterLabelCSS=(tab, state, device,styleDefault) =>{
    const style = styleDefault?.[tab];
    if (!style) {
      return "";
    }
    return normalizeGradientTextStyles(
      buildStyleArrayFromLayers(style, device, state, {
        backgroundImageMode: "url-wrap",
        excludeKeys: filterLabelCssProperty,
      })
    ).join(" ");
}`,
  },
  {
    start: 1422,
    end: 1683,
    body: `export const generateFilterCSS=(tab, state, device,styleDefault) =>{
    const style = styleDefault?.[tab];
    if (!style) {
      return "";
    }
    return buildStyleArrayFromLayers(style, device, state, {
      backgroundImageMode: "url-wrap",
    }).join(" ");
};`,
  },
  {
    start: 989,
    end: 1421,
    body: `export const generateImageModuleTagCSS=(style, state, device ,settings,postData) => {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      settings,
      postData,
      includeKeys: borderStyleKeys,
    });
    return styleArr.join(" ");
};`,
  },
  {
    start: 556,
    end: 988,
    body: `export const generateImageModuleCSS=(style, state, device ,settings,postData) => {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      settings,
      postData,
      excludeKeys: borderStyleKeys,
    });
    return normalizeGradientTextStyles(styleArr).join(" ");
};`,
  },
  {
    start: 134,
    end: 535,
    body: `export const generateCSS=(style, state, device ,settings,postData) => {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      settings,
      postData,
    });
    return normalizeGradientTextStyles(styleArr).join(" ");
};`,
  },
];

for (const { start, end, body } of replacements) {
  replaceRange(start, end, body);
  console.log(`Replaced lines ${start}-${end}`);
}

fs.writeFileSync(functionsPath, lines.join("\n"), "utf8");
console.log("Done.");
