const isFunction = require('./isFunction');

function resolveKey(key) {
  if (isFunction(key)) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(key()).then(String);
      } catch (err) {
        return reject(err);
      }
    });
  }

  return Promise.resolve(key).then(String);
}

module.exports = resolveKey;
