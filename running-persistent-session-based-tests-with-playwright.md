# Running Persistent Session-Based E2E Tests with Playwright

![  ](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Frunning-persistent-session-based-tests-with-playwright%2Fprimaryimage.jpg?alt=media&token=4c8577da-d59e-4e09-810f-a931a353a1ee)

[PlayWright](https://playwright.dev/) is a great testing tool for running [End-to-End Tests](https://circleci.com/blog/what-is-end-to-end-testing) with various languages and frameworks.

One thing that is not clear upfront is how we can test end-to-end with a flow while persisting authentication and storage state between your tests.

After all, it isn't wise to log in to your user account again and again whenever you run a test module.

After a lot of experimentation and digging through Playwright's documentation, I found the solution to this problem to be [Playwright's Persistent Context](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context) which utilizes the browser's native capability of storing user data on the disk and then restoring it (Including data in localStorage, cookies, IndexedDB).

### What's a persistent browser context?

A [persistent browser context](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context) is a way to retain user data across multiple openings of a browser window, think of it as storing a snapshot of the tabs, their storage data (local storage, IndexedDB, cookies etc) on the disk or in memory to pick them up again in a future launch.

This is kind of a hack because we're taking advantage of the "resumability" of a browser window from one session to the other. But this is exactly what we need to fulfil our requirements.

### Let's do it!

Let's set up a file that will be responsible for housing our persistent context:

```javascript
// setup/get-browser-page.js

// Do this for whichever browsers you need to test on
const { chromium } = require("@playwright/test");

const BROWSER_USER_DATA_STORAGE_PATH = path.join(
	__dirname,
	"../../playwright/.persistent"
);

/**
 * @type { import("@playwright/test").Page }
 */
let page;
/**
 * @type { import("@playwright/test").BrowserContext }
 */
let context;

const getBrowserPage = async () => {
        // Firing up a page context is a heavy operation, thus always memorize it as much as possible
	if (page && context) return { page, context };

	context = await chromium.launchPersistentContext(
		BROWSER_USER_DATA_STORAGE_PATH
	);
	page = await context.newPage();
	return { page, context };
};

module.exports = getBrowserPage;
```

Now we can use the `page` and `context` in any of our tests with the following pattern:

```javascript
test.describe.configure({ mode: "serial" });

let page, context;

test.beforeAll(async () => {
	const response = await getBrowserPage();
	context = response.context;
	page = response.page;
});
```

This gives us a very powerful advantage, we can write all our tests in sequence and mimic a real user flow, starting from logging in to their accounts, navigating to their dashboards and in the end logging them out of their accounts.

Make sure to not close your page context immediately, and only close it in the final test.

```javascript
await context.close();
```