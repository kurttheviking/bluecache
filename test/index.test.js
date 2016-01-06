/* global beforeEach, describe, it */
'use strict';

var chai = require('chai');

var LRU = require('lru-cache');
var BlueLRU = require('../index');
var BPromise = require('bluebird');

var expect = chai.expect;

describe('bluecache', function () {
  it('does not require the new keyword', function () {
    var bcache = require('../index')();

    expect(bcache).to.be.a('function');
    expect(global.bcache).to.equal(undefined);
  });

  it('gets a promised value from a String key', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var value = 'mark iv';
    var valueFn = function () {
      return BPromise.resolve(value);
    };

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

  it('invokes the value function with the key', function () {
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

  it('deletes and resolves to undefined', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';
    var valueFn = function () {
      return BPromise.resolve(value);
    };

    var observedValue;

    return bcache(key, valueFn).then(function () {
      return bcache.del(key);
    }).then(function () {
      observedValue = bcache._lrucache.get(key);
      expect(observedValue).to.equal(undefined);
    });
  });

  it('resets and resolves to undefined', function () {
    var bcache = new BlueLRU();

    var key1 = 'jaeger #1';
    var value1 = 'mark iii';
    var valueFn1 = function () {
      return BPromise.resolve(value1).delay(Math.random() * 10);
    };

    var key2 = 'jaeger #2';
    var value2 = 'mark iv';
    var valueFn2 = function () {
      return BPromise.resolve(value2).delay(Math.random() * 10);
    };

    var observedKeys;
    var observedResponse;

    return BPromise.all([
      bcache(key1, valueFn1),
      bcache(key2, valueFn2)
    ])
    .then(function () {
      return bcache.reset();
    })
    .then(function (_value) {
      observedKeys = bcache._lrucache.keys();
      observedResponse = _value;

      expect(observedResponse).to.equal(undefined);
      expect(observedKeys.length).to.equal(0);
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
  });

  describe('handles errors', function () {
    var bcache = new BlueLRU();

    it('rejects with error if invoked without key', function () {
      return bcache().catch(function (err) {
        expect(err).to.match(/missing required parameter: key/);
      });
    });

    it('rejects with error if invoked without value function', function () {
      var key = 'jaeger';

      return bcache(key).catch(function (err) {
        expect(err).to.match(/missing required parameter: valueFunction/);
      });
    });

    it('rejects with error if value function is not a function', function () {
      var key = 'jaeger';
      var value = 'mark iii';

      return bcache(key, value).catch(function (err) {
        expect(err).to.match(
          /invalid parameter: valueFunction must be a function/
        );
      });
    });

    it('avoids setting on error within promise', function () {
      var key = 'jaeger';
      var valueFn = function () {
        return new BPromise(function () {
          throw new Error('processing error');
        });
      };

      return bcache(key, valueFn).catch(function (err) {
        expect(err).to.match(/processing error/);
        expect(bcache._lrucache.get(key)).to.equal(undefined);
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
