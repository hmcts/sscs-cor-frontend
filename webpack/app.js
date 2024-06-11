/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

// const root = path.resolve(__dirname, './');
const sass = path.resolve(__dirname, '../app/client/sass');
const images = path.resolve(__dirname, '../app/client/images'); // images are not copied in original....
const locale = path.resolve(__dirname, '../app/common/locale'); // webchat for nfdiv
// const pdfWorker = path.resolve(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.mjs');

const copyImages = new CopyWebpackPlugin({
  patterns: [{ from: images, to: '../../dist/images/' }],
});

const copyLocales = new CopyWebpackPlugin({
  patterns: [{ from: locale, to: '../../dist/common/locale' }],
});

//
// const copyPdfWorker = new CopyWebpackPlugin({
//  patterns: [{ from: pdfWorker, to: 'assets/pdf' }],
// });

module.exports = {
  paths: { sass },
  plugins: [copyImages, copyLocales], // copyPdfWorker taken out copyLocales
};