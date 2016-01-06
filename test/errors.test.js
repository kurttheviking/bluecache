/* global describe, it */
'use strict';

var chai = require('chai');

var BPromise = require('bluebird');
var BlueLRU = require('../index');

var expect = chai.expect;

describe('errors', function () {
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
