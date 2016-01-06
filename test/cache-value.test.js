/* global describe, it */
'use strict';

var chai = require('chai');
var sinon = require('sinon');

var BPromise = require('bluebird');
var BlueLRU = require('../index');

var expect = chai.expect;

describe('cache value', function () {
  it('accepts a null value', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = null;

    var expectedValue = value;
    var observedValue;
    var isCached;

    return bcache(key, value).then(function (_value) {
      return bcache._lrucache.get(key).value.then(function (cachedValue) {
        observedValue = _value;
        isCached = bcache._lrucache.has(key);

        expect(cachedValue).to.equal(expectedValue);
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('accepts an undefined value', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';

    var expectedValue;
    var observedValue;
    var isCached;

    return bcache(key).then(function (_value) {
      return bcache._lrucache.get(key).value.then(function (cachedValue) {
        observedValue = _value;
        isCached = bcache._lrucache.has(key);

        expect(cachedValue).to.equal(expectedValue);
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('accepts a primitive value', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var expectedValue = value;
    var observedValue;
    var isCached;

    return bcache(key, value).then(function (_value) {
      return bcache._lrucache.get(key).value.then(function (cachedValue) {
        observedValue = _value;
        isCached = bcache._lrucache.has(key);

        expect(cachedValue).to.equal(expectedValue);
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('accepts an Object value', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = {type: 'mark iv'};

    var expectedValue = value;
    var observedValue;
    var isCached;

    return bcache(key, value).then(function (_value) {
      return bcache._lrucache.get(key).value.then(function (cachedValue) {
        observedValue = _value;
        isCached = bcache._lrucache.has(key);

        expect(cachedValue).to.deep.equal(expectedValue);
        expect(observedValue).to.deep.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('accepts a Promise value', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var expectedValue = value;
    var observedValue;
    var isCached;

    return bcache(key, BPromise.resolve(value)).then(function (_value) {
      return bcache._lrucache.get(key).value.then(function (cachedValue) {
        observedValue = _value;
        isCached = bcache._lrucache.has(key);

        expect(cachedValue).to.equal(expectedValue);
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('accepts a Function returning a primitive value', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';
    function valueFn () { return BPromise.resolve(value); }

    var expectedValue = value;
    var observedValue;
    var isCached;

    return bcache(key, valueFn).then(function (_value) {
      return bcache._lrucache.get(key).value.then(function (cachedValue) {
        observedValue = _value;
        isCached = bcache._lrucache.has(key);

        expect(cachedValue).to.equal(expectedValue);
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('accepts a Function returning a Promise value', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var expectedValue = value;
    var observedValue;
    var isCached;

    return bcache(key, value).then(function (_value) {
      return bcache._lrucache.get(key).value.then(function (cachedValue) {
        observedValue = _value;
        isCached = bcache._lrucache.has(key);

        expect(cachedValue).to.equal(expectedValue);
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('invokes a value function once on successive cache calls', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';
    var valueFn = sinon.stub().returns(value);

    var expectedValue = value;

    return BPromise.all([
      bcache(key, valueFn),
      BPromise.delay(1, bcache(key, valueFn)),
      BPromise.delay(3, bcache(key, valueFn)),
      BPromise.delay(5, bcache(key, valueFn))
    ])
    .then(function (results) {
      results.map(function (observedValue) {
        expect(observedValue).to.equal(expectedValue);
      });

      expect(valueFn.callCount).to.equal(1);
    });
  });

  it('invokes a value function once on immediate cache calls', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';
    var valueFn = sinon.stub().returns(BPromise.delay(5, value));

    var expectedValue = value;

    return BPromise.all([
      bcache(key, valueFn),
      bcache(key, valueFn),
      bcache(key, valueFn),
      bcache(key, valueFn)
    ])
    .then(function (results) {
      results.map(function (observedValue) {
        expect(observedValue).to.equal(expectedValue);
      });

      expect(valueFn.callCount).to.equal(1);
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
