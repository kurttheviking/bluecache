bluecache
=========

[![Build Status](https://travis-ci.org/kurttheviking/bluecache.svg?branch=master)](https://travis-ci.org/kurttheviking/bluecache) [![Coverage Status](https://coveralls.io/repos/github/kurttheviking/bluecache/badge.svg?branch=master)](https://coveralls.io/github/kurttheviking/bluecache?branch=master)

Read-through, in-memory, least recently used (lru) cache


## Use

First, instantiate the cache &ndash; passing [options](https://github.com/kurttheviking/bluecache#options) if necessary.

```js
const Bluecache = require('bluecache');
const options = {
  max: 500,
  maxAge: '1h'
};

const cache = Bluecache(options);
```

Traditional cache "getting" and "setting" takes place within a single call, promoting functional use. The `cache` instance is a Promise-returning function which takes two parameters: a cache key and a priming value.

```js
cache(Promise.resolve('dinosaur'), (key) => {
  console.log(`the invoked key was: ${key}`); // "the invoked key was: dinosaur"
  return Promise.resolve('rar');
})
.then((value) => {
  console.log(`the invoked key is: ${value}`); // "the resolved value is: rar"
});
```


## Options

Options are passed to [lru-cache](https://github.com/isaacs/node-lru-cache#options) at instantiation:

- `max`: The maximum size of the cache, checked by applying the length function to all values in the cache
- `maxAge`: Maximum age in ms (or a valid [ms expression](https://www.npmjs.com/package/ms)); lazily enforced; expired keys will return `undefined`
- `length`: Function called to calculate the length of stored items (e.g. `function (n) { return n.length; }`); defaults to `function (n) { return 1; }`
- `dispose`: Function called on items immediately before they are dropped from the cache; called with parameters (`key`, `value`)
- `stale`: Allow the cache to return a stale (expired via `maxAge`) value before it is deleted

In addition, the following options are specific to bluecache:

- `pruneInterval`: Interval at which the cache will pro-actively remove stale entries; by default stale items remain in memory until the next attempted read

Note: the underlying cache stores a memo for the promised value and a default length of 1 while the value is being resolved. After the value is first resolved, the `length` is updated to reflect the desired `options.length` passed at instantiation. (In short, peak cache "max" may exceed the specified `max` while values are being resolved.)


## API

### cache(`key`, `primingValue`)

Attempts to get the current value of `key` from the cache. If the `key` was previously used, the "recently-used"-ness of the `key` is updated and the cached value is returned. If the `key` does not exist, the `primingValue` is determined and the underlying cache value is set. If the `primingValue` is a function, it is invoked with the resolved `key` (resolved as a `String`) as its single argument.

Both `key` and `primingValue` can be a `Boolean`, `Number`, `String`, `Symbol`, `Object`, a `Function` that returns one of these primitives, or a `Promise` that resolves to one of these primitives.

By immediately caching and returning a `Promise`, the cache avoids a [stampede](https://en.wikipedia.org/wiki/Cache_stampede) for the target `primingValue`. However, a stampede may occur for a `key` because it resolves on each cache call. If you plan to asynchronously resolve the `key`, consider caching the `key` function as well.

A rejected `Promise` is returned if `key` is empty (`null` or `undefined`) or if there is an error resolving the `primingValue`.

### cache#del(`key`)

Returns a `Promise` that resolves to `undefined` after deleting `key` from the cache.

### cache#on(`eventName`, `eventHandler`)

`eventName` is a string, corresponding to a [supported event](https://github.com/kurttheviking/bluecache#emitted-events). `eventHandler` is a function which responds to the data provided by the target event.

```js
cache.on('cache:hit', (data) => {
  console.log(`The cache took ${data.ms} milliseconds to respond to key: ${key}.`);
});
```


## Emitted events

The cache instance is also an [event emitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) which provides an `on` method against which the implementing application can listen for the below events.

### `cache:hit`

```js
{
  'key': <String>,
  'ms': <Number:Integer:Milliseconds>
}
```

Note: `ms` is milliseconds elapsed between cache invocation and final resolution of the cached value.

### `cache:miss`

```js
{
  'key': <String>,
  'ms': <Number:Integer:Milliseconds>
}
```

Note: `ms` is milliseconds elapsed between cache invocation and final resolution of the priming value.


## Changelog

### v3 &rarr; v4

- [breaking] Dropped Bluebird in favor of native promises
- [breaking] Errored values (and rejected promises) are no longer held in cache
- [breaking] Rewritten to use [ES6 (ES2015, Node.js 4+) language features](https://developers.google.com/web/shows/ttt/series-2/es2015)

### v2 &rarr; v3

- [breaking] Removed support for [interval `Object`](https://www.npmjs.com/package/interval) options in favor of [ms expression](https://www.npmjs.com/package/ms)
- [minor] Added support for automatic pruning via `pruneInterval` option

### v1 &rarr; v2

- [breaking] Addressed thundering herd problem identified by @ketilovre and others (a minor api change but the side-effects in underlying `_lrucache` are considered breaking)
- [breaking] Removed `#reset` instance method which was abused in practice; use a key-specific `#del` instead
- [minor] Generalized key and priming values to any primitive, promise, or function
- [patch] Upgraded dependencies
- [patch] Reorganized test suite


## Contribute

PRs are welcome! For bugs, please include a failing test which passes when your PR is applied.


## Tests

To run the unit test suite:

```sh
npm test
```

Or, to determine unit test coverage:

```sh
npm run coverage
```

This project maintains 100% coverage of statements, branches, and functions.
