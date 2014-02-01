<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.0 compliant" align="right" />
</a>

bluecache
=========

[lru-cache](https://github.com/isaacs/node-lru-cache/issues) via [bluebird](https://github.com/petkaantonov/bluebird)


### Motivation

Provide a API abstraction (with, ready for this...arity parity) of LRU Cache to make it easier to use within a Promise-based architecture.


### Usage

```
var BlueLRU = require("bluecache");
var options = {
  max: 500,
  maxAge: 1000 * 60 * 60
};

var cache = BlueLRU(options);

cache.set("key", "value")
  .then(function () {
    return cache.get("key")
  })
  .then(function (_value) {
    console.log("key => ", _value);  // "key => value"
  });
```


### Options

Options are passed directly to LRU Cache at instantiation; the below documentation is based on the API descriptions of the underlying LRU Cache:

- `max`: The maximum size of the cache, checked by applying the length function to all values in the cache
- `maxAge`: Maximum age in ms; lazily enforced; expired keys will return `undefined`
- `length`: Function called to calculate the length of stored items (e.g. `function(n) { return n.length; }`); defaults to `function(n) { return 1; }`
- `dispose`: Function called on items when they immediately before they are dropped from the cache. Called with parameters (`key`, `value`)
- `stale`: Allow the cache to return the stale (expired via `MaxAge`) value before deleting it
- `reject`: _bluecache only_; Boolean; instructs bluecache to generate rejected promises (rather than resolving to undefined) for missing or expired output from `get`, `peek`, and `has`;  defaults to `false`


### API

**set(key, value)**

Updates the cached `key` to value `value`; updates the "recently-used"-ness of the key. Returns a promise that resolves true.


**get(key)**

Returns a promise that resolves to the cached value of `key`; updates the "recently-used"-ness of the key.


**peek(key)**

Returns a promise that resolves to the cached value of `key` _without_ updating the "recently-used"-ness of the key.


**del(key)**

Returns a promise that resolves to `undefined` after deleting the key from the cache.


**reset()**

Returns a promise that resolves to `undefined` after removing the key from the cache.


**has(key)**

Returns a promise that resolves to either `true` or `false` without updating the "recently-used"-ness; does not impact the use of `stale` data.


**WIP: forEach(function(value,key,cache), [thisp])**

TODO: NOT YET IMPLEMENTED. What is the most useful promise structure for this?


**keys()**

Returns a promise that resolves to an array of the keys in the cache.

```
cache.keys().then(function (keys) {
	console.log(keys);
});
```

**values()**

Returns a promise that resolves to an array of the values in the cache.

```
cache.values().then(function (values) {
	console.log(values);
});
```

### reject

Promises provide a convenient mechanism for handling unexpected data in the flow: rejected Promises. In bluecache, this is particularly helpful because the rejection contains the key as the error argument:

```
var BlueLRU = require('bluecache');

var cache = BlueLRU({
  reject: true,
  max: 100
});

var key = 'jaeger';
var value = 'mark iv';

cache.set(key, value)
	.then(function () {
		return cache.get(key);
	})
	.then(function (_value) {
		console.log(_value + ' = ' + value);
		cache.del(key);
		return;
	})
	.then(function (_value) {
		return cache.get(key);
	})
	.then(function (_value) {
		console.log('if rejection was disabled, _value would = ' + _value);
	}, function (_errorKey) {
		console.log('rejection is on, so the missing key is = ' + _errorKey);
	});
```

Combine these concepts with `Promise.all` as well as `Array.map` and friends and you've got some solid functional programming afoot.


### Release History

| bluecache | [bluebird](https://github.com/petkaantonov/bluebird) | [lru-cache](https://github.com/isaacs/node-lru-cache) | Comment |
| --- | :--- | :--- | :--- |
| 0.1.0 | 1.0.1 | 2.5.0 | |
