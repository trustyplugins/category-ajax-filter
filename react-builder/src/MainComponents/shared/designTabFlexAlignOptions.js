/**
 * Flex "align X / align Y" dropdown options derived from resolved flexFlow.
 * Shared by filter and post DesignTab (identical behavior).
 */
export function buildFlexAlignOptions(flexFlow) {
  let opt1 = [];
  let opt2 = [];
  if (flexFlow === "row") {
    opt1 = [
      {
        value: "flex-start",
        label: "Left",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-end",
        label: "Right",
      },
      {
        value: "space-between",
        label: "Space between",
      },
      {
        value: "space-around",
        label: "Space around",
      },
      {
        value: "space-evenly",
        label: "Space evenly",
      },
    ];
    opt2 = [
      {
        value: "flex-start",
        label: "Top",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-end",
        label: "Bottom",
      },
      {
        value: "stretch",
        label: "Stretch",
      },
      {
        value: "baseline",
        label: "Baseline",
      },
    ];
  } else if (flexFlow === "row-reverse") {
    opt1 = [
      {
        value: "flex-end",
        label: "Left",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-start",
        label: "Right",
      },
      {
        value: "space-between",
        label: "Space between",
      },
      {
        value: "space-around",
        label: "Space around",
      },
      {
        value: "space-evenly",
        label: "Space evenly",
      },
    ];
    opt2 = [
      {
        value: "flex-start",
        label: "Top",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-end",
        label: "Bottom",
      },
      {
        value: "stretch",
        label: "Stretch",
      },
      {
        value: "baseline",
        label: "Baseline",
      },
    ];
  } else if (flexFlow === "column") {
    opt1 = [
      {
        value: "flex-start",
        label: "Left",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-end",
        label: "Right",
      },
      {
        value: "stretch",
        label: "Stretch",
      },
      {
        value: "baseline",
        label: "Baseline",
      },
    ];
    opt2 = [
      {
        value: "flex-start",
        label: "Top",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-end",
        label: "Bottom",
      },
      {
        value: "space-between",
        label: "Space between",
      },
      {
        value: "space-around",
        label: "Space around",
      },
      {
        value: "space-evenly",
        label: "Space evenly",
      },
    ];
  } else if (flexFlow === "column-reverse") {
    opt1 = [
      {
        value: "flex-start",
        label: "Left",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-end",
        label: "Right",
      },
      {
        value: "stretch",
        label: "Stretch",
      },
      {
        value: "baseline",
        label: "Baseline",
      },
    ];
    opt2 = [
      {
        value: "flex-end",
        label: "Top",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-start",
        label: "Bottom",
      },
      {
        value: "space-between",
        label: "Space between",
      },
      {
        value: "space-around",
        label: "Space around",
      },
      {
        value: "space-evenly",
        label: "Space evenly",
      },
    ];
  }
  else {
    opt1 = [
      {
        value: "flex-start",
        label: "Left",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-end",
        label: "Right",
      },
      {
        value: "space-between",
        label: "Space between",
      },
      {
        value: "space-around",
        label: "Space around",
      },
      {
        value: "space-evenly",
        label: "Space evenly",
      },
    ];
    opt2 = [
      {
        value: "flex-start",
        label: "Top",
      },
      {
        value: "center",
        label: "Center",
      },
      {
        value: "flex-end",
        label: "Bottom",
      },
      {
        value: "stretch",
        label: "Stretch",
      },
      {
        value: "baseline",
        label: "Baseline",
      },
    ];
  }

  return { opt1, opt2 };
}
