/* global describe, it */
'use strict';

var chai = require('chai');

var BPromise = require('bluebird');
var BlueLRU = require('../index');

var expect = chai.expect;

describe('cache key', function () {
  it('accepts a String key', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var expectedValue = value;
    var isCached;

    return bcache(key, value).then(function () {
      isCached = bcache._lrucache.has(key);

      return bcache._lrucache.get(key).value.then(function (observedValue) {
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('accepts a Function key', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    function keyFn () {
      return key;
    }

    var expectedValue = value;
    var isCached;

    return bcache(keyFn, value).then(function () {
      isCached = bcache._lrucache.has(key);

      return bcache._lrucache.get(key).value.then(function (observedValue) {
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('accepts a Promise key', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var expectedValue = value;
    var isCached;

    return bcache(BPromise.resolve(key), value).then(function () {
      isCached = bcache._lrucache.has(key);

      return bcache._lrucache.get(key).value.then(function (observedValue) {
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('invokes a value function with the key', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var expectedKey = key;
    var observedKey;

    function valueFn (_key) {
      observedKey = _key;
      return value;
    }

    return bcache(key, valueFn).then(function () {
      expect(observedKey).to.equal(expectedKey);
    });
  });
});
