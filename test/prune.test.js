/* global describe, it */
'use strict';

var chai = require('chai');

var BlueLRU = require('../index');

var expect = chai.expect;

describe('prune', function () {
  it('when disabled, allows items to remain in stale cache', function (done) {
    var key = 'jaeger';
    var ms = 5;
    var value = 'mark iv';

    var bcache = new BlueLRU({ maxAge: ms });

    bcache(key, value);

    setTimeout(function () {
      expect(bcache._lrucache.keys().length).to.equal(1);
      expect(bcache._lrucache.keys()[0]).to.equal(key);
      done();
    }, ms * 5)
  });

  it('when enabled with Number, clears the stale cache', function (done) {
    var key = 'jaeger';
    var ms = 5;
    var value = 'mark iv';

    var bcache = new BlueLRU({ maxAge: ms, pruneInterval: ms });

    bcache(key, value);

    setTimeout(function () {
      expect(bcache._lrucache.keys().length).to.equal(0);
      done();
    }, ms * 5)
  });

  it('when enabled with ms expression, clears the stale cache', function (done) {
    var key = 'jaeger';
    var ms = '5ms';
    var value = 'mark iv';

    var bcache = new BlueLRU({ maxAge: ms, pruneInterval: ms });

    bcache(key, value);

    setTimeout(function () {
      expect(bcache._lrucache.keys().length).to.equal(0);
      done();
    }, 25)
  });
});
