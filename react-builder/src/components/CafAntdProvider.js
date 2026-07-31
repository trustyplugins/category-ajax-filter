import React from "react";
import { ConfigProvider } from "antd";

/** App-wide Ant Design defaults (Select arrow styling is in index.css for `.caf-nevigation-dropdown` / `.caf-header-dropdown`). */
const CafAntdProvider = ({ children }) => (
  <ConfigProvider componentSize="middle">{children}</ConfigProvider>
);

export default CafAntdProvider;
