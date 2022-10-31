# Creating our own SWR

![SWR from Vercel is amazing! We'll try to create it ourselves in this post](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-our-own-swr%2Fprimaryimage.jpg?alt=media&token=21c5e804-c0e9-45cf-959d-ec973d069961)

If you're a developer working with React, chances are you've used, or at least heard of some data fetching hook, may it be [React Query](https://react-query-v3.tanstack.com/) or [SWR](https://swr.vercel.app/).

I've used SWR extensively in numerous of my projects and most recently at Unacademy where we migrated a big chunk of data stored in centralized state management libraries like Redux to a pattern of API-based data fetched using SWR and local state management using lighter state management solutions like Zustand (Blog post for that coming on [Unacademy's Tech Blog](https://tech.unacademy.com/) soon, so go check that out)

In this post, we'll look at what SWR really is, how the SWR library from Vercel uses that pattern for data fetching and keeping apps performant and then the most important part, we'll implement our own `useFetch` React hook mimicking the functionality that [`useSWR`](https://swr.vercel.app/#overview) from Vercel provides us.

The code for this post can be found at [https://github.com/deve-sh/useFetch](https://github.com/deve-sh/useFetch) so feel free to check that repository for reference at any time.

### What Is [SWR](https://web.dev/stale-while-revalidate/)?

SWR or Stale-While-Revalidate is an HTTP Caching technique. Where data is fetched once, cached for a specified amount of time and served to the users till the specified time is up. Once the time is up, the data is updated in the background and the next user that comes to see the data is served with the updated data, and this process repeats.

This is extremely useful in the case of static websites where content does not change very often, and pages/resources can be efficiently cached and served to users for the time being.

To know about the headers and options involved in SWR, [check out this post](https://web.dev/stale-while-revalidate/).

### What is SWR from Vercel?

SWR From Vercel is a simple React Library that provides you with hooks, that mimic the Stale-While-Revalidate pattern of data fetching.

Essentially, SWR creates a global cross-application cache and returns data from there while data is being invalidated. This way, in a specific amount of time, data is fetched only once and served across the application reactively.

This might not seem like a big deal, but the common pattern used in a lot of codebases like the one below has an inherent problem: There is no connection related to data fetching between multiple components and hence you either have to add manual checks yourself to ensure you don't make API Calls for the same data.

You could always use a state-management library like Redux or Zustand to store data in a global store, but that requires you to set those tools up manually too.

```jsx
const ComponentOne = (props) => {
	const [data, setData] = useState(props.data || null);
	useEffect(() => {
		if (!data) refetchData();
	}, []);
};

const ComponentTwo = () => {
	const [data, setData] = useState(props.data || null);
	useEffect(() => {
		if (!data) refetchData(); // How do you ensure that this does not cause duplicate API Calls? You can't.
	}, []);
};

const ContainerComponent = () => {
	// Will cause two duplicate calls
	return (
		<>
			<ComponentOne />
			<ComponentTwo />
		</>
	);
};
```

Enter SWR:

```jsx
const ComponentOne = (props) => {
	const { data } = useSWR("/api/v1/data");
};

const ComponentTwo = () => {
	const { data } = useSWR("/api/v1/data");
};

const ContainerComponent = () => {
	// No duplicate calls
	return (
		<>
			<ComponentOne />
			<ComponentTwo />
		</>
	);
};
```

The data is shared between ComponentOne and Two automatically thanks to SWR.

Apart from that, SWR takes care of a ton of other things, like:

- Real-time application-wide updates
- Fallback data for
- Error handling
- Pagination and Infinite Loading
- No prop-drilling, all data is accessible across the app via a `key` that uniquely identifies your data. Most of the time this `key` is the URL you want to fetch data from.

All this in a package that doesn't even take up 8KB in your bundle if used correctly.

### What We'll be creating

Let's first list down what we'll be creating and the requirements we have:

Our simple `useFetch` hook will mimic some of the capabilities of the library hook: `useSWR`.

Some of the functionalities we'll be implementing include:

- A simple data fetching expression similar to `useSWR` with error, fetching and data states along with a `revalidate` function to trigger a refetch for the data.

```javascript
const { data, error, isValidating, revalidate } = useFetch(key);
```

- A global common cache, error and fetching states.
- Revalidation of data on the component mount.
- Revalidation of data on focus.
- Deduplication of requests in a specific timeframe.
- Ability to provide all our hooks with a common config using a Context Provider similar to `SWRConfig`
- A global configuration hook like `useSWRConfig`
- `onError` and `onSuccess` handlers for our requests

### Understanding Reactivity

React, by its very name, promises Reactivity out of the box. What's meant by reactivity is whenever some data that the UI depends on, changes, the UI will update accordingly. Imagine the setState calls we make inside our components that trigger a re-render, just React 101 stuff.

But the way React gets notified to re-render based on some change is not as someone just beginning to use React would expect.

```jsx
const [stateVariable, setStateVariable] = useState(0);

useEffect(() => {
	stateVariable = 1; // Does not cause a re-render
	setStateVariable(1); // Causes a re-render
}, []);

return <>{stateVariable}</>;
```

React does not automatically know of value updates to any variable, it is only when you explicitly tell React that you've changed a value that it starts re-rendering. I.E: Our `setStateVariable` function first updates the value of `stateVariable` and then tells React to trigger a re-render. Something that wouldn't be possible if you just assigned a value to the variable as React would have no way to know its value changed.

Even in frameworks like [Svelte](https://svelte.dev/), were just [assigning to a variable is reactive](https://svelte.dev/tutorial/reactive-declarations), you have the _illusion of reactivity_ using the `$` symbol, all Svelte is doing is creating [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) and [setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) behind the scenes (It's a compiler so it has all the means to do that) for that variable, so anytime a variable is assigned to, it will trigger a re-render.

Now, with SWR and our `useFetch` hook both promising reactivity, we can depend on two ways to achieve it:

One is to use state variables inside our hook/components and update their value (the `data`, `error` and `isValidating` variables) after an API Call for a re-render. This approach, however, works only when you're dealing with one hook. In our case, we'll be working with multiple hooks and hence need to take the storage and access of `data`, `error` and `isValidatng` outside just one hook. (State Management rings any bell?)

So the approach we would take is that we would have an external store where the cache, error states and loading states for all our keys would be stored. Any change to the values corresponding to a key would trigger a re-render in our components using the `useFetch` hook.

![Store Model.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-our-own-swr%2Fsecondaryimages%2FStore%20Model1665202054904.png?alt=media&token=680ca96c-7203-4ca4-898c-0d09f4647e80)

We could use libraries like Zustand or Redux to achieve the same, but for making life difficult for ourselves and to understand the ins and outs of reactivity, we'll create our mini store for cache, error states and loading states and use them with a special hook called [`useSyncExternalStore`](https://blog.saeloun.com/2021/12/30/react-18-usesyncexternalstore-api).

[`useSyncExternalStore`](https://github.com/reactwg/react-18/discussions/86) is a very special hook, new in React 18 but backwards compatible using a [shim](https://www.npmjs.com/package/use-sync-external-store), that allows you to use the [Observer Design Pattern](https://refactoring.guru/design-patterns/observer) to notify React components/hooks of any change in your custom store. Think of it like [`useSelector`](https://react-redux.js.org/api/hooks#useselector) when you use Redux with React, but for your store.

```javascript
// Ref: https://reactjs.org/docs/hooks-reference.html#usesyncexternalstore
const state = useSyncExternalStore(
	subscriberFunction,
	getYourFieldOrEntireStore
);
```

How we create our store and integrate that with `useSyncExternalStore` is coming up in the following sections.

### A common data cache

Let's start with the most basic feature that our hook will support, an app-wide/global cache for the data that is fetched corresponding to a key.

For that, we'll create a function called `GlobalCache` that will have a cache Map, where each key-value pair is the key passed to useFetch and the data fetched from the API.

Along with that, it will contain a list of subscribers/listeners and an unsubscribe function that removes a listener.

The listener here is the function that `useSyncExternalStore` passes to our store, every time we update our cache store, we'll iterate over all the listeners we have and notify them of the updated contents of our cache. This is essentially how Reactivity in React and other libraries like RxJS works.

We're making the GlobalCache variable a function as we want the cache to be ["closed"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) to its instance, so every time a Global Context Provider is created, a new instance of the cache is created that has nothing to do with any other cache instances shared across the app.

```javascript
// src/internals/GlobalCache.ts
const GlobalCache = () => {
	const cache = new Map();
	const cacheSubscribers = new Set();
	const unsubscriber = (listener) => cacheSubscribers.delete(listener);
	return {
		subscribe(listener) {
			cacheSubscribers.add(listener);
			return () => unsubscriber(listener);
		},
		get entries() {
			return cache;
		},
		// Cache updater
		setEntry(key: string, value: any) {
			cache.set(key, value);
			// Send signal of update to subscribers for key.
			cacheSubscribers.forEach((listenerFunc) => listenerFunc(cache));
		},
	};
};

export default GlobalCache;
```

### A common error and fetching state map

Just like the global cache, we'll use the same structure for our Error and Fetching State Maps as well.

### Our default fetcher

In case the user does not pass a fetcher, we will create a default fetcher ourselves.

```javascript
// src/Provider/defaultFetcher.js
const defaultFetcher = (key) =>
	fetch(key).then((res) => {
		if (!res.ok) throw new Error("Error in request for key: " + key);
		return res.json();
	});
export default defaultFetcher;
```

### Custom Global Context like `SWRProvider`

Before we get to the `useFetch` hook, let's create a `FetchProvider` context for the consumers of our library to use to set a common config for all `useFetch` hooks inside them.

For Example:

```jsx
<FetchConfig
	value={{
		revalidateOnMount: true,
		revalidateOnFocus: false,
		fetcher: (key) => yourFetcher(key),
		fallback: {
			[key]: data,
			[secondKey]: secondData,
		},
	}}
>
	<ComponentContainingManyUseFetchHooks />
</FetchConfig>
```

```jsx
// src/Provider/index.js
import { createContext, useMemo } from "react";

import GlobalCache from "../internals/GlobalCache";
import GlobalFetching from "../internals/GlobalFetching";
import GlobalErrors from "../internals/GlobalErrors";

export const FetchProviderContext = createContext();

const FetchProvider = ({ children, value }) => {
	const contextValue = useMemo(
		() => ({
			...value,
			cache: GlobalCache(),
			fetching: GlobalFetching(),
			errors: GlobalErrors(),
		}),
		[value]
	);
	return (
		<FetchProviderContext.Provider value={contextValue}>
			{children}
		</FetchProviderContext.Provider>
	);
};

export default FetchProvider;
```

We'll also create a `useFetchConfig` hook for internal use, all the hook does is expose the current provider value that the component is wrapped in.

```javascript
// src/Provider/useFetchContext.js
import { useContext } from "react";
import { FetchProviderContext } from "./index";

const useFetchContext = () => useContext(FetchProviderContext);

export default useFetchContext;
```

This Provider can now be imported and used anywhere.

But we know `useSWR` doesn't necessarily require a global config provider, so we need to have a default provider in case our FetchProvider is not used.

```javascript
// src/Provider/defaultGlobalProvider.js
import GlobalCache from "../internals/GlobalCache";
import GlobalErrors from "../internals/GlobalErrors";
import GlobalFetching from "../internals/GlobalFetching";

import defaultFetcher from "./defaultFetcher";

// In case a FetchProvider has not been added as a wrapper. Pick up the config from this.
const defaultProviderValue = {
	cache: GlobalCache(),
	fetching: GlobalFetching(),
	errors: GlobalErrors(),
	fallback: {},
	revalidateOnMount: true,
	revalidateOnFocus: false,
	dedupingInterval: 2000,
	onSuccess: undefined,
	onError: undefined,
	fetcher: defaultFetcher,
};

export default defaultProviderValue;
```

### Putting it together

Now that we have our global providers, our cache, error and fetching state maps, let's combine them all to form a basic version of our `useFetch` hook.

```javascript
// src/useFetch.js
import { useEffect } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import globalProvider from "./Provider/defaultGlobalProvider";
import useFetchContext from "./Provider/useFetchContext";

const useFetch = (key, options = {}) => {
	const wrappedContext = useFetchContext();

	const contextToReferTo = wrappedContext || globalProvider;

	const isKeyFetchable = !!key; // If the key is falsy, don't fetch.

	const fetcher = resolveIfNotUndefined(
		options.fetcher,
		contextToReferTo.fetcher
	);

	const {
		setEntry: setCacheEntry,
		entries: overallDataCache,
		subscribe: subscribeToCache,
	} = contextToReferTo.cache;
	const {
		entries: fetchingFor,
		setFetching,
		subscribe: subscribeToFetching,
	} = contextToReferTo.fetching;
	const {
		errors,
		setError,
		subscribe: subscribeToErrors,
	} = contextToReferTo.errors;

	// Sync hook with cache for the data.
	const data = useSyncExternalStore(subscribeToCache, () =>
		isKeyFetchable ? overallDataCache.get(key) : null
	);
	// Sync hook for validating and error updates as well
	const error = useSyncExternalStore(subscribeToErrors, () =>
		isKeyFetchable ? errors.get(key) : null
	);
	useSyncExternalStore(subscribeToFetching, () =>
		isKeyFetchable ? fetchingFor.get(key) : null
	);

	const fetchData = () => {
		setFetching(key, true);
		fetcher(key)
			.then((dataFetched) => {
				setCacheEntry(key, dataFetched);
				setFetching(key, false);
				setError(key, undefined);
			})
			.catch((err) => {
				setCacheEntry(key, undefined);
				setError(key, err);
				setFetching(key, false);
			});
	};

	useEffect(() => {
		fetchData();
	}, []);

	return {
		data,
		isValidating: isKeyFetchable ? fetchingFor.get(key) || false : false,
		error: isKeyFetchable ? errors.get(key) || undefined : undefined,
	};
};

export default useFetch;
```

All the above hook is doing is taking a key, checking if it's a valid key, i.e: Not `null`, fetching the data on the first render based on the fetcher passed in options or the one passed to the wrapping context/default global context, setting the data in our reactive store (And in the process updating values corresponding to error and validating states as well).

We'll be looking at deduping requests and revalidation in just a bit.

### Revalidation

A major part of SWR is `mutation`, i.e: Updating the data currently stored in the cache corresponding to a key. Let's create a `revalidate` function in our hook to do the same.

```javascript
const revalidate = useCallback(
	async (updater, revalidateAfterSetting = true) => {
		if (!isKeyFetchable) return;

		if (typeof updater === "function") {
			const updatedData = await updater();
			setCacheEntry(key, updatedData);
			if (revalidateAfterSetting) fetchData();
			return updatedData;
		} else if (typeof updater !== "undefined") {
			setCacheEntry(key, updater);
			if (revalidateAfterSetting) fetchData();
		} else fetchData();
	},
	[fetchData, key]
);
```

```diff
return {
	data,
+ 	revalidate,
	isValidating: isKeyFetchable ? fetchingFor.get(key) || false : false,
	error: isKeyFetchable ? errors.get(key) || undefined : undefined,
};
```

The function takes the function or value to update and a boolean that tells it whether to refetch the data in the background, usually for [optimistic rendering](https://medium.com/@whosale/optimistic-and-pessimistic-ui-rendering-approaches-bc49d1298cc0). If no arguments are passed, we simply refetch the data using our existing `fetchData` function.

### Handling options

All the following options we discuss can be passed in 3 ways to the hook:

- Via the `options` argument to `useFetch`.
- Via the Context Provider.
- If none of the above is used, we fall back to the default values for those options.

**1. Handling `revalidateOnMount`**

The most basic option we would be supporting is the revalidation/fetching of data on the component mount. All we have to do here is add a `useEffect` block to the hook.

```javascript
const revalidateOnMount = resolveIfNotUndefined(
	options.revalidateOnMount,
	contextToReferTo.revalidateOnMount
);

useEffect(() => {
	if (revalidateOnMount) fetchData();
}, [revalidateOnMount]);
```

**2. Handling `fallbackData` for SSR and SSG**

Similar to `revalidateOnMount` we can support fallback data for server-side rendering and static site generation, or just in case an error happens while fetching.

[Look at the server-side rendering use-case for SWR here](https://swr.vercel.app/docs/with-nextjs#pre-rendering-with-default-data).

It can be passed to the hook in two ways only:

- Via the `fallback` value in a Context Provider.
- Via the `fallbackData` key of the hook's options argument.

```javascript
const fallbackData = isKeyFetchable
	? resolveIfNotUndefined(
			options.fallbackData,
			(contextToReferTo.fallback || {})[key],
			undefined
	  )
	: undefined;
```

And we simply update the return value for `data`:

```diff
- data,
+ data: typeof data === "undefined" && typeof fallbackData !== "undefined" ? fallbackData : data,
```

**3. Handling `dedupingInterval` and same-time request invocations**

The most common concern when having multiple hooks with the same key at different levels of your application or too many points of usage is that there can be multiple/duplicate requests to the same endpoint.

There are two forms of de-duplications:

1. Deduplication of a request to an endpoint being made at the same time
2. Prevention of a new request to an endpoint for a set amount of time, in SWR, this is set to 2 seconds by default but one can change it using the `dedupingInterval` property in the options argument of `useSWR`.

SWR takes care of both of the above cases, and there are very clever ways to handle deduping of requests.

First, let's look at the first case: Deduping of a request to an endpoint being made at the same time. This is most often caused by two or more `useFetch` hooks being called with a `key` very close in time to each other. Consider the scenario below:

```jsx
const ComponentOne = () => {
	const { data } = useFetch("/api/v1/data");
};

const ComponentTwo = () => {
	const { data } = useFetch("/api/v1/data");
};

const ContainerComponent = () => {
	return (
		<>
			<ComponentOne />
			<ComponentTwo />
		</>
	);
};
```

In the above, both components containing a reference to `useFetch` are called at the same level during the same render, both will trigger an API Call to `/api/v1/data`.

To prevent that, let's understand some basics. When React renders a component, the hooks are called in order, i.e: synchronously. So the hook present inside ComponentOne will be called first, and so will the `useEffect` block inside ComponentOne's `useFetch`.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-our-own-swr%2Fsecondaryimages%2Fimage1665686794290.png?alt=media&token=680f57e7-d5d8-4a63-8b2f-925c4d760afa)

Notice how the first thing we do in our `fetchData` function is to update the fetching status for the key using `setFetching(key, true)`. That will come in handy now.

Let's add a new function that tells us whether the API call can go or not.

```javascript
const allowedToFetchData = (isFromRevalidate = false) => {
	if (!isKeyFetchable) return false;

	const isCurrentlyFetching = fetchingFor.get(key); // This will be updated synchronously by any other hook with the same key that might have started fetching already.
	if (isCurrentlyFetching) return false;

	return true;
};
```

```diff
const fetchData = () => {
+   if (!allowedToFetchData()) return;
    setFetching(key, true);
```

This will take care of the same-time request deduplication. Since `data` is reactive to a common store, it will automatically update itself in all the concerned hooks.

Now, to handle similar deduplication for requests that are fired later but still too soon, all we need is an external `lastFetched` store, just like cache and fetching status to store when an API call corresponding to a key was last completed. Any request in an interval less than the `dedupingInterval` cancels any request to be made.

We'll set up the `lastFetched` store just like we set up cache, error and fetching state maps, and add the following change to our `fetchData` function:

```javascript
const dedupingInterval = resolveIfNotUndefined(
    options.dedupingInterval,
    contextToReferTo.dedupingInterval,
    2000
);
const { lastFetched } = contextToReferTo;

...
// In allowedToFetchData
const lastFetchedTimestampForKey = lastFetched.get(key);
const now = new Date().getTime();
if (lastFetchedTimestampForKey && now - lastFetchedTimestampForKey < dedupingInterval)
return false;
```

And to our `fetchData` function:

```diff
fetcher(key)
    .then((dataFetched: any) => {
        setCacheEntry(key, dataFetched);
        setFetching(key, false);
        setError(key, undefined);
+        lastFetched.set(key, new Date().getTime());
    })
```

Once implemented, this takes care of deduping requests for a specified time as well for us.

**4. Handling `revalidateOnFocus`**

Oftentimes, when users use your web app, they wander off to distant tabs not to return to your web app for a long time. During that time, the data fetched with `useFetch` might have gotten stale. We want to set up a flag, which when set to true, will auto-fetch data when the user comes back to the tab.

To do so, we'll use the `focus` event to detect the user's focus in and out of the tab and make the API calls accordingly.

A simple solution would be to simply mount a focus event handler in the `useEffect` block for the `useFetch` hook, however, there's a problem with that, there could be 15 hooks with the same key across the page the user's viewing and it's not healthy for the window object to be overloaded with focus event handlers over and over again.

So we'll use a pattern similar to the deduping of requests.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-our-own-swr%2Fsecondaryimages%2Fimage1665583273006.png?alt=media&token=196754d0-0d17-40c6-aba9-85d93ac65cfe)

Unlike other maps, we'll have this exclusively to the top most global provider and not to the context provider, the reason for that being that we don't want multiple focus event handlers for the same key just because the hooks have been wrapped by multiple context providers through multiple levels of the
component tree.

We'll start by creating a map of the keys the event has been set for and adding it to our default global provider.

```javascript
// src/internals/GlobalFocusRevalidationEventSet.js

// Map to keep track of the keys for which revalidate on focus event has been registered.
const GlobalFocusRevalidationEventSet = () => {
	const OnFocusRevalidationAlreadySet = new Map();
	return OnFocusRevalidationAlreadySet;
};

export default GlobalFocusRevalidationEventSet;
```

```diff
// src/Provider/defaultGlobalProvider.js
+ revalidateOnFocusEventSetFor: GlobalFocusRevalidationEventSet(),
```

Now that we have those set, let's add our useEffect block to register the focus event handler to useFetch.

```javascript
const revalidateOnFocus = resolveIfNotUndefined(
	options.revalidateOnFocus,
	contextToReferTo.revalidateOnFocus
);

useEffect(() => {
	if (revalidateOnFocus && isKeyFetchable) {
		if (!contextToReferTo.revalidateOnFocusEventSetFor.get(key)) {
			contextToReferTo.revalidateOnFocusEventSetFor.set(key, true);
			const revalidateOnFocusFunc = () => fetchData();
			window.addEventListener("focus", revalidateOnFocusFunc);

			return () => {
				window.removeEventListener("focus", revalidateOnFocusFunc);
				contextToReferTo.revalidateOnFocusEventSetFor.set(key, false);
			};
		}
	}
}, [revalidateOnFocus, fetchData]);
```

**5. Handling `onSuccess` and `onError` functions**

Users might also want to simply pass functions to do something on the error or success of an API Call.

The handling for that's pretty simple. Just to clarify, there's no `onError` and `onSuccess` handler in the context provider options or the default global provider as each hook might have different ways of handling responses depending on component-level logic.

```javascript
const { onSuccess, onError } = useMemo(
	() => ({ onSuccess: options.onSuccess, onError: options.onError }),
	[options]
);

useEffect(() => {
	if (data !== undefined && typeof onSuccess === "function")
		onSuccess(data, key, options);
}, [data]);

useEffect(() => {
	if (error !== undefined && typeof onError === "function")
		onError(error, key, options);
}, [error]);
```

### Global Config hook like [`useSWRConfig`](https://swr.vercel.app/docs/global-configuration#access-to-global-configurations)

Onto the final frontier, let's create a `useFetchConfig` hook that provides users access to the current global configuration.

```javascript
const {
	fetcher,
	fallback,
	cache,
	dedupingInterval,
	revalidateOnMount,
	revalidateOnFocus,
	revalidate,
} = useFetchConfig();
```

The functionality is fairly simple, minus the part where our hook is also supposed to return a `revalidate` function that acts as a revalidator function for all hooks with the `key` passed to it.

Let's build a basic `useFetchConfig` first without the revalidate function:

```javascript
const useFetchConfig = () => {
	const contextToReferTo = useFetchContext() || globalProvider;
	return {
		fetcher: contextToReferTo.fetcher,
		fallback: contextToReferTo.fallback,
		cache: contextToReferTo.cache.entries,
		dedupingInterval: contextToReferTo.dedupingInterval,
		revalidateOnMount: contextToReferTo.revalidateOnMount,
		revalidateOnFocus: contextToReferTo.revalidateOnFocus,
	};
};
```

Well, that was easy. Now onto creating the `revalidate` function, some usage details first: It works just like our regular revalidate function, except it takes an extra first argument: the `key` of the `useFetch` hook you want to revalidate.

```javascript
const { revalidate } = useFetchConfig();
revalidate("/api/v1/data"); // Just revalidate and update the cache
revalidate("/api/v1/data", data); // Set `data` first, then fetch in the background and update the cache.
revalidate("/api/v1/data", data, false); // Set `data` but do not fetch in the background.
```

For this, we have a simple technique:

Every `useFetch` hook has a `revalidate` function for itself, all we have to do is call it when the wrapping `revalidate` function from `useFetchConfig` is called. We'll use a pattern similar to the one we used in the deduplication of requests and `revalidateOnFocus`. We'll register the revalidate function to an external store for each key and then simply invoke it from the external revalidate function.

We'll add a map similar to the cache to our Global Provider, as `revalidators` and then assign it our `useFetch` hook's revalidate function at mount time.

```javascript
// useFetch.js
useEffect(() => {
	if (!isKeyFetchable) return;
	contextToReferTo.revalidators.set(key, revalidate);
	return () => contextToReferTo.revalidators.set(key, undefined);
}, [revalidate]);
```

```diff
+ const revalidate = (key, updater, revalidateAfterSetting = true) => {
+	return contextToReferTo.revalidators.get(key)?.(
+		updater,
+		revalidateAfterSetting
+	);
+ };

return {
  fetcher,
+ revalidate,
  ...
}
```

### Writing Tests

In the end, before publishing the package, we should set up some automated testing mechanisms to ensure:

- Our library and all its components work as expected
- A new change we make does not break any existing expected flow.

To do so, we'll be using [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). Jest as the test environment and React Testing Library for rendering our components with the `useFetch` hook to test out multiple cases.

Some major cases we might want to cover with our tests:

- Basics: `useFetch` is always a function and expects at least one argument: The `key`. This core API Contract should never break due to accidental export statement changes or function signature changes.
- Custom Fetchers work for our hook as expected.
- Real-time fetching works and deduplication of requests happen as expected.
- Options such as `revalidateOnMount`, `revalidateOnFocus` and `fallbackData` work as expected.
- Wrapped Context Provider takes precedence over global common provider.
- `useFetchConfig` returns the correct config and a revalidate function that revalidates the key-based cache properly.

To setup our test environment, we'll be adding some dev dependencies to our repo:

```bash
npm i --save-dev jest @testing-library/react @babel/preset-typescript @babel/core @babel/preset-env jest-environment-jsdom
```

The babel libraries are for Jest to compile our TypeScript and React code. JSDOM is an environment that adds value to the `document` object inside the Testing Environment that Jest exposes.

```diff
// package.json

"scripts": {
    ...
+    "test": "jest --silent"
}
```

```javascript
// jest.config.js
module.exports = { testEnvironment: "jsdom" };
```

```javascript
// babel.config.js
module.exports = {
	presets: [
		["@babel/preset-env", { targets: { node: "current" } }],
		"@babel/preset-typescript",
		["@babel/preset-react", { runtime: "automatic" }],
	],
};
```

To see some of the tests out of the list above implemented, check out [this directory](https://github.com/deve-sh/useFetch/tree/main/tests).

### That was quite a lot!

So we come to the end of this post, it was fun reverse-engineering SWR, although it's a fully open-source library and takes care of a ton of things.

It sure was a lot of information to take in at once, and no one expects all this to be done in a single day, but it also reveals how much engineering goes into something as simple as an expression like:

```javascript
const { data } = useFetch("/api/v1/data");
```

To me, the fact that this much engineering goes into making things simple for other developers is [the most beautiful thing in programming](https://blog.devesh.tech/post/the-most-beautiful-thing-in-programming).

Reverse engineering and building libraries that you use every day is always a joy. I hope this post was informative and insightful.
