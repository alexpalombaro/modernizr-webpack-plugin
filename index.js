var CachedSource = require('webpack-core/lib/CachedSource');
var ConcatSource = require('webpack-core/lib/ConcatSource');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var uglifyJs = require('uglify-js');
var build = require('modernizr').build;

function ModernizerPlugin(options) {
  this.options = options || {};

  // defaults
  if (typeof this.options.filename === 'undefined') {
    this.options.filename = 'modernizr-bundle.js';
  }

  if (typeof this.options.htmlWebPackPluginIntegration == 'undefined') {
    this.options.htmlWebPackPluginIntegration = true;
  }
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

      if (self.options.uglify) {
        var parsed = self.options.uglify === 'object' ? self.options.uglify : {};
        var options = Object.assign({}, parsed, {fromString: true});
        output = uglifyJs.minify(output, options).code;
      }

      source.add(output);

      var filename = self.options.filename;
      compilation.assets[filename] = new CachedSource(source);

      cb();
    })
  })
};

module.exports = ModernizerPlugin;
