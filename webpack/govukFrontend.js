/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const packageJson = path.resolve(
  __dirname,
  '../node_modules/govuk-frontend/package.json'
); // differs from template
const root = path.resolve(packageJson, '..', 'govuk'); // diff diff taken out
const sass = path.resolve(root, 'all.scss');
const javascript = path.resolve(root, 'all.js');
const components = path.resolve(root, 'components');
const assets = path.resolve(root, 'assets');
const images = path.resolve(assets, 'images');
const fonts = path.resolve(assets, 'fonts');

const copyGovukTemplateAssets = new CopyWebpackPlugin({
  patterns: [
    { from: images, to: '../dist/images' },
    { from: fonts, to: '../dist/fonts' },
    //    { from: `${assets}/manifest.json`, to: '../dist/manifest.json' },
    //    { from: `${root}/template.njk`, to: '../views' },
    //    { from: `${root}/components`, to: '../views/components' },
  ],
});

module.exports = {
  paths: { template: root, components, sass, javascript, assets },
  plugins: [copyGovukTemplateAssets],
};
