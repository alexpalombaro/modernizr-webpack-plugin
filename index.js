var build = require('modernizr').build;

var CachedSource = require('webpack-core/lib/CachedSource');
var ConcatSource = require('webpack-core/lib/ConcatSource');

var uglifyJs = require('uglify-js');
var invariant = require('invariant');

var ModernizerPlugin = function (options) {
  this.options = options || {};
};

ModernizerPlugin.prototype.apply = function (compiler) {

  var _self = this;

  compiler.plugin('emit', function (compilation, cb) {

    build(_self.options, function (output) {
      var source = new ConcatSource();

      if (_self.options.uglify) {
        var parsed = _self.options.uglify === 'object' ? _self.options.uglify : {};
        var options = Object.assign({}, parsed, {fromString: true});
        output = uglifyJs.minify(output, options).code;
      }

      source.add(output);

      var filename = _self.options.filename || 'modernizr-bundle.js';
      compilation.assets[filename] = new CachedSource(source);

      cb();
    })
  })
};

module.exports = ModernizerPlugin;
