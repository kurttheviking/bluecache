<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.0 compliant" align="right" />
</a>

bluecache [![Build Status](https://travis-ci.org/kurttheviking/bluecache.svg?branch=master)](https://travis-ci.org/kurttheviking/bluecache)
===================

In-memory, Promises/A+, read-through [lru-cache](https://github.com/isaacs/node-lru-cache) via [bluebird](https://github.com/petkaantonov/bluebird)


## Usage

First, instantiate the cache &ndash; passing [options](https://github.com/kurttheviking/bluecache#options) if necessary.

```
var BlueLRU = require("bluecache");
var options = {
  max: 500,
  maxAge: 1000 * 60 * 60
};

var cache = BlueLRU(options);
```

Traditional cache "getting" and "setting" takes place within a single call, promoting functional use. The `cache` instance is a Promise-returning function which takes two parameters: a String for the cache key and a Promise-returning function that resolves to a value to store in the cache. The cached value can be of any type.

```
cache('key', function (_key) {
  console.log("the resolved key => ", _key);
  return Promise.resolve('value');
})
.then(function (cachedValue) {
  console.log("cached value => ", _value);  // "key => value"
})
```

Note: the priming function is invoked with the resolved key. Thus, the key can be used to determine the behavior of the priming function without storing the key in higher-level scope.


## Options

Options are passed to [lru-cache](https://github.com/isaacs/node-lru-cache#options) at instantiation.

- `max`: The maximum size of the cache, checked by applying the length function to all values in the cache
- `maxAge`: Maximum age in ms (or a valid [interval](https://www.npmjs.com/package/interval)); lazily enforced; expired keys will return `undefined`
- `length`: Function called to calculate the length of stored items (e.g. `function (n) { return n.length; }`); defaults to `function (n) { return 1; }`
- `dispose`: Function called on items immediately before they are dropped from the cache; called with parameters (`key`, `value`)
- `stale`: Allow the cache to return the stale (expired via `MaxAge`) value before deleting it


## Emitted events

The cache instance is also an [event emitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) which provides an `on` method against which the implementing application can listen for the below events.


#### cache:hit

```
{
  'key': <String>,
  'ms': <Number:Integer:Milliseconds>
}
```

Note: `ms` is milliseconds elapsed between cache invocation and final resolution of the cached value.


#### cache:miss

```
{
  'key': <String>,
  'ms': <Number:Integer:Milliseconds>
}
```

Note: `ms` is milliseconds elapsed between cache invocation and final resolution of the priming function.


## API

#### cache(key, primingFunction)

Attempts to get the current value of `key` from the cache. If the key exists, the "recently-used"-ness of the key is updated and the cached value is returned. If the key does not exist, the `primingFunction` is executed and the returned Promise resolved to its underlying value before being set in the cache and returned. (To support advanced cases, the key can also be a Promise for a String.)

A rejected promise is returned if either `key` or `primingFunction` is missing.


#### cache.del(key)

Returns a promise that resolves to `undefined` after deleting `key` from the cache.


#### cache.on(eventName, eventHandler)

`eventName` is a string, corresponding to a [supported event](https://github.com/kurttheviking/bluecache#emitted-events). `eventHandler` is a function which responds to the data provided by the target event.

```
cache.on('cache:hit', function (data) {
  console.log('The cache took ' + data.ms + ' milliseconds to respond.');
});
```


#### cache.reset()

Returns a promise that resolves to `undefined` after removing all data from the cache.


## Contribute

PRs are welcome! For bugs, please include a failing test which passes when your PR is applied.


## Release history

The `0.1.x` versions focused on API parity with the underlying lru-cache. However, [Bluebird promisification](https://github.com/petkaantonov/bluebird/blob/master/API.md#promisification) makes that use case unnecessary (though perhaps a bit more complicated). For version specific release notes, see the [release history on GitHub](https://github.com/kurttheviking/bluecache/releases).
