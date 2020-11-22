const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const { createDefaultConfig } = require('@open-wc/building-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const argv = require('yargs').argv;
const isProduction = argv.mode === 'production';
const sourcemapMode = argv.sourcemap || false;

const defaultConfig = createDefaultConfig({
  input: path.resolve(__dirname, './index.html'),
  mode: argv.mode,
  plugins: {
    workbox: false,
  },
});

const appConfig = merge(defaultConfig, {
  devtool: sourcemapMode,
  stats: 'errors-only',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: isProduction ? '[name].[chunkhash].js' : 'app.js'
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.css'],
  },
  module: {
    rules: [
      {
        test: /(?<!\.d)\.ts?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(argv.mode),
    }),
    new FriendlyErrorsPlugin(),
    // copy custom static assets
    new CopyWebpackPlugin([
      'node_modules/@kor-ui/kor/*',
      'node_modules/@kor-ui/kor/fonts/*',
    ]),
  ],
  optimization: isProduction
    ? {
        splitChunks: {
          chunks: 'async',
          minSize: 30000,
          maxSize: 0,
          minChunks: 1,
          maxAsyncRequests: 6,
          maxInitialRequests: 4,
          automaticNameDelimiter: '~',
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
        minimize: true,
        minimizer: [
          new TerserPlugin({
            sourceMap: true,
            parallel: true,
            terserOptions: {
              output: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
      }
    : {
        usedExports: true,
      },
});

const cleanPluginIndex = appConfig.plugins.findIndex(
  ({ cleanOnceBeforeBuildPatterns }) =>
    `${cleanOnceBeforeBuildPatterns}` === '**/*'
);

if (!isProduction && cleanPluginIndex !== -1) {
  appConfig.plugins.splice(cleanPluginIndex, 1);
}

module.exports = [
  appConfig
];
