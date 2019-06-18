# promise-polyfill 源码解析
> https://segmentfault.com/a/1190000014368256

## Tips
* CSP violations：内容安全策略   (CSP) 
  * https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP

```
// 检测是否通过new实例化
if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
```

* 当Promise 出现reject的情况时，而没有提供 onRejected 函数时，内部会打印一个错误出来，提示要捕获错误。
```
const pro = new Promise((resolve,reject)=>{setTimeout(function () {
  reject(100);
},1000)});
pro.then(data => console.log(data));  // 会报错
pro.then(data => console.log(data)).catch();  // 会报错
pro.then(data => console.log(data)).catch(()=>{});  // 不会报错
pro.then(data => console.log(data),()=>{})  // 不会报错
```

* 在原型里可以通过 this.constructor 去调用构造函数
```
Promise.prototype.then = function(onFulfilled, onRejected) {
  // 构造一个新的promise实例
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};
```
```
_state === 0  // pending
_state === 1  // fulfilled,执行了resolve函数，并且_value instanceof Promise === false
_state === 2  // rejected,执行了reject函数
_state === 3  // fulfilled,执行了resolve函数，并且_value instanceof Promise === true
```