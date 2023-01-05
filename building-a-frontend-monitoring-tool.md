# Building a Frontend Monitoring Tool

![Photo by Lukas: https://www.pexels.com/photo/document-on-top-of-stationery-669619/](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-frontend-performance-monitoring-and-observability-solution%2Fprimaryimage.jpg?alt=media&token=eba91c58-d95d-48e2-bfb7-9957ce86d912)

I've been using [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon) for over a couple of years now, ever since the product was launched for web applications.

I've always been blown away by the amount of information that the network calls to Firebase's Performance Logging server captured. From Web Vitals to Network Call information and whatnot!

So I thought, let's try building a solution similar to Firebase Performance Monitoring, and also add a few bonus features on top of it.

##### Features we'll be building:

- User Session Creation and deduplication.
- Measurement of API Call duration, latency, response time etc.
- Measurement of Web Vitals
- Collecting metrics related to page resources like scripts, link tags and images.
- Intercepting and storing console logs from the user's session for debugging errors and issues later.
- Measuring performance of custom app-level code snippets.

Firebase Performance Monitoring uses the [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance) to get network call-related metrics, resource load times, web vitals etc. So that's what we'll be using.

We'll be bundling all of the above at the end into a simple SDK which users can embed into their codebases to measure all the performance-related aspects of their web applications and send it to our databases for aggregation and analysis.

We'll be calling the service "Spot"! (I know I know, it's not the most creative name, all the others were taken 😛)

#### An Overview of how it will work

![How Spot SDK Works In a Nutshell.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-frontend-monitoring-tool%2Fsecondaryimages%2FHow%20Spot%20SDK%20Works%20In%20a%20Nutshell1669456033633.png?alt=media&token=50e3e104-9f22-410b-ba32-c5952003d6f3)

We'll not be discussing server-side implementation in this blog post. The storage, retrieval and analytics on the backend are fairly straightforward.

##### Check Out The Final Source Code [here](https://github.com/deve-sh/spot).

##### Check Out The Result [here](https://spot-monitoring.vercel.app) - fully functional with a backend and a database.

