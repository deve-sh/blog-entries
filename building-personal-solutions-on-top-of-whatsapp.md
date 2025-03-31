# Building Personal Solutions on top of WhatsApp

![WhatsApp-Web.js is an amazing utility!](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-personal-solutions-on-top-of-whatsapp%2FWhatsApp.png?alt=media&token=7d2bc30e-a2b4-40f8-8b93-85eb4f98b100)

If you're Indian, you can agree on the problems that are created with WhatsApp as the means, including mass misinformation campaigns and the unforgivable Good Morning and Good Night messages we get from our annoying relatives and uncles.

However, a fact remains undeniable: for a majority of the people in the country, it has created a ton of impact by giving them the means to communicate effortlessly with their loved ones.

A slightly overlooked fact is also that WhatsApp has made its way to a common business communication medium. My own business (Solar Ladder) runs majorly on it, and there are entire companies whose customer support functions would grind to a halt without WhatsApp. No matter how technologically advanced these companies are, their customers might still not have made the switch.

Since so many businesses operate on WhatsApp, you would expect a plethora of tools to emerge around it, but the ecosystem for WhatsApp is fairly small, except for, of course, the official WhatsApp Business tools and APIs. Even the official Business API comes with a ton of restrictions around what messages you can and cannot send to WhatsApp users and rate limits, plus a pricing tier that would bleed you dry if you don't have a lot of money lying around.

There's a simple reason for the lack of tools built around WhatsApp: the risk of abuse. Facebook (Meta—the parent company of WhatsApp) is extremely cautious in exposing APIs for building anything with WhatsApp. And by anything, I mean anything.

When you have a platform used by Billions of people daily, and their entire lives running around it, it's very easy for a bad actor to slip in and wreak havoc. Imagine you are waiting for a message from your mother back home, and every time your phone chimes, the notification is yet another message offering you get-rich-quick schemes or multi-level marketing schemes, designed to prey on people who are deep in the demographic that uses WhatsApp.

Worse yet, imagine a grandfather who uses WhatsApp as his daily mode of communication and isn't tech-savvy; it would not be far-fetched to say the grandfather would empty his entire bank account to support the "urgent message" from a contact pretending to be his grandson. We grew up with email spam being a huge problem; imagine having to build a spam detection and discarding box for WhatsApp. That's an engineering effort I don't think Meta would be too fond of. Especially when Meta built APIs on top of the then-ubiquitous "Facebook," which led to the [Facebook-Cambridge Analytica Data Scandal.](https://en.wikipedia.org/wiki/Facebook%E2%80%93Cambridge_Analytica_data_scandal)

With the risks and restrictions well known, builders like me will say just one thing:

> WhatsApp doesn't have APIs? As if that is going to stop me.

But do note: Whatever I am writing in this post is meant purely as a fun side project and not something I'm comfortable turning into a product; neither do I encourage anyone to do so. WhatsApp is built on the principle of connecting you with your loved ones. It's a side effect that we ended up using it as a means of business communication. But the core principle still stands, so don't be a means to bring something dystopian to something useful (although I might argue Meta with its AI chatbots and business API that allows businesses to spam us right now even with the restrictions by itself is the one enabling that).

Now, coming back to businesses using WhatsApp, a common occurrence is the need for you to send messages to someone at a later day or time. It could be to remind them of a meeting or to follow up on something you decided weeks ahead. It's been a standard feature in almost all workplace messaging mediums, be it Slack or email (Gmail took forever but finally added this feature). But not so on WhatsApp. I'm pretty sure WhatsApp will add this feature eventually. 

Similarly, for someone who works on WhatsApp, there's never truly a clear divide between work messages and personal messages. So when your phone chimes, you don't know if it's your annoying society uncle or a customer who needs urgent help. Why not switch to a workplace messaging tool? Simple, you can do so, but your customers won't.

A solution could be to turn off all notifications from WhatsApp and selectively enable notifications for workplace groups and customer channels or contacts. Something like a "focus mode.". Currently, WhatsApp notifications are opt-out, rather than opt-in. We'll solve this problem in this post too.

