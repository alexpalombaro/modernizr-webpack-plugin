var ModernizrWebpackPlugin = require('./index');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  context: __dirname,
  entry: {
    'entry-bundle': './tests/entry.js'
  },
  output: {
    filename: '[name][hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ModernizrWebpackPlugin({
      filename: 'modernizr[hash]',
      noChunk:true
    })
  ]
};
