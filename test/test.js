var chai = require('chai');
var should = chai.should();

var LRU = require('lru-cache');
var BlueLRU = require('../index');
var Promise = require('bluebird');

describe('bluecache ->', function () {

  describe('gets and sets ->', function () {
    var bcache = BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var value = 'mark iv';

    lcache.set(key, value);
    var expectedValue = lcache.get(key);
    var observedValue;

    beforeEach(function (done) {
      bcache.set(key, value)
        .then(function () {
          return bcache.get(key);
        })
        .then(function (_value) {
          observedValue = _value;
          done();
        });
    });
   
    it('like lru-cache', function () {
      chai.expect(observedValue).equals(expectedValue);
    });
  });

  describe('deletes ->', function () {
    var bcache = BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var observedValue;

    beforeEach(function (done) {
      bcache.set(key, value)
        .then(function () {
          bcache.del(key);
          return;
        })
        .then(function (_value) {
          observedValue = _value;
          done();
        });
    });
   
    it('and returns undefined', function () {
      should.not.exist(observedValue);
    });
  });

  describe('optionally rejects ->', function () {
    var bcache = BlueLRU({
      reject: true
    });

    var key = 'jaeger';
    var value = 'mark iv';

    var observedValue = true;

    beforeEach(function (done) {
      bcache.set(key, value)
        .then(function () {
          bcache.del(key);
          return;
        })
        .then(function () {
          return bcache.get(key);
        })
        .then(function (_value) {
          observedValue = _value;
          done();
        }, function (_errorKey) {
          observedValue = _error;
          done();
        });
    });
   
    it('if getting an deleted key', function () {
      chai.expect(observedValue).equals(key);
    });
  });

  describe('peeks ->', function () {
    var bcache = BlueLRU();
    var lcache = LRU();

    var key = 'jaeger';
    var value = 'mark iv';

    lcache.set(key, value);
    var expectedValue = lcache.peek(key);
    var observedValue;

    beforeEach(function (done) {
      bcache.set(key, value)
        .then(function () {
          return bcache.peek(key);
        })
        .then(function (_value) {
          observedValue = _value;
          done();
        });
    });
   
    it('like lru-cache', function () {
      chai.expect(observedValue).equals(expectedValue);
    });
  });

  describe('has ->', function () {
    var bcache = BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var expectedValue = true;
    var observedValue;

    beforeEach(function (done) {
      bcache.set(key, value)
        .then(function () {
          return bcache.has(key);
        })
        .then(function (_value) {
          observedValue = _value;
          done();
        });
    });
   
    it('like lru-cache', function () {
      chai.expect(observedValue).to.be.true;
    });
  });

  describe('has not ->', function () {
    var bcache = BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var expectedValue = true;
    var observedValue;

    beforeEach(function (done) {
      bcache.set(key, value)
        .then(function () {
          return bcache.has(key + '_the_large');
        })
        .then(function (_value) {
          observedValue = _value;
          done();
        });
    });
   
    it('like lru-cache', function () {
      chai.expect(observedValue).to.be.false;
    });
  });

  describe('resets ->', function () {
    var bcache = BlueLRU();

    var key = 'jaeger';
    var value = 'mark iv';

    var observedValue;

    beforeEach(function (done) {
      bcache.set(key, value)
        .then(function () {
          bcache.reset();
          return;
        })
        .then(function () {
          return bcache.get(key);
        })
        .then(function (_value) {
          observedValue = _value;
          done();
        });
    });
   
    it('and returns undefined', function () {
      should.not.exist(observedValue);
    });
  });

  describe('keys ->', function () {
    var bcache = BlueLRU();
    var lcache = LRU();

    var key1 = 'jaeger';
    var value1 = 'mark iv';

    var key2 = 'keiju';
    var value2 = 'kaiceph';

    lcache.set(key1, value1);
    lcache.set(key2, value2);

    var expectedValue = lcache.keys();
    var observedValue;

    beforeEach(function (done) {
      bcache.set(key1, value1)
        .then(function () {
          return bcache.set(key2, value2);
        })
        .then(function () {
          return bcache.keys();
        })
        .then(function (_value) {
          observedValue = _value;
          done();
        });
    });
   
    it('like lru-cache', function () {
      chai.expect(observedValue).deep.equals(expectedValue);
    });
  });

  describe('values ->', function () {
    var bcache = BlueLRU();
    var lcache = LRU();

    var key1 = 'jaeger';
    var value1 = 'mark iv';

    var key2 = 'keiju';
    var value2 = 'kaiceph';

    lcache.set(key1, value1);
    lcache.set(key2, value2);

    var expectedValue = lcache.values();
    var observedValue;

    beforeEach(function (done) {
      bcache.set(key1, value1)
        .then(function () {
          return bcache.set(key2, value2);
        })
        .then(function () {
          return bcache.values();
        })
        .then(function (_value) {
          observedValue = _value;
          done();
        });
    });
   
    it('like lru-cache', function () {
      chai.expect(observedValue).deep.equals(expectedValue);
    });
  });

});
