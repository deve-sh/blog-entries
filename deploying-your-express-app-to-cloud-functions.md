# Deploying your Express App to Cloud Functions

![Express + Serverless = 🐉](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdeploying-your-express-app-to-cloud-functions%2Fprimaryimage.jpg?alt=media&token=bb23415a-f2d4-4da2-a94e-b3d6d4e1ad07)

If you're someone who's worked with serverless, you would know it's addictive. The simplicity of pushing your code and having it work without the hassle of provisioning servers and the ability to scale automatically is something you miss when switching to a traditional REST API setup.

While [AWS Lambda](https://aws.amazon.com/lambda/) popularised the serverless concept and framework, I find [Google Cloud Functions](https://cloud.google.com/functions) much better in terms of the entire development loop and ease of deployments, rollouts and updates (Minus the cold start, which AWS Lambda is significantly better at).

Let's say you are someone at an early-stage startup and decide to create a backend API with Express, you host it on an EC2 instance and life's good until 2 months later when your EC2 instance hits its memory and storage limits (Storage runs out on an EC2 instance for some reason) and it's no longer able to serve requests for your app that's booming. Now you could set up auto-scaling but that's too much of a hassle and too confusing (AWS after all), hard to get right, time-consuming and budget-draining for a small team of engineers.

But you couldn't just wake up one day and decide "Let me move my Express app to a serverless platform, that way no hassles of managing memory and traffic".

There are ways to dockerize your application and serve it via a platform like [Cloud Run](https://cloud.google.com/run), [AWS EKS](https://aws.amazon.com/ecs) or [ECS](https://aws.amazon.com/ecs) that handle traffic surges for you automatically. But even then, too complex and hard to get right. In those times, one wishes for a way to deploy their existing backend app to Lambdas (Or cloud functions if you're me).

Well now you can, in this post, I'll show you how you can deploy your existing Express app straight to Google Cloud Functions and reap the benefits of Serverless without a single structural change.

> Let me make something clear, this is a solution that would probably suit a single dev or a small team very well. But with a larger dev team with more complex use cases, you might want to assess whether a one-size-fits-all cloud function would work for you. No two needs are the same in tech and we have complex-yet-robust architectures of backend microservices for a reason.

### Wait? What are Firebase Cloud Functions then?

For those that have come from Firebase land, it might be a little surprising to see another Cloud Functions offering from Google themselves. Well, the simplest answer is Firebase Cloud Functions acts as an opinionated wrapper around your code and takes care of deployments automatically for you without any added configuration, you still run your code as a Google Cloud Function at the end of the day, just with a neater and "taken-care-of-for-you" interface provided by Firebase.

Firebase Cloud Functions only support JavaScript/TypeScript with Express whereas Google Cloud Functions support a lot more (For instance it's a good solution for fans of Python with Flask, or even those that build APIs in Java).

A benefit you get with this is that traditional Firebase Cloud Functions act as a framework with guidelines around how to structure your backend into micro-services that get deployed independently, with Google Cloud Functions you have the flexibility to do whatever you want, deploy whatever you want.

### Why you'd want to use Google Cloud Functions for your Express App?

- **Infinite Scalability:** Scale to as many users and invocations as you want with horizontally executing Cloud Functions.
- **No modifications required to existing codebase**: If you've built your backend app as a single codebase, there aren't many changes you have to do other than exporting your app.
- **Easily automatable deployments**: With the Google Cloud Functions framework, deploying an express app to a Cloud Function should be merely a single command job.
- **Native support for JavaScript/TypeScript with Express**: You don't have to worry about dockerizing your application to make it run on a serverless environment, GCF comes with perfect Express support out of the box, in fact, it is one of the recommended ways to spin up a Cloud Function.

### When you shouldn't host your express app on Google Cloud Functions

- Serverless is useful when you don't know the kind of traffic you would receive and to scale up quickly as the traffic comes in. With cloud functions or serverless in general, you'll be constantly hitting a dreaded problem called "Cold Starts" where due to lack of traffic your functions go "cold" and take time to start up again. If you know you're going to get a manageable amount of traffic or know the spikes, you can very well do with a traditional REST API hosting setup.
- Any underlying component that your Express app is dependent on cannot scale past a certain point, for example, many databases enforce a connection limit. If you're using Serverless with a database that's not, you will hit a wall. Evaluate your use case accordingly.
- Your express app has components that are `stateful` like files or in-memory stores. Cloud Functions execute independently, which means they more often than not will not share memory space with each other in most cases (There are exceptions sometimes where a cloud function is pooled in the same memory space as its parallelly executing function instances), same goes with storage, Cloud Functions have a File System but it is ephemeral and goes away as soon as your Cloud Function terminates.
- You need long-lived connections to your consumers, like Web Sockets. It's pretty clear from the USP of Serverless Functions that you can't have long-lived connections on them and instead have to go with the traditional REST API hosting methods.

### Bring out the steps

1. [Create a Google Cloud Functions project](https://developers.google.com/workspace/guides/create-project)

2. Enable the Cloud Functions API (It should enable the Cloud build APIs to build your code on the server).
![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdeploying-your-express-app-to-cloud-functions%2Fsecondaryimages%2Fimage1688911803251.png?alt=media&token=e7841fd6-40c9-4d27-a377-7165c50d7c34)

3. Optional: If your backend requires some build steps to do things like transpile TypeScript to JavaScript, add them to the `build` script in your package.json file.
```diff
"scripts": {
+ "build": "tsc",
...
}
```
4. Add a `main` field in your package.json file and point it to the final JS file you'll execute your express from.
```diff
"name": "my-express-api"
+ "main": "./build/index.js" // Will be the final index file for your app
```
5. Remove the `app.listen` function call in your express file or hide it behind a local-dev check with something like `proces.env.NODE_ENV`. With Cloud Functions, the app listens automatically for you on a pre-defined port, you don't have to add it yourself and doing so will actually cause your function to crash once deployed.
6. Add an export statement for your app to the main file.
```diff
...
...
+ export { app };
```
7. Install the [`gcloud`](https://cloud.google.com/sdk/docs/install-sdk) command line utility that makes it easy for you to work with Google Cloud APIs and login to your account using `gcloud init`.

8. Finally run the following command:

```sh
gcloud functions deploy <name-of-your-function>
    --timeout=100
    --trigger-http
    --entry-point app # Should be the name of your exported variable
    --region=asia-south1 # You can check the list of regions supported by GCP
    --allow-unauthenticated
    --runtime=nodejs18
```

### Environment Variables Setup

"Well, what happens to my environment variables?" you might ask.

It's actually quite simple, to the deployment command, you can add the following:

```sh
--set-env-vars VAR_NAME=<var_value>,VAR_NAME2=<var_value>...
```

You can even specify your .env file for the function:
```sh
--env-vars-file .env
```

**OR** There's another elegant way but that requires some manual work:

- Go to Google Cloud console and navigate to Cloud Functions for your project.
- Find the function you just deployed, and click on it.
- Click on **Edit**. This should open the function configuration.
- Expand the **Runtime, build, connections and security settings** section
- Add the list of environment variables you want.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdeploying-your-express-app-to-cloud-functions%2Fsecondaryimages%2Fimage1689004257453.png?alt=media&token=abc8e7bf-1347-49f3-9742-baa77153b46a)

After this is done and the **function is re-deployed**, your `process.env.VAR_NAME` expressions will start working. Locally there shouldn't be any changes required.

### Bonus: Automating deployments with GitHub actions

Now that we've nailed down how to write and deploy a Cloud Function manually, we can now do the same thing via our CI/CD pipelines.

While the specific deployment code would differ for your CI/CD provider, here's an outline of how I do it in a GitHub action.

First, whichever CI/CD provider you choose, you will need a way for it to communicate with Google Cloud and for Google Cloud to verify that the actions are indeed happening on your behalf, you can do so by [using a service account generated for your account](https://cloud.google.com/iam/docs/service-accounts-create) and [using it to initialize the `gcloud` command line on GitHub actions](https://github.com/google-github-actions/setup-gcloud#Authorization) with it.

Generate the Service Account from your Google Cloud Console using the steps above and [add it to your GitHub repository's secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

```yaml
name: Deploy API to Google Cloud Function

on:
  - workflow_dispatch  # Manual deployment

jobs:
  deploy:
    name: Deploy API to Google Cloud Function
    runs-on: ubuntu-latest
    env:
      GCLOUD_PROJECT_ID: ${{ secrets.GCLOUD_PROJECT_ID }}
      GOOGLE_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}

    steps:
      - name: "Set up Cloud SDK"
        uses: "google-github-actions/setup-gcloud@v1"
        with:
          version: ">= 363.0.0"

      - id: "auth"
        name: "Authenticate to Google Cloud"
        uses: "google-github-actions/auth@v1"
        with:
          credentials_json: "${{ secrets.GOOGLE_CREDENTIALS }}"

      - name: Run Deployment Script
        run: |
          gcloud config set project $GCLOUD_PROJECT_ID
          gcloud functions deploy <functionName> --timeout=100 --trigger-http --entry-point <name of app export, ex: app> --region=asia-south1 --allow-unauthenticated --runtime=nodejs18
```

With this deployment script, you should be set to deploy your backend to Cloud Functions using a single click!