/* global  describe, it, beforeEach */

const delay = require('delay');
const expect = require('chai').expect;

const Bluecache = require('../index');

describe('cache#on', () => {
  describe('cache:hit', () => {
    const key = 'jaeger';
    const value = 'mark iii';

    const observations = {};

    beforeEach((done) => {
      delete observations.key;
      delete observations.ms;

      const cache = new Bluecache();
      const valueFn = () => delay(Math.ceil(Math.random() * 10)).then(() => value);

      cache.on('cache:hit', (data) => {
        observations.key = data.key;
        observations.ms = data.ms;

        done();
      });

      cache(key, valueFn).then(() => cache(key, valueFn));
    });

    it('emits with valid parameters', () => {
      expect(typeof observations.key).to.equal('string');
      expect(typeof observations.ms).to.equal('number');
    });

    it('emits with resolved key', () => {
      expect(observations.key).to.equal(key);
    });

    it('emits with minimal delay', () => {
      expect(observations.ms).to.be.above(-1);
      expect(observations.ms).to.be.below(11);
    });
  });

  describe('cache:miss', () => {
    const key = 'jaeger';
    const value = 'mark iii';

    const observations = {};

    beforeEach((done) => {
      const cache = new Bluecache();
      const valueFn = () => delay(Math.ceil(Math.random() * 10)).then(() => value);

      cache.on('cache:miss', (data) => {
        observations.key = data.key;
        observations.ms = data.ms;

        done();
      });

      cache(key, valueFn);
    });

    it('emits with valid parameters', () => {
      expect(typeof observations.key).to.equal('string');
      expect(typeof observations.ms).to.equal('number');
    });

    it('emits with resolved key', () => {
      expect(observations.key).to.equal(key);
    });

    it('emits with minimal delay', () => {
      expect(observations.ms).to.be.above(-1);
      expect(observations.ms).to.be.below(11);
    });
  });
});
