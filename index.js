var LRU = require('lru-cache');
var Promise = require('bluebird');


function BlueCache (options) {
  if (!(this instanceof BlueCache)) {
    return new BlueCache (options);
  }

  if (!options) {
    options = {};
  }

  this._reject = !!options.reject;  // [KE] cast for turhty-ness
  this.__cache = LRU(options);
}

BlueCache.prototype.set = function (key, value) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    resolve(_this.__cache.set(key, value));
  });
};

BlueCache.prototype.get = function (key) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    var value = _this.__cache.get(key);

    if (value === undefined && _this._reject) {
      reject(key);
      return;
    }

    resolve(value);
  });
};

BlueCache.prototype.peek = function (key) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    var value = _this.__cache.peek(key);

    if (value === undefined && _this._reject) {
      reject(key);
      return;
    }

    resolve(value);
  });
};

BlueCache.prototype.del = function (key) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    resolve(_this.__cache.del(key));
  });
};

BlueCache.prototype.reset = function () {
  var _this = this;

  return new Promise(function (resolve, reject) {
    resolve(_this.__cache.reset());
  });
};

BlueCache.prototype.has = function (key) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    var value = _this.__cache.has(key);

    if (value === undefined && _this._reject) {
      reject(key);
      return;
    }

    resolve(value);
  });
};

BlueCache.prototype.keys = function () {
  var _this = this;

  return new Promise(function (resolve, reject) {
    resolve(_this.__cache.keys());
  });
};

BlueCache.prototype.values = function () {
  var _this = this;

  return new Promise(function (resolve, reject) {
    resolve(_this.__cache.values());
  });
};


module.exports = BlueCache;
