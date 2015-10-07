import {build} from 'modernizr';

import CachedSource from 'webpack-core/lib/CachedSource';
import ConcatSource from 'webpack-core/lib/ConcatSource';

import uglifyJs from 'uglify-js';
import invariant from 'invariant';

class ModernizerPlugin {

  constructor(options = {}) {
    this.options = options;
  }

  apply = (compiler) => {
    compiler.plugin('emit', (compilation, cb) => {

      build(this.options, (output) => {
        let source = new ConcatSource();

        if (this.options.uglify) {
          let parsed = this.options.uglify === 'object' ? this.options.uglify : {};
          let options = Object.assign({}, parsed, {fromString: true});
          output = uglifyJs.minify(output, options).code;
        }

        source.add(output);

        let filename = this.options.filename || 'modernizr-bundle.js';
        compilation.assets[filename] = new CachedSource(source);

        cb();
      })
    })
  }
}

export default ModernizerPlugin
