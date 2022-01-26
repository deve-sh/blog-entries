# Creating Our Own JavaScript Call, Apply And Bind Functions

![Photo by Alex Azabache from Pexels](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdont_lock_yourself%2Fprimaryimage.jpg?alt=media&token=73f28c14-5ff8-4cdb-bd85-bcc7c368abac)

The `call`, `apply` and `bind` functions are extremely helpful functions in JavaScript that allow us to bind and invoke functions with a different execution context, attach their value of `this` to an object of our preference.

Note: This blog post requires some basic knowledge of JavaScript and execution contexts.

Resources:

- [Execution context, Scope chain and JavaScript internals
  ](https://medium.com/@happymishra66/execution-context-in-javascript-319dd72e8e2c)
- ['this' keyword in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [JavaScript Prototypes](https://www.programiz.com/javascript/prototype)

### Function.call

We're just going to use Prototypes to add a common `callWith` function to all functions in our code, it will act as a polyfill for the `call` function.

So a little context:

```javascript
const obj = {
	a: 1,
	b() {
		console.log(this.a);
	}, // 1
};
```

The value of `this` inside a function declared or attached to an object is the object itself. We'll be using this to our advantage in our implementation of `call`, `apply` and `bind`.

Let's check the syntax of the call function and try creating our own:
![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-our-own-javascript-call-apply-bind-functions%2Fsecondaryimages%2Fimage1642914936381.png?alt=media&token=445ccd77-79b0-4cad-9f32-e78e88c8fd9b)

```javascript
Function.prototype.callWith = function (context, ...args) {
	const updatedContext = {
		...context,
		func: this, // 'this' refers to the function that this prototype is running on
	};
	// We have to invoke the function now. The 'this' keyword will now refer to 'updatedContext' that the user has passed.
	return updatedContext.func(...args);

	/*// Simpler approach, but readable code is better than performant code
        context.func = this;
        context.func(...args);
    */
};

// Usage
function nonBindedFunc(arg1, arg2) {
	console.log(this.a, arg1, arg2);
}

nonBindedFunc.callWith({ a: 1 }, 2, 3);
```

### Function.apply

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-our-own-javascript-call-apply-bind-functions%2Fsecondaryimages%2Fimage1642914905086.png?alt=media&token=3e6eef9e-bd55-48e1-98ec-9dd3e4767b86)

The `apply` function is very similar to `call`, the only difference being that the arguments to the function are passed as an array instead of regular function arguments. So there's only one change we have to make to the function, which is the type of `args`.

```javascript
Function.prototype.applyWith = function (context, args = []) {
	const updatedContext = { ...context, func: this };
	return updatedContext.func(...args);
};

// Usage
function nonBindedFunc(arg1, arg2) {
	console.log(this.a, arg1, arg2);
}

nonBindedFunc.applyWith({ a: 1 }, [2, 3]);
```

### Function.bind

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-our-own-javascript-call-apply-bind-functions%2Fsecondaryimages%2Fimage1642914882278.png?alt=media&token=bffde626-eba2-46e0-a38f-0d3c1b3da5e3)

Unlike `call` and `apply` that create a new binded function and also invoke it, `bind` just returns a copy of the binded function and let's you choose when to invoke it.

Since we already have created our `applyWith` and `callWith` prototype functions, we can simply use them to our advantage to create our implementation of `bindWith`.

```javascript
Function.prototype.bindWith = function (context, ...args) {
	const func = this;
	return function () {
		return func.applyWith(context, args); // or func.callWith(context, ...args);
	};
};

// Usage
function nonBindedFunc(arg1, arg2) {
	console.log(this.a, arg1, arg2);
}

const bindedFunc = nonBindedFunc.bindWith({ a: 1 });
// ... You decide when to execute this now since the function is already binded
bindedFunc(2, 3);
```

**Note**: Instead of using `...args` everywhere, in case we don't know about the list of arguments, we could use the inbuild `arguments` variable available to each function for dynamic arguments passed into a function.

**Exceptions**: Arrow functions do not work with these approaches, since their working of `this` keyword is different. For reference, [check this page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).
