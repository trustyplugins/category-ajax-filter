export function resolvePropertyForPreViewDesignTab({
    data,
    styleTab,
    device,
    styleState,
    property,
  }) {
    let propertyValue = "";  
    if (
      data?.[styleTab]?.["style"][device]?.[styleState]?.[property]
    ) {
      propertyValue =
        data?.[styleTab]?.["style"]?.[device]?.[styleState]?.[property];
    } else {
      if (device == "desktop") {
        if (styleState == "hover") {
          if (
            data?.[styleTab]?.["style"]?.[device]?.["default"]?.[property]
          ) {
            propertyValue =
              data?.[styleTab]?.["style"]?.[device]?.["default"]?.[property];
          }
        }
      }
  
      if (device == "tablet") {
        if (styleState == "default") {
          if (
            data?.[styleTab]?.["style"]?.["desktop"]?.["default"]?.[property]
          ) {
            propertyValue =
              data?.[styleTab]?.["style"]?.["desktop"]?.["default"]?.[property];
          }
        } else {
          if (
            data?.[styleTab]?.["style"]?.[device]?.["default"]?.[property]
          ) {
            propertyValue =
              data?.[styleTab]?.["style"]?.[device]?.["default"]?.[property];
          } else {
            if (
              data?.[styleTab]?.["style"]?.["desktop"]?.["hover"]?.[property]
            ) {
              propertyValue =
                data?.[styleTab]?.["style"]?.["desktop"]?.["hover"]?.[property];
            } else {
              if (
                data?.[styleTab]?.["style"]?.["desktop"]?.["default"]?.[property]
              ) {
                propertyValue =
                  data?.[styleTab]?.["style"]?.["desktop"]?.["default"]?.[property];
              }
            }
          }
        }
      }
  
      if (device == "mobile") {
        if (styleState == "default") {
          if (
            data?.[styleTab]?.["style"]?.["desktop"]?.["default"]?.[property]
          ) {
            propertyValue =
              data?.[styleTab]?.["style"]?.["desktop"]?.["default"]?.[property];
          }
        } else {
          if (
            data?.[styleTab]?.["style"]?.[device]?.["default"]?.[property]
          ) {
            propertyValue =
              data?.[styleTab]?.["style"]?.[device]?.["default"]?.[property];
          } else {
            if (
              data?.[styleTab]?.["style"]?.["desktop"]?.["hover"]?.[property]
            ) {
              propertyValue =
                data?.[styleTab]?.["style"]?.["desktop"]?.["hover"]?.[property];
            } else {
              if (
                data?.[styleTab]?.["style"]?.["desktop"]?.["default"]?.[property]
              ) {
                propertyValue =
                  data?.[styleTab]?.["style"]?.["desktop"]?.["default"]?.[property];
              }
            }
          }
        }
      }
    }
    return propertyValue;
}

