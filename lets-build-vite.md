# Let's build Vite (Or Any Other Frontend Development Environment Framework)

![Vite has revolutionized frontend app development](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-build-vite%2Fprimaryimage.jpg?alt=media&token=de4af93f-a87f-4eee-88a8-d306e6954d6d)

Remember the days of 2017? You had to complete 20-25 steps to create a simple React Project. If you're new to the frontend development ecosystem (>2019), you probably never had to go through the arduous journey of executing 20 different commands you had no idea about, just to get a basic "Hello, World" React application going. *What a nightmare!*

A lot of today's apps are spun up in seconds instead of a full day of chained command-line executions one after the other (Unless you're at a big company that moves at the pace of a snail, in which case, the setup time is still >15 days and takes 5 different engineers to run and get a basic repository up and running through all the approvals and checks needed 🤯).

A lot of that is thanks to the introduction of development and build frameworks like [Create-React-App](https://create-react-app.dev/), and today, [Vite](https://vitejs.dev/) - Used by millions around the world to save time they can then use to build the next big thing (Trust me, I have probably left several world-changing ideas on the table simply because I didn't want to go through the extensive setup process that React repositories once took).

### Index of this post

We'll cover the following in this post:
- How React or any other frontend library works - An Overview
- Step-by-step: Building a Vite Equivalent
  - Our Project's Structure
  - Some basics: Building a Command Line Tool
  - Choosing a bundler
  - Scaffolding of a new app
  - Building an app for production
  - Serving A Built App
  - Working with Environment Variables
  - Lazy Loading / Splitting of Chunks and Tree-Shaking
  - Dev Mode
    - Overview
    - Build Caching for fast builds
    - Live Reload
    - Advanced: Hot-Module-Replacement
    - Advanced: Lazy Compilation

### How React or any other frontend library works - An Overview

All apps built on frontend libraries work on a few simple principles:
1. An HTML file/template that has a DOM Element (Usually identified by the `id` or `className` set to `"root"`)
2. A script tag that imports a JavaScript bundle
3. That JavaScript bundle is responsible for importing the frontend library, and then the rest of the bundle takes over the root DOM Element and renders the app as needed.

![How Frontend Libraries Work - Overview.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-build-vite%2Fsecondaryimages%2FHow%20Frontend%20Libraries%20Work%20-%20Overview1733551882772.png?alt=media&token=e4cce894-8e8b-4d3d-aa66-bfcd7d50cea8)

In Dev Mode, there's one additional layer added, which is a websocket that's responsible for reloading any updated JavaScript or CSS bundles and re-rendering the components affected by them.

Vite and other development frameworks handle these abstractions for you, and that's exactly what we'll build in this post.

### Step-by-step: Building a Vite Equivalent

#### Our Project's Structure

```
.
├── bin
│   └── index.js
├── scripts
│   ├── build.js
│   ├── serve.js
│   ├── setup.js
│   └── dev.jd
├── helpers
│   └── ...
├── .gitignore
├── package-lock.json
└── package.json
```

#### Some basics: Building a Command Line Tool

Since Vite is run mostly on the command line as a Node.js executable, we'll have to do the same.

This is a simple process comprising the following steps:

1. Create a new Node.js project with a package.json
2. Add a `bin/index.js` file to the repository.

```js
#!/usr/bin/env node  <-- This tells the system that node.js is supposed to run this file when executed.

const command = (process.argv[2] || "").toLowerCase();

if (!command || typeof command !== "string") {
	console.log(
		"No command passed. Please pass either `dev`, `build` or `serve`, `scaffold`"
	);
	process.exit(0);
}

if (!["dev", "build", "serve", "scaffold"].includes(command)) {
	console.log(
		"Invalid command passed. Please pass either `dev`, `build` or `serve`, `scaffold`"
	);
	process.exit(1);
}

// To be filled in later

if (command === "dev")  process.exit(0);

if (command === "build") process.exit(0);

if (command === "serve") process.exit(0);

if (command === "scaffold") process.exit(0);
```

3. Go to `package.json` and add a `bin` object to the JSON and point a `vite-clone` key to `./bin/index.js`

```json
"bin": {
    "vite-clone": "./bin/index.js"
}
```

This now instructs `npm` and `npx` to treat `vite-clone` as an executable command. You can run `npm i .` and `npx vite-clone <any_command_key_from_the_above_file>` to see your script running on the command line.

You can then publish your project to `npm` as a package and have other people install it and run it as a command-line executable.

Do note that since your executable will be running all over the place, to find the current directory the script is running in, we'll use [`process.cwd`](https://nodejs.org/api/process.html#processcwd).

### Choosing a bundler

For every project, you would have a set of dependencies you import as well as the framework you build on. Combine them with the need to transpile ES6 or TypeScript code to vanilla JavaScript that is universally understood code for the browsers and a bundler + task runner combo becomes essential.

We can use several such tools, the most famous being [Webpack](https://webpack.js.org/). Vite uses [Rollup](https://rollupjs.org/), which we'll also use in our project, taking advantage of its extensively simple and widely adopted plugin system and super-active community.

Rollup also comes with built-in support for all the following amazing features:
- Static file import conversions to chunks
- Lazy-loading via deferred chunks
- Tree Shaking
- External Module marking reducing generated bundle sizes
- APIs that will help us with [Hot-module replacement](https://blog.devesh.tech/post/quick-dive-into-how-hmr-works) later.

#### Scaffolding of a new app

Vite allows you to quickly start an app with a template, be it [React or React with TypeScript](https://v2.vitejs.dev/guide/#trying-vite-online), [Vue](https://vuejs.org/), or even several newer frameworks.

Doing this is fairly straightforward, you can follow two approaches:
- Use a tool like [degit](https://github.com/Rich-Harris/degit) to pull template repositories to the user's device.
- (Or) Have a set of files to clone with their content, and then write those files using Node.js's FS Module.

Let's create our `scaffold` command that a user can run with `npx vite-clone scaffold ./<dir-path>`

```js
// ./bin/index.js file

// Replace the existing command === 'scaffold' block with this
if (command === "scaffold") {
	const dirName = process.argv[3] || "";
	const setup = require("../scripts/setup");

	setup(dirName);

	process.exit(0);
}
```
Create a new `scripts/setup.js` file with the following React.js boilerplate generator code:

```js
const fs = require("node:fs");
const path = require("node:path");

const fileList = [
	{
		name: "index.html",
		directory: "",
		content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite Clone + React</title>
  </head>
  <body>
    <div id="root"></div>
	<!-- % PROD BUILD INJECTOR % --> <!-- We'll use this later for build and dev scripts -->
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>`,
	},
	{
		name: "index.jsx",
		directory: "src",
		content: `import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
	},
	{
		name: "App.jsx",
		directory: "src",
		content: `function App() {
  return <div className="app">Vite Clone + React Starter</div>;
}
export default App;`,
	},
	{
		name: "package.json",
		directory: "",
		content: `{
	"name": "starter-vite-clone-react",
	"private": true,
	"version": "0.0.1",
	"scripts": {
		"dev": "vite-clone dev",
		"build": "vite-clone build",
		"serve": "vite-clone serve"
	},
	"dependencies": {
		"react": "^18.2.0",
		"react-dom": "^18.2.0"
	},
	"devDependencies": {
		"vite-clone": "...to be filled in later"
	}
}`,
	},
];

module.exports = function (dirName) {
	if (!dirName)
		return console.error("Please pass directory to scaffold project in");

	if (dirName.includes("/"))
		return console.error(
			"Cannot create project in a nested directory. Please navigate to one level above the folder for the project and run this command."
		);

	const basePath = path.resolve(process.cwd(), dirName);

	if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

	const dirStat = fs.statSync(basePath);

	if (!dirStat.isDirectory())
		return console.error("Supplied path is not a directory.");

	if (fs.readdirSync(basePath).length > 0)
		return console.error("Supplied path is not an empty directory.");

	for (let file of fileList) {
		const dirPath = path.resolve(basePath, file.directory || "");

		if (file.directory && !fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

		fs.writeFileSync(path.resolve(dirPath, file.name), file.content);
	}

	return console.log("Project setup in", dirName);
};
```

Now whenever someone runs `npx vite-clone scaffold ...`, it will generate the right boilerplate code for the project.

### Building an app for production

Let's get a basic build process out of the way (The trickiest part is dev mode).

When you are done developing your app from the files we scaffolded in the previous section, you would want to export all assets for your app, so you can upload them to a service like Vercel or Netlify to serve your end-users.

The process is pretty simple, you tell Rollup the path you want to build and it generates chunks to your specified file path.

We'll see the use of environment variables and more in the upcoming sections.

```js
// scripts/build.js

module.exports = async function build() {
	const fs = require("node:fs");
	const path = require("node:path");

	const srcEntryPath = path.resolve(process.cwd(), "src/index.jsx");
	const buildPath = path.resolve(process.cwd(), "build");

	// First, build the JS Chunks and move them to the build folder

	let bundle;
	let buildFailed = false;
	try {
		const { rollup } = require("rollup");

		// Plugins from Rollup
		const { default: nodeResolve } = require("@rollup/plugin-node-resolve");
		const { default: commonjs } = require("@rollup/plugin-commonjs");
		const { default: babel } = require("@rollup/plugin-babel");	// Transpile React code to regular JS
		const { default: terser } = require("@rollup/plugin-terser");  // Minify output

		/**
		 * @type {import('rollup').RollupOptions}
		 */
		const inputOptions = {
			input: srcEntryPath,
			treeshake: 'recommended',
			jsx: 'react-jsx',
			plugins: [
				nodeResolve({
					extensions: [".js", ".jsx"],
				}),
				babel({
					babelHelpers: "bundled",
					presets: ["@babel/preset-react"],
					extensions: [".js", ".jsx"],
				}),
				commonjs(),
				terser(),
			],
		};

		/**
		 * @type {import('rollup').OutputOptions[]}
		 */
		const outputOptions = [
			{
				dir: buildPath,
				format: "esm",
				sourcemap: true,
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
			},
		];

		bundle = await rollup(inputOptions);

		// Write the generated output files to disk
		for (const options of outputOptions) await bundle.write(options);

		console.log("React build completed successfully.");
	} catch (error) {
		buildFailed = true;
		console.error(error);
	}

	if (bundle) await bundle.close();

	if (buildFailed || !fs.existsSync(buildPath)) process.exit(1);

	// Now move anything from the public directory to the build directory
	const publicDirPath = path.resolve(process.cwd(), "public");

	if (fs.existsSync(publicDirPath))
		fs.cpSync(publicDirPath, buildPath, { recursive: true });

	// Now finally move the index.html file, pointing to bundle.js instead of /src/index.jsx
	const indexHTMLFile = fs.readFileSync(
		path.resolve(process.cwd(), "index.html"),
		"utf-8"
	);
	fs.writeFileSync(
		path.resolve(buildPath, "index.html"),
		indexHTMLFile.replace("/src/index.jsx", "index.js").replace(
			"<!-- % PROD BUILD INJECTOR % -->",
			`<script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
             <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>`
		)
	);
	process.exit(0);
};
```

Notice that I've kept React and ReactDOM separately for simplicity and moved our `public` folder to the `build` folder to ensure that our CDN or server can find the static files our developer intends to use.

All we now need to do is link this script to our executable:

```js
// bin/index.js
...
if (command === "build") {
	const build = require("../scripts/build");
	build();
}
...
```

### Serving A Built App

Once we have built the user's app, the user can upload the output from the `build` folder to any static-site hosting service such as Vercel, Netlify etc. Before they do that though, we would also want the user to be able to test the site before making it live to the world.

A simple mechanism to do so is to run the built site from the `build` folder with an executable package like `serve`, but the same can also be done with very few lines of code.

The following is the overview of how simply static site serving works:

![Vite Clone Static Serving.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-build-vite%2Fsecondaryimages%2FVite%20Clone%20Static%20Serving1733081200540.png?alt=media&token=1977a7c0-9196-40c8-ae01-1e6c8ad4a349)

The code for the same will be:

```js
// scripts/setup.js
module.exports = function serve(port) {
	const app = require("express")();

	const fs = require("node:fs");
	const path = require("node:path");

	const buildDirFolder = path.resolve(process.cwd(), "./build");
	const buildDirIndexHTMLFile = path.resolve(buildDirFolder, "./index.html");

	if (!fs.existsSync(buildDirFolder) || !fs.existsSync(buildDirIndexHTMLFile))
		return console.error(
			"No build has been generated for your app. Please run the build command first."
		);

	app.all("*", (req, res) => {
		const filePath = path.resolve(
			buildDirFolder,
			`.${req.path.replace("\\", "/")}`
		);

		const fileExists = fs.existsSync(filePath)
			? !fs.statSync(filePath).isDirectory()
			: false;

		// If a file with the request's pathname exists, send that back otherwise serve the index.html file itself
		return res.sendFile(fileExists ? filePath : buildDirIndexHTMLFile);
	});

	return app.listen(port, () =>
		console.log("Listening to requests on port", port)
	);
};
```

In our `bin/index.js` file we'll just have to make one slight change to the `serve` command so people can run a built site with `npx vite-clone serve <optional-port-number>`:

```js
if (command === "serve") {
	const port = Number(process.argv[3]) || 9191;

	const serve = require("../scripts/serve");

	serve(port);
}
```

### Working with Environment Variables

In frontend frameworks, environment variables are done by one of two methods:
- In Vite: `import.meta.env` is populated as an object with all the variables present in the `.env` file and the system.
- In frameworks like Create React App, a similar approach is followed but the code containing references to `process.env.<xyz>` is replaced in place with the value of the variable.

We will follow the second approach for simplicity, we'll use [`dotenv`](https://www.npmjs.com/package/dotenv) to read system environment variables as well as any locally stored `.env` or `.env.production` files and use Rollup's replace plugin to replace the code containing `process.env.<xyz>` with the value picked up from the environment variables.

```js
const processEnv = {};

const envProdPath = path.resolve(process.cwd(), ".env.production");
const envBasePath = path.resolve(process.cwd(), ".env");

// Priority to the prod env path and inject into processEnv variable
require("dotenv").config({ path: [envBasePath, envProdPath], processEnv });

...

const { default: replace } = require("@rollup/plugin-replace");

const envReplacements = {
	preventAssignment: true, // Avoid warnings
	"process.env.NODE_ENV": JSON.stringify("production"),
};

for (let key in processEnv)
	if (key.startsWith("REACT_APP_"))
		envReplacements[`process.env.${key}`] = JSON.stringify(processEnv[key] || '');

...
```

To prevent any crashes, we'll also define `window.process.env` as an empty object so unresolved references to `process.env.<xyz>` do not cause the entire app to crash in production mode. We'll do so at our production build-time and inject:

```js
const indexHTMLFile = fs.readFileSync(
	path.resolve(process.cwd(), "index.html"),
	"utf-8"
);
fs.writeFileSync(
	path.resolve(buildPath, "index.html"),
	indexHTMLFile.replace("/src/index.jsx", "index.js").replace(
		"<!-- % PROD BUILD INJECTOR % -->",
		`<script type="text/javascript">
			// In order to prevent process is not defined errors for when a variable hasn't been injected.
			process = { env: {} }
		 </script>
		 <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
                 <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>`
	)
);
```

### Lazy Loading / Splitting of Chunks and Tree-Shaking

You obviously don't want to put everything about your app into a single chunk file. For larger apps, it will become a nightmare with several megabyte-sized bundles.

Add to that, JavaScript is a heavy language to run and you get a perfect storm brewing if dependencies and modules are not managed properly.

To work around these problems, we have a combination of the following strategies: 

1. Lazy-loading/chunk-splitting
2. Tree-Shaking

##### Lazy-loading/chunk-splitting

Lazy-loading is fairly straightforward, instead of importing modules in your code in the static scope, you import it dynamically on some user action or somewhere later down the app lifecycle.

```js
const module = (await import('module-name')).default;
```

Modern bundlers such as Webpack and Rollup can determine these dynamic imports and automatically split one chunk into multiple chunks, importing the lazy-loaded chunks as and when needed.

If the block of code importing them never runs, they're never imported and don't bog down the rest of the application.

##### Tree-Shaking
Tree-shaking means removing code that is not used (Quite literally shaking a tree to see which fruits fall that are not connected to the tree).

It is less straightforward as there are different levels to tree-shaking a bundle. Primarily because not all modules are free of "side-effects".

For instance:

```js
 // This is a module import that has no exports
// but might have global definitions inside that affect the rest of the app
// so the compiler would be confused about whether this is a used or unused module
import 'module-name';
```

Some really famous libraries like Firestore Client SDKs pre-v9 work in this fashion, and are hence tricky to work with in the context of tree-shaking.

So there are trade-offs where you decide you don't want tree-shaking for side-effect modules and other configurations. For our build and dev configuration, we'll simply add to the rollup config, [the recommended settings](https://rollupjs.org/configuration-options/#treeshake).

```js
const inputOptions = {
   ...
   treeshake: 'recommended',
   ...
};
```

### The Complex Part: Dev Mode

Dev Mode is a combination of all the learnings we have seen above. We combine the static file serving from the `serve` command and the build configuration from the `build` command + Make some changes to make the app work in live mode.

Things start getting tricky here, let's decide what we'll build first:
- Dev Mode should include auto-refreshing of a frontend component whenever a file is updated.
- Any CSS and stylesheet changes should auto-reflect without needing a component refresh.
- Dev Mode should be faster than a full build mode and should build chunks as and when needed.

#### Build Caching for faster builds

When we run the app in Dev Mode, we don't want the entire build to run all over again on each minor file change, imagine having to wait 2 minutes for an entire build to run just because you changed the position of a comma in your UI code.

This is where build-caching comes into play. Hashes for each file are generated and compared, if the hashes match the previous build, then the file is skipped and not built again.

This is fairly simple to implement, Rollup has an [advanced configuration option](https://rollupjs.org/configuration-options/#cache) by itself, which we'll take full advantage of.

The build caching flow is fairly simple:
1. Rollup generates the first build bundle
2. It generates a `cache` configuration object with the bundle which you can store in memory or disk.
3. This configuration object can be passed into the future build every time there's a new change. This ensures that builds and reloads are fast.

We'll look at the implementation in the next section.

#### Live Reloading your app in Dev Mode

The simplest way for listening to changes to the `src` folder and reflecting them in the app being viewed in a browser is simple: Simply rebuild whenever you detect a change in the `src` folder and refresh the app after the quick build is finished.

This was the de-facto way to get live updates pushed during dev mode for the longest time.

Below is an overview of how it works:

![How Live Reload Works](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-build-vite%2Fsecondaryimages%2FHow%20Live%20Reload%20Works%20-%20Vite%20Clone1734414820627.png?alt=media&token=2e40a8d8-73ef-49d3-9801-e813d97ef19f)

The neat part: Rollup has a `watch` option that uses [`Chokidar`](https://www.npmjs.com/package/chokidar) internally to listen for changes to the file system inside the input `src` folder and rebuild just the chunk that has changed or has been affected.

Rollup's watch mode also writes the files to the disk for your app to pick up on reload.

#### Advanced: Hot-Module Replacement

Hot Module Replacement is when you change a component's code in its associated file and the changes reflect instantly without manually refreshing the app. This is a huge value add and speeds up development.

![HMR In Action](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fquick-dive-into-how-hmr-works%2Fsecondaryimages%2FScreen%20Recording%202023-09-05%20at%2011.44.54%20AM.gif?alt=media&token=a4e6a6de-b77d-4a00-8ba3-bb82fbd73454)

I've researched and written about Hot Module Replacement in this blog post: [A Quick Dive into how HMR Works](https://blog.devesh.tech/post/quick-dive-into-how-hmr-works).

We need to set up a few things to make Hot Module Replacement work:
1. A watcher for listening to changes to our files in the `src` directory.
2. A WebSocket server that our frontend development-mode bundle will connect to listen for changes.
3. A mechanism to refresh the entry point of the app and reflect the right changes (React's reconciliation process should take care of it but we'll dive in a little just in case)

#### Advanced: Lazy Compilation

Vite also provides an amazing development experience feature: Lazy Compilation. It is when only the chunks necessary for the app's starting point are compiled, making the development startup times extremely fast.

The bundles for all other chunks are compiled as and when needed. This is very evident when you have errors in lazy-loaded code, and they are not thrown until the screen switches to needing that code. In build mode, the entire app is compiled and bundled at once.)

#### The Dev Mode Script

Our dev mode script consists of a few major components:
- A temporary `.dev` directory houses files for our build and output files.
- An Express Server, similar to our serve script.
- A Rollup `watcher` using `chokidar` underneath, that listens to the changes in the `src` folder, rebuilds what's needed, and writes it to the `.dev` folder.
- A `livereload` server listens to changes in the final `.dev` directory and `public` directory and reloads the app when needed.
- A cleanup function that is executed on process termination which deletes the `.dev` directory and closes any active file watchers.

```js
// scripts/dev.js

const fs = require("node:fs");
const path = require("node:path");

const devDirFolder = path.resolve(process.cwd(), "./.dev");
const publicFolderPath = path.resolve(process.cwd(), "./public");

let builderAndWatcher;
let initialBuildDone = false;
let cache = true;

const setupServer = () => {
	const liveReload = require("livereload");
	const liveReloadServer = liveReload.createServer();

	// Reload the webpage on any changes to the final dev build
	liveReloadServer.watch([devDirFolder, publicFolderPath]);

	// Start the express server
	const app = require("express")();

	app.use((req, res, next) => {
		console.log("Serving request at:", req.path);
		next();
	});

	app.all("*", (req, res) => {
		const publicFilePath = path.resolve(publicFolderPath, `.${req.path.replace("\\", "/")}`);
		const devFilePath = path.resolve(devDirFolder, `.${req.path.replace("\\", "/")}`);

		const publicFileExists = fs.existsSync(publicFilePath)
			? !fs.statSync(publicFilePath).isDirectory()
			: false;
		const devFileExists = fs.existsSync(devFilePath)
			? !fs.statSync(devFilePath).isDirectory()
			: false;

		// If a file with the request's pathname exists, send that back otherwise serve the index.html file itself
		if (publicFileExists) return res.sendFile(publicFilePath);
		if (devFileExists) return res.sendFile(devFilePath);
		else return res.sendFile(path.resolve(devDirFolder, "./index.html"));
	});

	const port = process.env.PORT || 5173;

	app.listen(port, () => console.log("Listening to requests on port", port));
};

module.exports = async function dev() {
        // This would be the same as the build script config but with a couple of minor differences 
	const getRollupDevConfig = require("../helpers/configs/rollup.dev.config");

	const rollupDevConfig = getRollupDevConfig();

	if (!fs.existsSync(devDirFolder)) fs.mkdirSync(devDirFolder);

	const { watch: generateBuilderAndWatcher } = require("rollup");

	builderAndWatcher = generateBuilderAndWatcher({
		...rollupDevConfig.inputOptions,
		output: rollupDevConfig.outputOptions,
		watch: rollupDevConfig.inputOptions.watch,
		cache,
	});

	builderAndWatcher.on("event", (event) => {
		if (event.code === "BUNDLE_END") {
			if (event.result && event.result.cache) cache = event.result.cache; // Cache for next build
			if (event.result) event.result.close();
		}

		if (event.code === "END") {
			console.log("Waiting for changes...");

			if (!initialBuildDone) {
				initialBuildDone = true;

				// Write the index.html file
				const indexHTMLFile = fs.readFileSync(
					path.resolve(process.cwd(), "./index.html"),
					"utf-8"
				);

				// TODO: Inject websocket listener for HMR Chunk events
				fs.writeFileSync(
					path.resolve(devDirFolder, "index.html"),
					indexHTMLFile.replace("/src/index.jsx", "index.js").replace(
						"<!-- % PROD BUILD INJECTOR % -->",
						`<script type="text/javascript">
							// To prevent process is not defined errors for when a variable hasn't been injected.
							process = { env: {} }
						</script>
						<script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
						<script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>

						<!-- Live Reload Injected Script -->
						<script src="http://localhost:35729/livereload.js?snipver=1"></script>`
					)
				);

				setupServer();
			}
		}
	});

	builderAndWatcher.on("change", (fileName, eventData) => {
		console.log(eventData.event, "detected:", fileName);
	});
};

const cleanup = () => {
	if (fs.existsSync(devDirFolder))
		fs.rmdirSync(devDirFolder, { recursive: true, force: true });

	if (builderAndWatcher) {
		builderAndWatcher.close();
		builderAndWatcher = null;
	}

	process.exit(0);
};

process.on("exit", cleanup);
process.on("SIGINT", cleanup);
```

The rollup configuration for the same would be similar to the build mode configuration:

```
module.exports = function getRollupDevConfig() {
	const path = require("node:path");

	const srcEntryPath = path.resolve(process.cwd(), "src/index.jsx");
	const buildPath = path.resolve(process.cwd(), ".dev");

	// First read environment variables for injection-based replacement in the generated bundles
	const processEnv = {};

	const envDevPath = path.resolve(process.cwd(), ".env.development");
	const envBasePath = path.resolve(process.cwd(), ".env");

	// Priority to the prod env path
	require("dotenv").config({
		path: [envBasePath, envDevPath],
		processEnv,
	});

	// Plugins from Rollup
	const { default: nodeResolve } = require("@rollup/plugin-node-resolve");
	const { default: commonjs } = require("@rollup/plugin-commonjs");
	const { default: babel } = require("@rollup/plugin-babel");
	const { default: terser } = require("@rollup/plugin-terser");
	const { default: replace } = require("@rollup/plugin-replace");

	const envReplacementOptions = {
		preventAssignment: true, // Avoid warnings
		values: {
			"process.env.NODE_ENV": JSON.stringify("development"),
		},
	};

	for (let key in processEnv)
		if (key.startsWith("REACT_APP_"))
			envReplacementOptions[values][`process.env.${key}`] = JSON.stringify(
				processEnv[key] || ""
			);

	/**
	 * @type {import('rollup').RollupOptions}
	 */
	const inputOptions = {
		input: srcEntryPath,
		treeshake: "recommended",
		jsx: "react-jsx",
		plugins: [
			nodeResolve({
				extensions: [".js", ".jsx"],
			}),
			replace(envReplacementOptions),
			babel({
				babelHelpers: "bundled",
				presets: ["@babel/preset-react"],
				extensions: [".js", ".jsx"],
			}),
			commonjs(),
			terser(),
		],
		watch: {
			exclude: "node_modules/**",
			include: "src/**",
			chokidar: {
				ignored: (path, stats) => stats?.isFile() && !path.includes(".js"),
				ignoreInitial: true,
				persistent: true,
			},
		},
	};

	/**
	 * @type {import('rollup').OutputOptions[]}
	 */
	const outputOptions = [
		{
			dir: buildPath,
			format: "esm",
			sourcemap: true,
			globals: {
				react: "React",
				"react-dom": "ReactDOM",
			},
		},
	];

	return { inputOptions, outputOptions };
};

```

### The Goalpost

Did I forget to tell you? Since we built this as a command-line tool, you can actually package this and release this on npm for use by other engineers using `npm publish` if the package-name you've given your repository doesn't already exist. Make sure to `.gitignore` - `node_modules` and other useless files though.

This was a fun little post to build your own development and build environment for your front-end apps.

One might read this and exclaim: "Wait, you just used a few abstractions like Rollup and LiveServer to construct an equivalent to Vite, you didn't build everything from scratch" and they'll be correct. That's the point of engineering, you keep building things with abstractions till you learn how those abstractions work underneath.

The goalpost of learning to build and understand is a moving goalpost and as such needs constant work. This post doesn't go super-deep into the implementation details of each and every component, especially advanced ones like hot-module-replacement and lazy-compilation but we'll get there too with future posts, just stay tuned.