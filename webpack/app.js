/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const sass = path.resolve(__dirname, '../app/client/sass');
const images = path.resolve(__dirname, '../app/client/images');
const locale = path.resolve(__dirname, '../app/common/locale');

const copyImages = new CopyWebpackPlugin({
  patterns: [{ from: images, to: '../../dist/images/' }],
});

const copyLocales = new CopyWebpackPlugin({
  patterns: [{ from: locale, to: '../../dist/common/locale' }],
});

module.exports = {
  paths: { sass },
  plugins: [copyImages, copyLocales],
};
