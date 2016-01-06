'use strict';

var BPromise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var interval = require('interval');
var LRU = require('lru-cache');

function BlueCache (opts) {
  if (!(this instanceof BlueCache)) {
    return new BlueCache(opts);
  }

  var options = opts || {};
  if (typeof options.maxAge === 'object') {
    options.maxAge = interval(options.maxAge);
  }

  var getMemoLength = (typeof options.length === 'function') ?
    options.length :
    function () { return 1; };

  // [KE] ensure that the memo's length property is always used;
  //      any user-specified length is set to memo.length
  options.length = function (memo) {
    return memo.length;
  };

  var bus = new EventEmitter();
  var lrucache = LRU(options);

  function cache (key, value) {
    var tsInit = Date.now();

    function emit (memoKey, wasHit) {
      var eventName = wasHit ? 'cache:hit' : 'cache:miss';
      var tsExit = Date.now();

      bus.emit(eventName, {
        key: memoKey,
        ms: tsExit - tsInit
      });
    }

    return BPromise.try(function () {
      if (key === undefined) {
        throw new Error('missing required parameter: key');
      }

      var isKeyFunction = (typeof key === 'function');

      return isKeyFunction ? key() : key;
    })
    .then(function (memoKey) {
      var memo;
      var isValueFunction = (typeof value === 'function');

      if (lrucache.has(memoKey)) {
        memo = lrucache.get(memoKey);
        emit(memoKey, true);
        return memo.value;
      }

      memo = {
        value: BPromise.try(function () {
          return isValueFunction ? value(memoKey) : value;
        }),
        length: 1
      };

      lrucache.set(memoKey, memo);

      return memo.value.then(function (result) {
        memo.length = getMemoLength(result);
        emit(memoKey, false);

        lrucache.set(memoKey, memo);
        return result;
      });
    });
  }

  cache.del = function (key) {
    return new BPromise(function (resolve) {
      BPromise.resolve(key).then(function (memoKey) {
        resolve(lrucache.del(memoKey));
      });
    });
  };

  cache.on = function () {
    bus.on.apply(bus, arguments);
  };

  cache._lrucache = lrucache;

  return cache;
}

module.exports = BlueCache;
