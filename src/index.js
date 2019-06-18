import promiseFinally from './finally';

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  /** @type {!number} 
  * Promise内部状态码
  * _state: 0 padding  _value:{undefined}
  * _state: 1 onResolved  _value:{正常值}
  * _state: 2 onRejected  _value:{值 || 异常对象}
  * _state: 3 onResolved  _value:{Promise}
  */
  this._state = 0;
  /** @type {!boolean} */
  // onFulfilled,onRejected是否被处理过
  this._handled = false;
  /** @type {Promise|undefined} */
  // Promise 内部值，resolve 或者 reject返回的值
  this._value = undefined;
  /** @type {!Array<!Function>} */
  // 存放 Handle 实例对象的数组，缓存 then 方法传入的回调
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    // _value 为 promise
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    // deferred.promise ：第一个 Promise then 方法 返回的新 Promise 对象
    // 这里调用下一个 Promise 对象的 then 方法的回调函数
    // 如果当前 Promise resolve 了，则调用下一个 Promise 的 resolve方法，反之，则调用下一个 Promise 的 reject 回调
    // 如果当前 Promise resolve 了，则调用下一个 Promise 的 resolve方法
    // cb回调方法：如果自己有onFulfilled||onRejected方法，则执行自己的方法；如果没有，则调用下一个 Promise 对象的onFulfilled||onRejected
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      // 自己没有回调函数，进入下一个 Promise 对象的回调
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      // 自己有回调函数，进入自己的回调函数
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    // 处理下一个 Promise 的 then 回调方法
    // ret 作为上一个Promise then 回调 return的值 => 返回给下一个Promise then 作为输入值，当前 then 方法一定要 return 下一个值的操作
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // resolve 的值不能为本身 this 对象
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      // thenable
      var then = newValue.then;
      if (newValue instanceof Promise) {
        // 返回promise
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  //  Promise reject 情况，但是 then 方法未提供 reject 回调函数参数 
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      // 未实现 catch 函数
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    // 这里调用之前 then 方法传入的onFulfilled, onRejected函数
    // self._deferreds[i] => Handler 实例对象
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * Handle 构造函数
 * @param onFulfilled resolve 回调函数
 * @param onRejected reject 回调函数
 * @param promise 下一个 promise 实例对象
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  // done变量保护 resolve 和 reject 只执行一次
  // 这个done在 Promise.race()函数中有用
  var done = false;
  try {
    // 立即执行 Promise 传入的 fn(resolve,reject)
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  // 构造一个新的promise实例
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  // 解决 promise 链式调用的问题
  return prom;
};

Promise.prototype['finally'] = promiseFinally;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!arr || typeof arr.length === 'undefined')
      throw new TypeError('Promise.all accepts an array');
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        // 如果 val 是 Promise 对象的话，则执行 Promise,直到 resolve 了一个非 Promise 对象
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(values) {
  return new Promise(function(resolve, reject) {
    for (var i = 0, len = values.length; i < len; i++) {
      // 因为doResolve方法内部 done 变量控制了对 resolve reject 方法只执行一次的处理
      // 所以这里实现很简单，清晰明了，最快的 Promise 执行了  resolve||reject，后面相对慢的Promise都不执行
      values[i].then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  (typeof setImmediate === 'function' &&
    function(fn) {
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

export default Promise;
