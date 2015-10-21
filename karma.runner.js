var Config = require('karma/lib/config').Config;
var Server = require('karma').Server;
var ModernizrWebpackPlugin = require('./index');

var createConfig = require('./karma.conf');
var karmaConfig = createConfig(new Config());

var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

var path = require('path');

var OUTPUT_JS = 'modernizr-bundle.js';

function _executeTestingServer(source) {
  var config = Object.assign({}, karmaConfig);
  config.files.push(source);
  var server = new Server(config);
  server.start();
}

webpackConfig.plugins = webpackConfig.plugins.filter(function (plugin) {
  return !(plugin instanceof ModernizrWebpackPlugin)
});

webpackConfig.plugins.push(new ModernizrWebpackPlugin({
  'filename': OUTPUT_JS,
  'feature-detects': require('./tests/feature-detects')
}));

var compiler = webpack(webpackConfig, function (err, stats) {
  if (err) {
    console.error(err);
    process.exit(0);
  }

  _executeTestingServer(path.resolve(stats.compilation.compiler.outputPath, OUTPUT_JS));
});
