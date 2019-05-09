const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin'); // 清除 /dist 内的文件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 自动生成 index.html 

module.exports = {
  entry: {
    app: './src/index.js',
    // another: './src/another-module.js'
  },
  output: {
    filename: '[name].bundle.js', // [name] entry 文件名，[chunkhash] hash映射
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },

  plugins: [
  	new HtmlWebpackPlugin({
      title: 'Output Management'
    }),
		new CleanWebpackPlugin(['dist'])
  ]
};