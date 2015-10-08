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
 * @param options
 * @constructor
 */
function ModernizerPlugin(options) {
  this.options = assign({}, {
    filename: 'modernizr-bundle.js',
    htmlWebPackPluginIntegration: true,
    minify: !(process.env.NODE_ENV === 'development')
  }, options);
}

ModernizerPlugin.prototype._htmlWebpackPluginInject = function (plugin, filename, hash) {
  var htmlWebPackPluginAssets = plugin.htmlWebpackPluginAssets;
  plugin.htmlWebpackPluginAssets = function () {
    var result = htmlWebPackPluginAssets.apply(plugin, arguments);
    var chunkName = filename.replace(/\.js/, '');
    if (plugin.options.hash) {
      filename = plugin.appendHash(filename, hash || '');
    }
    result.chunks[chunkName] = {
      entry: filename
    };
    return result;
  };
};

ModernizerPlugin.prototype._minifySource = function (source, options) {
  var uglifyOptions = Object.assign({}, options, {fromString: true});
  return uglifyJs.minify(source, uglifyOptions).code;
};

ModernizerPlugin.prototype.apply = function (compiler) {
  var self = this;

  compiler.plugin('after-compile', function (compilation, cb) {
    var stats = compilation.getStats();
    if (self.options.htmlWebPackPluginIntegration) {
      compiler.options.plugins.forEach(function (plugin) {
        if (plugin instanceof HtmlWebpackPlugin) {
          self._htmlWebpackPluginInject(plugin, self.options.filename, stats.hash)
        }
      })
    }
    cb();
  });

  compiler.plugin('emit', function (compilation, cb) {
    build(self.options, function (output) {
      var source = new ConcatSource();
      if (self.options.minify) {
        output = self._minifySource(output, self.options.minify);
      }

      source.add(output);

      var filename = self.options.filename;
      compilation.assets[filename] = new CachedSource(source);

      cb();
    })
  })
};

module.exports = ModernizerPlugin;
