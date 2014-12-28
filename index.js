/*jslint node: true */
'use strict';

var EventEmitter = require('events').EventEmitter;
var BPromise = require('bluebird');
var LRU = require('lru-cache');


function BlueCache (options) {
  if (!(this instanceof BlueCache)) {
    return new BlueCache(options);
  }

  var self = this;

  self._bus = new EventEmitter();
  self._lrucache = LRU(options || {});

  function cache (key, valueFn) {
    var tsInit = +new Date();

    function exit (key, wasHit) {
      var eventName = wasHit ? 'cache:hit' : 'cache:miss';
      var tsExit = +new Date();

      self._bus.emit(eventName, {
        key: key,
        ms: tsExit - tsInit
      });
    }

    return new BPromise(function (resolve, reject) {
      if (!key || !valueFn) {
        return reject('cache instance must be called with a key and a value function');
      }

      BPromise.resolve(key).then(function (_key) {
        if (self._lrucache.has(_key)) {
          var _value = self._lrucache.get(_key);
          exit(_key, true);
          return resolve(_value);
        }

        valueFn().then(function (_value) {
          self._lrucache.set(_key, _value);
          exit(_key, false);
          return resolve(_value);
        });
      });
    });
  }

  cache.del = function (key) {
    return new BPromise(function (resolve) {
      BPromise.resolve(key).then(function (_key) {
        resolve(self._lrucache.del(_key));
      });
    });
  };

  cache.reset = function () {
    return new BPromise(function (resolve) {
      resolve(self._lrucache.reset());
    });
  };

  cache.on = function () {
    self._bus.on.apply(self._bus, arguments);
  };

  cache._lrucache = self._lrucache;

  return cache;
}


module.exports = BlueCache;
