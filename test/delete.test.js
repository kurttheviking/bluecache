/* global  describe, it */

const expect = require('chai').expect;

const Bluecache = require('../index');

describe('cache#del', () => {
  it('removes" an item from the underlying cache', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    return cache(key, value).then(() => cache.del(key)).then(() => {
      expect(cache._lrucache.get(key)).to.equal(undefined);
    });
  });

  it('resolves to undefined', () => {
    const cache = new Bluecache();

    const key = 'jaeger';
    const value = 'mark iv';

    return cache(key, value).then(() => cache.del(key)).then((out) => {
      expect(out).to.equal(undefined);
    });
  });
});
