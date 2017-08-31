/* global  describe, it */

const expect = require('chai').expect;

const Bluecache = require('../index');

describe('errors', () => {
  const cache = new Bluecache();

  // [KE] if a test below is incorrectly written, the catch block will never be called and the test
  //      will appear to pass, even though the lack of an error should itself be an error; so,
  //      inject a known failure mode so we can verify the expected failure mode was reached
  function failedTestFn() {
    throw new Error('test failed');
  }

  it('rejects with error if invoked with undefined key', () => {
    const key = undefined;

    return cache(key, Date.now().toString(36)).then(failedTestFn).catch((err) => {
      expect(err).to.match(/missing key/);
    });
  });

  it('rejects with error if invoked with null key', () => {
    const key = null;

    return cache(key, Date.now().toString(36)).then(failedTestFn).catch((err) => {
      expect(err).to.match(/missing key/);
    });
  });

  it('does not store an errored function value', () => {
    const key = 'jaeger';
    const valueFn = () => { throw new Error('bad value'); };

    return cache(key, valueFn).then(failedTestFn).catch((err) => {
      expect(err).to.match(/bad value/);
      expect(cache._lrucache.has(key)).to.equal(false);
    });
  });

  it('does not store a rejected promise on error', () => {
    const key = 'jaeger';
    const valueFn = () => Promise.reject('bad value');

    return cache(key, valueFn).then(failedTestFn).catch((err) => {
      expect(err).to.match(/bad value/);
      expect(cache._lrucache.has(key)).to.equal(false);
    });
  });
});
