# Let's Build Redux From Scratch

![Redux is a nice, intuitive state management system](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-create-redux-from-scratch-in-two-languages%2Fprimaryimage.jpg?alt=media&token=6e37b97a-f475-476e-b044-af557c5902f9)

Redux is a simple and intuitive state-management library for any framework. In this post, we are going to build a simple version of Redux ourselves, with support for multiple reducers, subscribers and dispatchers. There is a slight twist though, I've written it in both JavaScript, as well as Python to show how the concepts Redux uses are portable to any framework, any language you might be working with.

### Pre-Requisites
- Little Knowledge of JavaScript / Python
- Sound Knowledge of Redux Concepts (We'll be going fairly fast here)

For this post, I'll only be using JavaScript, but you can take a look at the Python implementation as well in [this repository](https://github.com/deve-sh/Reverse-Engineered/tree/main/Redux).

### What is Redux
For those of you who skipped the part above, Redux is a library that allows you to create a global state from which parts of your application can read, so the state is available to the entire app and you don't have to worry about passing data between two components of the app through patterns like [props](https://reactjs.org/docs/components-and-props.html) and [prop-drilling](https://kentcdodds.com/blog/prop-drilling/).

As a note, you can check out the result at [this repository here](https://github.com/deve-sh/Reverse-Engineered/tree/main/Redux).

### Setting Up Our Redux Class
Let's set up our Redux class that will contain the state for the application and the methods to get and set states, along with a record of subscribers, which we notify any time the state of the application changes (Very useful when you have things like selectors listening to state changes).

```javascript
class Redux {
    // # -> Private Variable
    #state = {};
    #reducers = {};
    #subscribers = [];

    constructor(reducers, initialState) {
        ...
    }
    ...
}
```
### Setting Up Our Constructor
There is a bit of code that has to be run to initialize our Redux class, we'll put it inside its constructor.
```javascript
constructor(reducers, initialState) {
	if (!reducers || !initialState || !initialState instanceof Object)
		throw new Error("Reducers and initialState are required.");
	this.#state = initialState || {};
	this.#reducers = reducers || (() => null);
	this.#subscribers = [];
}
```
### Adding functionality for multiple reducers
The official Redux library has a [`combineReducers`](https://redux.js.org/api/combinereducers) function, which lets you define multiple reducers, and combine them to form one big store with each reducer responsible for their own state. The result of `combineReducers` can then be passed to the `createStore` function.

In a typical Redux setup, you will do something like:

```javascript
const reducerMap = {
    todos: todosReducer,
    posts: postsReducer
}

rootReducer = combineReducers(reducerMap)
```

Since we don't have to do anything extra, we will simply have the `combineReducers` function return the reducerMap it is passed, which can be later used to create the store.

```javascript
function combineReducers(reducerMap = {}) {
	return reducerMap;
}
```

### Setting up function to check if there is only one reducer or multiple

There can be multiple reducers for a redux store, using `combineReducers`, in that case, we need to setup a function to differentiate, in case there are multiple reducers, each reducer makes "scoped changes", I.E: It only changes the part of the state it is responsible for.
```javascript
#isSingleReducer() {
	return (
		this.#reducers instanceof Function ||
		!this.#reducers instanceof Object ||
		Object.keys(this.#reducers).length === 0
	);
}
```

### Setting Up Our Getter and Setter Functions

```javascript
getState() {
	return this.#state;
}

#setState(newState) {
	if (!newState || !newState instanceof Object) return;
	this.#state = newState;
	this.#notifySubscribers();
}
```

### Setting Up Our Dispatcher

Dispatchers are functions that allow you to pass actions to your reducers, to update the state accordingly, you pass the dispatch function an action and it invokes the reducer accordingly. In the case of multiple reducers, it passes the action to every reducer.

```javascript
dispatch(action) {
	let newState = this.getState();
	if (!this.#isSingleReducer()) {
		for (let reducer in this.#reducers) // Applying action based on each reducer.
			if (this.#reducers[reducer] instanceof Function)
				newState[reducer] = this.#reducers[reducer](
					newState[reducer] || {},
					action
				);
	} else {
		newState = this.#reducers instanceof Function
				? this.#reducers(this.#state, action)
				: newState;
	}

	this.#setState(newState);
}
```

### Setting Up Our Subscribers using the Observer Pattern

The [Observer pattern](https://refactoring.guru/design-patterns/observer) is a design pattern that allows modules/objects/functions to communicate with one another, we are going to use this pattern in order to subscribe to state changes.

```javascript
subscribe(callbackFunction) {
	// Check if functiion has already been added to list of subscribers.
	for (let i = 0; i < this.#subscribers.length; i++)
		if (this.#subscribers[i] === callbackFunction) return;
	this.#subscribers.push(callbackFunction);
}

unsubscribe(callbackFunction) {
	this.#subscribers = this.#subscribers.filter(
		(func) => func !== callbackFunction
	);
}

#notifySubscribers() {
	if (this.#subscribers.length) {
		// Notify subscribers of change to state.
		for (let func of this.#subscribers) func(this.getState());
	}
}

// # -> Private Class Method
#setState(newState) {
	if (!newState || !newState instanceof Ogbject) return;
	this.#state = newState;
	this.#notifySubscribers();
}
```

### Setting up our Singleton

A singleton is a class that is only instantiated once, it's a useful [design pattern](https://refactoring.guru/design-patterns/singleton) to avoid duplication of instances and to maintain only one control point of a resource, for example, the global state should only be one, an application should only have one connection to a database.

```javascript
function createStore(reducers, initialState) {
	if (instance) return instance;
	else {
                // ... Perform initiateState and reducer checks
		instance = new Redux(reducers, initialState);
		return instance;
	}
}
```

### Adding Reducer and initialState checks to createStore
There might be createStore calls that might not have the second argument as the initialState, so in those cases we need to get a default initial state by passing an empty action to all the reducers. So the `createStore` function becomes:

```javascript
function createStore(reducers, initialState) {
	if (instance) return instance;
	else {
		if (!reducers) throw new Error("Reducers not passed to createStore");
		if (!initialState) {
			// Setting up initialState from the default value returned by the reducer.
			if (reducers instanceof Function) {
				initialState = reducers(undefined, {}) || {};
			} else if (reducers instanceof Object) {
				// Multiple reducers passed.
				initialState = {};
				for (let reducer in reducers)
					initialState[reducer] = reducers[reducer](undefined, {});
			}
		}
		instance = new Redux(reducers, initialState);
		return instance;
	}
}
```

### Full Code
Putting it all together, we get:
```javascript
class Redux {
	#state = {};
	#reducers = {};
	#subscribers = [];

	constructor(reducers, initialState) {
		if (!reducers || !initialState || !initialState instanceof Object)
			throw new Error("Reducers and initialState are required.");

		this.#state = initialState || {};
		this.#reducers = reducers || (() => null);
		this.#subscribers = [];
	}

	#isSingleReducer() {
		return (
			this.#reducers instanceof Function ||
			!this.#reducers instanceof Object ||
			Object.keys(this.#reducers).length === 0
		);
	}

	getState() {
		return this.#state;
	}

	#notifySubscribers() {
		if (this.#subscribers.length) {
			// Notify subscribers of change to state.
			for (let func of this.#subscribers) func(this.getState());
		}
	}

	// # -> Private Class Method
	#setState(newState) {
		if (!newState || !newState instanceof Object) return;
		this.#state = newState;
		this.#notifySubscribers();
	}

	dispatch(action) {
		let newState = this.getState();

		if (!this.#isSingleReducer()) {
			for (let reducer in this.#reducers) // Applying action based on each reducer.
				if (this.#reducers[reducer] instanceof Function)
					newState[reducer] = this.#reducers[reducer](
						newState[reducer] || {},
						action
					);
		} else {
			newState =
				this.#reducers instanceof Function
					? this.#reducers(this.#state, action)
					: newState;
		}

		this.#setState(newState);
	}

	subscribe(callbackFunction) {
		// Check if functiion has already been added to list of subscribers.
		for (let i = 0; i < this.#subscribers.length; i++)
			if (this.#subscribers[i] === callbackFunction) return;
		this.#subscribers.push(callbackFunction);
	}

	unsubscribe(callbackFunction) {
		this.#subscribers = this.#subscribers.filter(
			(func) => func !== callbackFunction
		);
	}
}

// Export a singleton instance of the above class. So each part of the app has access to only one instance.
let instance = null;

function combineReducers(reducerMap = {}) {
	return reducerMap;
}

function createStore(reducers, initialState) {
	if (instance) return instance;
	else {
		if (!reducers) throw new Error("Reducers not passed to createStore");
		if (!initialState) {
			// Setting up initialState from the default value returned by the reducer.
			if (reducers instanceof Function) {
				initialState = reducers(undefined, {}) || {};
			} else if (reducers instanceof Object) {
				// Multiple reducers passed.
				initialState = {};
				for (let reducer in reducers)
					initialState[reducer] = reducers[reducer](undefined, {});
			}
		}
		instance = new Redux(reducers, initialState);
		return instance;
	}
}
```
In the repository linked above, I've also added a few tests for single and multiple reducer cases, try it out if you've worked your way till here.

One thing to note is, of course, there are very nice and important features of Redux like Middlewares that I haven't mentioned in this post, that's of course because they are much more complicated to implement from scratch, and look out in the future for seeing an implementation for Middlewares. Till then, thanks for reading. 😁