/*eslint-env node, mocha*/

const ModernizrWebpackPlugin = require('./index');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');
const fs = require('fs/promises');
const del = require('del');
const expect = require('chai').expect;

const OUTPUT_PATH = path.resolve(__dirname, 'temp');

const util = require('util');

const webpack = util.promisify(require('webpack'));
let webpackConfig;
const webpackConfigBase = {
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

  beforeEach(function () {
    // reset config to base status
    webpackConfig = Object.assign({}, webpackConfigBase);

    return del(OUTPUT_PATH);
  });

  it('should output a hashed filename', function () {
    const config = {filename: 'testing[hash]'};
    webpackConfig.plugins = [
      new HtmlWebpackPlugin(),
      new ModernizrWebpackPlugin(config)
    ];

    return webpack(webpackConfig).then(function (stats) {
        console.log('STATS HAS ERROR', stats.hasErrors());
        const info = stats.toJson();

        console.log('INFO ERRORS', info.errors);
      const hashDigestLength = stats.compilation.hash;
        console.log('HASH DIGEST LENGTH', hashDigestLength);

      return fs.readdir(OUTPUT_PATH).then(function (files) {
          console.log('FILES', files);
        const regexp = new RegExp('^testing' + hashDigestLength + '\\.js$');
        files = files.filter(function (file) {
          return regexp.test(file);
        });
        expect(files.length).to.equal(1);
      })
    });
  });

  it('should output a chunkhashed filename', function () {
    const config = {filename: 'testing[chunkhash]'};
    webpackConfig.plugins = [
      new HtmlWebpackPlugin(),
      new ModernizrWebpackPlugin(config)
    ];
    webpack(webpackConfig).then(function (stats) {
      const hashDigestLength = stats.compilation.outputOptions.hashDigestLength;

      return fs.readdir(OUTPUT_PATH).then(function (files) {
        const regexp = new RegExp('^testing[\\w\\d]{' + hashDigestLength + '}\\.js$');
        files = files.filter(function (file) {
          return regexp.test(file);
        });
        expect(files.length).to.equal(1);
      })
    });
  });

  it('should include public path with html-webpack-plugin', function () {
    webpackConfig.plugins = [
      new HtmlWebpackPlugin(),
      new ModernizrWebpackPlugin()
    ];
    webpackConfig.output.publicPath = 'public/';

    return webpack(webpackConfig).then(function () {
      return fs.readFile(path.resolve(OUTPUT_PATH, 'index.html'), 'utf8').then(function (data) {
          console.log('DATA', data);
        expect(/<script\ssrc="public\/modernizr-bundle.js">/.test(data)).to.be.true;
      });
    });
  });

  it('should output minified modernizr package', function () {
    webpackConfig.plugins = [
      new ModernizrWebpackPlugin({
        minify:true
      })
    ];

    return webpack(webpackConfig).then(function () {
      fs.readFile(path.resolve(OUTPUT_PATH, 'modernizr-bundle.js'), 'utf8').then(function (data) {
        expect(/\r|\n/.test(data)).to.be.false;
      });
    });
  })

});
