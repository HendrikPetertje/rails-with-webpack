const path = require('path');
const webpack = require('webpack');

const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './app/webpack/index.ts',

  plugins: [new webpack.ProgressPlugin(), new WorkboxWebpackPlugin.GenerateSW({
          swDest: 'sw.js',
          clientsClaim: true,
          skipWaiting: false,
        })],

  module: {
    rules: [{
      test: /\.(ts|tsx)$/,
      loader: 'ts-loader',
      include: [path.resolve(__dirname, 'app/webpack')],
      exclude: [/node_modules/]
    }, {
      test: /.(sa|sc|c)ss$/,

      use: [{
        loader: "style-loader"
      }, {
        loader: "css-loader",

        options: {
          sourceMap: true
        }
      }, {
        loader: "sass-loader",

        options: {
          sourceMap: true
        }
      }]
    }]
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', 'css', 'scss']
  },
}
