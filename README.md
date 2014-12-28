<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.0 compliant" align="right" />
</a>

bluecache
=========

In-memory, read-through, Promises/A+, [lru-cache](https://github.com/isaacs/node-lru-cache/issues) via [bluebird](https://github.com/petkaantonov/bluebird)


### Usage

First, instantiate the cache, passing [options](https://github.com/kurttheviking/bluecache#Options) if necessary.

```
var BlueLRU = require("bluecache");
var options = {
  max: 500,
  maxAge: 1000 * 60 * 60
};

var cache = BlueLRU(options);
```

Traditional LRU cache "getting" and "setting" takes place within a single call, promoting functional use. The `cache` instance is a Promise-returning function which takes two parameters: a String for the cache key and a Promise-returning function which resolves to the value to store in the cache. The cached value can be of any type.

```
cache('key', function () {
  return Promise.resolve('value');
})
.then(function (cachedValue) {
  console.log("cached value => ", _value);  // "key => value"
})
```


### Options

Options are passed directly to LRU Cache at instantiation; the below documentation is based on the API descriptions of the underlying LRU Cache:

- `max`: The maximum size of the cache, checked by applying the length function to all values in the cache
- `maxAge`: Maximum age in ms; lazily enforced; expired keys will return `undefined`
- `length`: Function called to calculate the length of stored items (e.g. `function(n) { return n.length; }`); defaults to `function(n) { return 1; }`
- `dispose`: Function called on items when they immediately before they are dropped from the cache. Called with parameters (`key`, `value`)
- `stale`: Allow the cache to return the stale (expired via `MaxAge`) value before deleting it


### Emitted events

The cache instance is also an [event emitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) which provides an `on` method against which the implementing application can listen for certain events.


**cache:hit**

```
{
  'key': <String>,
  'ms': <Number:Integer:Milliseconds>
}
```
Note: `ms` is milliseconds elapsed between cache invocation and final resolution of the cached value.


**cache:miss**

```
{
  'key': <String>,
  'ms': <Number:Integer:Milliseconds>
}
```
Note: `ms` is milliseconds elapsed between cache invocation and final resolution of the value function.


### API

**cache(key, promiseFn)**

Attempts to get the current value of `key` from the cache. If the key exists, the "recently-used"-ness of the key is updated and the cached value is returned. If the key does not exist, the `promiseFn` is resolved to its underlying value before being set in the cache and returned. (To support advanced cases, the key can also be a Promise for a String.)

If either `key` or `promiseFn` are missing, the cache instance returns a rejected promise.


**cache.del(key)**

Returns a promise that resolves to `undefined` after deleting `key` from the cache.


**cache.on(eventName, eventHandler)**

`eventName` is a string, currently either `cache:hit` or `cache:miss`. `eventHandler` is a function which responds to the data provided by the target event.

```
cache.on('cache:hit', function (data) {
  console.log('The cache took ' + data.ms + ' milliseconds to respond.');
});
```


**cache.reset()**

Returns a promise that resolves to `undefined` after removing all data from the cache.


### Contribute

PRs are welcome! For bugs, please include a failing test which passes when your PR is applied.


### Release History

| bluecache | [bluebird](https://github.com/petkaantonov/bluebird) | [lru-cache](https://github.com/isaacs/node-lru-cache) |
| --- | :--- | :--- |
| 0.1.x | 1.0.1 | 2.5.0 |
| 0.2.x | 2.3.11 | 2.5.0 |
