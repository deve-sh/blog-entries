# Creating Staging/Preview Build for Firebase Cloud Functions

![Photo by Manuel Geissinger: https://www.pexels.com/photo/black-server-racks-on-a-room-325229/](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-staging-or-preview-builds-for-firebase-cloud-functions%2Fprimaryimage.jpg?alt=media&token=9eab50d3-cdb9-4d71-84c3-71fa35060898)

**Note:** This article requires a good understanding of working with Firebase and Firebase Cloud Functions.

I love [Firebase](http://firebase.com/), for all the readers that don't know. However, there are obviously tradeoffs when you use Firebase, one of them is the fact that you cannot have a development and production environment separately under one Firebase project, the workaround of which would be to have two separate projects for development and production.

Another tradeoff is that Full-Text Search isn't possible when it comes to FireStore, which is ironic and sad given Firebase is from a company that literally is the best Search Engine on the planet, the workaround being to use Algolia or ElasticSearch to index your documents and to use them to perform a super-fast full-text search.

One of the tradeoffs that doesn't have a good solution is the problem of preview or version controlling your [Firebase Cloud Functions](https://firebase.google.com/docs/functions). There are approaches like maintaining `/v1`, `/v2` versions of your functions and performing functions based on a switch statement, but it's clunky and just keeps adding the code on top of your existing code-base, why can't we just deploy our Functions like a standalone app to an independent service that can act like an HTTPS endpoint based on your function's changes over time or at least to a specific branch's source code? And that is how this post was created. In this post, I'll be sharing knowledge about how to run your Firebase Cloud Functions in an Express app's shell and use them as a preview build for your Cloud Functions.

### Requirements

Some base requirements for our Preview Cloud Functions would be:

- To have a pre-staging environment where we can host our Cloud Functions.
- HTTPS Endpoints can be invoked via REST Network Calls
- Good to have, but what we won't implement right now: Event Listener functions (Functions that listen to changes like Document updates in Firestore, User Signups in Firebase Authentication etc) can be set up using GCP's Pub/Sub Service that can listen to Firestore events and then make API Calls to our endpoint.

We'll be using [GitLab](https://gitlab.com/) to host our Firebase Cloud Functions, and [GitLab CI/CD](https://docs.gitlab.com/ee/ci/) to send the code to [Google Cloud Build](https://cloud.google.com/build) to compile the code and create a Docker Image, then we'll use [Google Cloud Run](https://cloud.google.com/run) to host our preview Cloud Functions for an infinitely Scalable workload.

### Creating Our Shell App

Remember, Firebase Cloud Functions are just code that is deployed individually to a server, meaning that the code you write is packaged into an executable "function", and those functions are literally JavaScript functions that run inside an Express Shell App.

Building on that, we'll do exactly that, we'll get all the exports from our `functions/index.js` file that are HTTPS functions, and on request to a path matching the name of that function, we will invoke the function corresponding to the Cloud Function.

To get started, let's install some dependencies.

```bash
npm i --save express dotenv
```

```javascript
// functions/run-preview-functions.js
require("dotenv").config();

const PORT = process.env.PORT || 8080;

// Preview builds are only for staging environments, for obvious reasons.
const firebaseAdminKey = require("<Path to your Firebase Admin Service Account>");
// Don't forget to have firebase admin be initialized with the above inside your application.
process.env.FIREBASE_CONFIG = JSON.stringify({
	projectId: firebaseAdminKey.project_id,
	databaseURL: "<Your Project's Database URL>",
	storageBucket: "<Your Project's Storage Bucket ID>",
});
process.env.GCLOUD_PROJECT = firebaseAdminKey.project_id;
process.env.RUNNING_IN_PREVIEW_BUILD = true;

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

const allFunctions = require("./index");

app.all("*", async (req, res) => {
	let functionName = req.path.replace("/", "");
	// Check if this is an HTTPS trigger function
	if (
		allFunctions[functionName] &&
		allFunctions[functionName].__trigger &&
		allFunctions[functionName].__trigger.httpsTrigger
	) {
		return allFunctions[functionName](req, res);
	}
	return res.sendStatus(200);
});

app.listen(PORT, () =>
	console.log("Listening for Function Previews at ", PORT)
);
```

You might encounter one slight issue, if you've ever used config variables in Firebase Functions, they would not show up here given you're not running in a Cloud Functions Scoped Environment inside Google Cloud Platform infra, hence, we will have to tweak the imports of `firebase-functions` library inside our source code to a new file we create:

```
// functions/firebase-functions.js
let functions = require('firebase-functions');

if (process.env.RUNNING_IN_PREVIEW_BUILD) {
	let config;
	try {
		config = require('./.runtimeconfig.json');
	} catch {
		console.log('Could not read Firebase Config.');
	}
	functions = {
		...functions,
		config: () => config,
	};
}

module.exports = functions;
```

Inside our app code:

```diff
- const functions = require('firebase-functions');
+ const functions = require('./firebase-functions');
```

### Testing Our Shell App

In order to test our application, both in prod and development environment, we'll add two scripts to our package.json file:

```diff
+ "functions-preview-env": "node ./run-function-previews.js",
+ "functions-preview-env:dev": "nodemon ./run-function-previews.js"
```

We can install nodemon for the dev command so our server listens to changes in the file and dependencies of `run-function-previews.js` and restarts while we develop features locally.

```bash
npm i --save nodemon
```

### Setting Up CI

We'll be using Docker to set up a containerized image so that our app can run on any system and any deployment infrastructure in the world. In our case, we'll be building the image using [Google Cloud Build](https://cloud.google.com/build) and then deploying our app through [Google Cloud Run](https://cloud.google.com/run).

We'll be using [Firebase CLI](https://www.npmjs.com/package/firebase-tools) to fetch our [Cloud function's runtime environment configuration/Environment variables](https://firebase.google.com/docs/functions/config-env).

Let's set up our [Dockerfile](https://docs.docker.com/engine/reference/builder/) to build the application and start it.

```docker
# base node image
FROM node:14

WORKDIR /usr/src/app

ENV FIREBASE_TOKEN {Insert Your Firebase Token from CI Here}
ENV PORT 8080
ENV HOST 0.0.0.0

# Copy local code to the container
COPY . .

# Install core dependencies
RUN npm install -g firebase-tools
# Ready Preview Build App
RUN npm install
WORKDIR ./functions
RUN npm install
RUN firebase functions:config:get >.runtimeconfig.json    # For our environment config values

# Start the service
CMD npm run functions-preview-env
```

In our GitLab CI File, we'll be following this great post about how to deploy our Preview Build to Cloud Run through Cloud Build: [Deploy to Cloud Run using GitLab CI
](https://medium.com/google-cloud/deploy-to-cloud-run-using-gitlab-ci-e056685b8eeb)

```yaml
# gitlab-ci.yml
stages:
  - deploy

Deploy Preview Cloud Functions:
  image: google/cloud-sdk
  stage: deploy
  environment:
    name: preview
  script:
    - echo $GCP_STAGING_CLOUD_BUILD_SERVICE_KEY > gcloud-service-key.json # Google Cloud service accounts
    - gcloud auth activate-service-account --key-file gcloud-service-key.json
    - gcloud config set project $GCP_STAGING_PROJECT_ID
    - gcloud builds submit . --config=google-cloud-build.yaml --suppress-logs
```

For the deployment file, we'll create a `google-cloud-build.yaml` file:

```yaml
steps:
  # Build the container image
  - name: "gcr.io/cloud-builders/docker"
    args: ["build", "-t", "gcr.io/$PROJECT_ID/preview-builds", "."]
    # Push the container image
  - name: "gcr.io/cloud-builders/docker"
    args: ["push", "gcr.io/$PROJECT_ID/preview-builds"]
    # Deploy to Cloud Run
  - name: "gcr.io/cloud-builders/gcloud"
    args:
      [
        "run",
        "deploy",
        "preview-functions",
        "--image",
        "gcr.io/$PROJECT_ID/preview-builds",
        "--region",
        "asia-south1",
        "--platform",
        "managed",
        "--allow-unauthenticated",
      ]
```

On pushing to your GitLab Repository now, you'll notice that your functions will be deployed to Cloud Run, you can get the endpoint for the Cloud Run build from inside the Cloud Run dashboard and use it in your app's code.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-staging-or-preview-builds-for-firebase-cloud-functions%2Fsecondaryimages%2Fimage1654690066803.png?alt=media&token=6111de97-29c7-4da8-b915-959780c70608)

### Resources

- [Cloud Run QuickStart - Docker to Serverless
  ](https://www.youtube.com/watch?v=3OP-q55hOUI&t=91s)
- [Continuous Integration and Deployment with Google Cloud Build
  ](https://youtu.be/Zd014DjonqE)
- [Learn Docker in 7 Easy Steps](https://www.youtube.com/watch?v=gAkwW2tuIqE)
- [Deploy to Cloud Run using GitLab CI](https://medium.com/google-cloud/deploy-to-cloud-run-using-gitlab-ci-e056685b8eeb)
