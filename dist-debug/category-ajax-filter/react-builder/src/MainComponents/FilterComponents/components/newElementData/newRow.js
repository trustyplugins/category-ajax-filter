import { fColumnStyle, fRowStyle } from "../../styleData";

const newRowData = {
  type: "row",
  style: { ...fRowStyle },
  settings: {
    collapse_status: "false",
    custom_class: "",
    admin_label: "",
    visibility: {
      mobile: "false",
      tablet: "false",
      desktop: "false"
    }
  },
  //Start Column
  data: [
    {
      type: "column",
      settings: {
        collapse_status: "false",
        custom_class: "",
        admin_label: "",
        visibility: {
          mobile: "false",
          tablet: "false",
          desktop: "false"
        }
       },
      data: [],
      style: { ...fColumnStyle },
    },
    //End Column
  ],
};

export default newRowData;
