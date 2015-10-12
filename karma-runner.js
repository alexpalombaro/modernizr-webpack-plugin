var Config = require('karma/lib/config').Config;
var Server = require('karma').Server;

var createConfig = require('./karma.conf');

var config = createConfig(new Config());

var server  = new Server(config);
server.start();
