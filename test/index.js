/* jslint node: true */
/* global beforeEach, describe, it */
'use strict';

var chai = require('chai');
var should = chai.should();

var LRU = require('lru-cache');
var BlueLRU = require('../index');
var BPromise = require('bluebird');


describe('bluecache', function () {

  it('gets a promised value from a String key', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var value = 'mark iv';
    var valueFn = function () {
      return BPromise.resolve(value);
    };

    lcache.set(key, value);
    var cachedValue;
    var expectedValue = lcache.get(key);
    var observedValue;
    var isCached;

    return bcache(key, valueFn).then(function (_value) {
      cachedValue = bcache._lrucache.get(key);
      observedValue = _value;
      isCached = bcache._lrucache.has(key);

      chai.expect(cachedValue).to.equal(expectedValue);
      chai.expect(observedValue).to.equal(expectedValue);
      chai.expect(isCached).to.equal(true);
    });
  });

  it('gets a promised value from a Promise key', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var keyPromise = BPromise.resolve(key);
    var value = 'mark iv';

    lcache.set(key, value);
    var cachedValue;
    var expectedValue = lcache.get(key);
    var observedKey;
    var observedValue;
    var isCached;

    var valueFn = function (_key) {
      observedKey = _key;
      return BPromise.resolve(value);
    };

    return bcache(keyPromise, valueFn).then(function (_value) {
      cachedValue = bcache._lrucache.get(key);
      observedValue = _value;
      isCached = bcache._lrucache.has(key);

      chai.expect(observedKey).to.equal(key);
      chai.expect(cachedValue).to.equal(expectedValue);
      chai.expect(observedValue).to.equal(expectedValue);
      chai.expect(isCached).to.equal(true);
    });
  });

  it('invokes the value function with the key', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var keyPromise = BPromise.resolve(key);
    var valueFn = function (_key) {
      return BPromise.resolve(_key);
    };

    return bcache(keyPromise, valueFn).then(function (_value) {
      var expectedValue = key;
      var observedValue = _value;

      chai.expect(observedValue).to.equal(expectedValue);
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
      should.not.exist(observedValue);
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

      chai.expect(observedResponse).to.equal(undefined);
      chai.expect(observedKeys.length).to.equal(0);
    });
  });

  describe('accepts options', function () {
    it('`maxAge` with milliseconds', function () {
      var ms = 5 * 24 * 60 * 60 * 1000;
      var bcache = new BlueLRU({maxAge: ms});
      chai.expect(bcache._lrucache._maxAge).to.equal(ms);
    });

    it('`maxAge` with interval', function () {
      var bcache = new BlueLRU({maxAge: {days: 5}});
      chai.expect(bcache._lrucache._maxAge).to.equal(5 * 24 * 60 * 60 * 1000);
    });
  });

  describe('handles errors', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var valueFn = function () {
      return new BPromise(function () {
        throw new Error('processing error');
      });
    };

    var cachedValue;
    var isPropegatedError;

    beforeEach(function (done) {
      bcache(key, valueFn).then(function () {
        cachedValue = bcache._lrucache.get(key);
      })
      .catch(function () {
        isPropegatedError = true;
        done();
      });
    });

    it('avoids setting on error within promise', function () {
      chai.expect(isPropegatedError).to.equal(true);
      chai.expect(cachedValue).to.equal(undefined);
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
      chai.expect(observedKey).to.equal(key);
    });

    it('with minimal delay', function () {
      var isNonZero = observedMS > -1;
      var isNotTooDelayed = observedMS < 5;

      chai.expect(isNonZero).to.equal(true);
      chai.expect(isNotTooDelayed).to.equal(true);
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
      chai.expect(observedKey).to.equal(key);
    });

    it('with minimal delay', function () {
      var isAtLeastDelayMS = observedMS > (delayMS - 1);
      var isNotTooDelayed = observedMS < (delayMS + 5);

      chai.expect(isAtLeastDelayMS).to.equal(true);
      chai.expect(isNotTooDelayed).to.equal(true);
    });
  });

});
