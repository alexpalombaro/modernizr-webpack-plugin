var Config = require('karma/lib/config').Config;
var Server = require('karma').Server;

var ModernizrWebpackPlugin = require('./index');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var createConfig = require('./karma.conf');
var karmaConfig = createConfig(new Config());

var path = require('path');
var del = require('del');

var OUTPUT_PATH = path.resolve(__dirname, 'temp');

del(OUTPUT_PATH);

var webpack = require('webpack');
var webpackConfig = {
  context: __dirname,
  entry: {
    'entry-bundle': './tests/entry.js'
  },
  output: {
    filename: '[name].js',
    path: OUTPUT_PATH
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ModernizrWebpackPlugin({
      'feature-detects': require('./tests/feature-detects')
    })
  ]
};

function executeTestingServer(source) {
  var config = Object.assign({}, karmaConfig);
  config.files.push(source);
  var server = new Server(config);
  server.start();
}

webpack(webpackConfig, function (err) {
  if (err) {
    console.error(err);
    process.exit(0);
  }

  executeTestingServer(path.resolve(OUTPUT_PATH, 'modernizr-bundle.js'));
});
