/* global describe, it */
'use strict';

var chai = require('chai');

var BPromise = require('bluebird');
var BlueLRU = require('../index');

var expect = chai.expect;

describe('cache key', function () {
  it('accepts a Boolean key', function () {
    var bcache = new BlueLRU();

    var key = true;
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

  it('accepts a Number key', function () {
    var bcache = new BlueLRU();

    var key = 10;
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

  it('accepts an Object key', function () {
    var bcache = new BlueLRU();

    var key = {k: 'jaeger'};
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

  it('accepts a Promise<String> key', function () {
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

  it('accepts a Function=>String key', function () {
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

  it('accepts a Function=>Promise<String> key', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    function keyFn () {
      return BPromise.resolve(key);
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
});
