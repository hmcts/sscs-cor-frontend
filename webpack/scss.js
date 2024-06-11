/* eslint @typescript-eslint/no-var-requires: "off" */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const devMode = process.env.NODE_ENV !== 'production'; // could need this with gov-frontend v5
// const fileNameSuffix = devMode ? '-dev' : '.[contenthash]';  // could need this with gov-frontend v5
// const filename = `[name]${fileNameSuffix}.css`;  // could need this with gov-frontend v5
const filename = `[name].css`;

const miniCss = new MiniCssExtractPlugin({
  // Options similar to the same options in webpackOptions.output
  // both options are optional
  filename,
  chunkFilename: '[id].css',
});

module.exports = {
  rules: [
    {
      test: /\.(sa|sc|c)ss$/,
      use: [
        'style-loader',
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            esModule: true,
          },
        },
        {
          loader: 'css-loader',
          options: {
            url: false,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              quietDeps: true,
            },
          },
        },
      ],
    },
  ],
  plugins: [miniCss],
};