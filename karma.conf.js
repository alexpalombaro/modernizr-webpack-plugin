var webpackConfig = require('./webpack.config');

var debug = (process.env.NODE_ENV !== 'production');

function makeDefaultConfig() {

  return {
    files: [
      './karma.entry.js'
    ],
    singleRun: !debug,
    autoWatch: debug,
    frameworks: ['mocha', 'sinon-chai'],
    preprocessors: ['webpack'],
    reporters: ['progress'],
    browsers: ['PhantomJS', 'Chrome'],
    webpack: {
      plugins: webpackConfig.plugins,
      module: {
        loaders: webpackConfig.module.loaders
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    plugins: [
      require('karma-webpack'),
      require('karma-mocha'),
      require('karma-sinon-chai'),
      require('karma-phantomjs-launcher'),
      require('karma-chrome-launcher')
    ]
  };
}

module.exports = function (config) {
  return config.set(makeDefaultConfig());
}
