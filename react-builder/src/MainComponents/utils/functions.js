export const CamelToSnake=(string) =>{
    return string.replace(/([a-z]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}
export const removeDuplicateProperty = (arr, item) => {
    if (arr.length === 0) {
      return arr;
    }
    let deletedval = "";
    for (let i = 0; i < arr.length; i++) {
      const property = arr[i];
      const colon = property.indexOf(":");
      const key = colon === -1 ? property : property.slice(0, colon);
      if (item == key) {
        deletedval = property;
      }
    }
    if (deletedval === "") {
      return arr;
    }
    return arr.filter((e) => e !== deletedval);
};

const normalizeGradientTextStyles = (styleArr = []) => {
  const backgroundColorGradientEntry = styleArr.find(
    (rule) => rule.startsWith("background-color:") && rule.includes("gradient(")
  );

  let nextStyleArr = [...styleArr];

  if (backgroundColorGradientEntry) {
    const backgroundGradientValue = backgroundColorGradientEntry
      .slice(backgroundColorGradientEntry.indexOf(":") + 1)
      .replace(/;$/, "")
      .trim();

    nextStyleArr = nextStyleArr.filter(
      (rule) => !rule.startsWith("background-color:")
    );
    nextStyleArr = removeDuplicateProperty(nextStyleArr, "background-image");
    nextStyleArr.push(`background-image:${backgroundGradientValue};`);
  }

  const borderColorKeys = [
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
  ];
  const borderGradientEntry = nextStyleArr.find(
    (rule) =>
      borderColorKeys.some((key) => rule.startsWith(`${key}:`)) &&
      rule.includes("gradient(")
  );

  if (borderGradientEntry) {
    const borderGradientValue = borderGradientEntry
      .slice(borderGradientEntry.indexOf(":") + 1)
      .replace(/;$/, "")
      .trim();

    borderColorKeys.forEach((key) => {
      nextStyleArr = removeDuplicateProperty(nextStyleArr, key);
    });
    nextStyleArr = removeDuplicateProperty(nextStyleArr, "border-image-source");
    nextStyleArr = removeDuplicateProperty(nextStyleArr, "border-image-slice");
    nextStyleArr = removeDuplicateProperty(nextStyleArr, "border-image-repeat");

    borderColorKeys.forEach((key) => {
      nextStyleArr.push(`${key}:transparent;`);
    });
    nextStyleArr.push(`border-image-source:${borderGradientValue};`);
    nextStyleArr.push("border-image-slice:1;");
    nextStyleArr.push("border-image-repeat:stretch;");
  }

  const colorEntry = nextStyleArr.find(
    (rule) => rule.startsWith("color:") && rule.includes("gradient(")
  );

  if (!colorEntry) {
    return nextStyleArr;
  }

  const gradientValue = colorEntry
    .slice(colorEntry.indexOf(":") + 1)
    .replace(/;$/, "")
    .trim();

  // If background gradient is already using background-image on this selector,
  // keep it as-is to avoid clobbering background visuals.
  if (nextStyleArr.some((rule) => rule.startsWith("background-image:"))) {
    return nextStyleArr;
  }

  nextStyleArr = nextStyleArr.filter((rule) => !rule.startsWith("color:"));
  nextStyleArr = removeDuplicateProperty(nextStyleArr, "background-image");
  nextStyleArr = removeDuplicateProperty(nextStyleArr, "background-clip");
  nextStyleArr = removeDuplicateProperty(nextStyleArr, "-webkit-background-clip");
  nextStyleArr = removeDuplicateProperty(nextStyleArr, "-webkit-text-fill-color");

  nextStyleArr.push(`background-image:${gradientValue};`);
  nextStyleArr.push("background-clip:text;");
  nextStyleArr.push("-webkit-background-clip:text;");
  nextStyleArr.push("-webkit-text-fill-color:transparent;");
  nextStyleArr.push("color:transparent;");

  return nextStyleArr;
};

const normalizeBackgroundImageRules = (styleArr = []) => {
  if (!Array.isArray(styleArr) || styleArr.length === 0) {
    return styleArr;
  }

  return styleArr.map((rule) => {
    if (typeof rule !== "string") {
      return rule;
    }

    const trimmed = rule.trim();
    const prefix = "background-image:url(";
    if (!trimmed.startsWith(prefix) || !trimmed.endsWith(");")) {
      return rule;
    }

    const innerValue = trimmed.slice(prefix.length, -2).trim();
    if (!/gradient\s*\(/i.test(innerValue)) {
      return rule;
    }

    return `background-image:${innerValue};`;
  });
};

const isStyleLayerEmpty = (layer) =>
  !layer || typeof layer !== "object" || Object.keys(layer).length === 0;

const isDefaultStyleState = (state) => state === "default";
const isPlaceholderStyleState = (state) => state === "placeholder";
const isSelectedStyleState = (state) => state === "selected";

const shouldSkipStyleValue = (value) =>
  value === "" || value === null || value === undefined;

/**
 * Ordered style layers for CSS output.
 * Default merges breakpoints; hover emits explicit overrides only.
 * Selected merges default + selected because many filters use a different
 * selector after selection (e.g. dropdown head loses .caf-all-selected).
 */
export const getStyleLayers = (style, device, state) => {
  if (!style || !device || !state) {
    return [];
  }

  const layers = [];

  if (device === "desktop") {
    if (isDefaultStyleState(state)) {
      layers.push(style.desktop?.default);
    } else if (isPlaceholderStyleState(state)) {
      layers.push(style.desktop?.placeholder);
    } else if (isSelectedStyleState(state)) {
      layers.push(style.desktop?.default);
      layers.push(style.desktop?.selected);
    } else {
      layers.push(style.desktop?.[state]);
    }
  } else if (device === "tablet" || device === "mobile") {
    if (isDefaultStyleState(state)) {
      layers.push(style.desktop?.default);
      layers.push(style[device]?.default);
    } else if (isPlaceholderStyleState(state)) {
      layers.push(style.desktop?.placeholder);
      layers.push(style[device]?.placeholder);
    } else if (isSelectedStyleState(state)) {
      layers.push(style.desktop?.default);
      layers.push(style[device]?.default);
      layers.push(style.desktop?.selected);
      layers.push(style[device]?.selected);
    } else {
      layers.push(style.desktop?.[state]);
      layers.push(style[device]?.[state]);
    }
  }

  return layers.filter((layer) => !isStyleLayerEmpty(layer));
};

const appendBackgroundImageRule = (
  styleArr,
  item,
  value,
  { settings = null, postData = null, imageUrl = null, backgroundImageMode = "auto" } = {}
) => {
  const property = CamelToSnake(item);
  styleArr = removeDuplicateProperty(styleArr, property);

  if (backgroundImageMode === "url-wrap") {
    styleArr.push(property + ":url(" + value + ");");
    return styleArr;
  }

  const imageSource =
    settings?.background_image === "post-img"
      ? postData?.image || imageUrl
      : value;
  styleArr.push(property + ":url(" + imageSource + ");");
  return styleArr;
};

const appendStandardStyleLayer = (styleArr, layer, options = {}) => {
  const {
    settings = null,
    postData = null,
    imageUrl = null,
    includeKeys = null,
    excludeKeys = [],
    includeStyleKeys = null,
    propertyFilter = null,
    valueFormatter = null,
    backgroundImageMode = "auto",
    onPropertyApplied = null,
  } = options;

  if (isStyleLayerEmpty(layer)) {
    return styleArr;
  }

  Object.keys(layer).forEach((item) => {
    if (includeKeys && !includeKeys.includes(item)) {
      return;
    }
    if (includeStyleKeys && !includeStyleKeys.includes(item)) {
      return;
    }
    if (excludeKeys.includes(item)) {
      return;
    }

    const value = layer[item];
    if (shouldSkipStyleValue(value)) {
      return;
    }

    const property = CamelToSnake(item);
    if (propertyFilter && !propertyFilter(property, item, value)) {
      return;
    }

    styleArr = removeDuplicateProperty(styleArr, property);

    if (item === "backgroundImage") {
      styleArr = appendBackgroundImageRule(styleArr, item, value, {
        settings,
        postData,
        imageUrl,
        backgroundImageMode,
      });
    } else {
      const formattedValue = valueFormatter
        ? valueFormatter(property, item, value)
        : value;
      styleArr.push(property + ":" + formattedValue + ";");
    }

    if (typeof onPropertyApplied === "function") {
      styleArr = onPropertyApplied(styleArr, property, item, value) || styleArr;
    }
  });

  return styleArr;
};

const buildStyleArrayFromLayers = (style, device, state, options = {}) => {
  let styleArr = [];
  getStyleLayers(style, device, state).forEach((layer) => {
    styleArr = appendStandardStyleLayer(styleArr, layer, options);
  });
  return styleArr;
};

const buildSkinStyleFromLayers = (style, device, state) => {
  let styleObj = {};
  getStyleLayers(style, device, state).forEach((layer) => {
    Object.keys(layer).forEach((item) => {
      if (item === "backgroundImage" || shouldSkipStyleValue(layer[item])) {
        return;
      }
      styleObj = removeDuplicateSkinCss(styleObj, item);
      styleObj[item] = layer[item];
    });
  });
  return styleObj;
};

export const generateCSS=(style, state, device ,settings,postData) => {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      settings,
      postData,
    });
    return normalizeGradientTextStyles(styleArr).join(" ");
};

let borderStyleKeys =  [
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius"
];

export const generateImageModuleCSS=(style, state, device ,settings,postData) => {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      settings,
      postData,
      excludeKeys: borderStyleKeys,
    });
    return normalizeGradientTextStyles(styleArr).join(" ");
};
export const generateImageModuleTagCSS=(style, state, device ,settings,postData) => {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      settings,
      postData,
      includeKeys: borderStyleKeys,
    });
    return styleArr.join(" ");
};
export const generateFilterCSS=(tab, state, device,styleDefault) =>{
    const style = styleDefault?.[tab];
    if (!style) {
      return "";
    }
    return normalizeGradientTextStyles(
      buildStyleArrayFromLayers(style, device, state, {
        backgroundImageMode: "url-wrap",
      })
    ).join(" ");
};

