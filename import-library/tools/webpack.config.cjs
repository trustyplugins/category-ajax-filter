const path = require("path");
const defaultConfig = require(
  path.join(__dirname, "../../react-builder/node_modules/@wordpress/scripts/config/webpack.config")
);

module.exports = {
  ...defaultConfig,
  entry: {
    "generate-templates": path.resolve(__dirname, "generate-templates-entry.js"),
  },
  output: {
    path: path.resolve(__dirname, ".build"),
    filename: "[name].js",
  },
  target: "node",
};
