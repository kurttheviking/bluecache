var BlueCache = require('./index');

var cache = BlueCache({
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