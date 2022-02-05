# Performance Optimization with Promises in JavaScript

![Photo by SevenStorm JUHASZIMRUS from Pexels](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fperformance-optimization-with-promises-in-javascript%2Fprimaryimage.jpg?alt=media&token=a90e89b0-a659-49c5-8ec6-255c67b6c596)

Imagine this, you're building a big JavaScript application (Something that wasn't a thing just 5-6 years back), there are a few functions that execute synchronously/asynchronously, but are all independent of each other. Like the example below:

```javascript
independentComputationThatTakes5Seconds();
independentComputationThatTakes10Seconds();
independentComputationThatTakes15Seconds();
// The above takes 30 seconds to execute synchronously.
```

Now waiting for one to finish, before starting processing for the other, when the two don't have anything common to affect isn't the most efficient operation, especially when these operations happen in say, **a loop**.

This is exactly the issue we faced when we had an old backend controller responsible for serving `n` projects for a single user, and along with that also had to send all data related to those projects (All of them requiring some synchronous computation and some asynchronous API calls). For 2-3 projects, the function was still super fast, but the moment the number of projects went to 10-15, we started noticing latency of ~3-4 seconds added on top of the cold start time for the server-less function.

![Parallel Processing 1.jpg](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fperformance-optimization-with-promises-in-javascript%2Fsecondaryimages%2FParallel%20Processing%2011643864424404.jpg?alt=media&token=07298fc7-ec39-4c33-ba17-27c31303c745)

Hence we started looking for possible solutions, one was to make the database queries faster, which we did, and saw a decrease of ~0.125s on average, which isn't a lot, because with today's databases, even inefficient queries are super-fast. We realized later that the solution was looking at us right in the face. We were processing a lot of data and making a lot of database queries for each project.

The pattern looked a little like this:

```javascript
for (let project of projects) {
	const project = await fetchProjectExtraDetails(projectId);
	const relatedInfo1 = await fetchProjectRelatedInfo1(projectId);
	const relatedInfo2 = await fetchProjectRelatedInfo2(projectId);
	someProcessingOnRelatedInfo1();
	someProcessingOnRelatedInfo2();
	combineAllAvailableInfo();
	pushToResponse();
}
```

Of course, putting await inside for loops isn't the recommended approach, and is almost always the true bottleneck. Add to that the fact that this was being run for n projects one by one, and you can see that we're not leveraging one of the most important features provided to us by JavaScript natively.

### In come `Promises`

[Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are placeholders that let something run in the background and send a `resolved` value or a `rejected` response back. I.E: You can use a promise to perform heavy tasks in the background and go along with the flow of the remaining program as required (A lot like [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)).

They are very widely used for API calls, which by their nature take a little time to resolve and return a value. But they can also be used to do all sorts of things, for example, make the program `sleep` for some time, and in our case for this article, perform synchronous tasks asynchronously in the background.

Just to remind, in JavaScript, an async function returns a promise as well, so we don't have to use the `return new Promise(resolve => ...)` syntax with async functions.

```javascript
// Converts a heavy unit of work to a promise, so it can be executed async in the background.
const heavyUnitOfWork = async (computer) => {
	const computedValue = computer();
	return computedValue;
};
```

or if you preper regular promises with try-catch:

```javascript
const heavyUnitOfWork = (computer) => {
    return new Promise((resolve, reject) => {
        try {
            const computedValue = computer();
            resolve(computedValue);
        } catch(err) {
            reject(err);
        }
    }
}
```

This very simple code snippet does a lot, basically this is an async function, and what do async functions do? They return promises that are `awaitable` and `thenable`, and hence this block above wraps even synchronous blocks of heavy processing in a Promise.

```
// With our simple wrapper function
await Promise.all([
    heavyUnitOfWork(independentComputationThatTakes5Seconds),
    heavyUnitOfWork(independentComputationThatTakes10Seconds),
    heavyUnitOfWork(independentComputationThatTakes15Seconds)
]);
// Takes 15 seconds, i.e: The time it takes to finish the longest computation and it all runs async, parallel to each other
```

![Parallel Processing 2.jpg](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fperformance-optimization-with-promises-in-javascript%2Fsecondaryimages%2FParallel%20Processing%2021643865468638.jpg?alt=media&token=f11e9ee5-0a42-48f1-9ea4-5db04a6115bb)

What we have essentially done is split the processing into parallel computation blocks.

Now, with this approach we were able to split processing for each project into separate computation blocks, that ran asynchronously in the background along with each other. We went ahead, got a little creative, and promisified the smallest blocks that were independent of each other, and voila, we had a function that took less than 0.5s to finish compared to the 5s it took earlier! 🥳🎉

**Note**: Please note that this approach isn't always the most readable, especially if you have a lot of nesting.
