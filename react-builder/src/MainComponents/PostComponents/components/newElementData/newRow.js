import { columnStyle, rowStyle } from "../styleData"


const newRowData=
    {
        type: "row",
        style: {...rowStyle},
        settings: {
          background_image: "",
          bg_type: "color",
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
            type:'column',
            data:[],
          style: {...columnStyle},
          settings: {
            background_image: "",
            bg_type: "color",
            collapse_status: "false",
            admin_label: "",
            custom_class: "",
            visibility: {
              mobile: "false",
              tablet: "false",
              desktop: "false"
            }
          },
        },
        
        //End Column
        
    ],
        
      }

export default newRowData