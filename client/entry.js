function _init() {
  var output = 'Modernizr ' + (window && window.Modernizr ? 'available' : 'missing');
  console.log(output);
  if (document) {
    var h1 = document.createElement('h1');
    h1.style.color = 'red';
    h1.innerHTML = output;
    document.body.appendChild(h1);
  }
}

module = module.exports = (function TestingClass(window) {
  if (window) {
    var document = document || window.document;
    document.readyState === 'complete' ? _init() : window.addEventListener('load', _init);
  }
}(window));
