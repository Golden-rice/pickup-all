const common = require('./webpack.common.js');
const merge = require('webpack-merge');
const webpack = require('webpack');

module.exports =  merge(common, {
  devtool: 'inline-source-map', 
  devServer: {
    contentBase: './dist',
    hot: true
  },
  mode: "development",
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});