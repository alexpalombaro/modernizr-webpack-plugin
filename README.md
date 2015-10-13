# modernizr-webpack-plugin

Generate a custom modernizr build during webpack compile. 
Includes support to integrate with [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)

[![Build Status](https://travis-ci.org/alexpalombaro/modernizr-webpack-plugin.svg?branch=master)](https://travis-ci.org/alexpalombaro/modernizr-webpack-plugin)

## Install

```sh
$ npm install modernizr-webpack-plugin
```

## Usage

Add the modernizr-webpack-plugin to your list of plugins in the webpack config

```javascript
// webpack.config.js
var ModernizrWebpackPlugin = require('modernizr-webpack-plugin');

module.exports = {
  entry: 'app.js',
  output: {
    filename: 'app-bundle.js'
  },
  plugins: [
    new ModernizrWebpackPlugin()
  ]
}
```

## Config

ModernizrWebpackPlugin supports all the options available to [Modernizr](https://github.com/Modernizr/Modernizr/blob/master/lib/config-all.json).

```javascript
// webpack.config.js
...
var config = {
  'feature-detects': [
    'input',
    'canvas',
    'css/resize'
  ]
}

module.exports = {
  ...
  plugins: [
    // Output modernizr-bundle.js with 'input',  
    // 'canvas' and 'css/resize' feature detects
    new ModernizrPlugin(config)
  ]
}
```

Additional config options available

```javascript

var config = {
  filename: 'custom-bundle-name.js' // custom filename (default: modernizr-bundle.js),
  minify: true|false // (default: true if NODE_ENV is 'production'),
  htmlWebPackPluginIntegration: true|false // (default: true)
}

```
