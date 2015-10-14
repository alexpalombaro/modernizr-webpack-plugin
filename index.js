/* eslint-disable no-process-env */
var CachedSource = require('webpack-core/lib/CachedSource');
var ConcatSource = require('webpack-core/lib/ConcatSource');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var path = require('path');
var url = require('url');
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
  // ensure extension on filename
  if (options && options.filename && !options.filename.match(/\.js$/)) {
    options.filename = options.filename + '.js';
  }

  this.options = assign({}, {
    filename: 'modernizr-bundle.js',
    htmlWebPackPluginIntegration: true,
    minify: process.env.NODE_ENV === 'production',
    noChunk: false
  }, options);
}

ModernizrPlugin.prototype.htmlWebpackPluginInject = function (plugin, filename, filePath, filesize, noChunk) {
  var htmlWebPackPluginAssets = plugin.htmlWebpackPluginAssets;
  plugin.htmlWebpackPluginAssets = function () {
    var result = htmlWebPackPluginAssets.apply(plugin, arguments);
    if (noChunk) {
      result[filename] = filePath;
    } else {
      var chunk = {};
      chunk[filename] = {
        entry: filePath,
        css: [],
        size: filesize || 0
      };
      // get html-webpack-plugin to output modernizr chunk first
      result.chunks = assign({}, chunk, result.chunks);
    }
    return result;
  };
};

ModernizrPlugin.prototype.minifySource = function (source, options) {
  var uglifyOptions = Object.assign({}, options, {fromString: true});
  return uglifyJs.minify(source, uglifyOptions).code;
};

/**
 * Copied from html-webpack-plugin
 * @param {Object} compilation
 * @param {string} filename
 * @returns {string} Webpack public path option
 * @private
 */
ModernizrPlugin.prototype.resolvePublicPath = function (compilation, filename) {
  var publicPath = typeof compilation.options.output.publicPath !== 'undefined' ?
    compilation.mainTemplate.getPublicPath({hash: compilation.hash}) :
    path.relative(path.dirname(filename), '.');

  if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
    publicPath = path.join(url.resolve(publicPath + '/', '.'), '/');
  }

  return publicPath
};

ModernizrPlugin.prototype.createHash = function (output) {
  var hash = require('crypto').createHash('md5');
  hash.update(output);
  return hash.digest('hex');
};

ModernizrPlugin.prototype.createOutputPath = function (oFilename, publicPath, hash) {
  var result = oFilename;
  if (publicPath) {
    result = publicPath + oFilename;
  }
  if (hash) {
    result = result + (result.indexOf('?') === -1 ? '?' : '&') + hash;
  }
  return result;
};

ModernizrPlugin.prototype.apply = function (compiler) {
  var self = this;

  compiler.plugin('after-compile', function (compilation, cb) {
    build(self.options, function (output) {
      if (self.options.minify) {
        output = self.minifySource(output, self.options.minify);
      }
      self.modernizrOutput = output;
      var publicPath = self.resolvePublicPath(compilation, self.options.filename);
      var filename = self.options.filename;
      if (/\[hash\]/.test(self.options.filename)) {
        self.oFilename = filename.replace(/\[hash\]/, self.createHash(output));
        filename = filename.replace(/\[hash\]/, '');
      } else {
        self.oFilename = filename;
      }
      if (self.options.htmlWebPackPluginIntegration) {
        compiler.options.plugins.forEach(function (plugin) {
          if (plugin instanceof HtmlWebpackPlugin) {
            var filePath = self.createOutputPath(self.oFilename, publicPath,
              plugin.options.hash ? compilation.hash : null);
            self.htmlWebpackPluginInject(plugin, path.basename(filename, '.js'), filePath,
              output.length, self.options.noChunk)
          }
        })
      }
      cb();
    })
  });

  compiler.plugin('emit', function (compilation, cb) {
    var source = new ConcatSource();

    source.add(self.modernizrOutput);

    var filename = self.oFilename;
    compilation.assets[filename] = new CachedSource(source);

    cb();
  })
};

module.exports = ModernizrPlugin;
