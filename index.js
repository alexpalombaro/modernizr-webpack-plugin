/* eslint-disable no-process-env */
var CachedSource = require('webpack-core/lib/CachedSource');
var ConcatSource = require('webpack-core/lib/ConcatSource');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var uglifyJs = require('uglify-js');
var build = require('modernizr').build;
var assign = require('object-assign');

process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();

/**
 * es5 class
 * @param {Object} [options] Refer to Modernizr for available options
 * @param {string} [options.filename=modernizr-bundle.js] The output file name including extension
 * @param {boolean} [options.htmlWebPackPluginIntegration=true] Integrate into html-webpack-plugin if begin used
 * @param {boolean} [options.minify] Defaults to NODE_ENV
 * @constructor
 */
function ModernizrPlugin(options) {
  if (options && options.filename && !options.filename.match(/\.js$/)) {
    options.filename = options.filename + '.js';
  }

  this.options = assign({}, {
    filename: 'modernizr-bundle.js',
    htmlWebPackPluginIntegration: true,
    minify: !(process.env.NODE_ENV === 'development')
  }, options);
}

ModernizrPlugin.prototype._htmlWebpackPluginInject = function (plugin, filename, hash, filesize) {
  var htmlWebPackPluginAssets = plugin.htmlWebpackPluginAssets;
  var oFilename = plugin.options.hash ? plugin.appendHash(filename, hash || '') : filename;
  plugin.htmlWebpackPluginAssets = function () {
    var result = htmlWebPackPluginAssets.apply(plugin, arguments);
    var chunk = {};
    chunk[filename] = {
      entry: oFilename,
      css: [],
      size: filesize || 0
    };
    // get html-webpack-plugin to output modernizr chunk first
    result.chunks = assign({}, chunk, result.chunks);
    return result;
  };
};

ModernizrPlugin.prototype._minifySource = function (source, options) {
  var uglifyOptions = Object.assign({}, options, {fromString: true});
  return uglifyJs.minify(source, uglifyOptions).code;
};

ModernizrPlugin.prototype.apply = function (compiler) {
  var self = this;

  compiler.plugin('after-compile', function (compilation, cb) {
    build(self.options, function (output) {
      if (self.options.minify) {
        output = self._minifySource(output, self.options.minify);
      }
      self.modernizrOutput = output;
      var stats = compilation.getStats().toJson();
      if (self.options.htmlWebPackPluginIntegration) {
        compiler.options.plugins.forEach(function (plugin) {
          if (plugin instanceof HtmlWebpackPlugin) {
            self._htmlWebpackPluginInject(plugin, self.options.filename,
              stats.hash, self.modernizrOutput.length)
          }
        })
      }
      cb();
    })
  });

  compiler.plugin('emit', function (compilation, cb) {
    var source = new ConcatSource();

    source.add(self.modernizrOutput);

    var filename = self.options.filename;
    compilation.assets[filename] = new CachedSource(source);

    cb();
  })
};

module.exports = ModernizrPlugin;
