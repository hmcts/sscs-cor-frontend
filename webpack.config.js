/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

const sourcePath = path.resolve(__dirname, 'app/client/javascript');
const govukFrontend = require(path.resolve(__dirname, 'webpack/govukFrontend'));
const scss = require(path.resolve(__dirname, 'webpack/scss'));
// const HtmlWebpack = require(path.resolve(__dirname, 'webpack/htmlWebpack'));
const app = require(path.resolve(__dirname, 'webpack/app'));

const devMode = process.env.NODE_ENV !== 'production';
// const fileNameSuffix = devMode ? '-dev' : '.[contenthash]'; // could need this with gov-frontend v5
// const filename = `[name]${fileNameSuffix}.js`; // could need this with gov-frontend v5
const filename = `[name].js`;

module.exports = {
  plugins: [
    ...govukFrontend.plugins,
    ...scss.plugins,
    // ...HtmlWebpack.plugins, // would need for gov-frontend v5?
    // ...hmctsFrontend.plugins, // nfdiv uses it to copy some extra images
    ...app.plugins,
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
    path: path.resolve(__dirname, 'public/js'),
    publicPath: '',
    filename,
  },
};