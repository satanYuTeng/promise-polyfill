
# Promise/A+ 规范
> https://promisesaplus.com/
> https://juejin.im/post/5b0b8cff518825154c405992

> An open standard for sound, interoperable JavaScript promises—by implementers, for implementers.

由实现者开发，为实现者服务，提供开放的标准，实现可靠，可互操作的JavaScript promise。

> A promise represents the eventual result of an asynchronous operation. The primary way of interacting with a promise is through its then method, which registers callbacks to receive either a promise’s eventual value or the reason why the promise cannot be fulfilled.

promise 表示一个异步操作的最终结果。使用的主要方式是通过 then 方法，他注册了回调函数去接受 promise 最后的结果或者 promise fulfilled 的原因。

> This specification details the behavior of the then method, providing an interoperable base which all Promises/A+ conformant promise implementations can be depended on to provide. As such, the specification should be considered very stable. Although the Promises/A+ organization may occasionally revise this specification with minor backward-compatible changes to address newly-discovered corner cases, we will integrate large or backward-incompatible changes only after careful consideration, discussion, and testing.

规范详细制定了 then 方法的行为，提供了一个所有符合 Promises/A+ 的实现都可以依赖的基础。因此，这个规范应该可以说是非常稳定的。虽然Promises/A+组织有可能会修订这个标准，处理一些新发现的边界情况，但是这些改动都是向后兼容的，如果要整合一个大的或者不向后的兼容的修改，一定会经过小心的考虑与决定，并且会去测试。

> Historically, Promises/A+ clarifies the behavioral clauses of the earlier Promises/A proposal, extending it to cover de facto behaviors and omitting parts that are underspecified or problematic.

从历史上看，Promises/A+ 澄清了Promises/A的提案，覆盖了约定俗成的行为，并且剔除了不足的或者有问题的部分。

> Finally, the core Promises/A+ specification does not deal with how to create, fulfill, or reject promises, choosing instead to focus on providing an interoperable then method. Future work in companion specifications may touch on these subjects.

最后，Promises/A+规范的核心不是去描述如何去创建，完成，拒绝promises，而是专注于提供一个可操作的then方法。未来配套的规范会去定义他们。

> 1. Terminology  
1.1 “promise” is an object or function with a then method whose behavior conforms to this specification.   
1.2. “thenable” is an object or function that defines a then method.   
1.3. “value” is any legal JavaScript value (including undefined, a thenable, or a promise).  
1.4. “exception” is a value that is thrown using the throw statement.   
1.5. “reason” is a value that indicates why a promise was rejected.

1. 术语
1.1 “promise” 是一个符合此规范的object或是function。  
1.2 “thenable” 是一个定义了then方法的object或者function。  
1.3 “value” 代表了一切合法的JavaScript值（包括undefined, thenable, 或者一个promise）。  
1.4 “exception” 代表了通过throw语句扔出的值。  
1.5 “reason” 说明了promise 为什么被 rejected了的值。

> 2. Requirements
2.1. Promise States
A promise must be in one of three states: pending, fulfilled, or rejected.  
2.1.1. When pending, a promise:  
2.1.1.1. may transition to either the fulfilled or rejected state.  
2.1.2. When fulfilled, a promise:  
2.1.2.1. must not transition to any other state.  
2.1.2.2. must have a value, which must not change.  
2.1.3. When rejected, a promise:  
2.1.3.1. must not transition to any other state.  
2.1.3.2. must have a reason, which must not change.  
Here, “must not change” means immutable identity (i.e. ===), but does not imply deep immutability.

2. 要求
2.1 promise的状态 promise只能是pending, fulfilled, rejected三种状态中一种。  
2.1.1 如果处于pending状态，promise:  
2.1.1.1. 可以转化为fulfilled状态或rejected状态。  
2.1.2. 如果处于fulfilled状态，promise:  
2.1.2.1. 不能转化为其他的状态。  
2.1.2.2. 必须是不会变化的value。  
2.1.3. 如果处于rejected状态，promise：  
2.1.3.1. 不能变成其他的状态。  
2.1.3.2. 必须有一个不变的reason。  
在这里，不变指的是完全不变，（可用===校验），但是不是属性不能变。

> 2.2 The then Method  
A promise must provide a then method to access its current or eventual value or reason.  
A promise’s then method accepts two arguments:
```promise.then(onFulfilled, onRejected)```  
2.2.1. Both onFulfilled and onRejected are optional arguments:  
2.2.1.1. If onFulfilled is not a function, it must be ignored.  
2.2.1.2. If onRejected is not a function, it must be ignored.  
2.2.2. If onFulfilled is a function:
  2.2.2.1. it must be called after promise is fulfilled, with promise’s value as its first argument.
  2.2.2.2. it must not be called before promise is fulfilled.
  2.2.2.3. it must not be called more than once.
2.2.3. If onRejected is a function
  2.2.3.1. it must be called after promise is rejected, with promise’s reason as its first argument.
  2.2.3.2. it must not be called before promise is rejected.
  2.2.3.3. it must not be called more than once.
