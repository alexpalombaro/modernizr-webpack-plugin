var ModernizrPlugin = require('./index');
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
    new HtmlWebpackPlugin({
      template: 'template.html',
      hash: true
    }),
    new ModernizrPlugin({
      filename: 'modernizr[hash]',
      noChunk: true
    })
  ]
};
