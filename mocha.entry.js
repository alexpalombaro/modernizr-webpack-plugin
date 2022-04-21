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
    this.timeout(5000);

    // reset config to base status
    webpackConfig = assign({}, webpackConfigBase);
    del(OUTPUT_PATH).then(function () {
      done();
    });
  });

  it('should output a hashed filename', function (done) {
    this.timeout(10000);

    var config = {filename: 'testing[hash]'};
    webpackConfig.plugins = [
      new HtmlWebpackPlugin(),
      new ModernizrWebpackPlugin(config)
    ];
    webpack(webpackConfig).then(function (stats) {
      var hashDigestLength = stats.compilation.hash;
      return fs.readdirAsync(OUTPUT_PATH).then(function (files) {
        var regexp = new RegExp('^testing' + hashDigestLength + '\\.js$');
        files = files.filter(function (file) {
          return regexp.test(file);
        });
        expect(files.length).to.equal(1);
        done();
      })
    }).catch(done);
  });

  it('should output a chunkhashed filename', function (done) {
    var config = {filename: 'testing[chunkhash]'};
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
    webpack(webpackConfig).then(function () {
      fs.readFileAsync(path.resolve(OUTPUT_PATH, 'index.html'), 'utf8').then(function (data) {
        expect(/<script(.*)src="public\/entry-bundle.js">/.test(data)).to.be.true;
        done();
      }).catch(function (error) { });
    }).catch(done);
  });

  it('should output minified modernizr package', function (done) {
    webpackConfig.plugins = [
      new ModernizrWebpackPlugin({
        minify:true
      })
    ];
    webpack(webpackConfig).then(function () {
      fs.readFileAsync(path.resolve(OUTPUT_PATH, 'modernizr-bundle.js'), 'utf8').then(function (data) {
        expect(/\r|\n/.test(data)).to.be.false;
        done();
      });
    }).catch(done)
  })

});
