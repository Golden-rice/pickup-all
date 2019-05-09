const common = require('./webpack.common.js');
const merge = require('webpack-merge');

module.exports =  merge(common, {
	output: {
    filename: '[name].[chunkhash].js', // [name] entry 文件名，[chunkhash] hash映射
  },
  optimization: {
     splitChunks: { // 防止重复，公共的依赖模块提取到已有的入口 chunk 中，或者提取到一个新生成的 chunk（块，子父连接）
  //      chunks: 'all' // 指明所有模块均尝试分离
        cacheGroups: { // 对第三方库（vender libarary）进行缓存
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
     },
     runtimeChunk: 'single' // 缓存 chunk
  },
  mode: "production",
  devtool: 'source-map' // 此处不使用 inline-* eval-* 防止 bundle 内容增大
});