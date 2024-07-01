/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const packageJson = require.resolve('govuk-frontend');
const root = path.resolve(packageJson, '..');
const sass = path.resolve(root, 'all.scss');
const javascript = path.resolve(root, 'all.js');
const components = path.resolve(root, 'components');
const assets = path.resolve(root, 'assets');
const images = path.resolve(assets, 'images');
const fonts = path.resolve(assets, 'fonts');

const copyGovukTemplateAssets = new CopyWebpackPlugin({
  patterns: [
    { from: images, to: '../../dist/images' },
    { from: fonts, to: '../../dist/fonts' },
  ],
});

module.exports = {
  paths: { template: root, components, sass, javascript, assets },
  plugins: [copyGovukTemplateAssets],
};
