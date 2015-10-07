var ModernizrPlugin = require('./index');
var path = require('path');

module.exports = {
  context: __dirname,
  entry: {
    'entry-bundle': './client/entry.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel']
      }
    ]
  },
  plugins: [
    new ModernizrPlugin({
      'feature-detects': [
        'canvas'
      ]
    })
  ]
};
