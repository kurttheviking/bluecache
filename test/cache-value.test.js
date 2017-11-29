/* global describe, it */
/* eslint-disable no-underscore-dangle, global-require */

const delay = require('delay');
const expect = require('chai').expect;
const sinon = require('sinon');

const Bluecache = require('../index');

describe('cache parameter: value', () => {
  it('accepts a null value', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = null;

    return cache(key, value).then((out) => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(out).to.equal(value);
      expect(cache._lrucache.get(key).value).to.equal(value);
    });
  });

  it('accepts an undefined value', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = undefined;

    return cache(key, value).then((out) => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(out).to.equal(value);
      expect(cache._lrucache.get(key).value).to.equal(value);
    });
  });

  it('accepts a String value', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    return cache(key, value).then((out) => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(out).to.equal(value);
      expect(cache._lrucache.get(key).value).to.equal(value);
    });
  });

  it('accepts an Object value', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = { type: 'mark iv' };

    return cache(key, value).then((out) => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(out).to.equal(value);
      expect(cache._lrucache.get(key).value).to.deep.equal(value);
    });
  });

  it('accepts a Promise<String> value', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    return cache(key, Promise.resolve(value)).then((out) => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(out).to.equal(value);
      expect(cache._lrucache.get(key).value).to.equal(value);
    });
  });

  it('accepts a Function=>String value', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    return cache(key, () => value).then((out) => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(out).to.equal(value);
      expect(cache._lrucache.get(key).value).to.equal(value);
    });
  });

  it('accepts Function=>Promise<String> value', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    return cache(key, () => Promise.resolve(value)).then((out) => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(out).to.equal(value);
      expect(cache._lrucache.get(key).value).to.equal(value);
    });
  });

  it('invokes a value function once on successive cache calls', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';
    const valueFn = sinon.stub().returns(value);

    return Promise.all([
      cache(key, valueFn),
      delay(1).then(() => cache(key, valueFn)),
      delay(3).then(() => cache(key, valueFn)),
      delay(5).then(() => cache(key, valueFn))
    ]).then((results) => {
      results.map(observed => expect(observed).to.equal(value));
      expect(valueFn.callCount).to.equal(1);
    });
  });

  it('invokes a value function once on immediate cache calls', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';
    const valueFn = sinon.stub().returns(value);

    return Promise.all([
      cache(key, valueFn),
      cache(key, valueFn),
      cache(key, valueFn),
      cache(key, valueFn)
    ]).then((results) => {
      results.map(observed => expect(observed).to.equal(value));
      expect(valueFn.callCount).to.equal(1);
    });
  });

  it('invokes a value function with the key', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';
    const valueFn = sinon.stub().returns(value);

    return cache(key, valueFn).then(() => {
      const args = valueFn.getCall(0).args;

      expect(args[0]).to.equal(key);
    });
  });
});