export function resolvePropertyForPreViewMiscDesignTab({
    data,
    type,
    selectedTab,
    device,
    styleState,
    property,
  }) {
    let propertyValue = "";  
    if(type === "column"){
    if (
        data?.["style"][device]?.[styleState]?.[
         property
        ]
      ) {
        propertyValue =
          data["style"][device][styleState][property];
      } else {
        if (device == "desktop") {
          if (styleState == "hover") {
            if (
              data?.["style"]?.[device]?.["default"]?.[
               property
              ]
            ) {
              propertyValue =
                data["style"][device]["default"][
                 property
                ];
            }
          }
        }
        if (device == "tablet") {
          if (styleState == "default") {
            if (
              data?.["style"]?.["desktop"]?.["default"]?.[
               property
              ]
            ) {
              propertyValue =
                data["style"]["desktop"]["default"][
                 property
                ];
            }
          } else {
            if (
              data?.["style"]?.[device]?.["default"]?.[
               property
              ]
            ) {
              propertyValue =
                data["style"][device]["default"][
                 property
                ];
            } else {
              if (
                data?.["style"]?.["desktop"]?.["hover"]?.[
                 property
                ]
              ) {
                propertyValue =
                  data["style"]["desktop"]["hover"][
                   property
                  ];
              } else {
                if (
                  data?.["style"]?.["desktop"]?.[
                    "default"
                  ]?.[property]
                ) {
                  propertyValue =
                    data["style"]["desktop"]["default"][
                     property
                    ];
                }
              }
            }
          }
        }
        if (device == "mobile") {
          if (styleState == "default") {
            if (
              data?.["style"]?.["desktop"]?.["default"]?.[
               property
              ]
            ) {
              propertyValue =
                data["style"]["desktop"]["default"][
                 property
                ];
            }
          } else {
            if (
              data?.["style"]?.[device]?.["default"]?.[
               property
              ]
            ) {
              propertyValue =
                data["style"][device]["default"][
                 property
                ];
            } else {
              if (
                data?.["style"]?.["desktop"]?.["hover"]?.[
                 property
                ]
              ) {
                propertyValue =
                  data["style"]["desktop"]["hover"][
                   property
                  ];
              } else {
                if (
                  data?.["style"]?.["desktop"]?.[
                    "default"
                  ]?.[property]
                ) {
                  propertyValue =
                    data["style"]["desktop"]["default"][
                     property
                    ];
                }
              }
            }
          }
        }
      }
    }
    if(type === "item"){
        if (
            data?.["style"]?.[selectedTab][device]?.[styleState]?.[
             property
            ]
          ) {
            propertyValue =
              data["style"]?.[selectedTab][device][styleState][property];
          } else {
            if (device == "desktop") {
              if (styleState == "hover") {
                if (
                  data?.["style"]?.[selectedTab]?.[device]?.["default"]?.[
                   property
                  ]
                ) {
                  propertyValue =
                    data["style"]?.[selectedTab][device]["default"][
                     property
                    ];
                }
              }
            }
            if (device == "tablet") {
              if (styleState == "default") {
                if (
                  data?.["style"]?.[selectedTab]?.["desktop"]?.["default"]?.[
                   property
                  ]
                ) {
                  propertyValue =
                    data["style"]?.[selectedTab]["desktop"]["default"][
                     property
                    ];
                }
              } else {
                if (
                  data?.["style"]?.[selectedTab]?.[device]?.["default"]?.[
                   property
                  ]
                ) {
                  propertyValue =
                    data["style"]?.[selectedTab][device]["default"][
                     property
                    ];
                } else {
                  if (
                    data?.["style"]?.[selectedTab]?.["desktop"]?.["hover"]?.[
                     property
                    ]
                  ) {
                    propertyValue =
                      data["style"]?.[selectedTab]["desktop"]["hover"][
                       property
                      ];
                  } else {
                    if (
                      data?.["style"]?.[selectedTab]?.["desktop"]?.[
                        "default"
                      ]?.[property]
                    ) {
                      propertyValue =
                        data["style"]?.[selectedTab]["desktop"]["default"][
                         property
                        ];
                    }
                  }
                }
              }
            }
            if (device == "mobile") {
              if (styleState == "default") {
                if (
                  data?.["style"]?.[selectedTab]?.["desktop"]?.["default"]?.[
                   property
                  ]
                ) {
                  propertyValue =
                    data["style"]?.[selectedTab]["desktop"]["default"][
                     property
                    ];
                }
              } else {
                if (
                  data?.["style"]?.[selectedTab]?.[device]?.["default"]?.[
                   property
                  ]
                ) {
                  propertyValue =
                    data["style"]?.[selectedTab][device]["default"][
                     property
                    ];
                } else {
                  if (
                    data?.["style"]?.[selectedTab]?.["desktop"]?.["hover"]?.[
                     property
                    ]
                  ) {
                    propertyValue =
                      data["style"]?.[selectedTab]["desktop"]["hover"][
                       property
                      ];
                  } else {
                    if (
                      data?.["style"]?.[selectedTab]?.["desktop"]?.[
                        "default"
                      ]?.[property]
                    ) {
                      propertyValue =
                        data["style"]?.[selectedTab]["desktop"]["default"][
                         property
                        ];
                    }
                  }
                }
              }
            }
          }
    }
    return propertyValue;
}

  export { buildFlexAlignOptions } from "../../../../shared/designTabFlexAlignOptions";