### What We'll Build

We'll build a simple project that'll allow us to do the following:

- Schedule WhatsApp messages where I want to follow up with my co-workers and customers or set reminders for them at a future date and time. I currently do this by setting inconvenient alarms and to-dos, which are sometimes missed and require you to be present at the time of sending those messages.

- Create clear distinctions between my business and personal contacts, and snooze or pause notifications from personal contacts that aren't a priority. It's a huge focus drain for me throughout the day.

The solution to the above is open-source. And you can find the repository here: [github/deve-sh/WhatsApp-Message-Scheduler](https://github.com/deve-sh/WhatsApp-Message-Scheduler).

### Let's see how we can build it.

I started scanning the internet for solutions, but most solutions were either just ads for WhatsApp Business API services (no shocker—Google's SEO has sucked for the longest time I can remember) or business-facing solutions such as [Periscope,](https://periskope.app/) which is an amazing software, by the way, but doesn't solve for the problems I've mentioned above.

But that got me started somewhere; I eventually stumbled upon an unbelievably good library: [whatsapp-web.js](https://wwebjs.dev/) which enables us to use WhatsApp Web and exposes APIs on top of it with WhatsApp Web running in a [Chromium-driven](https://www.chromium.org/chromium-projects/) [Puppeteer](https://pptr.dev/) instance. Their [API list](https://docs.wwebjs.dev/) is exhaustive, and I am shocked that a library this good is available for free.

> Just goes to show the passion driving people who do it not for the money but for the craft of solving for "How does WhatsApp Web work underneath? Let's figure it out"

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-personal-solutions-on-top-of-whatsapp%2Fsecondaryimages%2Fimage1738387290244.png?alt=media&token=f886cacc-cced-4f41-b3b9-ab1b002ce58a)

The library is similar to another one I found: [https://github.com/WhiskeySockets/Baileys](Baileys) but I'll go ahead with [whatsapp-web.js](https://wwebjs.dev/) as it's got better community support and more downloads.

### How WhatsApp-Web.js Works

WhatsApp-Web.js sits on top of a [Puppeteer](https://pptr.dev/) instance and interacts with the client APIs available to send and receive messages and not the DOM elements, internally instructing the WhatsApp Web Client to show QR codes, send messages, send attachments, etc.

It's interesting how many APIs WhatsApp exposes simply via the window.require function, and the guys at WhatsApp-Web.js have used it to their advantage.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-personal-solutions-on-top-of-whatsapp%2Fsecondaryimages%2Fimage1738739269381.png?alt=media&token=17e598a5-e416-48f6-b207-35370775d754)

WhatsApp-Web.js is an event emitter where you can listen to most WhatsApp-Web.js events such as qr, message, read-receipt-change, logout etc.

![WhatsApp-Web - 1.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-personal-solutions-on-top-of-whatsapp%2Fsecondaryimages%2FWhatsApp-Web%20-%2011739456150590.png?alt=media&token=afeef1b8-d1e8-4017-89f4-814ad6795378)

We can thus build a RESTful API on top of this to interact with the WhatsApp Web instance running inside the browser.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-personal-solutions-on-top-of-whatsapp%2Fsecondaryimages%2FWhatsApp-Web1738739060201.png?alt=media&token=44dac437-3fba-4996-add3-d94528af3f6b)

> Note: Running WhatsApp via such clients is against WhatsApp Terms Of Service, so there are ban risks involved here and WhatsApp has some [amazing filters](https://scontent.fdel27-1.fna.fbcdn.net/v/t39.8562-6/299911313_583606040085749_3003238759000179053_n.pdf?_nc_cat=101&ccb=1-7&_nc_sid=b8d81d&_nc_ohc=rhjLmR7DeVsQ7kNvgE5TA4I&_nc_zt=14&_nc_ht=scontent.fdel27-1.fna&_nc_gid=AkMSWsz0r5-1OeKNxJ8ROuY&oh=00_AYDm4BGe8m4ymgrIvldWbdIboIErcZSkSo91Qx4zNC-M6A&oe=67A8C894) to block out spam. However, the risks are infinitely lower for a number that has a good age attached to it and gets used daily in natural conversations.

WhatsApp-Web.js also has a concept of stores that help retain memory about a user session so even if the browser instance is closed, it can simply restart. Some stores support local memory, such as AWS or even Google Cloud Storage, which I wrote for fun [here](https://github.com/deve-sh/wwebjs-google-cloud-storage-store).

### A Quick Note

WhatsApp-Web.js is a hack on top of WhatsApp Web and thus is not foolproof. Just like all hacks, this one will come to an end too.

Nothing in life is permanent, so enjoy it while it gets the job done.

If you need assurance that things change and they're okay. Just watch [this video](https://www.youtube.com/watch?v=BxV14h0kFs0).

[Embed](https://www.youtube.com/embed/BxV14h0kFs0)

### Message Scheduling -> How it will work

Let's set some rules for how we'll work with WhatsApp Web in general:

1. We will ensure the security of our chats. Since WhatsApp-Web.js sits on top of the client, it has unencrypted access to our entire chat history and contacts list. Thus, we want to ensure that we, and only we, can access this instance.

2. We'll host the setup on a private cloud instance or even on our own device if that's on most of the time.

3. We'll mandate HTTPS for our client-server communication.

With these rules in mind, let's outline the steps for us to get the setup working:

1. A basic Express server that supports HTTPS certificates

```js

const app = require('express')();

let listenableServerRef = app;

let port = process.env.PORT || 8080;

if (

	process.env.SSL_FULL_CHAIN_FILE_PATH &&

	process.env.SSL_PRIVATE_KEY_FILE_PATH

) {

	const certificates = {

		cert: fs.readFileSync(process.env.SSL_FULL_CHAIN_FILE_PATH),

		key: fs.readFileSync(process.env.SSL_PRIVATE_KEY_FILE_PATH),

	};

	const https = require("node:https");

	listenableServerRef = https.createServer(certificates, app);

}

if (listenableServerRef)

	listenableServerRef.listen(port, onServerListeningStart);

```

2. Route controllers that initialize the WhatsApp-Web.js client and store the instance in memory + the store to be exposed to the rest of the application.

```js

// wwebjs/client-store.js

/**

 * @type {null | import("whatsapp-web.js").Client}

 */

let client = null;

/**

 * @type {Record<string, any> | null}

 */

let usefulClientMetadata = {};

const getClient = function () {

	return client || null;

};

const getQRCodeForClient = function () {

	const client = getClient();

	if (!client) return null;

	if (usefulClientMetadata && usefulClientMetadata.qr)

		return usefulClientMetadata.qr;

	return new Promise((resolve) => {

		client.once("qr", resolve);

	});

};

const setClient = function (

	/**

	 * @type {import("whatsapp-web.js").Client}

	 */

	clt

) {

	if (client)

		throw new Error(

			"A client for this user id is already registered. Please use that."

		);

	console.log("Setting client");

	client = clt;

};

const removeClient = async function () {

	try {

		if (!client) return;

		console.log("Destroying and deleting client");

		await client.destroy();

		client = null;

	} catch (error) {

		console.error("Error while destroying client", error);

	}

};

const setUsefulClientMetadata = function (key, value) {

	if (!usefulClientMetadata) usefulClientMetadata = {};

	usefulClientMetadata[key] = value;

};

```

```js

// wwebjs/setup-client.js

async function setupClient() {

	try {

		const { Client, LocalAuth, Events: WWebEvents } = require("whatsapp-web.js");

		const client = new Client({

			puppeteer: {

				headless: process.env.NODE_ENV !== "development",

				args: [

					"--no-sandbox",

					"--disable-setuid-sandbox",

					"--single-process",

					"--no-zygote",

				],

				ignoreDefaultArgs: ["--disable-extensions"],

			},

			authStrategy: new LocalAuth(),

		});

		client.on(WWebEvents.QR_RECEIVED, (qr) => {

			// Generate and scan this code with your phone

			console.log("QR Code for WhatsApp Web Generated:", qr);

			clientStore.setUsefulClientMetadata("qr", qr);

		});

		client.on(WWebEvents.READY, () => {

			console.log("Client is ready!");

		});

		client.on(WWebEvents.AUTHENTICATED, (session) => {

			console.log("Account authenticated", session);

			clientStore.setUsefulClientMetadata("qr", null);

			clientStore.setUsefulClientMetadata("sessionData", session);

		});

		client.on(WWebEvents.AUTHENTICATION_FAILURE, (session) => {

			console.log("Account authenticated failed", session);

		});

		client.on(WWebEvents.DISCONNECTED, (reason) => {

			console.log("Client disconnected", reason);

			clientStore.removeClient();

		});

		await client.initialize();

		clientStore.setClient(client);

		return client;

	} catch (error) {

		console.error("Error encountered during client run", error);

		return null;

	}

}

```

3. Now that we've set up WhatsApp-Web.js, we'll set up route controllers that provide the user with a list of available contacts + a middleware that validates the client has been initialized so the consumer doesn't hit the route without going through the QR Authorization process.

```js

// middleware/validate-client-init.js

const validateClientInitialized = (controller) => (req, res) => {

	const { getClient } = require("../wweb/client-store");

	const client = getClient();

	if (!client)

		return res.status(401).json({

			error:

				"Session for this user has not been initialized or already terminated. Please restart the session.",

		});

	return controller(req, res);

};

module.exports = validateClientInitialized;

```

```js

const validateClientInitialized = require("../../middleware/validate-client-init");

module.exports = validateClientInitialized(async (req, res) => {

	try {

		const { getClient } = require("../../wweb/client-store");

		const client = getClient();

		const contacts = await client.getContacts();

		return res.status(200).json({

			message: "Contacts fetched successfully",

			contacts,

		});

	} catch (error) {

		return res.status(500).json({

			error: "Something went wrong while fetching contacts. Please try again later",

		});

	}

});

```

4. Let's add a scheduler class and a controller to add a new message to it. For now, it will simply add it locally.

```js

// adapters/Scheduler.js

const { v4 } = require("uuid");

const roundToNearestMinute = function (

	/**

	 * @type {Date}

	 */

	date

) {

	const coeff = 1000 * 60;

	return new Date(Math.round(date.getTime() / coeff) * coeff);

};

class ScheduledTasks {

	/**

	 * @type {{ id?: string; at: Date, message: Record<string, any> }[]}

	 */

	tasks = [];

	constructor() {}

	add(

		/**

		 * @type {ScheduledTasks['tasks'][number]}

		 */

		task

	) {

		const operationId = v4();

		this.tasks.push({

			...task,

			at: roundToNearestMinute(task.at),

			id: operationId,

		});

		return operationId;

	}

	remove(

		/**

		 * @type {string}

		 */

		operationId

	) {

		this.tasks = this.tasks.filter((task) => task.id !== operationId);

		return true;

	}

}

class Scheduler {

	constructor() {}

	async scheduleTask(config = { at: new Date(), message: {} }) {

		return { operationId: ScheduledTasks.add(config), error: null };

	}

	async cancelScheduledTask(operationId) {

		ScheduledTasks.remove(operationId);

		return { error: null };

	}

	async markSchedulerTaskComplete(operationId, results) {

		ScheduledTasks.remove(operationId);

		return { error: null };

	}

	async getScheduledTasks({ from, to } = {}) {

		return {

			error: null,

			tasks: ScheduledTasks.tasks

				.filter((task) => {

					if (from && task.at.getTime() < from.getTime()) return false;

					if (to && task.at.getTime() > to.getTime()) return false;

					return true;

				})

				.map((task) => ({

					id: task.id,

					sendMessageAt: task.at,

					message: task.message,

				})),

		};

	}

}

module.exports = new Scheduler();

```

```js

const validateClientInitialized = require("../../middleware/validate-client-init");

const scheduleMessage = validateClientInitialized(async (req, res) => {

	try {

		const validateMessageAndChatIDRequestBody = require("../../wweb/validate-message-request-body");

		const { error: validationErrorWithRequestBody } =

			validateMessageAndChatIDRequestBody(req.body);

		if (validationErrorWithRequestBody)

			return res

				.status(400)

				.json({ error: validationErrorWithRequestBody.message });

		if (

			!req.body.at ||

			new Date(req.body.at).toString() === "Invalid Date" ||

			new Date(req.body.at).getTime() < new Date().getTime()

		)

			return res.status(400).json({ error: "Invalid Scheduling Date/Time" });

		const Scheduler = require("../../adapters/Scheduler");

		const { operationId, error: errorSchedulingMessage } =

			await Scheduler.scheduleTask({

				at: new Date(req.body.at),

				// req.body is the message data

				message: req.body,

			});

		if (errorSchedulingMessage)

			return res.status(500).json({ error: errorSchedulingMessage.message });

		return res.status(201).json({ message: "Scheduled message", operationId });

	} catch (error) {

		console.log(error);

		return res.status(500).json({

			error:

				"Something went wrong while scheduling message. Please try again later",

		});

	}

});

module.exports = scheduleMessage;

```

5. Let's create a local CRON job that runs every minute. It checks for two things: whether the client is initialized and whether there are scheduled messages. If yes, and any of them match the current minute time, send those messages to the contacts. We can use node-cron](https://www.npmjs.com/package/node-cron) for this, which runs after the server startup is done.

```js

// index.js

const onServerListeningStart = () => {

	// Setup node-cron to check scheduled messages every minute and dispatch those messages via an active whatsapp-web.js client

	const cron = require("node-cron");

	const scheduledMessageSenderCRONFunction = require("./controllers/scheduling/cron");

	const cancellableCRONJobTask = cron.schedule(

		"* * * * *",

		scheduledMessageSenderCRONFunction

	);

};

listenableServerRef.listen(port, onServerListeningStart);

// ...

// scheduledMessageSenderCRONFunction.js

const scheduledMessageSenderCRONFunction = async () => {

	try {

		const initializedWhatsAppWebClient = getClient();

		if (!initializedWhatsAppWebClient) return;

		const { error, tasks: allScheduledMessages } =

			await Scheduler.getScheduledTasks({

				// Compensate for the minor startup, latency and computation time

				from: new Date(new Date().getTime() - 1 * 1000),

				to: new Date(new Date().getTime() + 1  59  1000),

			});

		if (error) return;

		for (const messageTask of allScheduledMessages) {

			try {

				const { chatId, messageBody, messageMediaURL, messageMediaFileName = "" } = messageTask.message;

				let successfullySentMessage;

				if (messageMediaURL) {

					const { MessageMedia } = require("whatsapp-web.js");

					let messageMediaOptions = {};

					if (messageMediaFileName)

						messageMediaOptions = { filename: messageMediaFileName || "file" };

					const media = await MessageMedia.fromUrl(

						messageMediaURL,

						messageMediaOptions

					);

					successfullySentMessage =

						await initializedWhatsAppWebClient.sendMessage(chatId, media, {

							caption: messageBody,

						});

				} else {

					successfullySentMessage =

						await initializedWhatsAppWebClient.sendMessage(chatId, messageBody);

				}

				if (successfullySentMessage)

					Scheduler.markSchedulerTaskComplete(messageTask.id);

			} catch (error) {

				console.error("Error while sending scheduled message", error);

			}

			await new Promise((res) =>

				setTimeout(res, 350 + Math.floor(Math.random() * 100))

			);

		}

		if (allScheduledMessages.length)

			console.log("CRON Processing complete. Messages sent.");

	} catch (error) {

		console.error("Error in CRON Invoker", error);

	}

};

```

6. Lastly, let's add authentication controllers to enforce the rules we have specified above.

    - Since this app is only for personal use, we can set secret environment variables with the email and password of the user we want to authenticate with.

    - We can then create route controllers to issue [JWTs](https://jwt.io/) with [refresh tokens](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/) to the front end.

    - We can then add route middleware to validate and pass only requests with a valid JWT.

### Additional: Making the setup compatible with the cloud 

If you want to use the cloud with this setup, more power to you. You could even be doing this to build a product out of WhatsApp-Web.js. In this case, I highly recommend keeping customer data extremely secure and making no compromises, as WhatsApp, when misused, can lead to some terrible outcomes, not just for the customer but also for the ones who are linked to their WhatsApp accounts indirectly.

There's a simple reason I have advocated for this setup to be local-first/local-only:

> Privacy should be universal, not productized.

If you do decide to go ahead, the number of changes to our app would not be that much. Our architecture isn't very complicated and is very malleable.

1. Have an OPERATING_MODE environment variable that specifies the cloud provider you're using.

2. In the classes we have created for Scheduler and WWeb.js Sessions, simply add the cloud credentials and SDKs needed, scoped to an if block based on OPERATING_MODE. For example: The Scheduler class, instead of storing the job in memory, can store operation data in Firestore and call Google Cloud Tasks to invoke a CRON route that triggers the message sending at the defined time interval.

3. For WhatsApp-Web.js sessions, simply use the plethora of session stores available to you that make use of cloud provider services such as AWS S3, Google Cloud Storage, or even MongoDB to store session information on the cloud and resume your session.

You can end up having abstract classes that serve as the base for these Adapter classes for authentication and scheduling, where class methods operate behind conditions and checks.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-personal-solutions-on-top-of-whatsapp%2Fsecondaryimages%2Fimage1738914647778.png?alt=media&token=f8e1a1ac-aaec-4beb-a858-5635424d19b3)

My repository is already compatible with both local and Firebase modes of operation.

### Now comes the scheduling

After we've set up the server and hosted it somewhere it can run reliably, let's see how we can schedule messages:

You could build a front end that interacts with your server, fetches contacts, maintains a list of the reminders, and allows you to create, modify, or remove them -> Tedious, but pleasant if you plan to use this daily.

- You could simply use the REST API endpoints we created to authenticate and then  -> Straightforward, less time-consuming, or simply because you're hardcore like me and prefer the JSON outputs of REST APIs. 😛

For now, let's use the REST API. Simple cURL commands to authenticate and schedule messages are all that would be needed.

Here's a [Postman Collection](https://documenter.getpostman.com/view/15937596/2sAYXCjeD7) for the API you can use to work with the server APIs.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-personal-solutions-on-top-of-whatsapp%2Fsecondaryimages%2Fimage1739432099443.png?alt=media&token=f46c4920-26ab-4cd0-a8f3-8193f9e66fe5)

### Other things we can build with this—Focus Mode, Work Messaging Systems, etc.

WhatsApp isn't limited to just chats; an entire economy runs on it in many countries. And that's what makes it both powerful and dangerous. Anyone who has the capability of building anything on top of WhatsApp needs to be conscious of the responsibility in their hands as well.

I don't need to reiterate to you, but I will once again:

> "With great power, comes great responsibility."

With that out of the way, let me tell you about a few ideas I had that this library can be leveraged for:

1. You could build a "**focus mode**" that categorizes important contacts, listens to the message event, shows the notifications from only these contacts, and blocks notifications from everyone else.

2. If you're running a business that has a lot of WhatsApp back-and-forth with suppliers or customers, building workflows that utilize an always-on WhatsApp-Web.js instance to automatically send messages for actions can be very useful. These messages could be for workflows like getting prices of materials you want to purchase or chatbots that respond to customer queries using the large language model's NLP capabilities to respond as if a real person was talking to them and assisting them.

3. For fun: You could build a workflow on top of WhatsApp where whenever an annoying relative sends you a Good Morning message, you wish the same back. 😛 Be the good kid on the block for once?

4. For Fun: You could build an entire work-operating-system kind of wrapper around WhatsApp that looks like Slack and only shows you chats from your co-workers or business contacts.

These are just some basic examples; you can come up with your own.

Make sure to be responsible and not build dystopian chatbots and bring humanity one step closer to its doom. 🏃‍♂️ God knows we already have too many AI chatbots.