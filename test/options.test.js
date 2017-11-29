/* global describe, it */
/* eslint-disable no-underscore-dangle, global-require */

const expect = require('chai').expect;

const Bluecache = require('../index');

describe('options: maxAge', () => {
  it('does not require the new keyword', () => {
    const cache = require('../index')();

    expect(cache).to.be.a('function');
    expect(global.cache).to.equal(undefined);
  });

  it('accepts a Number<milliseconds>', () => {
    const ms = 60 * 1000;
    const cache = new Bluecache({ maxAge: ms });

    expect(cache._lrucache.maxAge).to.equal(ms);
  });

  it('accepts an String<ms expression>', () => {
    const cache = new Bluecache({ maxAge: '1m' });

    expect(cache._lrucache.maxAge).to.equal(60 * 1000);
  });
});

describe('options: length', () => {
  it('caches a constant value', () => {
    const expected = parseInt(Math.random() * 100, 10);
    const key = 'jaeger';
    const value = 'mark iv';

    const cache = new Bluecache({ length: () => expected });

    return cache(key, value).then(() => {
      const memo = cache._lrucache.get(key);

      expect(memo.length).to.equal(expected);
    });
  });

  it('caches a computed value', () => {
    const key = 'jaeger';
    const value = 'mark iv';

    const cache = new Bluecache({ length: n => n.length });

    return cache(key, value).then(() => {
      const memo = cache._lrucache.get(key);

      expect(memo.length).to.equal(value.length);
    });
  });
});

describe('options: pruneInterval', () => {
  it('when disabled, allows items to remain in stale cache', (done) => {
    const key = 'jaeger';
    const ms = 5;
    const value = 'mark iv';

    const cache = new Bluecache({ maxAge: ms });

    cache(key, value);

    setTimeout(() => {
      expect(cache._lrucache.keys().length).to.equal(1);
      expect(cache._lrucache.keys()[0]).to.equal(key);
      done();
    }, ms * 5);
  });

  it('when enabled with Number, clears the stale cache', (done) => {
    const key = 'jaeger';
    const ms = 5;
    const value = 'mark iv';

    const cache = new Bluecache({ maxAge: ms, pruneInterval: ms });

    cache(key, value);

    setTimeout(() => {
      expect(cache._lrucache.keys().length).to.equal(0);
      done();
    }, ms * 5);
  });

  it('when enabled with ms expression, clears the stale cache', (done) => {
    const key = 'jaeger';
    const ms = 5;
    const value = 'mark iv';

    const cache = new Bluecache({ maxAge: `${ms}ms`, pruneInterval: `${ms}ms` });

    cache(key, value);

    setTimeout(() => {
      expect(cache._lrucache.keys().length).to.equal(0);
      done();
    }, ms * 5);
  });
});