const FILTER_FOCUS_INHERIT_LAYOUT_KEYS = new Set([
  "width",
  "height",
  "maxWidth",
  "minWidth",
  "maxHeight",
  "minHeight",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "display",
  "flexFlow",
  "alignItems",
  "justifyContent",
  "gap",
  "float",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "flexWrap",
]);

const stripFocusLayoutFromStyleDefault = (styleDefault, tab) => {
  let cloned;
  try {
    cloned = JSON.parse(JSON.stringify(styleDefault ?? {}));
  } catch (_error) {
    return styleDefault;
  }

  if (!cloned?.[tab]) {
    return cloned;
  }

  ["desktop", "tablet", "mobile"].forEach((device) => {
    const selected = cloned[tab]?.[device]?.selected;
    if (!selected || typeof selected !== "object") {
      return;
    }

    FILTER_FOCUS_INHERIT_LAYOUT_KEYS.forEach((key) => {
      delete selected[key];
    });
  });

  return cloned;
};

export const generateFilterFocusCSS = (tab, device, styleDefault) => {
  return generateFilterCSS(
    tab,
    "selected",
    device,
    stripFocusLayoutFromStyleDefault(styleDefault, tab)
  );
};

const filterLabelCssProperty =["display","flexFlow" ,"justifyContent","alignItems","gap","float"];

