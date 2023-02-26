# How to make your Web Apps work offline

![Photo by Anna Nekrashevich: https://www.pexels.com/photo/a-laptop-near-the-drinking-glass-and-plant-on-the-table-8534387/](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-to-make-your-web-app-work-offline%2Fprimaryimage.jpg?alt=media&token=38b7313c-d159-4c36-bca8-b0a30fef1810)

> *Anything that can be written in JavaScript, will eventually be written in JavaScript.*

Well, whoever said that definitely knew what they were talking about. For avid users of their mobile phones (Who isn't at this point), we take one thing for granted: Taking our mobile phones out of our pockets, opening our favourite app and being able to use them without a hiccup, even if there isn't an internet connection.

Apps like Google Docs, Notion, and Evernote provide the highest amount of value to their users with the ability to work seamlessly even when they're offline or have a flaky internet connection.

Native mobile apps have had that comfort for a long time. If you're in a tunnel that doesn't have internet or on a flight where you're apparently told to put your phones on aeroplane mode (*Huh, why though?*), you still expect things to work on those apps even if new data does not stream in.

Web apps have not had that ability for the longest time they've existed, even today, when you visit a website, you don't expect it to work flawlessly when you go offline. But what if I told you, we could make them work nearly flawlessly when the user doesn't have an internet connection?! All the way from loading the web app without an internet connection to showing the user their content and letting them interact with the web app as if nothing happened.

What if I told you something else on top? Apps like Notion that you can install on your desktop aren't exactly native apps, they are just web apps running within a browser shell and have just perfected working offline (WHAT!?).

Looks like writing everything in JavaScript isn't a dream after all. Let's get started.

### The different types of "offline"

Before we get started, let's first clear out the types of "offline" there can be. Different applications have different use cases and a developer's job is to serve the most appropriate fit for those use cases.

There is the kind of offline where the user loses internet connection intermittently, like going in and out of a wifi-range. In such cases, most apps can work without a major problem, network calls that the browser makes to APIs and databases have a long timeout so your app might feel slow to the user but they will be able to see the data they need once they're back online moments later.

Most users do not worry too much about the above kind of offline, but what if you wanted data your user has already viewed on a previous page to be visible if they click the back button?

With that, we're entering the realm of "offline-tolerant" web apps, web apps that can load pages and store data on the user's device, and read from them in case the user is offline.

A great example of such an app is Notion, or if you're mad about me not mentioning it, Google Docs.

Apps take different approaches to be offline-tolerant, Google Docs for example shows a different UI to their users if they go offline, while others like Notion continue to function with their existing UI but with limited access to certain features.

All the approaches mentioned use some level of data storage on the user's device using APIs provided by the browser. We'll be discussing those techniques and also some concerns and challenges that you would face creating and working with offline web applications.

### Possible places to store/cache information locally

Browsers have a ton of places you could store information on the user's device.

The most obvious ones are of course: [**cookies**](https://www.cloudflare.com/learning/privacy/what-are-cookies/). However, you don't want to store any information in cookies just because you can.

Cookies are added to every single API call your web application makes by the browser and hence have a limitation on the size of data that can be stored so it's ideal only to store information like session IDs or the authenticated user's ID. Anything more than that and you'll need a slightly more complex data storage solution.

Enters [**LocalStorage**](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), a storage engine that has a much larger cap on sizes and can serve most of the needs the developer for an offline working app will have.

```javascript
localStorage.setItem("offline-cache", JSON.stringify(offlineCache));
...
...
... // Next user session
const offlineCache = JSON.parse(localStorage.getItem("offline-cache") || "{}");
```

A catch with LocalStorage is that it can only be used to store strings, it's not a problem in case you have data that can be directly stringified but the moment you reach the realm of complicated data you have to write your own serialization algorithms (Add to that the performance and time overhead parsing and stringification of large amounts of data before storage), or look for a different storage approach.

[**IndexedDB**](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) is an amazing tool and the preferred storage layer of a lot of offline working web apps and SDKs that support offline capabilities, like Firebase. It can store almost any kind of data that can be represented by JavaScript (which is pretty much anything 😛). The only caveat is that it's extremely complicated to work with and you would often find yourself using libraries to interact with IndexedDB.

### Enter Service Workers

Now that we have a way to store data on the user's device to have them available when the user is on the page but does not have an internet connection, we need to move on to an even more interesting mechanism to make web apps work from launch to close without an internet connection.

To do that, we need to find a way to store the assets responsible for constructing the page, like scripts, CSS files and images for pages the user has visited and have them load even when there is no internet connection.

Fortunately for us, an amazing resource to do that is a [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

> A service worker is a special kind of script with access to APIs not accessible to regular scripts that you load via a `script` tag. These APIs include ones that enable showing [push notifications](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) to users, [caching entire files and API responses](https://web.dev/learn/pwa/caching/#caching-assets-in-a-service-worker) to load them next time without an internet connection/reducing response times and even intercepting all requests coming to and going from your website.

Basically, a Service Worker is a lot like a Proxy at a user level between the web and their device, which adds super-powers to simple websites and turns them into something that very closely resembles the functionality of a native mobile app (Converting our web app into a mobile installable app is something we'll take a look at in the last section of this post).

How do you use Service Workers? You may ask. The steps are fairly simple.

1. Create a service worker file. It can be a simple JavaScript file, the following is just a simple JavaScript file that caches a list of specified files and a Home page route.
```javascript
// service-worker-file.js
const urlsToCache = ["/", "app.js", "styles.css", "logo.svg"];
self.addEventListener("install", event => {
   event.waitUntil(
      caches.open("app-cache")
      .then(cache => cache.addAll(urlsToCache));
   );
});
```
2. Once we have our service worker file ready, we have to tell the browser that our file is special and have the browser treat it that way. Doing so is called `Service Worker Registration`.
```html
<script type="text/javascript">
	window.addEventListener("load", function () {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register('/service-worker-file.js').catch((error) => {
				console.error(error);
			});
		} else console.log("Service Worker is not supported by browser.");
	});
</script>
```

That's all we have to do, now once the service worker is registered with the browser, all requests to and from the web app will go through the service worker, and you can do whatever you want with those requests. You could intercept those requests and add a standard header to those requests, and you can block certain requests from going through altogether based on some conditions.

You could even run background jobs to listen to a push notification server and show the user notifications once you have permission from the user to do so.

> The core principle behind service workers is that even though your web application is inactive, your browser still stays active as a background process in your operating system and has access to native operating system APIs, so you can tell the browser what to do even when your user isn't active on the website.

There are tools like [Workbox](https://developer.chrome.com/docs/workbox/) that auto-generate a service worker file for you relevant to your web application framework and configuration.

### Retaining user state and actions offline

Now that we have an application that can load, execute scripts and display styling without an internet connection using a Service Worker; store information offline for usage later using Local Storage or IndexedDB, we need to move on to the next natural step, ensure what your user does on the app is reflected accordingly in a data store once they go back online, i.e: Retaining user state and actions.

This is actually pretty simple and there are only a few steps to make this happen:
- Whenever your user performs an action that requires a network call or data change in a data store:
  - Check if your user is offline, if they are, you have two options: 
    - If it's an action that in turn requires a lot more actions or triggers further actions like a money transaction, simply fail or have a retry with exponential backoff until you get a successful response.
    - However, if the action is not complex, for example: Renaming a post or liking a post, we can follow the following strategy:
  - Serialize/stringify the action and store it in a queue of actions locally in a storage layer like Local Storage or IndexedDB.
```json
{ 
  "action": { 
     "type": "UPDATE",
     "collection": "posts",
     "id": "<uuid>",
     "updates": { 
        "title": "New title",
        "updatedAt": "2023-02-25T10:08:01.071Z" 
      }
  }
}
```
  - Assume the action went through, and make the changes to your UI as they would in case you received a successful response (This strategy is called an `optimistic write`)
- In the background have an interval that takes actions from the queue and keeps retrying them with exponential backoff.

This approach does require you to have a serialization mechanism for your actions and a background job as an interval on your web app running, but if you're using a library to make API calls or a BAAS SDK like Firestore's client SDK, these functionalities are handled out of the box for you, even if they aren't, I'm willing to bet retries and a callback for when all retries fail are supported in your library of choice.

Multiply the complexity of the above process exponentially and you get universally loved applications like Notion and Google Docs.

I would also like to point out that I mentioned checking whether the user is offline, it is recommended to have periodic checks for the user's offline state or using the browser's `navigator.offline` property to check so (Disclaimer: Even that is not fully reliable).

Checking the offline status of the user based on a failed API call can be a long process as most browsers have a really long timeout for API calls in case the client is offline, so even if you fire a network call, there is a chance you won't know whether the user is offline or just has a very slow internet connection for several seconds.

### Now that all of it is done, why not add a [manifest](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) to your web app and turn it into a PWA?

When you visit Twitter in your browser, the first thing Twitter does is pop up a tray to ask you to add Twitter to the home screen, when you click on the tray and go ahead to add Twitter to your home screen, your browser adds what's called a "[Progressive Web Application](https://web.dev/progressive-web-apps/)" to your device, it's like a native app installed on your device that functions just like a web app but feels like a native app.

Ever wondered how that happens? The pattern is similar to how Service Workers work, your browser has access to your operating system's native APIs and can install applications on it, all you have to do is *tell* the browser that your app is installable, just like you told the browser that it could register a service worker to act as a proxy or run background jobs.

The way you tell a browser so is via a `manifest.json` file that looks a little like the following:

```json
{
  "short_name": "Weather",
  "name": "Weather: Do I need an umbrella?",
  "icons": [
    {
      "src": "/images/icons-vector.svg",
      "type": "image/svg+xml",
      "sizes": "512x512"
    },
    {
      "src": "/images/icons-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/images/icons-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "id": "/?source=pwa",
  "start_url": "/?source=pwa",
  "background_color": "#3367D6",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#3367D6",
  "description": "Weather forecast information"
}
```
You can tell your browser about the `manifest.json` file by adding the following link tag to your index page:
```html
<link rel="manifest" href="/manifest.json">
```

And there you'll have an installable app with a prompt like the following:
![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-to-make-your-web-app-work-offline%2Fsecondaryimages%2Fimage1677387509325.png?alt=media&token=1cefb12a-9a2c-4db9-a625-52035774f1b5)

And that's not the only thing you can do, with manifests you can specify shortcuts for your PWA like native apps once it's installed and even specify installation screenshots for your browser to show users before they install your app. 🤯

```json
"shortcuts": [
    {
      "name": "How's weather today?",
      "short_name": "Today",
      "description": "View weather information for today",
      "url": "/today?source=pwa",
      "icons": [{ "src": "/images/today.png", "sizes": "192x192" }]
    },
    {
      "name": "How's weather tomorrow?",
      "short_name": "Tomorrow",
      "description": "View weather information for tomorrow",
      "url": "/tomorrow?source=pwa",
      "icons": [{ "src": "/images/tomorrow.png", "sizes": "192x192" }]
    }
  ]
```

![Photo from web.dev's guide on app shortcuts](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-to-make-your-web-app-work-offline%2Fsecondaryimages%2Fimage1677387683953.png?alt=media&token=33baa510-5da6-4c6f-b4d5-493ce97beb7d)

```json
"screenshots": [
    {
      "src": "/images/screenshot1.png",
      "type": "image/png",
      "sizes": "540x720",
      "form_factor": "narrow"
    },
    {
      "src": "/images/screenshot2.jpg",
      "type": "image/jpg",
      "sizes": "720x540",
      "form_factor": "wide"
    }
  ]
```

![Photo from web.dev's guide on app install screenshots](https://web-dev.imgix.net/image/vvhSqZboQoZZN9wBvoXq72wzGAf1/5SlCnibmZHqkXdGVgPZY.jpeg?auto=format&w=1252)

Feels amazing, right?! Now you have a web app that not only loads and runs offline, but is also installable on your end user's device and feels like a native app, all with JavaScript. Welcome to the future!