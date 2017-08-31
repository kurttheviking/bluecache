/* global describe, it */

const expect = require('chai').expect;

const Bluecache = require('../index');

describe('cache parameter: key', () => {
  it('accepts a Boolean key', () => {
    const cache = new Bluecache();

    const key = true;
    const value = 'mark iv';

    const expected = value;

    return cache(key, value).then(() => {
      const isCached = cache._lrucache.has(String(key));

      expect(isCached).to.equal(true);
      expect(cache._lrucache.get(String(key)).value).to.equal(expected);
    });
  });

  it('accepts a Number key', () => {
    const cache = new Bluecache();

    const key = 10;
    const value = 'mark iv';

    const expected = value;

    return cache(key, value).then(() => {
      const isCached = cache._lrucache.has(String(key));

      expect(isCached).to.equal(true);
      expect(cache._lrucache.get(String(key)).value).to.equal(expected);
    });
  });

  it('accepts a String key', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    const expected = value;

    return cache(key, value).then(() => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(cache._lrucache.get(key).value).to.equal(expected);
    });
  });

  it('accepts an Object key', () => {
    const cache = new Bluecache();

    const key = { k: 'jaeger' };
    const value = 'mark iv';

    const expected = value;

    return cache(key, value).then(() => {
      const isCached = cache._lrucache.has(String(key));

      expect(isCached).to.equal(true);
      expect(cache._lrucache.get(String(key)).value).to.equal(expected);
    });
  });

  it('accepts a Promise<String> key', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    const expected = value;

    return cache(Promise.resolve(key), value).then(() => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(cache._lrucache.get(key).value).to.equal(expected);
    });
  });

  it('accepts a Function=>String key', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    const expected = value;

    return cache(() => key, value).then(() => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(cache._lrucache.get(key).value).to.equal(expected);
    });
  });

  it('accepts a Function=>Promise<String> key', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    const expected = value;

    return cache(() => Promise.resolve(key), value).then(() => {
      const isCached = cache._lrucache.has(key);

      expect(isCached).to.equal(true);
      expect(cache._lrucache.get(key).value).to.equal(expected);
    });
  });
});
