/* global beforeEach, describe, it */
'use strict';

var chai = require('chai');

var BPromise = require('bluebird');
var BlueLRU = require('../index');

var expect = chai.expect;

describe('events', function () {
  describe('cache:hit', function () {
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

    it('emits with correct properties', function () {
      expect(observedKey).to.equal(key);
    });

    it('emits with minimal delay', function () {
      var isNonZero = observedMS > -1;
      var isNotTooDelayed = observedMS < 5;

      expect(isNonZero).to.equal(true);
      expect(isNotTooDelayed).to.equal(true);
    });
  });

  describe('cache:miss', function () {
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

    it('emits with correct properties', function () {
      expect(observedKey).to.equal(key);
    });

    it('emits with minimal delay', function () {
      var isAtLeastDelayMS = observedMS > (delayMS - 1);
      var isNotTooDelayed = observedMS < (delayMS + 5);

      expect(isAtLeastDelayMS).to.equal(true);
      expect(isNotTooDelayed).to.equal(true);
    });
  });
});
