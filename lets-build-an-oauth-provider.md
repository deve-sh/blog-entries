# Let's Build an OAuth Provider

![We'll build an OAuth Provider in this post](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-build-an-oauth-provider%2Fprimaryimage.jpg?alt=media&token=b5519b19-3793-42fa-911c-a3a1c01003cd)

OAuth is a brilliant Authentication System, it abstracts away a lot of the insecurities present in password-based authentication. The users have to remember credentials for just one system and you have to ability to scope the access you provide to a third party, win-win! 

The only place OAuth has a problem is its simplicity of implementation or lack thereof, OAuth has a complicated flow but to explain that is what this article is for. That being said, I still need you to have a little understanding of OAuth to follow along with this post.

> I have covered OAuth in a separate article, check it out [here](https://blog.devesh.tech/post/what-is-oauth-and-why-it-is-awesome), but in this post, we will be building an OAuth Provider ourselves.

What's special about the provider we will build is that it's completely headless, I.E: It doesn't involve us writing any frontend code and instead is completely RESTful, all operations happen using Network Calls.

Let's call the application **AuthVault**, we will give apps the ability to **Sign In With AuthVault**. You can check the codebase as I build this on my [GitHub Repo](https://github.com/deve-sh/AuthVault).

You can also check the API Documentation of all the routes required to set up our OAuth Provider [here](https://deve-sh.github.io/AuthVault).

### The OAuth Flow
![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-build-an-oauth-provider%2Fsecondaryimages%2Fimage1630559250486.png?alt=media&token=ee54e260-451c-4400-9f8a-619cfb4d53de)
Image Source: [Oracle](https://docs.oracle.com/cd/E82085_01/160023/JOS%20Implementation%20Guide/Output/oauth.htm)

If the above diagram makes no sense to you, don't worry, let's break it down:
- The users register on your service, consider you registering with a service like Google.
- Someone tells you that they want the users of your service to be able to login to their service too, without having to re-register.
- You give them a client ID and secret to verify later that the users they send to log in with your service are authentic.
- That's where OAuth comes in, the users see a 'Login with AuthVault' button on the login screen of the external service. They click on it and are redirected to your service, where they give consent to the external service using their data.
- Once the user agrees to share data, they are redirected back to the external service, the external service gets a code that it can send back to you on the user's behalf to get a 'token'.
- That token is what is then going to be used to get updated information about the user, hence validating that the user is authentic and the external service gives them access.

This flow is not limited to just logging in, remember, OAuth is a data-exchange authenticator, so you can use it for anything from syncing Calendars between two apps or even allowing an external service to send Emails from your account. These permissions are called **scopes**, as long as a service has the appropriate scope, it can function exactly the way you want it to. Don't trust a service anymore? No worries, simply remove their access from your data.

### Steps to Building an OAuth Provider
- Setup a backend API
- Give users the ability to register accounts.
- Provide users with the ability to create OAuth Consumers (Applications) that can use functionality like "Login With AuthVault"
- Providing login and token refreshing functionality to external apps via user consent.

### Pre-requisites
I'll be using JavaScript in this walkthrough, you can use any language you prefer as long as they can communicate with the services on the web.

- Firebase Authentication project to store user authentication information like passwords, phone numbers, email, profile photo and name.
- Firestore as a database to store information like OAuth Clients, users, the user they belong to and client ID as well as client secrets to use while requesting OAuth Tokens.
- An Express App to communicate with all other services.

### Setup
- [Create a Firebase App](https://firebase.google.com/docs/web/setup)
- [Create an Express App](https://expressjs.com/en/starter/hello-world.html)
- [Setup  Firebase Admin](https://firebase.google.com/docs/admin/setup) and add its [service account](https://cloud.google.com/iam/docs/understanding-service-accounts#:~:text=A%20service%20account%20is%20a,used%20in%20scenarios%20such%20as%3A&text=Running%20workloads%20which%20are%20not,lifecycle%20of%20a%20human%20user.) to `keys/service_account.json`.
- Install required dependencies `npm i --save firebase-admin firebase cors dotenv esm jsonwebtoken express-session uuid`
- Enable ES6 on repository using the [`esm`](https://www.npmjs.com/package/esm) package.

```javascript
// index.js
require("dotenv").config();
require = require("esm")(module);
module.exports = require("./main.js");
```

All our main code will be in the `main.js` file.

### Setting Up Firebase Admin SDK

```javascript
// firebaseAdmin.js
import firebaseAdmin from "firebase-admin";
firebaseAdmin.initializeApp({
	credential: firebaseAdmin.credential.cert("./keys/service_account.json"),
});
export default firebaseAdmin;
```

### Setting Up Firebase and Environment
We'll need Firebase Regular SDK at one or two places (Not the ideal way to do it, but serves the purpose for demonstration), add your Firebase credentials to a `.env` file:

```bash
FIREBASE_apiKey=
FIREBASE_authDomain=
FIREBASE_projectId=
FIREBASE_appId=

JWT_SECRET=    # Will be needed to sign our tokens
```

Then initialize the SDK with:
```javascript
// firebase.js
import firebase from "firebase/app";
import "firebase/auth";
const config = {
	apiKey: process.env.FIREBASE_apiKey,
	authDomain: process.env.FIREBASE_authDomain,
	projectId: process.env.FIREBASE_projectId,
	appId: process.env.FIREBASE_appId,
};
const firebaseApp = firebase.initializeApp(config);
export default firebaseApp;
```

### Setting Up User Registration, Token Retrieval and Auth Routing

The most important part of our application is of course, the user registration, we'll setup our express controllers to handle that using Firebase Authentication, along with processes to retrieve the token for creating OAuth Clients later.

```javascript
// controllers/auth/register.js
import firebaseAdmin from "../../firebaseAdmin";
export default async function register(req, res) {
	const error = (status = 400, message = "") =>
		res.status(status || 400).json({
			message: message || "Something went wrong. Please try again later.",
		});

	try {
		let { displayName, email, password, phoneNumber, photoURL } =
			req.body && req.body.user ? req.body.user : {};

		if (!displayName || !email || !password)
			return error(
				400,
				"Incomplete information. Mandatory fields: email, password and displayName"
			);

		let userProperties = {
			email,
			emailVerified: false,
			password,
			displayName,
			disabled: false,
		};

        if(photoURL) userProperties.photoURL = photoURL;
        if(phoneNumber) userProperties.phoneNumber = phoneNumber;

		const userRecord = await firebaseAdmin.auth().createUser(userProperties);

        let userRecordToSend = { ...userRecord.toJSON() };
        delete userRecordToSend.metadata;
        delete userRecordToSend.tokensValidAfterTime;
        delete userRecordToSend.providerData;

		return res.status(201).json({
			message: "Successfully created user",
            id: userRecordToSend.uid,
			user: userRecordToSend,
		});
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return error(400, err.message);
	}
}
```

```javascript
// controllers/auth/token.js
import firebase from "../../firebase";

export default async function getToken(req, res) {
	const error = (status = 400, message = "") =>
		res.status(status || 400).json({
			message: message || "Something went wrong. Please try again later.",
		});

	try {
		let { email, password } = req.body;

		if (!email || !password)
			return error(
				400,
				"Incomplete information. Mandatory fields: email, password and displayName"
			);

		await firebase.auth().signInWithEmailAndPassword(email, password);
		const token = await firebase.auth().currentUser.getIdToken();
		await firebase.auth().signOut();

		return res.status(200).json({
			message: "Successfully fetched token",
			token,
		});
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return error(400, err.message);
	}
}
```
```javascript
// controllers/auth/index.js
import { Router } from "express";
import register from "./register";
import token from "./token";

const authRouter = new Router();
authRouter.post("/register", register);
authRouter.post("/token", token);

export default authRouter;
```

### Setting up our JSON Web Token Helpers
At the core of OAuth, is JSON Web Tokens, cryptographic tokens that can act as passes to certain resources, they contain small bits of information in an encrypted format and can be set to expire after a certain amount of time has passed.

Read more about JWTs [here](https://jwt.io/introduction).
Watch a great video about JWTs [here](https://www.youtube.com/watch?v=mbsmsi7l3r4)

For JWTs we will be using the `jsonwebtoken` library we installed at the beginning of this post.

```javascript
// helpers/generateJWT.js
import jwt from "jsonwebtoken";
export default function generateJWT(
	params = {
		uid: null,
	},
	expires
) {
	return jwt.sign(
		{ ...params, exp: expires || Math.floor(Date.now() / 1000) + 60 * 60 },
		process.env.JWT_SECRET,
		{ algorithm: "RS256" }
	);
}
```
We will verify our generated JWTs by decrypting them with the help of the following helper function: 
```javascript
// helpers/verifyJWT.js
import jwt from "jsonwebtoken";
export default function verifyJWT(token) {
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		return decoded;
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return null;
	}
}
```
### Setting Up Firebase Auth Middleware
In addition to our regular JWTs, Firebase Admin gives us the ability to verify tokens generated using Firebase Auth, it is extremely useful to authorize user access to our APIs, so we could set up middleware to certain routes in our APIs.

Read more about Firebase Auth Tokens [here](https://firebase.google.com/docs/auth/admin/verify-id-tokens).
Read more about Express Middlewares [here](https://expressjs.com/en/guide/using-middleware.html).

```javascript
// helpers/validateFirebaseToken.js
import firebaseAdmin from "../firebaseAdmin";
export default async function validateFirebaseToken(req, res, next) {
	try {
		let idToken = req.headers["authorization"] || req.headers["Authorization"];
		if (!idToken) throw new Error("Token missing from request.");
		let decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
		req.token = decodedToken;
		next();
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return res.status(403).json({
			error: "Unauthorized",
		});
	}
}
```

### Setting up the flow to create and get OAuth Clients
To accept user logins on their site using AuthVault, the users have to first create an OAuth Client to request access to their account information. OAuth clients are the app that you see on Google's OAuth page mentioned something like "<OAuth Client Name> is requesting access to your profile data".

To create an OAuth Client on AuthVault, the user requests to the /clients/create a route with the information about the OAuth Client and the token he received after logging in to AuthVault with the API.

```javascript
// controllers/clients/create.js
import firebaseAdmin from "../../firebaseAdmin";
import { v4 as uuid } from "uuid";
export default async function createOAuthClient(req, res) {
	const error = (status = 400, message = "") =>
		res.status(status || 400).json({
			message: message || "Something went wrong. Please try again later.",
		});
	try {
		if (!req.token || !req.token.uid) return error(401, "Unauthorized");
		let { name, description, homepage, redirectURL } =
			req.body && req.body.client ? req.body.client : {};
		if (!name || !description || !homepage || !redirectURL)
			return error(
				400,
				"Incomplete information. Mandatory fields: name, description, homepage, redirectURL"
			);
		// Generating client IDs and Client Secrets for the OAuth Client
		let clientId = uuid();
		let clientSecret = `${uuid()}${uuid()}${new Date().getTime()}`;
		// Save the client to the database.
		await firebaseAdmin.firestore().collection("oauthclients").doc().set({
			createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
			updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
			clientId,
			clientSecret,
			nUsers: 0,
			homepage,
			redirectURL,
			name,
			description,
			createdBy: req.token.uid,
		});
		return res.status(201).json({
			message: "Successfully created OAuth Client",
			client: {	clientId,	clientSecret,	homepage, redirectURL },
		});
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return error(400, err.message);
	}
}
```

Once the client is created using the above controller, other routes will help the user get, list and delete OAuth Clients, not necessary for the flow, hence you can check the controllers out [here](https://github.com/deve-sh/AuthVault/tree/main/controllers/clients).

### Setting up the OAuth Flow

The OAuth flow consists of the following steps:
- User is redirected to a consent screen on AuthVault where they log in and approve the app that wants to access their data.
- Once approved, they are redirected to a page pre-registered by the app with a **code** valid for a small amount of time.
- Using that code, the app requests AuthVault to get a token that it can use in the future to assert that it has approval from the user and get the user's details (Email, name, etc) to login to the app.

The user first has to make a request to `api/oauth/login` with the clientId in the URL parameters, once that's done, we will show a login screen to them in case they are not logged in (In our session variable), if they are logged in, we will redirect them to the code page with the necessary info pre-filled.

```javascript
// controllers/oauth/login.js
// Generates an OAuth Code with the login credentials, takes client id and secret and sends the user to the successful redirect.
import firebaseAdmin from "../../firebaseAdmin";
export default async function loginUser(req, res) {
	const error = (status = 400, message = "") =>
		res
			.status(status || 400)
			.send(message || "Something went wrong. Please try again later.");
	try {
		let { clientId } = req.query;
		if (!clientId)
			return error(
				400,
				"Incomplete information. Mandatory fields: clientId"
			);
		const client = (
			await firebaseAdmin.firestore().collection("oauthclients")
				.where("clientId", "==", clientId).limit(1).get()
		).docs[0];

		if (!client || !client.data || !client.data() || !client.data().redirectURL)
			return error(404, "Client Not Found");
		let nextRedirectURL = `${req.baseUrl}/code?clientId=${clientId}`;
		if (!req.session.uid) {
			// User isn't logged in via session. Show the login form.
			let loginHTML = `
            <form action="${nextRedirectURL}" method="post">
                <input type="email" placeholder="Email" name="email" required />
                <br />
                <input type="password" placeholder="Password" name="password" required />
                <br />
                <button type="submit">Login</button>
            </form>`;
			return res.send(loginHTML);
		} else return res.redirect(nextRedirectURL);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return error(400, err.message);
	}
}

```

```javascript
// controllers/oauth/code.js
// Generates an OAuth Code with the login credentials, takes client id and secret and sends the user to the successful redirect.
import firebaseAdmin from "../../firebaseAdmin";
import firebase from "../../firebase";
import generateJWT from "../../helpers/generateJWT";

export default async function generateCode(req, res) {
	const error = (status = 400, message = "") =>
		res.status(status || 400).json({
			message: message || "Something went wrong. Please try again later.",
		});
	try {
		let { email, password } = req.body;
		let { clientId } = req.query;
		if ((!req.session.uid && (!email || !password)) || !clientId)
			return error(
				400,
				"Incomplete information. Mandatory fields: email, password, clientId, clientSecret"
			);
		const client = (
			await firebaseAdmin
				.firestore()
				.collection("oauthclients")
				.where("clientId", "==", clientId)
				.limit(1)
				.get()
		).docs[0];

		if (!client || !client.data || !client.data() || !client.data().redirectURL)
			return error(404, "Client Not Found");
		let user = { uid: null };
		if (!req.session.uid) {
			await firebase.auth().signInWithEmailAndPassword(email, password);
			user = firebase.auth().currentUser;
			await firebase.auth().signOut();
			req.session.uid = user.uid;
			req.session.save();
		}
		// User is valid.
		// Generate an OAuth Code of verification for the user.
		let codeParams = {
			clientId,
			uid: req.session.uid || user.uid,
			grantedAt: new Date().getTime(),
		};
		let codeJWT = generateJWT(
			codeParams,
			Math.floor(new Date().getTime() / 1000) + 3 * 60 // Code expires 3 minutes from now.
		);
		const redirectURL = new URL(client.data().redirectURL);
		redirectURL.searchParams.set("code", codeJWT);
		return res.redirect(redirectURL);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return error(400, err.message);
	}
}
```
Now with the above, once the user gets the code, they can send the code to get a token, which is handled by the following controller:
```javascript
// controllers/oauth/getOAuthToken.js
// Gets token from code.
import firebaseAdmin from "../../firebaseAdmin";
import verifyJWT from "../../helpers/verifyJWT";
import generateJWT from "../../helpers/generateJWT";
export default async function getOAuthToken(req, res) {
	const error = (status = 400, message = "") =>
		res.status(status || 400).json({
			message: message || "Something went wrong. Please try again later.",
		});
	try {
		let { code, clientId, clientSecret } = req.body;
		if (!code || !clientId || !clientSecret)
			return error(
				400,
				"Incomplete information. Mandatory fields: code, clientId, clientSecret"
			);
		const client = (
			await firebaseAdmin
				.firestore()
				.collection("oauthclients")
				.where("clientId", "==", clientId)
				.where("clientSecret", "==", clientSecret)
				.limit(1)
				.get()
		).docs[0];
		if (!client || !client.data || !client.data() || !client.data().redirectURL)
			return error(404, "Client Not Found");
		let decodedCode = verifyJWT(code);
		if (!decodedCode || !decodedCode.uid) return error(403, "Unauthorized");
		let user = await firebaseAdmin.auth().getUser(decodedCode.uid);
		user = user.toJSON();
		const token = generateJWT(
			{
				uid: decodedCode.uid,
				email: user.email,
				displayName: user.displayName,
				phoneNumber: user.phoneNumber,
				clientId,
			},
			// Expires 350 days from now. Not handling refresh token cases right now.
			Math.floor(new Date().getTime() / 1000) + 350 * 1440 * 60
		);
		return res.status(200).json({
			message: "OAuth Token Generated",
			token,
		});
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return error(400, err.message);
	}
}
```
Once the app has the token for the user with the above controller, they can get the details of the user with the following controller:
```javascript
// Final step of the OAuth Pipeline, to get user details from token generated in the OAuth Process.
import firebaseAdmin from "../../firebaseAdmin";
import verifyJWT from "../../helpers/verifyJWT";
export default async function getUserDetails(req, res) {
	const error = (status = 400, message = "") =>
		res.status(status || 400).json({
			message: message || "Something went wrong. Please try again later.",
		});
	try {
		let { token, clientId, clientSecret } = req.query;
		if (!token || !clientId || !clientSecret)
			return error(
				400,
				"Incomplete information. Mandatory fields: token, clientId, clientSecret"
			);
		const client = (
			await firebaseAdmin
				.firestore()
				.collection("oauthclients")
				.where("clientId", "==", clientId)
				.where("clientSecret", "==", clientSecret)
				.limit(1)
				.get()
		).docs[0];
		if (!client || !client.data || !client.data() || !client.data().redirectURL)
			return error(404, "Client Not Found");

		let decodedToken = verifyJWT(token);
		if (
			!decodedToken ||
			!decodedToken.uid ||
			!decodedToken.clientId ||
			decodedToken.clientId !== clientId
		)
			return error(403, "Unauthorized");

		let user = await firebaseAdmin.auth().getUser(decodedToken.uid);
		user = user.toJSON();

		return res.status(200).json({
			message: "Fetched User Details Successfully",
			user: {
				displayName: user.displayName || decodedToken.displayName,
				disabled: user.disabled,
				photoURL: user.photoURL || decodedToken.photoURL,
				email: user.email || decodedToken.email,
				phoneNumber: user.phoneNumber || decodedToken.phoneNumber,
			},
		});
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return error(400, err.message);
	}
}
```
### Connecting It All
We have a `main.js` file at the root of our project that controls everything.
```javascript
// main.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";

// Controller Routers
import authRouter from "./controllers/auth";
import OAuthClientsRouter from "./controllers/clients";
import OAuthRouter from "./controllers/oauth";

// Middlewares
import validateFirebaseToken from "./helpers/validateFirebaseToken";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: process.env.JWT_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: process.env.NODE_ENV === "production", maxAge: 3600000 },
	})
);
app.use("/api/auth", authRouter);
app.use("/api/clients", validateFirebaseToken, OAuthClientsRouter);
app.use("/api/oauth", OAuthRouter);

app.listen(process.env.PORT || 8080, () => console.log("App running."));
```

At this point, the tutorial has gotten code-heavy and a little lengthy, but worry not, once you get the hang of what OAuth is and how it functions, you'll get every part of the post fairly quickly.

Now anyone using the APIs could register, login, create an OAuth Client and add a "Login with AuthVault" button to their website for the users from AuthVault to login to their service, having to handle only one account.