2.2.4. onFulfilled or onRejected must not be called until the execution context stack contains only platform code. [3.1].
2.2.5. onFulfilled and onRejected must be called as functions (i.e. with no this value). [3.2]
2.2.6. then may be called multiple times on the same promise.
  2.2.6.1. If/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then.
  2.2.6.2. If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then.
2.2.7. then must return a promise [3.3].
promise2 = promise1.then(onFulfilled, onRejected);
  2.2.7.1. If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
  2.2.7.2. If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
  2.2.7.3. If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
  2.2.7.4. If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason as promise1.

2.2. then 方法
一个 promise 必须提供 then 方法去访问当前或最终的 value 或者 reason。
一个 promise 的 then 方法接受两个参数：
```promise.then(onFulfilled,onRejected)```
2.2.1. 如果 onFulfilled,onRejected 都是可选参数：
  2.2.1.1. 如果onFulfilled不是function，则必须忽略。
  2.2.1.2. 如果onRejected不是function, 则必须忽略。
2.2.2. 如果onFulfilled是function:
  2.2.2.1. 必须在promise变成fulfilled状态后被调用，value是调用时的第一个参数。
  2.2.2.2. promise的状态没有变成fulfilled时绝对不能调用。
  2.2.2.3. 只能被调用一次。
2.2.3. 如果onRejected是function:
  2.2.3.1. 必须在promise变成rejected状态后被调用，reason是调用时的第一个参数。
  2.2.3.2. promise的状态没有变成rejected时绝对不能调用。
  2.2.3.3. 只能被调用一次。
2.2.4. onFulfilled或onRejected只能执行环境（平台）包含的代码。[3.1]
2.2.5. onFulfilled或onRejected只能作为function调用（不包含this）。[3.2]
2.2.6. then可以被一个promise调用多次。
  2.2.6.1. 当promise变成fulfilled状态时，从一个then开始的所有onFulfilled方法必须按顺序执行。
  2.2.6.2. 当promise变成rejected状态时，从一个then开始的所有onRejected方法必须按顺序执行。
2.2.7. then方法必须返回一个promise。[3.3]
```promise2=promise1.then(onFulfilled,onRejected);```
  2.2.7.1. 如果onFulfilled或者onRejected返回了 value x, 执行Promise 决断过程[[Resolve]](promise2, x)
  2.2.7.2. 如果onFulfilled或者onRejected返回了 exception e, promise2 必须变成rejected状态并且使用e作为reason。
  2.2.7.3. 如果onFulfilled不是function并且promise1是fulfilled状态，promise2必须变为fulfilled状态，并且value与promise1相同。
  2.2.7.4. 如果onRejected不是function并且promise1是rejected状态，promise2必须变为rejected状态，并且reason与promise1相同。

> 2.3. The Promise Resolution Procedure
The promise resolution procedure is an abstract operation taking as input a promise and a value, which we denote as [[Resolve]](promise, x).
If x is a thenable, it attempts to make promise adopt the state of x, under the assumption that x behaves at least somewhat like a promise. Otherwise, it fulfills promise with the value x.
This treatment of thenables allows promise implementations to interoperate, as long as they expose a Promises/A+ compliant then method. It also allows Promises/A+ implementations to “assimilate” nonconformant implementations with reasonable then methods.
To run [[Resolve]](promise, x), perform the following steps:（x is the return of promise）
  2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
  2.3.2. If x is a promise, adopt its state [3.4]:
    2.3.2.1. If x is pending, promise must remain pending until x is fulfilled or rejected.
    2.3.2.2. If/when x is fulfilled, fulfill promise with the same value.
    2.3.2.3. If/when x is rejected, reject promise with the same reason.
  2.3.3. Otherwise, if x is an object or function
    2.3.3.1. Let then be x.then. [3.5]
    2.3.3.2. If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
    2.3.3.3. If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
      2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
      2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r.
      2.3.3.3.3. If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
      2.3.3.3.4. If calling then throws an exception e
        2.3.3.3.4.1. If resolvePromise or rejectPromise have been called, ignore it.
        2.3.3.3.4.2. Otherwise, reject promise with e as the reason.
    2.3.3.4. If then is not a function, fulfill promise with x.
  2.3.4. If x is not an object or function, fulfill promise with x.
If a promise is resolved with a thenable that participates in a circular thenable chain, such that the recursive nature of [[Resolve]](promise, thenable) eventually causes  [[Resolve]](promise, thenable) to be called again, following the above algorithm will lead to infinite recursion.
Implementations are encouraged, but not required, to detect such recursion and reject promise with an informative TypeError as the reason. [3.6]

