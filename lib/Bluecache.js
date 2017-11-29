const EventEmitter = require('events').EventEmitter;
const LRU = require('lru-cache');
const ms = require('ms');

const isFunction = require('./utils/isFunction');
const resolveKey = require('./utils/resolveKey');
const resolveValue = require('./utils/resolveValue');

function BlueCache(opts) {
  if (!(this instanceof BlueCache)) {
    return new BlueCache(opts);
  }

  const options = opts || {};

  if (typeof options.maxAge === 'string') {
    options.maxAge = ms(options.maxAge);
  }

  if (typeof options.pruneInterval === 'string') {
    options.pruneInterval = ms(options.pruneInterval);
  }

  const getMemoLength = isFunction(options.length) ? options.length : () => 1;

  // [KE] ensure that the memo's length property is always used;
  //      any user-specified length is set to memo.length
  options.length = memo => memo.length;

  const bus = new EventEmitter();
  const lrucache = LRU(options);

  if (options.pruneInterval) {
    setInterval(lrucache.prune.bind(lrucache), options.pruneInterval);
  }

  function cache(key, value) {
    const timestart = Date.now();

    function emit(memoKey, wasHit) {
      bus.emit(
        wasHit ? 'cache:hit' : 'cache:miss',
        {
          key: memoKey,
          ms: Date.now() - timestart
        }
      );
    }

    if (key === undefined || key === null) {
      return Promise.reject(new Error('missing key'));
    }

    return resolveKey(key).then((finalKey) => {
      const hit = lrucache.get(finalKey);

      if (hit) {
        emit(finalKey, true);

        return hit.value;
      }

      const memo = {
        value: resolveValue(finalKey, value),
        length: 1
      };

      lrucache.set(finalKey, memo);

      return memo.value.then((result) => {
        memo.value = result;
        memo.length = getMemoLength(result);

        emit(finalKey, false);

        // [KE] need to communicate updated length
        lrucache.set(finalKey, memo);

        return result;
      }).catch((err) => {
        lrucache.del(finalKey);

        throw err;
      });
    });
  }

  function del(key) {
    return resolveKey(key).then(finalKey => lrucache.del(finalKey));
  }

  function on() {
    return bus.on.apply(bus, arguments);
  }

  function reset() {
    cache._lrucache.reset(); // eslint-disable-line no-underscore-dangle

    return Promise.resolve(null);
  }

  cache.del = del;
  cache.on = on;
  cache.reset = reset;
  cache._lrucache = lrucache; // eslint-disable-line no-underscore-dangle

  return cache;
}

module.exports = BlueCache;
