/* global  describe, it */
'use strict';

var chai = require('chai');

var BlueLRU = require('../index');

var expect = chai.expect;

describe('#del', function () {
  it('"removes" an item from the underlying cache', function () {
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

  it('resolves to undefined', function () {
    var bcache = new BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    return bcache(key, value).then(function () {
      return bcache.del(key);
    })
    .then(function (finalValue) {
      expect(finalValue).to.equal(undefined);
    });
  });
});
