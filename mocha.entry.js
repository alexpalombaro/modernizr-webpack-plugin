/*eslint-env node, mocha*/

var ModernizrWebpackPlugin = require('./index');

var expect = require('');

var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

var path = require('path');
var fs = require('fs');
var del = require('del');

var relative = path.relative(__dirname, webpackConfig.output.path);

function clearPluginConfig(config) {
  config.plugins = config.plugins.filter(function (plugin) {
    return !(plugin instanceof ModernizrWebpackPlugin)
  });

  return config;
}

describe('ModernizrWebpackPlugin testing suite', function () {

  beforeEach(function (done) {
    webpackConfig = clearPluginConfig(webpackConfig);
    del(relative).then(function () {
      done();
    });
  });

  var config;
  it('should output a hashed filename', function (done) {
    config = { filename: 'testing[hash]' };
    webpackConfig.plugins.push(new ModernizrWebpackPlugin(config));
    webpack(webpackConfig, function () {
      fs.readdir(relative, function (stats, files) {
        files = files.filter(function (file) {
          return /^testing/
        });
        expect()
        done();
      });
    })
  });

  it('should output a file with name and extension', function () {
  });

});