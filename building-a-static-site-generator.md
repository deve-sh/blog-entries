# Building a Static Site Generator

![Photo by Tranmautritam from Pexels](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-static-site-generator%2Fprimaryimage.jpg?alt=media&token=9fab02f4-80d3-46a7-a267-b58844a7e3e4)

I'm a fan of Next.js and Gatsby, both great options for building static sites and dynamic server-rendered sites as well. So I decided I'll give my own site generator a try.

Let's call it **Stratify**, for some reason. We'll build it as a command-line interface. You can check it out [on GitHub](https://github.com/deve-sh/stratify) or even install it on your own system using [npm](https://npmjs.com/package/stratify-web).

### Tech Stack

I'm going to use plain Node.js with plain JavaScript with a few dependencies, we'll be extensively using the inbuilt `fs` (file-system) and `path` packages. We'll try to keep the dependencies to the bare minimum.

Libraries/Node.js Packages that I'll be using additionally:

- [Marked](https://marked.js.org/) - For conversion from markdown to HTML
- [Live Server](https://www.npmjs.com/package/live-server) - For running a live server when the user would run the `stratify dev` command.
- [fs-extra](https://www.npmjs.com/package/fs-extra) - For additional utilities that we will need on top of the existing functionality provided by the Node.js `fs` module.
- [serve](https://www.npmjs.com/package/serve) - For serving the build output of the website on a server, when the user runs the `stratify start` command after building the project.

### Adding Commands For Users

So Node.js supports adding binary executables to your package, we want our package to function the way command-line applications do. I.E: Users shouldn't require to add `npm run` or `node ...` before our commands. For that we have the `bin` part of our package.json file handy. Essentially, the `bin` section tells the system which commands it has to precompile and which files it should invoke in case a user executes those commands.

> You can also use the `bin` command with the recent runners like `npx` which don't even require you to have the package installed in the first place.

```json
{
    ...
    "bin": {
        "create-stratify-project": "./create-stratify-project/index.js",
        "stratify": "./scripts/index.js"
    }
}
```

On running `npm i -g` in our directory, we get direct access to the `create-stratify-project` and `stratify` commands (We'll discuss this in the upcoming sections) from our command lines. Users can install our package globally and use the same.

More on this in this [great article](https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs).

### Helping the users setup a boilerplate

As mentioned above, we created a `create-stratify-project` command, this will help our users setup a boilerplate the way they can with `create-react-app` and `create-next-app`.

```bash
create-stratify-project <directory-name> [?App Name]
```

We'll create a simple file, that contains all pre-packaged files required for the user to get started, linked to the `create-stratify-project` binary command.

The file can be found [here](https://github.com/deve-sh/stratify/blob/main/create-stratify-project/index.js).

### Templates

Just Markdown is not appealing on the web, the document generated needs additional info as well. For example, meta tags to tell the browser whether the page is responsive or not, a different title for each page, stylesheets to modify the content that has been generated on the page, in those cases, the power of plain HTML can come in handy.

We can add support for Templates, where a boilerplate is already setup for the user, we simply take the markdown content compiled to HTML and inject it into the appropriate position in the template.

If the user has a page named `post-1.md`, they could create a `templates/post-1.html` file and it will be picked up, if a matching template name is not found, the builder defaults to the `templates/index.html` file. If no templates are found, the html output generated is a simple conversion of the markdown to HTML.

An example of a template would be:

```html
<html>
	<head>
		<title>\{\{ title \}\}</title>
	</head>
	<body>
		\{\{ content \}\}
	</body>
</html>
```

We inject the conversion output from the markdown file in place of `{{ content }}` and the title of the page in place of `{{ title }}`. The user can simply add any additional meta tags, scripts, stylesheets they need in this file and they will be included in the build output.

### Static Files

Static Files are important for a website, because they don't necessarily contain code, but are rather files that don't change very often and hence can be served without a lot of overhead.

We'll be supporting static files using the `public` folder like a lot of existing frameworks like Next.js do.

The simplest approach is to move the files from the `public` folder during build/start time to the same folder where the markdown compiled output is present. That way, a snippet like `<img src="/image.jpeg" />` would work properly along with all other snippets requiring static assets.

Another approach is of course, using an express server and setting it to serve all static files from the public folder, this is an approach used by frameworks like Next.js and Create-React-App.

**Slight Note for upcoming sections:** `process.cwd()` is extensively used in the code, since this is a command line application, we use the value returned by `process.cwd()` (Which is the current directory from which the user is executing the program). Similary we will use `process.argv` which is a way for us to receive command line arguments into our program.

### Building a Page

The method to build a page is simple, we'll create a function that takes the page file's name and directory as the first argument and the folder to put the build output in.

![building-page-process.jpg](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-static-site-generator%2Fsecondaryimages%2Fbuilding-page-process1644810225351.jpg?alt=media&token=23df40db-a43a-4a99-8b70-02a954f6994d)

```javascript
const buildPage = async ({ fileName, directory }, buildFolder) => {
	const path = require("path");
	const fs = require("fs");

	const pageName = fileName
		.split(path.resolve(process.cwd(), "./pages"))[1] // Get the full file name for the markdown file
		.split(".md")[0] // Remove the .md extension;
		.replace("\\", "/"); // Remove opposite slashes from the path

	console.log("Building page: ", pageName);
	const markdownContent = fs.readFileSync(fileName, "utf-8");
	const { html: convertedHTML, title = "" } = parseMarkdown(markdownContent);

	if (directory)
		fs.mkdirSync(`${buildFolder}${directory}`, { recursive: true });

	// Check if there is any template present for this page.
	const template = getPageTemplate(pageName);
	if (template)
		fs.writeFileSync(
			`${buildFolder}/${pageName}.html`,
			// Replace the  {{ content }} block with the converted markdown HTML
			template
				.replace("{{ content }}", convertedHTML)
				.replace("{{ title }}", title)
		);
	else fs.writeFileSync(`${buildFolder}/${pageName}.html`, convertedHTML);
};

module.exports = buildPage;
```

In the above example, we're using some functions as abstractions (I.E: A simple helper function to get templates that might be associated with the page, one to parse markdown and so on, these are available in the GitHub repository previously listed). The function is marked as an asynchronous function so multiple pages can be compiled and built at the same time. For that reference, check out [this blog post](https://blog.devesh.tech/post/performance-optimization-with-promises-in-javascript).

### Building the entire site

Now since we have started building one page, we can replicate this functionality and build all pages in a similar fashion, but we'll also move all contents of the `public` folder to the `build` folder so the static assets are available to the .html files that are generated.

```javascript
// scripts/build.js
async function buildPages(
	buildPath = "./build",
	silent = false,
	exitPostBuild = true
) {
	const readPagesDirectory = require("../helpers/readPagesDirectory");

	const markdownFiles = readPagesDirectory();

	const dirExists = require("../helpers/dirExists");
	const fs = require("fs");
	const path = require("path");

	const buildFolder = path.resolve(process.cwd(), buildPath);
	const publicFolder = path.resolve(process.cwd(), "./public");

	if (dirExists(buildFolder)) fs.rmSync(buildFolder, { recursive: true });
	fs.mkdirSync(buildFolder);

	if (markdownFiles.length) {
		const buildPage = require("../helpers/buildPage");
		const pageBuilds = [];
		for (let file of markdownFiles)
			pageBuilds.push(buildPage(file, buildFolder));

		await Promise.all(pageBuilds);

		if (!silent) console.log("Finished Building Pages");
		if (!silent) console.log("Moving static assets to build directory");
		if (dirExists(publicFolder)) {
			// For all static assets
			const copyAllFolderContents = require("../helpers/copyAllFolderContents");
			copyAllFolderContents(publicFolder, buildFolder);
		}
	}

	if (!silent) console.log("Build successful");
	if (exitPostBuild) return process.exit(0); // Done building without any issues
}
module.exports = buildPages;
```

### Dev Server

We have two options to do this:

1. Create an express app internally that serves the static assets from `public` folder, and on each request, compiles markdown from the requesting page, converts it to HTML and serves it.
2. Use an existing utility package like `live-server` that we feed a `.live` folder, which contains the build output from the `pages` directory and the `public` directory. We listen for changes to any files in the pages directory using [`fs.watch`](https://nodejs.org/docs/latest/api/fs.html#fswatchfilename-options-listener) and build that specific page, put it into `.live` and let the live server do its job.

For me, the simpler approach was the second one, however, watch out for a beta version of the package in case I decide to try out approach one.

You could also try Webpack's Hot Module Reload, but I've never been a fan of Webpack and its working so I refuse to give it a try.

Check out the file responsible for running the dev server [here](https://github.com/deve-sh/stratify/blob/main/scripts/dev.js).

### Serving a Build

One we have built the site into html files from the `pages` directory into the `build` folder. There's a very simple package we need to use in order to serve a build: [`serve`](https://npmjs.com/serve). It can be run directly using `npx run serve` so all we need to do for our use case is execute that command.

```javascript
// scripts/start.js

// Check if there is a build folder, if yes, use the 'serve' package to serve it's content on a local server.
function start() {
	const path = require("path");
	const dirExists = require("../helpers/dirExists");

	if (dirExists(path.resolve(process.cwd(), "./build"))) {
		const { execSync } = require("child_process");
		execSync("npx serve build", { stdio: "inherit" }); // stdio: inherit means all the input output will be of the command that execSync is running.
	} else
		console.log(
			"There is no build folder. Run npm run build to build your pages."
		);
}

module.exports = start;
```

### Putting it all together

Since we now have all functionality required in order to develop, build and serve a static website generated using Markdown. We can setup the scripts interface, which will actually make `stratify dev`, `stratify build` and `stratify start` work.

`scripts/index.js`:

```javascript
#!/usr/bin/env node

const commandType = process.argv[2];

if (!commandType || !["dev", "build", "start"].includes(commandType))
	return console.log("Use stratify dev/build/start for appropriate action.");

if (commandType === "dev") {
	// Start the dev server, with live reloading for changes in the 'pages' directory.
	const dev = require("./dev");
	dev();
} else if (commandType === "build") {
	// Build the pages directory and generate a 'build' folder.
	const build = require("./build");
	build();
} else if (commandType === "start") {
	// Check if there is a build folder, if yes, use the 'serve' package to serve it's content on a local server.
	const start = require("./start");
	start();
}
```

That's it, we publish the package, and once we run `npm i -g stratify-web`, the binary executables for the package will be ready for everyone to use as highlighted [here](https://github.com/deve-sh/stratify#readme).

[Check out the package source code](https://github.com/deve-sh/stratify)

[Check out the package published on npm](https://npmjs.com/package/stratify-web)
