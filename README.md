# modernizr-webpack-plugin

Generate a custom modernizr build during webpack compile.
Includes support to integrate with [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)

[![npm version](https://badge.fury.io/js/modernizr-webpack-plugin.svg)](https://badge.fury.io/js/modernizr-webpack-plugin)
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
    new ModernizrWebpackPlugin(config)
  ]
}
```

Additional options available via following config properties.

### filename
Type: string

Optional custom output filename. Support included for `[hash]` and `[chunkhash]` in output name.
Defaults to `modernizr-bundle.js`.
*Note:* Will append `.js` extension if missing.

```javascript
var config = {
  filename: 'my-bundle-name[chunkhash].js',
}
```

### minify
Type: boolean | object

Option to minify Modernizr bundle. Accepts `true`, `false` or `object`.
For details of available minify options when using `object` please refer to [uglify-js](https://www.npmjs.com/package/uglify-js)
Defaults to `true` if NODE_ENV is `production` otherwise `false`.

```javascript
var config = {
  minify: {
    output: {
      comments: true,
      beautify: true
    }
  }
}
```

## htmlWebpackPlugin
Type: boolean | object | array

Option to include support for [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin).
Defaults to `true`.

```javascript
// define variable if specifying instance to inject into
var plugin = new HtmlWebpackPlugin();
webpackConfig = {...
   plugins: [
     plugin,  
     new ModernizrWebpackPlugin({
       // auto search through all webpack plugins for compatible
       // html-webpack-plugins and inject into all
       htmlWebpackPlugin: true
       // OR disable any html-webpack-plugin injection
       htmlWebpackPlugin: false
       // OR inject into the instance specified
       htmlWebpackPlugin: plugin
       // OR inject into each of the instances specified
       htmlWebpackPlugin: [plugin]
     })
   ]
}

```

## noChunk
Type: boolean

Option to simplify [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) template reference
Defaults to `false`.

```javascript
var htmlWebpackPluginConfig = {
  template:'template.html'
}
var modernizrPluginConfig = {
  filename: 'mybundle',
  noChunk: true
}
```

_template.html_
```html
<!-- example of template without noChunk-->
<script src="{%= o.htmlWebpackPlugin.files.chunks['mybundle'].entry %}"></script>

<!-- example of template WITH noChunk-->
<script src="{%= o.htmlWebpackPlugin.files.mybundle %}"></script>

```
