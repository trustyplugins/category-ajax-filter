import { columnStyle} from "../styleData"
const newColumnData=
{
    type:'column', 
    data:[],
    style: {...columnStyle,
      default:{
        ...columnStyle.default,
        backgroundColor: "#ffffff",
      },
    },
    settings: {
        background_image:'',
         bg_type:"color",
        collapse_status: "false",
        custom_class:"",
        admin_label : "",
        visibility:{
          mobile:"false",
          tablet:"false",
          desktop:"false",
        }
      },
}
        

export default newColumnData