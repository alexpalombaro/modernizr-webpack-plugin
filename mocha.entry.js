/*eslint-env node, mocha*/

var ModernizrWebpackPlugin = require('./index');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var Promise = require('bluebird');
var assign = require('object-assign');

var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var del = require('del');
var expect = require('chai').expect;

var OUTPUT_PATH = path.resolve(__dirname, 'temp');

var webpack = Promise.promisify(require('webpack'));
var webpackConfig;
var webpackConfigBase = {
  context: __dirname,
  entry: {
    'entry-bundle': './tests/entry.js'
  },
  output: {
    filename: '[name].js',
    path: OUTPUT_PATH
  }
};


describe('[ModernizrWebpackPlugin] Build Tests', function () {

  beforeEach(function (done) {
    // reset config to base status
    webpackConfig = assign({}, webpackConfigBase);
    del(OUTPUT_PATH).then(function () {
      done();
    });
  });

  it('should output a hashed filename', function (done) {
    var config = {filename: 'testing[hash]'};
    webpackConfig.plugins = [
      new HtmlWebpackPlugin(),
      new ModernizrWebpackPlugin(config)
    ];
    webpack(webpackConfig).then(function (stats) {
      var hashDigestLength = stats.compilation.outputOptions.hashDigestLength;
      return fs.readdirAsync(OUTPUT_PATH).then(function (files) {
        var regexp = new RegExp('^testing[\\w\\d]{' + hashDigestLength + '}\\.js$');
        files = files.filter(function (file) {
          return regexp.test(file);
        });
        expect(files.length).to.equal(1);
        done();
      })
    }).catch(done);
  });

  it('should include public path with html-webpack-plugin', function (done) {
    webpackConfig.plugins = [
      new HtmlWebpackPlugin(),
      new ModernizrWebpackPlugin()
    ];
    webpackConfig.output.publicPath = 'public/';
    webpackConfig.plugins.push(new ModernizrWebpackPlugin());
    webpack(webpackConfig).then(function () {
      fs.readFileAsync(path.resolve(OUTPUT_PATH, 'index.html'), 'utf8').then(function (data) {
        expect(/<script\ssrc="public\/modernizr-bundle.js">/.test(data)).to.be.true;
        done();
      })
    }).catch(done);
  });

});