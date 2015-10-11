// Require all ".spec.js" files in ~/client.
var context = require.context('./', true, /.+\.spec\.js$/);
context.keys().forEach(context);
module.exports = context;
