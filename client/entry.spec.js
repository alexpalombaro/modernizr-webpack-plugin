/* eslint-env jasmine, mocha */

var config = require('./feature-detects');

describe('[ModernizrPlugin]', function () {

  it('Should contain an instance of Modernizr', function () {
    expect(window.Modernizr).to.be.an('object');
  });

  it('Should have feature-detects specified in bundle options', function () {
    expect(window.Modernizr).to.have.all.keys(config);
  });
});
