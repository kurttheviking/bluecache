/* global beforeEach, describe, it */
'use strict';

var chai = require('chai');
var sinon = require('sinon');

var BPromise = require('bluebird');
var LRU = require('lru-cache');
var BlueLRU = require('../index');

var expect = chai.expect;

describe('bluecache', function () {
  it('does not require the new keyword', function () {
    var bcache = require('../index')();

    expect(bcache).to.be.a('function');
    expect(global.bcache).to.equal(undefined);
  });

  it('gets a plain value from a String key', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var value = 'mark iv';

    lcache.set(key, value);
    var expectedValue = lcache.get(key);
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

  it('gets a Promise value from a String key', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var value = 'mark iv';

    lcache.set(key, value);
    var expectedValue = lcache.get(key);
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

  it('gets a function value from a String key', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var value = 'mark iv';
    function valueFn () { return BPromise.resolve(value); }

    lcache.set(key, value);
    var expectedValue = lcache.get(key);
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

  it('gets a function Promise value from a String key', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var value = 'mark iv';

    lcache.set(key, value);
    var expectedValue = lcache.get(key);
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

  it('gets a promised value from a Promise key', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var keyPromise = BPromise.resolve(key);
    var value = 'mark iv';

    lcache.set(key, value);
    var expectedValue = lcache.get(key);
    var observedKey;
    var observedValue;
    var isCached;

    var valueFn = function (_key) {
      observedKey = _key;
      return BPromise.resolve(value);
    };

    return bcache(keyPromise, valueFn).then(function (_value) {
      return bcache._lrucache.get(key).value.then(function (cachedValue) {
        observedValue = _value;
        isCached = bcache._lrucache.has(key);

        expect(observedKey).to.equal(key);
        expect(cachedValue).to.equal(expectedValue);
        expect(observedValue).to.equal(expectedValue);
        expect(isCached).to.equal(true);
      });
    });
  });

  it('invokes a value function with the key', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var keyPromise = BPromise.resolve(key);
    var valueFn = function (_key) {
      return BPromise.resolve(_key);
    };

    return bcache(keyPromise, valueFn).then(function (_value) {
      var expectedValue = key;
      var observedValue = _value;

      expect(observedValue).to.equal(expectedValue);
    });
  });

  it('allows null cache values', function () {
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

  it('allows undefined cache values', function () {
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

  it('deletes and resolves to undefined', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var observedValue;

    return bcache(key, value).then(function () {
      return bcache.del(key);
    })
    .then(function () {
      observedValue = bcache._lrucache.get(key);
      expect(observedValue).to.equal(undefined);
    });
  });

  it('invokes a value function once (avoids thundering herd)', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';
    var valueFn = sinon.stub().returns(value);

    var expectedValue = value;

    return BPromise.all([
      bcache(key, valueFn),
      BPromise.delay(5, bcache(key, valueFn)),
      BPromise.delay(15, bcache(key, valueFn)),
      BPromise.delay(25, bcache(key, valueFn))
    ])
    .then(function (results) {
      results.map(function (observedValue) {
        expect(observedValue).to.equal(expectedValue);
      });

      expect(valueFn.callCount).to.equal(1);
    });
  });

  describe('accepts options', function () {
    it('`maxAge` with milliseconds', function () {
      var ms = 5 * 24 * 60 * 60 * 1000;
      var bcache = new BlueLRU({maxAge: ms});
      expect(bcache._lrucache.maxAge).to.equal(ms);
    });

    it('`maxAge` with interval', function () {
      var bcache = new BlueLRU({maxAge: {days: 5}});
      expect(bcache._lrucache.maxAge).to.equal(5 * 24 * 60 * 60 * 1000);
    });

    it('`length` function as constant', function () {
      var expectedLength = parseInt(Math.random() * 100, 10);
      function lengthFn () {
        return expectedLength;
      }

      var bcache = new BlueLRU({length: lengthFn});

      var key = 'jaeger';
      var value = 'mark iv';

      return bcache(key, value).then(function () {
        var storedValue = bcache._lrucache.get(key);

        expect(storedValue.length).to.equal(expectedLength);
      });
    });

    it('`length` function as computed property', function () {
      function lengthFn (n) {
        return n.length;
      }

      var bcache = new BlueLRU({length: lengthFn});

      var key = 'jaeger';
      var value = 'mark iv';

      return bcache(key, value).then(function () {
        var storedValue = bcache._lrucache.get(key);

        expect(storedValue.length).to.equal(value.length);
      });
    });
  });

  describe('handles errors', function () {
    var bcache = new BlueLRU();

    it('rejects with error if invoked without key', function () {
      return bcache().catch(function (err) {
        expect(err).to.match(/missing required parameter: key/);
      });
    });

    it('stores the rejected promise on error', function () {
      var key = 'jaeger';
      var valueFn = function () {
        return new BPromise(function () {
          throw new Error('processing error');
        });
      };

      return bcache(key, valueFn).catch(function (err) {
        expect(err).to.match(/processing error/);

        return bcache._lrucache.get(key).value.catch(function (err) {
          expect(err).to.match(/processing error/);
        });
      });
    });
  });

  describe('emits cache:hit events', function () {
    var key = 'jaeger';
    var value = 'mark iii';

    var delayMS;
    var observedKey;
    var observedMS;

    beforeEach(function (done) {
      var bcache = new BlueLRU();
      var valueFn = function () {
        delayMS = Math.ceil(Math.random() * 10);
        return BPromise.resolve(value).delay(delayMS);
      };

      bcache.on('cache:hit', function (data) {
        observedKey = data.key;
        observedMS = data.ms;

        done();
      });

      bcache(key, valueFn).then(function () {
        bcache(key, valueFn);
      });
    });

    it('with correct properties', function () {
      expect(observedKey).to.equal(key);
    });

    it('with minimal delay', function () {
      var isNonZero = observedMS > -1;
      var isNotTooDelayed = observedMS < 5;

      expect(isNonZero).to.equal(true);
      expect(isNotTooDelayed).to.equal(true);
    });
  });

  describe('emits cache:miss events', function () {
    var key = 'jaeger';
    var value = 'mark iii';

    var delayMS;
    var observedKey;
    var observedMS;

    beforeEach(function (done) {
      var bcache = new BlueLRU();
      var valueFn = function () {
        delayMS = Math.ceil(Math.random() * 10);
        return BPromise.resolve(value).delay(delayMS);
      };

      bcache.on('cache:miss', function (data) {
        observedKey = data.key;
        observedMS = data.ms;

        done();
      });

      bcache(key, valueFn);
    });

    it('with correct properties', function () {
      expect(observedKey).to.equal(key);
    });

    it('with minimal delay', function () {
      var isAtLeastDelayMS = observedMS > (delayMS - 1);
      var isNotTooDelayed = observedMS < (delayMS + 5);

      expect(isAtLeastDelayMS).to.equal(true);
      expect(isNotTooDelayed).to.equal(true);
    });
  });
});
