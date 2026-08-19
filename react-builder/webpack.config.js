const path = require('path');
const defaults = require('@wordpress/scripts/config/webpack.config');
const webpack = require('webpack');
const { getFreeBuildReplacements } = require('./scripts/free-build-replacements');

const isFreeBuild = process.env.CAF_BUILD_FREE === '1';
const isDebugBuild = process.env.CAF_DEBUG_BUILD === '1';
const outputDir = isFreeBuild ? 'build-free' : 'build';

module.exports = {
  ...defaults,
  // Debug packages: readable stacks + .map files (do not use for customer releases).
  ...(isDebugBuild
    ? {
        mode: 'development',
        devtool: 'source-map',
        optimization: {
          ...(defaults.optimization || {}),
          minimize: false,
        },
      }
    : {}),
  output: {
    ...defaults.output,
    path: path.resolve(__dirname, outputDir),
  },
  cache: false,
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  plugins: [
    ...(defaults.plugins || []),
    new webpack.DefinePlugin({
      'process.env.CAF_BUILD_FREE': JSON.stringify(isFreeBuild ? '1' : '0'),
    }),
    ...(isFreeBuild
      ? getFreeBuildReplacements().map(
          ({ resourceRegExp, newResource }) =>
            new webpack.NormalModuleReplacementPlugin(resourceRegExp, newResource)
        )
      : []),
  ],
};
