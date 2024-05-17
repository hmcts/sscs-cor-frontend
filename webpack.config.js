/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

const sourcePath = path.resolve(__dirname, 'app/client/javascript');
const govukFrontend = require(path.resolve(__dirname, 'webpack/govukFrontend'));
const scss = require(path.resolve(__dirname, 'webpack/scss'));
const HtmlWebpack = require(path.resolve(__dirname, 'webpack/htmlWebpack'));
const app = require(path.resolve(__dirname, 'webpack/app'));

const devMode = process.env.NODE_ENV !== 'production';
const fileNameSuffix = devMode ? '-dev' : '.[contenthash]';
const filename = `[name]${fileNameSuffix}.js`;

module.exports = {
  plugins: [
    ...govukFrontend.plugins,
    ...scss.plugins,
    //    ...HtmlWebpack.plugins,
    //    ...hmctsFrontend.plugins,
    //    ...app.plugins,
  ],
  entry: path.resolve(sourcePath, 'main.ts'),
  mode: devMode ? 'development' : 'production',
  module: {
    rules: [
      ...scss.rules,
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    publicPath: '',
    filename,
  },
};
