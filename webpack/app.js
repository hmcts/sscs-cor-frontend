/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const root = path.resolve(__dirname, './../');
const sass = path.resolve(root, './app/client/scss');
const images = path.resolve(root, './app/client/images');
// const locale = path.resolve(root, './app/common/locale'); //webchat for nfdiv
// const pdfWorker = path.resolve(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.mjs');

const copyImages = new CopyWebpackPlugin({
  patterns: [{ from: images, to: '../dist/images' }],
});

// const copyLocales = new CopyWebpackPlugin({
//  patterns: [{ from: locale, to: '../dist/locale' }],
// });

//
// const copyPdfWorker = new CopyWebpackPlugin({
//  patterns: [{ from: pdfWorker, to: 'assets/pdf' }],
// });

module.exports = {
  paths: { root, sass },
  plugins: [copyImages], // copyPdfWorker taken out copyLocales
};
