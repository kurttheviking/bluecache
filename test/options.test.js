/* global describe, it */
'use strict';

var chai = require('chai');

var BlueLRU = require('../index');

var expect = chai.expect;

describe('options', function () {
  it('does not require the new keyword', function () {
    var bcache = require('../index')();

    expect(bcache).to.be.a('function');
    expect(global.bcache).to.equal(undefined);
  });

  it('`maxAge` with milliseconds', function () {
    var ms = 5 * 24 * 60 * 60 * 1000;
    var bcache = new BlueLRU({maxAge: ms});
    expect(bcache._lrucache.maxAge).to.equal(ms);
  });

  it('`maxAge` with interval', function () {
    var bcache = new BlueLRU({maxAge: {days: 5}});
    expect(bcache._lrucache.maxAge).to.equal(5 * 24 * 60 * 60 * 1000);
  });

  describe('length function', function () {
    it('caches a constant value', function () {
      var expectedLength = parseInt(Math.random() * 100, 10);
      function lengthFn () {
        return expectedLength;
      }

      var bcache = new BlueLRU({length: lengthFn});

      var key = 'jaeger';
      var value = 'mark iv';

      return bcache(key, value).then(function () {
        var storedValue = bcache._lrucache.get(key);

        expect(storedValue.length).to.equal(expectedLength);
      });
    });

    it('caches a computed value', function () {
      function lengthFn (n) {
        return n.length;
      }

      var bcache = new BlueLRU({length: lengthFn});

      var key = 'jaeger';
      var value = 'mark iv';

      return bcache(key, value).then(function () {
        var storedValue = bcache._lrucache.get(key);

        expect(storedValue.length).to.equal(value.length);
      });
    });
  });
});
