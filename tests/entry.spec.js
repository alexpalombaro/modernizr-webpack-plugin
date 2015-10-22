/* eslint-env jasmine, mocha */

var config = require('./feature-detects');

describe('[ModernizrWebpackPlugin] Browser Tests', function () {

  it('should contain an instance of Modernizr', function () {
    expect(window.Modernizr).to.be.an('object');
  });

  it('should have feature-detects specified in bundle options', function () {
    expect(window.Modernizr).to.have.all.keys(config);
  });
});
