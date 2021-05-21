const Config = require('karma/lib/config').Config;
const Server = require('karma').Server;

const ModernizrWebpackPlugin = require('./index');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const createConfig = require('./karma.conf');
const karmaConfig = createConfig(new Config());

const path = require('path');
const del = require('del');

const OUTPUT_PATH = path.resolve(__dirname, 'temp');

del(OUTPUT_PATH);

const webpack = require('webpack');
const webpackConfig = {
  context: __dirname,
  entry: {
    'entry-bundle': './tests/entry.js'
  },
  output: {
    filename: '[name].js',
    path: OUTPUT_PATH
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ModernizrWebpackPlugin({
      'feature-detects': require('./tests/feature-detects')
    })
  ]
};

function executeTestingServer(source) {
  const config = Object.assign({}, karmaConfig);
  config.files.push(source);
  const server = new Server(config);
  server.start();
}

webpack(webpackConfig, function (err) {
  if (err) {
    console.error(err);
    process.exit(0);
  }

  executeTestingServer(path.resolve(OUTPUT_PATH, 'modernizr-bundle.js'));
});