2.3. Promise的决议过程
Promise的决议过程是一个抽象的运算， 输入为一个promise与一个value值，形式如同[[Resolve]](promise, x),[个人认为x是promise的返回值]
如果x是thenable的（定义了then方法的 object 或者 function ），会尝试使用x的state作为promise的state，前提是x的行为至少像promise，否则，promise使用x去执行。
这种对 thenables (包含then方法的object或者function)的处理使得promise的实现变得更灵活，只要暴露出符合Promises/A+ 的then方法即可。这也同时允许 Promises/A+ 兼容不合规范但是符合then方法的实现（thenable）。
[[Resolve]](promise, x)的执行过程如下：
2.3.1. 如果promise与x是同一个对象，promise使用TypeError作为reason进行reject。
2.3.2. 如果x是一个promise, 判断x的状态：[3.4]
  2.3.2.1. 如果x是pending状态，promise也必须保持pending状态，直到x变为fulfilled或者rejected。
  2.3.2.2. 当x是fulfilled状态，promise使用x的value进行fulfill。
  2.3.2.3. 当x是rejected状态，promise使用x的reason进行reject。
2.3.3. 如果x不是promise，而是object或是function。
  2.3.3.1. 使用x.then作为promise的then。[3.5]
  2.3.3.2. 如果检索x的then属性出错e，promise使用e做为reason进行reject。
  2.3.3.3. 如果then是function，以x为作用域调用then, 像使用this一样，第一个参数是resolvePromise， 第二个参数是rejectPromise。
    2.3.3.3.1. 如果resolvePromise以value y为参数被调用，则执行[[Resolve]](promise, y)。
    2.3.3.3.2. 如果resolvePromise以reason r为参数被调用，则用r为参数reject promise。
    2.3.3.3.3. 如果resolvePromise和rejectPromise都被调用了，或者被同一个参数多次调用，优先执行第一次调用，其余的忽略。
    2.3.3.3.4. 如果调用then时，扔出错误e。
      2.3.3.3.4.1. 如果resolvePromise或者rejectPromise已经被调用，忽略他。
      2.3.3.3.4.2. 否则，以e为reason进行reject。
    2.3.3.4. 如果then不是function，promise fulfill x。
2.3.4. 如果x不是object或者function，promise fulfill x。
如果promise被一个由thenable组成的循环链resolved，那么promise的决策过程将执行决策过程，造成无限递归。鼓励提供对这种递归的检测并且用TypeError去reject promise，但是不是必须去实现。[3.6]

> 3. Notes
3.1 Here “platform code” means engine, environment, and promise implementation code. In practice, this requirement ensures that onFulfilled and onRejected execute asynchronously, after the event loop turn in which then is called, and with a fresh stack. This can be implemented with either a “macro-task” mechanism such as setTimeout or setImmediate, or with a “micro-task” mechanism such as MutationObserver or process.nextTick. Since the promise implementation is considered platform code, it may itself contain a task-scheduling queue or “trampoline” in which the handlers are called.

3. 附录
3.1. 这里的“平台代码”指的是引擎，环境，promise 实现代码。实际上，要求确保onFulfilled和OnRejected异步执行，在then所在的事件轮询后被调用，并且在新的堆栈中。可以用setTimeout或者setImmediate之类的“宏任务”去实现。或者MutationObserver或者process.nextTick之类的“微任务”去实现。因为promise的实现被认为是平台代码，他可能包含自身任务队列。

ps: 异步任务时，JS引擎会将任务划分至macrotask和microtask任务队列，执行一个macrotask的任务后，执行全部的microtask任务，直到所有任务执行完。

> 3.2. That is, in strict mode this will be undefined inside of them; in sloppy mode, it will be the global object.

在严格模式下，this可能为undefined。在马虎模式下，它是全局对象

> 3.3. Implementations may allow promise2 === promise1, provided the implementation meets all requirements. Each implementation should document whether it can produce promise2 === promise1 and under what conditions.

3.3. 如果实现所有要求，可能允许promise2 = promise1，但是每个实现上述规则的实例，都应该记录什么情况下才可以产生promise2 === promise1。

> 3.4. Generally, it will only be known that x is a true promise if it comes from the current implementation. This clause allows the use of implementation-specific means to adopt the state of known-conformant promises.


3.4. 只有符合现有规范的才是真正的promise，该条文允许使用特定的实现方式的库接受符合已知promise的state

> 3.5  This procedure of first storing a reference to x.then, then testing that reference, and then calling that reference, avoids multiple accesses to the x.then property. Such precautions are important for ensuring consistency in the face of an accessor property, whose value could change between retrievals.

3.5. 决议的过程会先缓存x.then的引用，然后测试此引用，然后调用他，避免多次访问他。这种预防措施对确保访问属性的一致性非常重要，因为每次访问的值可能不一样。

> 3.6. Implementations should not set arbitrary limits on the depth of thenable chains, and assume that beyond that arbitrary limit the recursion will be infinite. Only true cycles should lead to a TypeError; if an infinite chain of distinct thenables is encountered, recursing forever is the correct behavior.

3.6. 实现不应该设置thenable链的最大长度，不能假设超过了设置的最大长度就是无限循环的调用。因为只有真正无限递归的调用会扔出TypeError; 如果一个无限链上的每个thenable对象都不同，那他就应该无限调用下去。

