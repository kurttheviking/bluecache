/* jslint node: true */
/* global beforeEach, describe, it */
'use strict';

var chai = require('chai');
var should = chai.should();

var LRU = require('lru-cache');
var BlueLRU = require('../index');
var BPromise = require('bluebird');


describe('bluecache ->', function () {

  describe('gets a promised value from a String key ->', function () {
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

    beforeEach(function (done) {
      bcache(key, valueFn).then(function (_value) {
        cachedValue = bcache._lrucache.get(key);
        observedValue = _value;
        isCached = bcache._lrucache.has(key);
        done();
      });
    });

    it('like lru-cache', function () {
      chai.expect(observedValue).equals(expectedValue);
    });

    it('saves the value for future calls', function () {
      chai.expect(isCached).to.be.true;
      chai.expect(cachedValue).equals(expectedValue);
    });
  });

  describe('gets a promised value from a Promise key ->', function () {
    var bcache = new BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var keyPromise = BPromise.resolve(key);
    var value = 'mark iv';
    var valueFn = function () {
      return BPromise.resolve(value);
    };

    lcache.set(key, value);
    var expectedValue = lcache.get(key);
    var observedValue;

    beforeEach(function (done) {
      bcache(keyPromise, valueFn).then(function (_value) {
        observedValue = _value;
        done();
      });
    });

    it('like lru-cache', function () {
      chai.expect(observedValue).equals(expectedValue);
    });
  });

  describe('deletes ->', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';
    var valueFn = function () {
      return BPromise.resolve(value);
    };

    var observedValue;

    beforeEach(function (done) {
      bcache(key, valueFn).then(function () {
        return bcache.del(key);
      }).then(function () {
        observedValue = bcache._lrucache.get(key);
        done();
      });
    });

    it('and returns undefined', function () {
      should.not.exist(observedValue);
    });
  });

  describe('resets ->', function () {
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

    beforeEach(function (done) {
      BPromise.all([
        bcache(key1, valueFn1),
        bcache(key2, valueFn2)
      ])
      .then(function () {
        return bcache.reset();
      })
      .then(function (_value) {
        observedKeys = bcache._lrucache.keys();
        observedResponse = _value;
        done();
      });
    });

    it('and returns undefined', function () {
      chai.expect(observedResponse).to.be.undefined;
    });

    it('and empties the underlying keyset', function () {
      chai.expect(observedKeys.length).equals(0);
    });
  });

  describe('emits cache:hit events ->', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iii';
    var valueMS = Math.ceil(Math.random() * 10);
    var valueFn = function () {
      return BPromise.resolve(value).delay(valueMS);
    };

    var observedKey;
    var observedMS;

    beforeEach(function (done) {
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
      var isNonZero = observedMS > -1;
      var isNotTooDelayed = observedMS < 5;

      chai.expect(isNonZero).to.be.true;
      chai.expect(isNotTooDelayed).to.be.true;
      chai.expect(observedKey).equals(key);
    });
  });

  describe('emits cache:miss events ->', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iii';
    var valueMS = Math.ceil(Math.random() * 10);
    var valueFn = function () {
      return BPromise.resolve(value).delay(valueMS);
    };

    var observedKey;
    var observedMS;

    beforeEach(function (done) {
      bcache.on('cache:miss', function (data) {
        observedKey = data.key;
        observedMS = data.ms;

        done();
      });

      bcache(key, valueFn);
    });

    it('with correct properties', function () {
      var isAtLeastValueMS = observedMS > (valueMS - 1);
      var isNotTooDelayed = observedMS < (valueMS + 5);

      chai.expect(isAtLeastValueMS).to.be.true;
      chai.expect(isNotTooDelayed).to.be.true;
      chai.expect(observedKey).equals(key);
    });
  });

});
