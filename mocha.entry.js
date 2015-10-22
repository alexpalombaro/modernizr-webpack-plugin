/*eslint-env node, mocha*/

var ModernizrWebpackPlugin = require('./index');

var Promise = require('bluebird');

var webpack = Promise.promisify(require('webpack'));
var webpackConfig = clearPluginConfig(require('./webpack.config'));

var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var del = require('del');
var expect = require('chai').expect;

var relative = path.relative(__dirname, webpackConfig.output.path);

function clearPluginConfig(config) {
  config.plugins = config.plugins.filter(function (plugin) {
    return !(plugin instanceof ModernizrWebpackPlugin)
  });

  return config;
}

describe('[ModernizrWebpackPlugin] Build Tests', function () {

  beforeEach(function (done) {
    webpackConfig = Object.assign({}, webpackConfig);
    del(relative).then(function () {
      done();
    });
  });

  var config;
  it('should output a hashed filename', function (done) {
    config = {filename: 'testing[hash]'};
    webpackConfig.plugins.push(new ModernizrWebpackPlugin(config));
    webpack(webpackConfig).then(function (stats) {
      var hashDigestLength = stats.compilation.outputOptions.hashDigestLength;
      return fs.readdirAsync(relative).then(function (files) {
        var regexp = new RegExp('^testing[\\w\\d]{' + hashDigestLength + '}\\.js$');
        files = files.filter(function (file) {
          return regexp.test(file);
        });
        expect(files.length).to.equal(1);
        done();
      })
    }).catch(done);
  });

  it('should output modernizr to the webpack public path', function (done) {
    webpackConfig.output.publicPath = 'public/';
    webpackConfig.plugins.push(new ModernizrWebpackPlugin());
    webpack(webpackConfig).then(function (stats) {
      console.log(stats);
      done();
    }).catch(done);
  });

});