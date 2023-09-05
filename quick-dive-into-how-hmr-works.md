# A Quick Dive into how HMR Works

![Tools like Webpack and Vite have an amazing feature: HMR](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fquick-dive-into-how-hmr-works%2Fprimaryimage.jpg?alt=media&token=4e20941c-1b13-4b9d-aab7-c45b5dc6455d)

Ever started working on a frontend project with a modern bundling tool like [Webpack](https://webpack.js.org/) or [Vite](https://vitejs.dev/) and noticed that whenever you make a change to your source files, the page automatically updates without a complete page reload?

For most of us, the above is the basic expectation when we work with an app. In fact, the lack of this functionality is often a deal breaker for all but a few people, including me. We are no longer bound by making changes and having to manually go and reload the entire page + make our way back to the application state we were at, making our development workflows faster.

This feature is called "[Hot Module Replacement](https://webpack.js.org/guides/hot-module-replacement/)" It essentially swaps out an older version of a module with a new version (The change that you just made).

![HMR in action](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fquick-dive-into-how-hmr-works%2Fsecondaryimages%2FScreen%20Recording%202023-09-05%20at%2011.44.54%20AM.gif?alt=media&token=a4e6a6de-b77d-4a00-8ba3-bb82fbd73454)

Ever wondered how it works? I have and we'll quickly explore how HMR works to make our lives easier.

### First: How does your frontend know something has changed

During your development session you will make several changes to your code. Hence, the frontend needs to be notified that many times in real-time. What's a good way to send several real-time changes to a web app and have the communication be bi-directional? [Web Sockets](https://en.wikipedia.org/wiki/WebSocket).

Let's first start with the basics, How is your frontend app served? Even if your frontend is a purely static web app consisting of nothing but HTML, CSS and JS, it still needs a server to serve it.

Thus, your tool will spin up a server (Most commonly an `express` server) and do the following things via the main process:
- Ask the server to serve static assets like images, CSS files and scripts via a `build` or `dist` folder. This can even come from an in-memory cache if your tool supports it.
- Ask the server to set up a web socket endpoint and inject code to connect and listen to the web socket into the main `index.html` file.
- Create a listener (Using a library like [chokidar](https://www.npmjs.com/package/chokidar)) that listens to file changes and save operations; this listener will tell the server to send a message to the frontend about an update operation that's taken place.

![A basic representation of what the setup looks like](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fquick-dive-into-how-hmr-works%2Fsecondaryimages%2FThe%20HMR%20Arch1693900186847.png?alt=media&token=e7a28d0d-3941-4022-8dbc-4429e8981539)

Now what happens on the front end and the structure of the messages sent is something we'll look at in the upcoming section.

### The Module Map

When you create a frontend app, you write code in files that are called "modules" and each module can be bundled separately, they refer to variables and other modules via "references" (Think of it as the import statements you have in your files).

Let's take for example a React app's `main.jsx` file that imports the App module and renders it.

```jsx
import App from './app';

const reactRoot = ReactDOM.createRoot(rootEl);
reactRoot.render(<App />);
```

Then in `<App />`, there might be several imports and variables that are linked to it, and so on. A really large React app for example could have several modules linked to each other.

This entire web creates what's called a "Module Map". Anyone who's even slightly familiar with Webpack knows it looks something like the following:

```javascript
{
   "<auto_generated_module_id_or_path>": {
     ... Information about the module
  }
}

// The module can then be imported in a bundle with:
__webpack_require__("<auto_generated_module_id_or_path>");
```

Module maps essentially act as "discovery" for the bundlers, even if the underlying file's code changes, the reference and ID for the module stay the same. This information will come in handy in the next section.

### The HMR Flow

For a tool like Vite, this is what the HMR flow looks like:

![Expand the image to see the full flow](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fquick-dive-into-how-hmr-works%2Fsecondaryimages%2Fimage1693896108790.png?alt=media&token=18752fb6-bb7b-4561-b42b-32fe75f9f680)

Remember the Module Map? Vite only has to do two things when a non-core module changes:
- Swap out the new version of the updated module.
- Trigger a re-execution of the core file (Vite and Webpack know your core file, which is the `entrypoint` of your app), your framework or frontend library with functions like `ReactDOM.render` should ensure your state isn't lost as long as the component and the root are the same.

All the modules that link to the module that has been updated will automatically fetch the updated code since they are doing so via an abstraction (In the case of webpack: `__webpack_require__`).

That, in essence, is how HMR works. And it's awesome! ✨

There's a lot more technical stuff with Webpack's `module.hot` and the settings you need, but for a good understanding of how HMR works, you don't need to worry about it. It's merely a wrapper around your main file that is responsible for listening to change pings on the web socket and rerunning the main file's code.