const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

 module.exports = merge(common, {
  mode: 'production',

  devServer: {
     open: true,
     host: 'localhost',
  },

  output: {
    path: path.resolve(__dirname, 'public/frontend'),
    filename: 'application-[contenthash].js'
  }
 });