export const generateFilterLabelCSS=(tab, state, device,styleDefault) =>{
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
}
export const generateFilterLabelInnerCSS=(tab, state, device,styleDefault) =>{
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
}
let placeholderStyleKeys =  [
  "color",
  "fontFamily",
  "fontWeight",
  "fontSize",
];
export const generateFilterPlaceholderCSS=(tab, state, device,styleDefault) =>{
    const style = styleDefault?.[tab];
    if (!style) {
      return "";
    }
    return buildStyleArrayFromLayers(style, device, state, {
      backgroundImageMode: "url-wrap",
      includeStyleKeys: placeholderStyleKeys,
    }).join(" ");
};
export const getMetaStyle = (tab, state, device, styleDefault) => {
  const width = styleDefault?.meta?.[device]?.[state]?.width;
  if (shouldSkipStyleValue(width)) {
    return "";
  }

  const tabLayers = getStyleLayers(styleDefault?.[tab], device, state);
  const hasWidthInTab = tabLayers.some((layer) =>
    Object.prototype.hasOwnProperty.call(layer, "width")
  );
  if (!hasWidthInTab) {
    return "";
  }

  let styleArr = ["width:" + width + ";"];
  if (width === "auto") {
    styleArr.push("margin:0;");
  }
  return styleArr.join(" ");
};
export const removeDuplicateSkinCss=(arr,item)=>{
    if (arr.hasOwnProperty(item)) {
      delete arr[item];
    }
    return arr;
}
export const generateSkinCSS=(tab,state, device,styleDefault)=> {
    const style = styleDefault?.[tab];
    if (!style) {
      return {};
    }
    return buildSkinStyleFromLayers(style, device, state);
}
export const generateContainerCSS=(state, device,styleDefault)=> {
    let ar = [];
    if (device == 'mobile') {
      if (state != 'hover') {
        Object.keys(styleDefault[state].desktop.container).map((item, i) => {
          let filter_item = CamelToSnake(item);
          ar = removeDuplicateProperty(ar, filter_item);
          if (item != "backgroundImage") {
            if(item == "backgroundColor"){
              ar.push(filter_item + ":" + styleDefault[state].desktop.container[item] + " !important;");
            }else{
              ar.push(filter_item + ":" + styleDefault[state].desktop.container[item] + ";");
            }
          }
          else {
            ar.push(filter_item + ":" + "url(" + styleDefault[state].desktop.container[item] + ");");
          }
        });
      }
      Object.keys(styleDefault[state][device].container).map((item, i) => {
        let filter_item = CamelToSnake(item);
         ar = removeDuplicateProperty(ar, filter_item);
        if (item != "backgroundImage") {
          if(item == "backgroundColor"){
            ar.push(filter_item + ":" + styleDefault[state].desktop.container[item] + " !important;");
          }else{
            ar.push(filter_item + ":" + styleDefault[state].desktop.container[item] + ";");
          }
        }
        else {
          ar.push(filter_item + ":" + "url(" + styleDefault[state][device].container[item] + ");");
        }
      });
    } else {
      Object.keys(styleDefault[state][device].container).map((item, i) => {
        let filter_item = CamelToSnake(item);
        ar = removeDuplicateProperty(ar, filter_item);
        if (item != "backgroundImage") {
          if(item == "backgroundColor"){
            ar.push(filter_item + ":" + styleDefault[state].desktop.container[item] + " !important;");
          }else{
            ar.push(filter_item + ":" + styleDefault[state].desktop.container[item] + ";");
          }
        }
        else {
          ar.push(filter_item + ":" + "url(" + styleDefault[state][device].container[item] + ");");
        }
      });
    }

    return ar.join(" ");
}
export const generateHeaderCSS=(state, device,styleDefault) =>{
    let ar = [];
    if (device == 'mobile') {
      if (state != 'hover') {
        Object.keys(styleDefault[state].desktop.header).map((item, i) => {
          let filter_item = CamelToSnake(item);
          ar = removeDuplicateProperty(ar, filter_item);
          if (item != "backgroundImage") {
            ar.push(filter_item + ":" + styleDefault[state].desktop.header[item] + ";");
          }
          else {
            ar.push(filter_item + ":" + "url(" + styleDefault[state].desktop.header[item] + ");");
          }
        });
      }
      Object.keys(styleDefault[state][device].header).map((item, i) => {
        let filter_item = CamelToSnake(item);
        ar = removeDuplicateProperty(ar, filter_item);
        if (item != "backgroundImage") {
          ar.push(filter_item + ":" + styleDefault[state][device].header[item] + ";");
        }
        else {
          ar.push(filter_item + ":" + "url(" + styleDefault[state][device].header[item] + ");");
        }
      });
    } else {
      Object.keys(styleDefault[state][device].header).map((item, i) => {
        let filter_item = CamelToSnake(item);
        ar = removeDuplicateProperty(ar, filter_item);
        if (item != "backgroundImage") {
          ar.push(filter_item + ":" + styleDefault[state][device].header[item] + ";");
        }
        else {
          ar.push(filter_item + ":" + "url(" + styleDefault[state][device].header[item] + ");");
        }
      });
    }

    return ar.join(" ");
}
export const generateMetaCSS=(state, device,styleDefault) =>{
    let ar = [];
    if (device == 'mobile') {
      if (state != 'hover') {
        Object.keys(styleDefault[state].desktop.meta).map((item, i) => {
          let filter_item = CamelToSnake(item);
         ar = removeDuplicateProperty(ar, filter_item);
          if (item != "backgroundImage") {
            ar.push(filter_item + ":" + styleDefault[state].desktop.meta[item] + ";");
          }
          else {
            ar.push(filter_item + ":" + "url(" + styleDefault[state].desktop.meta[item] + ");");
          }
        });
      }
      Object.keys(styleDefault[state][device].meta).map((item, i) => {
        let filter_item = CamelToSnake(item);
        ar = removeDuplicateProperty(ar, filter_item);
        if (item != "backgroundImage") {
          ar.push(filter_item + ":" + styleDefault[state][device].meta[item] + ";");
        }
        else {
          ar.push(filter_item + ":" + "url(" + styleDefault[state][device].meta[item] + ");");
        }
      });
    } else {
      Object.keys(styleDefault[state][device].meta).map((item, i) => {
        let filter_item = CamelToSnake(item);
        ar = removeDuplicateProperty(ar, filter_item);
        if (item != "backgroundImage") {
          ar.push(filter_item + ":" + styleDefault[state][device].meta[item] + ";");
        }
        else {
          ar.push(filter_item + ":" + "url(" + styleDefault[state][device].meta[item] + ");");
        }
      });
    }

    return ar.join(" ");
}
export const getFilterMetaStyle=(state, device,styleDefault)=> {
    let ar = [];
    if (device == 'mobile') {
      Object.keys(styleDefault[state].desktop.meta).map((item, i) => {
        let filter_item = CamelToSnake(item);
        ar = removeDuplicateProperty(ar, filter_item);
        if (item == "width") {
          ar.push(filter_item + ":" + styleDefault[state].desktop.meta[item]) + ";";
          if(styleDefault[state].desktop.meta[item] == 'auto'){
          ar.push("margin:0;");
          }
        }
      });

      Object.keys(styleDefault[state][device].meta).map((item, i) => {
       let filter_item = CamelToSnake(item);
        ar = removeDuplicateProperty(ar, filter_item);
        if (item == "width") {
          ar.push(filter_item + ":" + styleDefault[state][device].meta[item] + ";");
          if(styleDefault[state].desktop.meta[item] == 'auto'){
            ar.push("margin:0;");
            }
        }

      });
    } else {
      Object.keys(styleDefault[state][device].meta).map((item, i) => {
        let filter_item = CamelToSnake(item);
        ar = removeDuplicateProperty(ar, filter_item);
        if (item == "width") {
          ar.push(filter_item + ":" + styleDefault[state][device].meta[item] + ";");
          if(styleDefault[state].desktop.meta[item] == 'auto'){
            ar.push("margin:0;");
            }
        }

      });
    }

    return ar.join(" ");
}
export const generateSkinWrapperCSS= (state,device,styleDefault)=> {
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
}
export const generateFilterRowColCSS=(style, state, device) =>{
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      backgroundImageMode: "url-wrap",
    });
    return normalizeGradientTextStyles(normalizeBackgroundImageRules(styleArr)).join(" ");
}
export const generateFilterWrapperPreviewCSS=(device, state,filterPreviewData)=> {
    const style = filterPreviewData?.style;
    if (!style) {
      return "";
    }
    const styleArr = buildStyleArrayFromLayers(style, device, state);
    return normalizeGradientTextStyles(styleArr).join(" ");
};
export const generatePostPreviewCSS = (device, state,postPreviewData,selectedPostLayout)=> {
    const style = postPreviewData?.[selectedPostLayout]?.style;
    if (!style) {
      return "";
    }
    const styleArr = buildStyleArrayFromLayers(style, device, state);
    return normalizeGradientTextStyles(styleArr).join(" ");
};
export const generateMiscContainerCSS =(style, device, state)=> {
    return normalizeGradientTextStyles(
      buildStyleArrayFromLayers(style, device, state)
    ).join(" ");
};
export const generatePreviewSingleCSS=(device, state,postPreviewData)=> {
    const style = postPreviewData?.style;
    if (!style) {
      return "";
    }
    const styleArr = buildStyleArrayFromLayers(style, device, state);
    return normalizeGradientTextStyles(styleArr).join(" ");
};
export const generateGridLayoutCSS=(style, state, device ,settings,imgae_url)=> {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      settings,
      imageUrl: imgae_url,
    });
    return normalizeGradientTextStyles(styleArr).join(" ");
}
export const generateLoaderContainerCSS=(style, device, state)=> {
    return buildStyleArrayFromLayers(style, device, state).join(" ");
};
export const generatePostPreviewElementCSS = (style, device, state) => {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      excludeKeys: ["overlay"],
    });
    return normalizeGradientTextStyles(styleArr).join(" ");
};
export const generateLinkParentCSS=(style, state, device ,settings) => {
    const styleArr = buildStyleArrayFromLayers(style, device, state, {
      propertyFilter: (property) => property === "justify-content",
      onPropertyApplied: (currentStyleArr) => {
        currentStyleArr.push("width:100%;");
        return currentStyleArr;
      },
    });
    return normalizeGradientTextStyles(styleArr).join(" ");
};
export const validateTerm = (taxonomy, id, updatedTaxo) => {
  const taxo = updatedTaxo?.[taxonomy];
  if (!updatedTaxo || Object.keys(updatedTaxo).length === 0) {
    return false;
  }
  if (!taxo || taxo.length === 0) {
    return false;
  }
  const normalizedId = String(id);
  return taxo.some((termId) => String(termId) === normalizedId);
};