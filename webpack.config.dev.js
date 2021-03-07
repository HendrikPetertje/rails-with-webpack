const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./config/webpack/webpack.common.js');

 module.exports = merge(common, {
  mode: 'development',

  devServer: {
    open: true,
    host: 'localhost',
    port: 3035,
    open: false
  },

  output: {
    path: path.resolve(__dirname, 'tmp/frontend-dev'),
    filename: 'application.js'
  }
 });

