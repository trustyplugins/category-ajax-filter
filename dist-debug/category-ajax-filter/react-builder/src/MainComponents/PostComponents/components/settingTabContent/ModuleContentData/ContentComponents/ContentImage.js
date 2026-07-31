import React, { useEffect, useState, useMemo } from "react";
import { Select, Input, Switch, Tooltip ,Button} from "antd";
import { CloseCircleFilled ,DeleteOutlined} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { clonePostLayoutData } from "../postLayoutSnapshot";

function ContentImage(props) {
  const builderPostData = props.postPreviewData || {};
  const { type, rowindex, columnindex, moduleindex, module } = props.indexes;
  const {
    property,
    label,
    defaultSuffix,
    extraClass = "",
    styleState = "default",
    deviceSwitch,
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
                img = RowStyle["desktop"]["default"]["backgroundImage"];
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
                img = RowStyle["desktop"]["default"]["backgroundImage"];
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
                imgsize = RowStyle["desktop"]["default"]["backgroundSize"];
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
                imgsize = RowStyle["desktop"]["default"]["backgroundSize"];
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
                imgpos = RowStyle["desktop"]["default"]["backgroundPosition"];
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
                imgpos = RowStyle["desktop"]["default"]["backgroundPosition"];
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
                imgrep = RowStyle["desktop"]["default"]["backgroundRepeat"];
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
                imgrep = RowStyle["desktop"]["default"]["backgroundRepeat"];
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
                img = ColStyle["desktop"]["default"]["backgroundImage"];
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
                img = ColStyle["desktop"]["default"]["backgroundImage"];
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
                imgsize = ColStyle["desktop"]["default"]["backgroundSize"];
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
                imgsize = ColStyle["desktop"]["default"]["backgroundSize"];
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
                imgpos = ColStyle["desktop"]["default"]["backgroundPosition"];
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
                imgpos = ColStyle["desktop"]["default"]["backgroundPosition"];
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
                imgrep = ColStyle["desktop"]["default"]["backgroundRepeat"];
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
                imgrep = ColStyle["desktop"]["default"]["backgroundRepeat"];
              }
            }
          }
        }
      }
    }
  }
  if (type == "module") {
    let ModuleStyle =
      props.data[rowindex].data[columnindex].data[moduleindex].style;
    if (ModuleStyle[device][styleState]?.["backgroundImage"]) {
      img = ModuleStyle[device][styleState]["backgroundImage"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[device]["default"]?.["backgroundImage"]) {
            img = ModuleStyle[device]["default"]["backgroundImage"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle["desktop"]["default"]?.["backgroundImage"]) {
            img = ModuleStyle["desktop"]["default"]["backgroundImage"];
          }
        } else {
          if (ModuleStyle[device]["default"]?.["backgroundImage"]) {
            img = ModuleStyle[device]["default"]["backgroundImage"];
          } else {
            if (ModuleStyle["desktop"]["hover"]?.["backgroundImage"]) {
              img = ModuleStyle["desktop"]["hover"]["backgroundImage"];
            } else {
              if (ModuleStyle["desktop"]["default"]?.["backgroundImage"]) {
                img = ModuleStyle["desktop"]["default"]["backgroundImage"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle["desktop"]["default"]?.["backgroundImage"]) {
            img = ModuleStyle["desktop"]["default"]["backgroundImage"];
          }
        } else {
          if (ModuleStyle[device]["default"]?.["backgroundImage"]) {
            img = ModuleStyle[device]["default"]["backgroundImage"];
          } else {
            if (ModuleStyle["desktop"]["hover"]?.["backgroundImage"]) {
              img = ModuleStyle["desktop"]["hover"]["backgroundImage"];
            } else {
              if (ModuleStyle["desktop"]["default"]?.["backgroundImage"]) {
                img = ModuleStyle["desktop"]["default"]["backgroundImage"];
              }
            }
          }
        }
      }
    }

    if (ModuleStyle[device][styleState]?.["backgroundSize"]) {
      imgsize = ModuleStyle[device][styleState]["backgroundSize"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[device]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle[device]["default"]["backgroundSize"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle["desktop"]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle["desktop"]["default"]["backgroundSize"];
          }
        } else {
          if (ModuleStyle[device]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle[device]["default"]["backgroundSize"];
          } else {
            if (ModuleStyle["desktop"]["hover"]?.["backgroundSize"]) {
              imgsize = ModuleStyle["desktop"]["hover"]["backgroundSize"];
            } else {
              if (ModuleStyle["desktop"]["default"]?.["backgroundSize"]) {
                imgsize = ModuleStyle["desktop"]["default"]["backgroundSize"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle["desktop"]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle["desktop"]["default"]["backgroundSize"];
          }
        } else {
          if (ModuleStyle[device]["default"]?.["backgroundSize"]) {
            imgsize = ModuleStyle[device]["default"]["backgroundSize"];
          } else {
            if (ModuleStyle["desktop"]["hover"]?.["backgroundSize"]) {
              imgsize = ModuleStyle["desktop"]["hover"]["backgroundSize"];
            } else {
              if (ModuleStyle["desktop"]["default"]?.["backgroundSize"]) {
                imgsize = ModuleStyle["desktop"]["default"]["backgroundSize"];
              }
            }
          }
        }
      }
    }

    if (ModuleStyle[device][styleState]?.["backgroundPosition"]) {
      imgpos = ModuleStyle[device][styleState]["backgroundPosition"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[device]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle[device]["default"]["backgroundPosition"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle["desktop"]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle["desktop"]["default"]["backgroundPosition"];
          }
        } else {
          if (ModuleStyle[device]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle[device]["default"]["backgroundPosition"];
          } else {
            if (ModuleStyle["desktop"]["hover"]?.["backgroundPosition"]) {
              imgpos = ModuleStyle["desktop"]["hover"]["backgroundPosition"];
            } else {
              if (ModuleStyle["desktop"]["default"]?.["backgroundPosition"]) {
                imgpos =
                  ModuleStyle["desktop"]["default"]["backgroundPosition"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle["desktop"]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle["desktop"]["default"]["backgroundPosition"];
          }
        } else {
          if (ModuleStyle[device]["default"]?.["backgroundPosition"]) {
            imgpos = ModuleStyle[device]["default"]["backgroundPosition"];
          } else {
            if (ModuleStyle["desktop"]["hover"]?.["backgroundPosition"]) {
              imgpos = ModuleStyle["desktop"]["hover"]["backgroundPosition"];
            } else {
              if (ModuleStyle["desktop"]["default"]?.["backgroundPosition"]) {
                imgpos =
                  ModuleStyle["desktop"]["default"]["backgroundPosition"];
              }
            }
          }
        }
      }
    }

    if (ModuleStyle[device][styleState]?.["backgroundRepeat"]) {
      imgrep = ModuleStyle[device][styleState]["backgroundRepeat"];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (ModuleStyle[device]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle[device]["default"]["backgroundRepeat"];
          }
        }
      }
      if (device == "tablet") {
        if (styleState == "default") {
          if (ModuleStyle["desktop"]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle["desktop"]["default"]["backgroundRepeat"];
          }
        } else {
          if (ModuleStyle[device]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle[device]["default"]["backgroundRepeat"];
          } else {
            if (ModuleStyle["desktop"]["hover"]?.["backgroundRepeat"]) {
              imgrep = ModuleStyle["desktop"]["hover"]["backgroundRepeat"];
            } else {
              if (ModuleStyle["desktop"]["default"]?.["backgroundRepeat"]) {
                imgrep = ModuleStyle["desktop"]["default"]["backgroundRepeat"];
              }
            }
          }
        }
      }
      if (device == "mobile") {
        if (styleState == "default") {
          if (ModuleStyle["desktop"]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle["desktop"]["default"]["backgroundRepeat"];
          }
        } else {
          if (ModuleStyle[device]["default"]?.["backgroundRepeat"]) {
            imgrep = ModuleStyle[device]["default"]["backgroundRepeat"];
          } else {
            if (ModuleStyle["desktop"]["hover"]?.["backgroundRepeat"]) {
              imgrep = ModuleStyle["desktop"]["hover"]["backgroundRepeat"];
            } else {
              if (ModuleStyle["desktop"]["default"]?.["backgroundRepeat"]) {
                imgrep = ModuleStyle["desktop"]["default"]["backgroundRepeat"];
              }
            }
          }
        }
      }
    }
  }
  const [postImg, setPostImg] = useState(img ? img : "0");
  const [selected, setSelected] = useState(img);
  const [imgUrl, setImgUrl] = useState(builderPostData?.image);

  useEffect(() => {
    setImgUrl(builderPostData?.image);
  }, [builderPostData]);

  useEffect(() => {
    if (type == "row") {
      if (props.data[rowindex].settings?.background_image == "") {
        setPostImg("0");
      } else {
        setImgUrl(img);
      }
    }

    if (type == "column") {
      if (
        props.data[rowindex].data[columnindex].settings?.background_image == ""
      ) {
        setPostImg("0");
      } else {
        setImgUrl(img);
      }
    }

    if (type == "module") {
      if (module.settings?.background_image == "") {
        setPostImg("0");
      } else {
        setImgUrl(img);
      }
    }
  }, [img]);

  const applyBackgroundUpdate = ({ stylePatch = {}, settingsBackgroundImage }) => {
    const next = clonePostLayoutData(props.data);
    let styleTarget = null;
    let settingsTarget = null;
    if (type == "row") {
      styleTarget = next?.[rowindex]?.style?.[device]?.[styleState];
      settingsTarget = next?.[rowindex]?.settings;
    }
    if (type == "column") {
      styleTarget = next?.[rowindex]?.data?.[columnindex]?.style?.[device]?.[styleState];
      settingsTarget = next?.[rowindex]?.data?.[columnindex]?.settings;
    }
    if (type == "module") {
      styleTarget =
        next?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.style?.[device]?.[styleState];
      settingsTarget =
        next?.[rowindex]?.data?.[columnindex]?.data?.[moduleindex]?.settings;
    }
    if (!styleTarget) return;
    Object.assign(styleTarget, stylePatch);
    if (
      settingsTarget &&
      Object.prototype.hasOwnProperty.call(
        { settingsBackgroundImage },
        "settingsBackgroundImage"
      ) &&
      settingsBackgroundImage !== undefined
    ) {
      settingsTarget.background_image = settingsBackgroundImage;
    }
    props.onChangeStyle(next);
  };

  var customMediaLibrary = window.wp.media({
    frame: "select",
    title: "Select Images",
    multiple: false,
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
    applyBackgroundUpdate({
      stylePatch: {
        backgroundImage: selectedImage?.url,
        backgroundSize: imgsize,
        backgroundPosition: imgpos,
        backgroundRepeat: imgrep,
      },
    });
  });

  const selectedOptions = [
    {
      value: "0",
      label: "Select Post Image",
    },
    {
      value: imgUrl,
      label: "Post Image",
    },
  ];
  const handleBgSize = (value) => {
    applyBackgroundUpdate({ stylePatch: { backgroundSize: value } });
  };
  const handleBgPosition = (value) => {
    applyBackgroundUpdate({ stylePatch: { backgroundPosition: value } });
  };
  const handleBgRepeat = (value) => {
    applyBackgroundUpdate({ stylePatch: { backgroundRepeat: value } });
  };
  const removeBgImage = () => {
    setSelected("");
    applyBackgroundUpdate({ stylePatch: { backgroundImage: "''" } });
    setPostImg("0");
  };
  const resetPosition = () => {
    applyBackgroundUpdate({ stylePatch: { backgroundPosition: "top left" } });
  };
  const resetSize = () => {
    applyBackgroundUpdate({ stylePatch: { backgroundSize: "cover" } });
  };
  const resetImgRepeat = () => {
    applyBackgroundUpdate({ stylePatch: { backgroundRepeat: "no-repeat" } });
  };

  // const filteredSelectedOptions = useMemo(() => {
  //   //console.log(styleState)
  //   if(postImg !="0"){
  //   return selectedOptions.find((option) => option.value != "0" )?.label === "Post Image" &&
  //     styleState === "hover"
  //     ? selectedOptions.filter((option) => option.label !== "Select Post Image")
  //     : selectedOptions;
  //   }
  // }, [postImg, styleState, selectedOptions]);

  const filteredSelectedOptions = useMemo(() => {
    if (postImg !== "0") {
      return selectedOptions.some((option) => option.label === "Post Image") &&
        styleState === "hover"
        ? selectedOptions.filter(
            (option) => option.label !== "Select Post Image"
          )
        : selectedOptions;
    }
    return selectedOptions; // Ensure function always returns something
  }, [postImg, styleState, selectedOptions]);

  const handleItemClick = (value) => {
    // const selected = selectedOptions.find((option) => option.value === value);
    // if (selected.label === "Post Image" && styleState == "hover") {
    //   setIsDisabled('0');
    //   console.log('enter')
    //   return;
    // }
    setPostImg(value);
    if (value != "0") {
      applyBackgroundUpdate({
        stylePatch: {
          backgroundImage: value,
          backgroundSize: imgsize,
          backgroundPosition: imgpos,
          backgroundRepeat: imgrep,
        },
        settingsBackgroundImage: "post-img",
      });
    } else {
      applyBackgroundUpdate({
        stylePatch: { backgroundImage: "" },
        settingsBackgroundImage: "",
      });
    }
  };

  return (
    <>
      <div className="caf-builder-setting-row-label">
        {/* <label>Background Image</label>
        <div className="caf-manage-dropdown-labels">
          <label>Select Post Image</label>
          <Select
            className="caf-select-single-post caf-header-dropdown"
            options={[...filteredSelectedOptions]}
            defaultValue={postImg}
            onChange={handleItemClick}
            style={{ width: "200px" }}
            value={postImg}
          />
        </div> */}
        {/* {postImg == "0" && (

          <div className="module-content-image-uploader">
            <div
              className="caf-image-container-mask"
              onClick={handleWpUploader}
            >

              {img && img!="''" && <img src={img} className="caf-bg-mask"></img>}
            </div>
            {img && img!="''" && (
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
          </div> */}
          {props.bgType === "image" && (
            <>
            <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Configure background image source.">
              <label>Background Image</label>
            </Tooltip>
          <div className="caf-icon-container image-module-uploader-widget">
            <div className="icon-container-wrapper">
              <div className="icon-wrapper-fa">
                {img && img!="''" && <img src={img} className="caf-bg-mask" alt=""></img>}
              </div>
            </div>
            <div className="icon-container-header">
              {img && img!="''" && (
                <Button
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={removeBgImage}
                />
              )}
            </div>
            <div className="icon-container-footer">
              <button className="ic-lib" onClick={handleWpUploader}>
                Upload Image
              </button>
            </div>
          </div>
          </>
          )}
          
        {/* )} */}
      </div>
      {/* {props.type === "background-image" && ( */}
        <>
          <div className="caf-builder-setting-row-label">
            <label>
              Background Image Size
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
                <span onClick={resetSize}>
                  <FontAwesomeIcon icon={faArrowRotateLeft} />
                </span>
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
          <div className="caf-builder-setting-row-label">
            <label>
              Background Image Position
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
                <span onClick={resetPosition}>
                  <FontAwesomeIcon icon={faArrowRotateLeft} />
                </span>
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
          <div className="caf-builder-setting-row-label">
            <label>
              Background Image Repeat
              <Tooltip classNames={{ root: "caf-builder-tooltip" }} placement="topLeft" title="Reset">
                <span onClick={resetImgRepeat}>
                  <FontAwesomeIcon icon={faArrowRotateLeft} />
                </span>
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
      {/* )} */}
    </>
  );
}

export default ContentImage;
