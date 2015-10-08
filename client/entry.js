class TestingClass {
  constructor() {
    console.log('Modernizer Plugin Testing Class Init');
  }
}

export default TestingClass;

(function (window) {
  window.TestingClass = new TestingClass();
})(window);
