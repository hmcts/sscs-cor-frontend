const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');

const config = {
  target: 'web',
  entry: [path.resolve('app/client/javascript/main.ts')],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    path: path.resolve('public/js'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }

  if (argv.mode === 'production') {
    config.performance = { hints: false };
    config.optimization = {
      minimizer: [new TerserJSPlugin()],
    };
  }

  return config;
};
