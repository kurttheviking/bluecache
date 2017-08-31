const isFunction = require('./isFunction');

function resolveValue(key, value) {
  if (isFunction(value)) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(value(key));
      } catch (err) {
        return reject(err);
      }
    });
  }

  return Promise.resolve(value);
}

module.exports = resolveValue;
