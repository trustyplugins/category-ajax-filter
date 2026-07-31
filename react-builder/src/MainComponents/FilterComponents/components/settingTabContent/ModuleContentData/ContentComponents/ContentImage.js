import React, { useEffect, useState } from "react";
import { Select, Input, Switch, Tooltip } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
function ContentImage(props) {

  const { type, rowindex, columnindex, moduleindex } = props.indexes;
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    styleState = "default",
    deviceSwitch ,
    styleTab

  } = props;
  let img = "";
  let imgsize = "cover";
  let imgpos = "top left";
  let imgrep = "no-repeat";
  let device = deviceSwitch;

  if (type == "row") {
    let RowStyle = props.data[rowindex].style;
    if (RowStyle[device][styleState]?.["backgroundImage"]) {
      img = RowStyle[device][styleState]["backgroundImage"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.["backgroundImage"]) {
            img = RowStyle[device]["default"]["backgroundImage"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["backgroundImage"]) {
            img = RowStyle["desktop"]["default"]["backgroundImage"];
          }
        } else {
          if (RowStyle[device]["default"]?.["backgroundImage"]) {
            img = RowStyle[device]["default"]["backgroundImage"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["backgroundImage"]) {
              img = RowStyle["desktop"]["hover"]["backgroundImage"];
            } else {
              if (RowStyle["desktop"]["default"]?.["backgroundImage"]) {
                img =
                  RowStyle["desktop"]["default"]["backgroundImage"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["backgroundImage"]) {
            img = RowStyle["desktop"]["default"]["backgroundImage"];
          }
        } else {
          if (RowStyle[device]["default"]?.["backgroundImage"]) {
            img = RowStyle[device]["default"]["backgroundImage"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["backgroundImage"]) {
              img = RowStyle["desktop"]["hover"]["backgroundImage"];
            } else {
              if (RowStyle["desktop"]["default"]?.["backgroundImage"]) {
                img =
                  RowStyle["desktop"]["default"]["backgroundImage"];
              }
            }
          }
        }
      }
    }

    if (RowStyle[device][styleState]?.["backgroundSize"]) {
      imgsize = RowStyle[device][styleState]["backgroundSize"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.["backgroundSize"]) {
            imgsize = RowStyle[device]["default"]["backgroundSize"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["backgroundSize"]) {
            imgsize = RowStyle["desktop"]["default"]["backgroundSize"];
          }
        } else {
          if (RowStyle[device]["default"]?.["backgroundSize"]) {
            imgsize = RowStyle[device]["default"]["backgroundSize"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["backgroundSize"]) {
              imgsize = RowStyle["desktop"]["hover"]["backgroundSize"];
            } else {
              if (RowStyle["desktop"]["default"]?.["backgroundSize"]) {
                imgsize =
                  RowStyle["desktop"]["default"]["backgroundSize"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["backgroundSize"]) {
            imgsize = RowStyle["desktop"]["default"]["backgroundSize"];
          }
        } else {
          if (RowStyle[device]["default"]?.["backgroundSize"]) {
            imgsize = RowStyle[device]["default"]["backgroundSize"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["backgroundSize"]) {
              imgsize = RowStyle["desktop"]["hover"]["backgroundSize"];
            } else {
              if (RowStyle["desktop"]["default"]?.["backgroundSize"]) {
                imgsize =
                  RowStyle["desktop"]["default"]["backgroundSize"];
              }
            }
          }
        }
      }
    }

    if (RowStyle[device][styleState]?.["backgroundPosition"]) {
      imgpos = RowStyle[device][styleState]["backgroundPosition"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.["backgroundPosition"]) {
            imgpos = RowStyle[device]["default"]["backgroundPosition"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["backgroundPosition"]) {
            imgpos = RowStyle["desktop"]["default"]["backgroundPosition"];
          }
        } else {
          if (RowStyle[device]["default"]?.["backgroundPosition"]) {
            imgpos = RowStyle[device]["default"]["backgroundPosition"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["backgroundPosition"]) {
              imgpos = RowStyle["desktop"]["hover"]["backgroundPosition"];
            } else {
              if (RowStyle["desktop"]["default"]?.["backgroundPosition"]) {
                imgpos =
                  RowStyle["desktop"]["default"]["backgroundPosition"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["backgroundPosition"]) {
            imgpos = RowStyle["desktop"]["default"]["backgroundPosition"];
          }
        } else {
          if (RowStyle[device]["default"]?.["backgroundPosition"]) {
            imgpos = RowStyle[device]["default"]["backgroundPosition"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["backgroundPosition"]) {
              imgpos = RowStyle["desktop"]["hover"]["backgroundPosition"];
            } else {
              if (RowStyle["desktop"]["default"]?.["backgroundPosition"]) {
                imgpos =
                  RowStyle["desktop"]["default"]["backgroundPosition"];
              }
            }
          }
        }
      }
    }

    if (RowStyle[device][styleState]?.["backgroundRepeat"]) {
      imgrep = RowStyle[device][styleState]["backgroundRepeat"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (RowStyle[device]["default"]?.["backgroundRepeat"]) {
            imgrep = RowStyle[device]["default"]["backgroundRepeat"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["backgroundRepeat"]) {
            imgrep = RowStyle["desktop"]["default"]["backgroundRepeat"];
          }
        } else {
          if (RowStyle[device]["default"]?.["backgroundRepeat"]) {
            imgrep = RowStyle[device]["default"]["backgroundRepeat"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["backgroundRepeat"]) {
              imgrep = RowStyle["desktop"]["hover"]["backgroundRepeat"];
            } else {
              if (RowStyle["desktop"]["default"]?.["backgroundRepeat"]) {
                imgrep =
                  RowStyle["desktop"]["default"]["backgroundRepeat"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (RowStyle["desktop"]["default"]?.["backgroundRepeat"]) {
            imgrep = RowStyle["desktop"]["default"]["backgroundRepeat"];
          }
        } else {
          if (RowStyle[device]["default"]?.["backgroundRepeat"]) {
            imgrep = RowStyle[device]["default"]["backgroundRepeat"];
          } else {
            if (RowStyle["desktop"]["hover"]?.["backgroundRepeat"]) {
              imgrep = RowStyle["desktop"]["hover"]["backgroundRepeat"];
            } else {
              if (RowStyle["desktop"]["default"]?.["backgroundRepeat"]) {
                imgrep =
                  RowStyle["desktop"]["default"]["backgroundRepeat"];
              }
            }
          }
        }
      }
    }
  }
  if (type == "column") {
    let ColStyle = props.data[rowindex].data[columnindex].style;
       if (ColStyle[device][styleState]?.["backgroundImage"]) {
      img = ColStyle[device][styleState]["backgroundImage"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.["backgroundImage"]) {
            img = ColStyle[device]["default"]["backgroundImage"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["backgroundImage"]) {
            img = ColStyle["desktop"]["default"]["backgroundImage"];
          }
        } else {
          if (ColStyle[device]["default"]?.["backgroundImage"]) {
            img = ColStyle[device]["default"]["backgroundImage"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["backgroundImage"]) {
              img = ColStyle["desktop"]["hover"]["backgroundImage"];
            } else {
              if (ColStyle["desktop"]["default"]?.["backgroundImage"]) {
                img =
                  ColStyle["desktop"]["default"]["backgroundImage"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["backgroundImage"]) {
            img = ColStyle["desktop"]["default"]["backgroundImage"];
          }
        } else {
          if (ColStyle[device]["default"]?.["backgroundImage"]) {
            img = ColStyle[device]["default"]["backgroundImage"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["backgroundImage"]) {
              img = ColStyle["desktop"]["hover"]["backgroundImage"];
            } else {
              if (ColStyle["desktop"]["default"]?.["backgroundImage"]) {
                img =
                  ColStyle["desktop"]["default"]["backgroundImage"];
              }
            }
          }
        }
      }
    }

    if (ColStyle[device][styleState]?.["backgroundSize"]) {
      imgsize = ColStyle[device][styleState]["backgroundSize"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.["backgroundSize"]) {
            imgsize = ColStyle[device]["default"]["backgroundSize"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["backgroundSize"]) {
            imgsize = ColStyle["desktop"]["default"]["backgroundSize"];
          }
        } else {
          if (ColStyle[device]["default"]?.["backgroundSize"]) {
            imgsize = ColStyle[device]["default"]["backgroundSize"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["backgroundSize"]) {
              imgsize = ColStyle["desktop"]["hover"]["backgroundSize"];
            } else {
              if (ColStyle["desktop"]["default"]?.["backgroundSize"]) {
                imgsize =
                  ColStyle["desktop"]["default"]["backgroundSize"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["backgroundSize"]) {
            imgsize = ColStyle["desktop"]["default"]["backgroundSize"];
          }
        } else {
          if (ColStyle[device]["default"]?.["backgroundSize"]) {
            imgsize = ColStyle[device]["default"]["backgroundSize"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["backgroundSize"]) {
              imgsize = ColStyle["desktop"]["hover"]["backgroundSize"];
            } else {
              if (ColStyle["desktop"]["default"]?.["backgroundSize"]) {
                imgsize =
                  ColStyle["desktop"]["default"]["backgroundSize"];
              }
            }
          }
        }
      }
    }

    if (ColStyle[device][styleState]?.["backgroundPosition"]) {
      imgpos = ColStyle[device][styleState]["backgroundPosition"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.["backgroundPosition"]) {
            imgpos = ColStyle[device]["default"]["backgroundPosition"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["backgroundPosition"]) {
            imgpos = ColStyle["desktop"]["default"]["backgroundPosition"];
          }
        } else {
          if (ColStyle[device]["default"]?.["backgroundPosition"]) {
            imgpos = ColStyle[device]["default"]["backgroundPosition"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["backgroundPosition"]) {
              imgpos = ColStyle["desktop"]["hover"]["backgroundPosition"];
            } else {
              if (ColStyle["desktop"]["default"]?.["backgroundPosition"]) {
                imgpos =
                  ColStyle["desktop"]["default"]["backgroundPosition"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["backgroundPosition"]) {
            imgpos = ColStyle["desktop"]["default"]["backgroundPosition"];
          }
        } else {
          if (ColStyle[device]["default"]?.["backgroundPosition"]) {
            imgpos = ColStyle[device]["default"]["backgroundPosition"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["backgroundPosition"]) {
              imgpos = ColStyle["desktop"]["hover"]["backgroundPosition"];
            } else {
              if (ColStyle["desktop"]["default"]?.["backgroundPosition"]) {
                imgpos =
                  ColStyle["desktop"]["default"]["backgroundPosition"];
              }
            }
          }
        }
      }
    }
    
    if (ColStyle[device][styleState]?.["backgroundRepeat"]) {
      imgrep = ColStyle[device][styleState]["backgroundRepeat"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ColStyle[device]["default"]?.["backgroundRepeat"]) {
            imgrep = ColStyle[device]["default"]["backgroundRepeat"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["backgroundRepeat"]) {
            imgrep = ColStyle["desktop"]["default"]["backgroundRepeat"];
          }
        } else {
          if (ColStyle[device]["default"]?.["backgroundRepeat"]) {
            imgrep = ColStyle[device]["default"]["backgroundRepeat"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["backgroundRepeat"]) {
              imgrep = ColStyle["desktop"]["hover"]["backgroundRepeat"];
            } else {
              if (ColStyle["desktop"]["default"]?.["backgroundRepeat"]) {
                imgrep =
                  ColStyle["desktop"]["default"]["backgroundRepeat"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ColStyle["desktop"]["default"]?.["backgroundRepeat"]) {
            imgrep = ColStyle["desktop"]["default"]["backgroundRepeat"];
          }
        } else {
          if (ColStyle[device]["default"]?.["backgroundRepeat"]) {
            imgrep = ColStyle[device]["default"]["backgroundRepeat"];
          } else {
            if (ColStyle["desktop"]["hover"]?.["backgroundRepeat"]) {
              imgrep = ColStyle["desktop"]["hover"]["backgroundRepeat"];
            } else {
              if (ColStyle["desktop"]["default"]?.["backgroundRepeat"]) {
                imgrep =
                  ColStyle["desktop"]["default"]["backgroundRepeat"];
              }
            }
          }
        }
      }
    }
  }
  if (type == "module") {
    let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
    if (ModuleStyle[styleTab][device][styleState]?.["backgroundImage"]) {
      img = ModuleStyle[styleTab][device][styleState]["backgroundImage"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundImage"]) {
            img = ModuleStyle[styleTab][device]["default"]["backgroundImage"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundImage"]) {
            img = ModuleStyle[styleTab]["desktop"]["default"]["backgroundImage"];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundImage"]) {
            img = ModuleStyle[styleTab][device]["default"]["backgroundImage"];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.["backgroundImage"]) {
              img = ModuleStyle[styleTab]["desktop"]["hover"]["backgroundImage"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundImage"]) {
                img =
                  ModuleStyle[styleTab]["desktop"]["default"]["backgroundImage"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundImage"]) {
            img = ModuleStyle[styleTab]["desktop"]["default"]["backgroundImage"];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundImage"]) {
            img = ModuleStyle[styleTab][device]["default"]["backgroundImage"];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.["backgroundImage"]) {
              img = ModuleStyle[styleTab]["desktop"]["hover"]["backgroundImage"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundImage"]) {
                img =
                  ModuleStyle[styleTab]["desktop"]["default"]["backgroundImage"];
              }
            }
          }
        }
      }
    }

    if (ModuleStyle[styleTab][device][styleState]?.["backgroundSize"]) {
      imgsize = ModuleStyle[styleTab][device][styleState]["backgroundSize"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle[styleTab][device]["default"]["backgroundSize"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle[styleTab]["desktop"]["default"]["backgroundSize"];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle[styleTab][device]["default"]["backgroundSize"];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.["backgroundSize"]) {
              imgsize = ModuleStyle[styleTab]["desktop"]["hover"]["backgroundSize"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundSize"]) {
                imgsize =
                  ModuleStyle[styleTab]["desktop"]["default"]["backgroundSize"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle[styleTab]["desktop"]["default"]["backgroundSize"];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle[styleTab][device]["default"]["backgroundSize"];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.["backgroundSize"]) {
              imgsize = ModuleStyle[styleTab]["desktop"]["hover"]["backgroundSize"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundSize"]) {
                imgsize =
                  ModuleStyle[styleTab]["desktop"]["default"]["backgroundSize"];
              }
            }
          }
        }
      }
    }

    if (ModuleStyle[styleTab][device][styleState]?.["backgroundPosition"]) {
      imgpos = ModuleStyle[styleTab][device][styleState]["backgroundPosition"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle[styleTab][device]["default"]["backgroundPosition"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle[styleTab]["desktop"]["default"]["backgroundPosition"];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle[styleTab][device]["default"]["backgroundPosition"];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.["backgroundPosition"]) {
              imgpos = ModuleStyle[styleTab]["desktop"]["hover"]["backgroundPosition"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundPosition"]) {
                imgpos =
                  ModuleStyle[styleTab]["desktop"]["default"]["backgroundPosition"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle[styleTab]["desktop"]["default"]["backgroundPosition"];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle[styleTab][device]["default"]["backgroundPosition"];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.["backgroundPosition"]) {
              imgpos = ModuleStyle[styleTab]["desktop"]["hover"]["backgroundPosition"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundPosition"]) {
                imgpos =
                  ModuleStyle[styleTab]["desktop"]["default"]["backgroundPosition"];
              }
            }
          }
        }
      }
    }
    
    if (ModuleStyle[styleTab][device][styleState]?.["backgroundRepeat"]) {
      imgrep = ModuleStyle[styleTab][device][styleState]["backgroundRepeat"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle[styleTab][device]["default"]["backgroundRepeat"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle[styleTab]["desktop"]["default"]["backgroundRepeat"];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle[styleTab][device]["default"]["backgroundRepeat"];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.["backgroundRepeat"]) {
              imgrep = ModuleStyle[styleTab]["desktop"]["hover"]["backgroundRepeat"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundRepeat"]) {
                imgrep =
                  ModuleStyle[styleTab]["desktop"]["default"]["backgroundRepeat"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle[styleTab]["desktop"]["default"]["backgroundRepeat"];
          }
        } else {
          if (ModuleStyle[styleTab][device]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle[styleTab][device]["default"]["backgroundRepeat"];
          } else {
            if (ModuleStyle[styleTab]["desktop"]["hover"]?.["backgroundRepeat"]) {
              imgrep = ModuleStyle[styleTab]["desktop"]["hover"]["backgroundRepeat"];
            } else {
              if (ModuleStyle[styleTab]["desktop"]["default"]?.["backgroundRepeat"]) {
                imgrep =
                  ModuleStyle[styleTab]["desktop"]["default"]["backgroundRepeat"];
              }
            }
          }
        }
      }
    }
  }
  //const [postImg, setPostImg] = useState(img ? img : "0");
  const [selected, setSelected] = useState(img);
  //const [bgImageSize, setBgImageSize] = useState(imgsize);
  //const [bgImagePosition, setBgImagePosition] = useState(imgpos);
  //const [bgImageRepeat, setBgImageRepeat] = useState(imgrep);
  // let bgImages = {
  //   backgroundImage: img,
  //   backgroundSize: imgsize,
  //   backgroundPosition: imgpos,
  //   backgroundRepeat: imgrep,
  //   //condition:false,
  // };
  var customMediaLibrary = window.wp.media({
    // Accepts [ 'select', 'post', 'image', 'audio', 'video' ]
    // Determines what kind of library should be rendered.
    frame: "select",
    // Modal title.
    title: "Select Images",
    // Enable/disable multiple select
    multiple: false,
    // Library wordpress query arguments.
    library: {
      order: "DESC",
      // [ 'name', 'author', 'date', 'title', 'modified', 'uploadedTo', 'id', 'post__in', 'menuOrder' ]
      orderby: "date",
      // mime type. e.g. 'image', 'image/jpeg'
      type: "image",
      // Searches the attachment title.
      search: null,
      // Includes media only uploaded to the specified post (ID)
      uploadedTo: null, // wp.media.view.settings.post.id (for current post ID)
    },
    button: {
      text: "Done",
    },
  });
  const handleWpUploader = () => {
    customMediaLibrary.open();
  };
  customMediaLibrary.on("open", function () {
    var selectedImageIDs = selected;
    var selectionAPI = customMediaLibrary.state().get("selection");
    var attachment = wp.media.attachment(selected?.id);
    selectionAPI.add(attachment ? [attachment] : []);
  });
  customMediaLibrary.on("select", function () {
    var selectedImage = customMediaLibrary
      .state()
      .get("selection")
      .first()
      .toJSON();
    setSelected(selectedImage);
    let items = [...props.data];
    let item = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      item = { ...swcopy[styleState] };
      item.backgroundImage = selectedImage?.url;
      item.backgroundSize = imgsize;
      item.backgroundPosition = imgpos;
      item.backgroundRepeat = imgrep;
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      item = { ...swcopy[styleState]};
      item.backgroundImage = selectedImage?.url;
      item.backgroundSize = imgsize;
      item.backgroundPosition = imgpos;
      item.backgroundRepeat = imgrep;
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      item = { ...deviceCopy[styleState] }
      item.backgroundImage = selectedImage?.url;
      item.backgroundSize = imgsize;
      item.backgroundPosition = imgpos;
      item.backgroundRepeat = imgrep;
      deviceCopy[styleState] = item
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  });

  const handleBgSize = (value) => {
    //setBgImageSize(value);
    let items = [...props.data];
    let item = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      item = { ...swcopy[styleState] };
      item.backgroundSize = value;
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      item = { ...swcopy[styleState]};
      item.backgroundSize = value;
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      item = { ...deviceCopy[styleState] }
      item.backgroundSize = value;
      deviceCopy[styleState] = item
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  };
  const handleBgPosition = (value) => {
    //setBgImagePosition(value);
    let items = [...props.data];
    let item = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      item = { ...swcopy[styleState] };
      item.backgroundPosition = value;
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      item = { ...swcopy[styleState]};
      item.backgroundPosition = value;
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][styleTab] = swcopy;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      item = { ...deviceCopy[styleState] }
      item.backgroundPosition = value;
      deviceCopy[styleState] = item
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  };
  const handleBgRepeat = (value) => {
    // setBgImageRepeat(value);
    //item["bgImageRepeat"] = value;
    let items = [...props.data];
    let item = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      item = { ...swcopy[styleState] };
      item.backgroundRepeat = value;
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      item = { ...swcopy[styleState]};
      item.backgroundRepeat = value;
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
        let swcopy = { ...ModuleStyle[styleTab] };
        let deviceCopy = { ...swcopy[device] }
        item = { ...deviceCopy[styleState] }
        item.backgroundRepeat = value;
        deviceCopy[styleState] = item
        swcopy[device]=deviceCopy
        items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  };
  const removeBgImage = () => {
    setSelected("");
    let items = [...props.data];
    let item = "";
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      item = { ...swcopy[styleState] };
      item.backgroundImage = "";
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      item = { ...swcopy[styleState]};
      item.backgroundImage = "";
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      item = { ...deviceCopy[styleState] }
      item.backgroundImage = "";
      deviceCopy[styleState] = item
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  };
  const resetPosition = () => {
    let items = [...props.data];
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      let item = { ...swcopy[styleState] };
      item.backgroundPosition = "top left";
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      let item = { ...swcopy[styleState]};
      item.backgroundPosition = "top left";
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      let item = { ...deviceCopy[styleState] }
      item.backgroundPosition = "top left";
      deviceCopy[styleState] = item
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  }
  const resetSize = () => {
    let items = [...props.data];
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      let item = { ...swcopy[styleState] };
      item.backgroundSize = "cover";
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      let item = { ...swcopy[styleState]};
      item.backgroundSize = "cover";
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      let item = { ...deviceCopy[styleState] }
      item.backgroundSize = "cover";
      deviceCopy[styleState] = item
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  }
  const resetImgRepeat = () => {
    let items = [...props.data];
    if (type == "row") {
      let RowStyle = props.data[rowindex].style;
      let swcopy = { ...RowStyle[device] };
      let item = { ...swcopy[styleState] };
      item.backgroundRepeat = "no-repeat";
      swcopy[styleState] = item
      items[rowindex]["style"][device] = swcopy;
    }
    if (type == "column") {
      let ColStyle = props.data[rowindex].data[columnindex].style;
      let swcopy = { ...ColStyle[device] };
      let item = { ...swcopy[styleState]};
      item.backgroundRepeat = "no-repeat";
      swcopy[styleState] = item
      items[rowindex].data[columnindex]["style"][device] = swcopy;
    }
    if (type == "module") {
      let ModuleStyle = props.data[rowindex].data[columnindex].data[moduleindex].style;
      let swcopy = { ...ModuleStyle[styleTab] };
      let deviceCopy = { ...swcopy[device] }
      let item = { ...deviceCopy[styleState] }
      item.backgroundRepeat = "no-repeat";
      deviceCopy[styleState] = item
      swcopy[device]=deviceCopy
      items[rowindex].data[columnindex].data[moduleindex]["style"][styleTab] = swcopy;
    }
    props.onChangeStyle(props.data);
  }
  
  return (
    <>
      <div class="caf-builder-setting-row-label">
        <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Configure background image source.">
          <label>Background Image</label>
        </Tooltip>
        {/* <div className="caf-manage-dropdown-labels">
          <label>Select Post Image</label>
          <Select
            className="caf-select-single-post caf-header-dropdown"
            options={[
              {
                value: '0',
                label: 'Select Post Image',
              },
              {
                value: props?.postData?.image,
                label: 'Post Image',
              }
            ]}
            defaultValue={postImg}
            onChange={handleItemClick}
            style={{ width: "200px" }}
            value={postImg}
          />
        </div> */}
        {/* {postImg == "0" && ( */}
          <div className="module-content-image-uploader">
            <div className="caf-image-container-mask" onClick={handleWpUploader}>
              {img && <img src={img} className="caf-bg-mask"></img>}
            </div>
            {img && (
              <>
                <div
                  className="close-circle-bg"
                  title="Remove Image"
                  onClick={removeBgImage}
                >
                  <CloseCircleFilled></CloseCircleFilled>
                </div>
              </>
            )}
          </div>
        {/* )} */}
      </div>
      {props.type === "background-image" && (
        <>
          <div class="caf-builder-setting-row-label">
            <label>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Adjust background image sizing.">
                Background Image Size
              </Tooltip>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
                <span onClick={resetSize}>Reset</span>
              </Tooltip>
            </label>
            <Select
              defaultValue="cover"
              style={{
                width: "100%",
              }}
              onChange={handleBgSize}
              value={imgsize}
              options={[
                {
                  value: "cover",
                  label: "Cover",
                },
                {
                  value: "contain",
                  label: "Fit",
                },
                {
                  value: "initial",
                  label: "Actual Size",
                },
                {
                  value: "100% 100%",
                  label: "Stretch to Fill",
                },
                //   {
                //     value: "custom-size",
                //     label: "Custom Size",
                //   },
              ]}
            />
          </div>
          <div class="caf-builder-setting-row-label">
            <label>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Adjust background image position.">
                Background Image Position
              </Tooltip>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
                <span onClick={resetPosition}>Reset</span>
              </Tooltip>
            </label>
            <Select
              defaultValue="top left"
              style={{
                width: "100%",
              }}
              onChange={handleBgPosition}
              value={imgpos}
              options={[
                {
                  value: "top left",
                  label: "Top Left",
                },
                {
                  value: "top center",
                  label: "Top Center",
                },
                {
                  value: "top right",
                  label: "Top Right",
                },
                {
                  value: "center left",
                  label: "Center Left",
                },
                {
                  value: "center",
                  label: "Center",
                },
                {
                  value: "center right",
                  label: "Center Right",
                },
                {
                  value: "bottom left",
                  label: "Bottom Left",
                },
                {
                  value: "bottom center",
                  label: "Bottom Center",
                },
                {
                  value: "bottom right",
                  label: "Bottom Right",
                },
              ]}
            />
          </div>
          <div class="caf-builder-setting-row-label">
            <label>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Control background image repeat behavior.">
                Background Image Repeat
              </Tooltip>
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
                <span onClick={resetImgRepeat}>Reset</span>
              </Tooltip>
            </label>
            <Select
              defaultValue="no-repeat"
              style={{
                width: "100%",
              }}
              onChange={handleBgRepeat}
              value={imgrep}
              options={[
                {
                  value: "no-repeat",
                  label: "No Repeat",
                },
                {
                  value: "repeat",
                  label: "Repeat",
                },
              ]}
            />
          </div>
        </>
      )}
    </>
  );
}

export default ContentImage;
