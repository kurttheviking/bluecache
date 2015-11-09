'use strict';

var BPromise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var interval = require('interval');
var LRU = require('lru-cache');

function BlueCache (options) {
  if (!(this instanceof BlueCache)) {
    return new BlueCache(options);
  }

  options = options || {};
  if (typeof options.maxAge === 'object') {
    options.maxAge = interval(options.maxAge);
  }

  var bus = new EventEmitter();
  var lrucache = LRU(options);

  function cache (key, valueFn) {
    var tsInit = Date.now();

    function emit (key, wasHit) {
      var eventName = wasHit ? 'cache:hit' : 'cache:miss';
      var tsExit = Date.now();

      bus.emit(eventName, {
        key: key,
        ms: tsExit - tsInit
      });
    }

    return new BPromise(function (resolve, reject) {
      if (key === undefined) {
        return reject(
          new Error('missing required parameter: key')
        );
      }
      else if (valueFn === undefined) {
        return reject(
          new Error('missing required parameter: valueFunction')
        );
      }
      else if (typeof valueFn !== 'function') {
        return reject(
          new Error('invalid parameter: valueFunction must be a function')
        );
      }

      return BPromise.resolve(key).then(function (_key) {
        if (lrucache.has(_key)) {
          var _value = lrucache.get(_key);
          emit(_key, true);
          return resolve(_value);
        }

        return valueFn(_key).then(function (_value) {
          lrucache.set(_key, _value);
          emit(_key, false);
          return resolve(_value);
        })
        .catch(reject);
      });
    });
  }

  cache.del = function (key) {
    return new BPromise(function (resolve) {
      BPromise.resolve(key).then(function (_key) {
        resolve(lrucache.del(_key));
      });
    });
  };

  cache.reset = function () {
    return new BPromise(function (resolve) {
      resolve(lrucache.reset());
    });
  };

  cache.on = function () {
    bus.on.apply(bus, arguments);
  };

  cache._lrucache = lrucache;

  return cache;
}


module.exports = BlueCache;