> **Note**: Supabase, the auth and database provider I used to build the front-end seems to be having issues with GitHub login so bare with me while that issue is fixed. Check the ongoing issue discussion [here](https://github.com/supabase/supabase/issues/10540).

### Our Base Class

Let's first create a simple base class that would be responsible for initializing the SDK. It will receive two arguments, the Project ID that it has to track info for (It will be generated when a user on the Spot platform creates a new project) and the Project's Public API Key.

```javascript
class Spot {
	public projectId: string = '';
	public sessionId: string = '';
	public apiKey: string = '';

	constructor(projectId: string, apiKey: string) {
		if (!projectId || !apiKey) throw new Error('Project ID and API Key are required.');

		this.projectId = projectId;
		this.apiKey = apiKey;

                setupMonitoring();
		setupLogInterception();

		...
	}
```

To see a full implementation of this Class with all the other features mentioned in this post: [Check this out](https://github.com/deve-sh/Spot/blob/main/web-sdk/src/index.ts).

### Sessions For User Identification & Segregation: Initialization and Deduplication

The moment the Web SDK Class is instantiated, we create a session for the user. The session is active till all the tabs and active browser windows are opened.

Our session identifiers will be UUIDs given they can be uniquely generated on the client as well.

To keep a session active till all the tabs and browser windows are closed, we will take advantage of a relatively unknown feature of cookies, if you don't set their `expires` or `max-age` attributes, they become session-based cookies by default.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-frontend-performance-monitoring-and-observability-solution%2Fsecondaryimages%2Fimage1668855451028.png?alt=media&token=9b18e412-651d-48d5-adfc-9d575383aa69)

Hence the session flow becomes:

- Check if a session is already actively using a cookie.
- If it is, pick up from where we left off. If not, generate a UUID and set it as the session cookie.
- Make an API call to the backend to notify of a session creation or continuation.

### Intercepting Network Calls Approach 1: Create a Prototype of `XMLHttpRequest` and `fetch`

We could always just wrap around our own function to trace Network Calls.

```javascript
// Intercepting Network Calls from XMLHttpRequest

const networkInterceptor = () => {
	const originalOpen = XMLHttpRequest.prototype.open;
	const originalSend = XMLHttpRequest.prototype.send;

	XMLHttpRequest.prototype.open = function (...args) {
		const requestURL = args[1];
		if (requestURL) this.url = requestURL;

		const self = this;

		this.addEventListener('readystatechange', function () {
			if(this.readyState === 4) // Complete, log this with the completion time to the API
		});

		this.addEventListener('error', function () {
			// Log errored network call
		});

		originalOpen.apply(this, args);
	};

	XMLHttpRequest.prototype.send = function (...args) {
		// Do whatever here.
		originalSend.apply(this, args);
	};
};
```

**Pros of this approach:**

- We get information like the request's method (GET, POST, DELETE etc) and network level errors, information that we wouldn't get from Performance API.

**Cons of this approach:**

- Wrapping Prototypes can be risky as there might be other libraries that could expose their own wrappers for these classes, which might break.
- Every request's initiator would be our own library and it will get hard for developers to debug issues with their network calls using the browser console.

### Intercepting Network Calls Approach 2: Use the Performance API

The Browser exposes a [`performance`](https://developer.mozilla.org/en-US/docs/Web/API/Performance) API for us and the SDK/library to consume to get information about page performance (Web Vitals like [FCP](https://web.dev/fcp/), [FID](https://web.dev/fid/) and other DOM Events).

Another great advantage of the performance API is the use case we are looking for, it provides performance information on all network calls that happen on the website.

A simple call of `performance.getEntries()` gives us information from the start of the website session in the current tab to the current point in time, and not just network calls, but also performance information about scripts, link tags, images and other performance marks which we'll use to measure the performance of custom app code later. It's truly all the data one might need for their website's performance on real users' devices.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-frontend-monitoring-tool%2Fsecondaryimages%2Fperformance-api-entries.png?alt=media&token=f0cb6aca-7682-482c-84c4-5cbda9d6552b)

For a start, a simple loop on performance.getEntries for network calls data would look like this:

```javascript
const entries = performance.getEntries();

for (let i = 0; i < entries.length; i += 1) {
	const entry = entries[i];
	if (!(entry instanceof PerformanceResourceTiming)) continue;
	if (!["fetch", "xmlhttprequest"].includes(entry.initiatorType)) continue;

	console.log({
		// Do something with this data, like sending it to your performance monitoring server.
		type: "network-call",
		bodySize: entry.encodedBodySize,
		responseSize: entry.transferSize,
		duration: entry.duration,
		url: entry.name.split("?")[0],
		startTime: entry.startTime,
		startedAt: entry.startTime + performance.timeOrigin,
		totalWaitingTime: Math.abs(entry.fetchStart - entry.startTime),
		timeToResponse: entry.responseEnd - entry.requestStart,
	});
}
```

One con of this approach, however, is that there are no logs of failed network calls or their request method.

### Getting Web Vitals like FCP, FID, domContentInteractive etc

The Performance list we get with `performance.getEntries` is also rich in vitals information about the page, including metrics like [First Contentful Paint](https://web.dev/fcp/), [First Input Delay](https://web.dev/fid/), and other navigational metrics like domInteractive`and`domContentLoaded`.

We can extend our base performance function to include these changes:

```javascript
if (entry instanceof PerformanceNavigationTiming) {
    // Contains info like domInteractive, domContentLoaded benchmarks.
    monitoringEntries.push({
        type: 'navigate',
        location,
        ...entry.toJSON()
    } as NavigationTypeEntry);
}
```

```javascript
if (entry instanceof PerformancePaintTiming) {
    if (entry.name === 'first-contentful-paint')
        monitoringEntries.push({
            vitalType: 'fcp',
            type: 'vitals',
            location,
            value: entry.startTime
        } as VitalsEntry);
    if (entry.name === 'first-paint')
        monitoringEntries.push({
            location,
            type: 'vitals',
            vitalType: 'fcp',
            value: entry.startTime
        } as VitalsEntry);
}
if (entry instanceof PerformanceEventTiming) {
    if (entry.entryType === 'first-input') {
        // FID
        monitoringEntries.push({
            location,
            type: 'vitals',
            vitalType: 'fid',
            value: entry.startTime
        } as VitalsEntry);
    }
}
```

### Collecting metrics about page resources

Web developers also value information about load times and sizes for the resources that are loaded for their web apps on the end user's devices. Fortunately for us, the Performance API also provides us with a way to do exactly that.

We'll just extend our monitoring function with the following condition for `PerformanceResourceTiming` entities.

```javascript
if (
    ['script', 'img', 'link'].includes(entry.initiatorType)
) {
    // Script Tags and page resources
    monitoringEntries.push({
        type: 'page-resource',
        resourceType: entry.initiatorType,
        bodySize: entry.encodedBodySize,
        responseSize: entry.transferSize,
        duration: entry.duration,
        url: entry.name.split('?')[0],
        startTime: entry.startTime,
        startedAt: entry.startTime + performance.timeOrigin,
        totalWaitingTime: Math.abs(entry.fetchStart - entry.startTime),
        timeToResponse: entry.responseEnd - entry.requestStart
    } as PageResourcesEntry);
}
```

### Measuring the performance of custom app-level code snippets (I.E: Custom Traces)

Measuring of custom app-level code is done using [Custom Traces](https://firebase.google.com/docs/perf-mon/custom-code-traces?platform=web) in Firebase Performance Monitoring.

The Performance API is great at calculating the time it takes to execute app-level code. The logic is pretty simple (And can even be implemented without Performance API):

```javascript
const before = new Date().getTime();
// ... Custom App Code
const after = new Date().getTime();
const timeItTookInMilliSeconds = after - before;
```

Where Performance API helps us is assigning names to these markers using [performance.measure](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure) and [performance.mark](https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark), and subsequently getting them in the list we receive using `performance.getEntries()`.

Think of performance.measure and performance.mark as a stopwatch, you start by adding one mark at the beginning, and then by adding another mark at the end, then you use performance.measure to calculate the time and other performance-related info between the two marks.

We'll have a syntax of usage similar to Firebase Performance Monitoring's Custom Traces:

```javascript
const perfTrace = Trace("custom-trace");
perfTrace.start();
// App Code
perfTrace.stop();
```

Similar to Firebase Performance Monitoring, we can implement a class and a function to initialize the trace:

```javascript
class Trace {
	private uniqueName: string;
	private startMark: string;
	private endMark: string;
	private traceName: string;

	constructor(traceName: string) {
		if (!traceName) throw new Error('Please provide a value for trace to the .trace function');

		this.uniqueName = `Spot-${new Date().getTime()}-${traceName}`;
		this.startMark = this.uniqueName + '-START';
		this.endMark = this.uniqueName + '-END';
		this.traceName = traceName;
	}

	public start() {
		performance.mark(this.startMark);
	}

	public stop() {
		performance.mark(this.endMark);

		// Measure the duration between the two marks
		performance.measure(this.uniqueName, this.startMark, this.endMark);

		const traceMeasure = performance.getEntriesByName(this.uniqueName)[0];
		const traceEntry = {
			duration: traceMeasure.duration,
			traceName: this.traceName,
			startTime: traceMeasure.startTime,
			startedAt: performance.timeOrigin + traceMeasure.startTime
		};
		sendTracingData(traceEntry);
	}
}
```

### Bonus: Intercepting Frontend Logs

We would also want to store the logs for a user's session and show it to developers to help in debugging common errors.

A very simple interception of the most common logging functions would be the following:

```javascript
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function (...logFragments) {
	originalConsoleLog(...logFragments);
	logsQueue.push(processLog(logFragments, "info"));
	setLogReleaseTimer();
};

console.info = function (...logFragments) {
	originalConsoleInfo(...logFragments);
	logsQueue.push(processLog(logFragments, "info"));
	setLogReleaseTimer();
};

console.warn = function (...logFragments) {
	originalConsoleWarn(...logFragments);
	logsQueue.push(processLog(logFragments, "warn"));
	setLogReleaseTimer();
};

console.error = function (...logFragments) {
	originalConsoleError(...logFragments);
	logsQueue.push(processLog(logFragments, "error"));
	setLogReleaseTimer();
};
```

Here we have a queue of logs we want to send to the backend and a timeout to debounce network calls to the logging endpoint, this is done keeping in mind the nature of frontend logs, there can be 100s of logs created in a couple of seconds by certain applications and having a single API call for transporting all of them to the database instead of one for every log is extremely helpful.

```javascript
const logsQueue = [];
```

We will also need to do some processing, logs can have object data in them and we don't want them to be stored in the database as `[object Object]` so we would `JSON.stringify` them before being sent. All the front-end logs would be sent as fragments.

```javascript
const processLogFragment = (logFragment: any): LogFragment => ({
	type: typeof logFragment,
	value:
		typeof logFragment !== "string" ? JSON.stringify(logFragment) : logFragment,
});

const processLog = (logFragments: any[], severity: LogTypes): LogEntry => {
	const { sessionId } = getInstance() || { sessionId: "" };
	return {
		fragments: logFragments.map(processLogFragment),
		severity,
		at: new Date().getTime(),
		sessionId,
	};
};
```

### Bundling the SDK with Webpack and publishing it

We can't ship the SDK to users without compiling and bundling the dependencies first.

To compile, we'll use TypeScript, and then we would bundle all the distribution files into a single distributable using Webpack.

```json
// package.json

"scripts": {
    "compile": "tsc",
    "bundle": "webpack",
    "build": "npm run compile && npm run bundle",
    "pre-publish": "npm run build && cp package.json README.md ./dist && cd dist"
}
```

Let's set up our webpack command:

```bash
npm i --save-dev webpack webpack-cli
```

Add the following config to our SDK's `webpack.config.js` file:

```javascript
const path = require("path");

module.exports = {
	entry: "./dist/index.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "index.js",
		library: "Spot", // To enable CDN, or browser-based imports using window.Spot
		libraryTarget: "umd", // To work on both npm based apps and plain HTML based apps
		libraryExport: "default", // Only export the default export from index.js
		globalObject: "this",
	},
};
```

Run `npm publish`. And we should be set.

### Finishing Off

The SDK code should be ready at this point, all the information that's collected for monitoring, logging and traces can be sent to a backend server that stores it in a database (Most reliably a time-series database if the scale is large, although it could also go directly to LogStash and queried with ElasticSearch).

I built a simple dashboard that displays project-related data and the metrics corresponding to it. Check it out [here](https://spot-monitoring.vercel.app/).

> **Note**: Supabase, the auth provider I used to build the front-end seems to be having issues with GitHub login so bare with me while that issue is fixed.
