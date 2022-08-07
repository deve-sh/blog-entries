# Getting Notified When Your Cloud Functions Deploy

![Photo by Field Engineer: pexels.com/photo/electronics-engineer-fixing-cables-on-server-442150](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fgetting-notified-when-your-cloud-functions-deploy%2Fprimaryimage.jpg?alt=media&token=b5ab5382-152c-4ade-bc8b-60d7795297ea)

**Note**: This post is a little technical, understanding of Firebase/Google Cloud Functions or some Serverless tech is required.

As most of you know, I am a Firebase fan, and a great service Firebase offers is Cloud Functions.

An issue relating to Cloud Functions I faced was that there was no alerting to tell you when your functions started deploying, finished deploying or failed to deploy. As a result, most of the time when we would push functions to stage or production via our automated pipelines, we would have to manually check back now and then to get an idea of the deployment and which functions failed to deploy.

We had alerts to Slack set up from Vercel for our frontend deployments, but a first look gave us no such options to have Firebase ping us or a webhook whenever a deployment for a cloud function started, completed or failed.

This post is a solution to that problem, to help you solve the same issue if at any point you might face a similar problem.

### The Crux of the Solution

Given every Firebase Cloud Function is a Google Cloud Function underneath, running on Google's infrastructure, there is the ability to view all logs associated with it in Cloud Logging. There are specific types of logs that associate with the Creation, Updation and Deletion of Cloud Functions. We'll use those logs to our advantage.

- Using Cloud Logging's Log Routes feature, we'll set up a route where a subset of logs, relating to updating and creation of Cloud Functions, will be forwarded to a Pub/Sub topic.
- We'll create a Pub/Sub topic to receive those messages.
- We'll create a Cloud Function or API Endpoint to listen for those messages coming into the Pub/Sub topic, it will have a Slack Webhook URL that will be invoked with the status of the function to update us about the function's progress.

### The Flow

![Pinging Slack On Firebase Functions Deployment.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fgetting-notified-when-your-cloud-functions-deploy%2Fsecondaryimages%2FPinging%20Slack%20On%20Firebase%20Functions%20Deployment1659809930028.png?alt=media&token=539169db-f428-405a-96a6-401c314999e8)

### Setting Up Our Incoming Slack Channel Webhook

I've written a post about how we can set up an Incoming Webhook, an endpoint where you can make an API Call to send a message to a specific channel. You can [find the post here](/lets_build_a_slack_extension). Or you could use a super-fast approach to test things out using an old way to quickly create incoming webhooks for your Slack Channels: [New Incoming Webhook](https://my.slack.com/services/new/incoming-webhook).

I also wrote a post about what webhooks are, you can find it [here](/what-are-webhooks-and-how-do-i-use-one).

### Sample Logs

Logs relating to updates and creation of Cloud Function look like the following, I've omitted fields that are not useful to us to better understand the fields we would need to focus on.

```json
{
	"protoPayload": {
		"authenticationInfo": { "principalEmail": "contact@devesh.tech" },
		"methodName": "google.cloud.functions.v1.CloudFunctionsService.UpdateFunction",
		"resourceName": "projects/your-firebase-project/locations/your-function-location/functions/your-function-name"
	},
	"resource": {
		"type": "cloud_function",
		"labels": {
			"project_id": "your-firebase-project",
			"function_name": "your-function-name",
			"region": "your-function-location"
		}
	},
	"timestamp": "2022-08-06T07:22:01.897976Z",
	"operation": { "first": true, "last": false }
}
```

### Setting Up Our Pub/Sub Topic

To set up your Pub/Sub topic, navigate to your [Google Cloud Console](https://console.cloud.google.com/), and select the name of your Firebase Project from the top navigation.

From the left navigation, go to Pub/Sub and click on the "Create Topic" button. This should open the following menu:

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fgetting-notified-when-your-cloud-functions-deploy%2Fsecondaryimages%2Fimage1659857703365.png?alt=media&token=86f7b33f-ee8a-4917-a3ee-a4e6e37db36a)

Uncheck "Add a default subscription", enter the Topic ID as: `cloud-functions-deployment-notification-topic` and click on Create Topic. We're done creating a topic for our use.

### Setting Up Our Log Router

Now we need to set up the Cloud Logging console to forward logs to our Pub/Sub topic to be forwarded to our cloud function and then in turn to our Slack channel.

From the left navigation, navigate to Logging and then to Logs Router. Click on "Create Sink".

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fgetting-notified-when-your-cloud-functions-deploy%2Fsecondaryimages%2Fimage1659857989788.png?alt=media&token=5fdee944-3c08-40b3-a49d-984a34a2ed7c)

Provide a lowercase sink name, and proceed to the Sink Destination step. In "Select Sink Service", select "Cloud Pub/Sub Topic" and select the Topic that we created in the previous step.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fgetting-notified-when-your-cloud-functions-deploy%2Fsecondaryimages%2Fimage1659858066032.png?alt=media&token=0cf338d5-daf6-4efa-9547-54aa772af149)

Proceed to the next step for specifying the filter for the logs we want to send to the Pub/Sub topic. In the inclusion filter, enter the following:

```
resource.type = "cloud_function" AND
operation.producer = "cloudfunctions.googleapis.com" AND
(operation.first = true OR operation.last = true) AND
(protoPayload.methodName = "google.cloud.functions.v1.CloudFunctionsService.UpdateFunction"
  OR protoPayload.methodName = "google.cloud.functions.v1.CloudFunctionsService.CreateFunction")
```

You can find a reference to this log filtering language here: [Logging Query Language](https://cloud.google.com/logging/docs/view/logging-query-language)

Save and proceed to finish the setup, we don't need a Log Exclusion filter for now.

### Setting Up Our Cloud Function to notify us

This might seem a little meta, to have a cloud function notify us about the deployment of cloud functions, but I'm only taking this route as Firebase/Google Cloud Functions make it ridiculously easy to connect a Pub/Sub topic to invoke a cloud function.

If we do not want to go the cloud function route, we can always set up the pub/sub topic to make an API Call to an HTTP Endpoint where our server will do exactly what the Cloud Function is supposed to. This kind of a Pub/Sub subscription is called a "Push Subscription", a lot like a [Webhook](/what-are-webhooks-and-how-do-i-use-one).

Continuing, I will assume that you have already setup Functions using Firebase CLI locally for your Firebase Project (Why else would you need this tutorial otherwise? :P), we just have to add the following snippet:

```javascript
exports.notifyOnCloudFunctionDeployment = functions.pubsub
	.topic("cloud-functions-deployment-notification-topic")
	.onPublish((message) => {
		try {
			const logData = message.json;
			const functionName = logData.resource.labels.function_name;
			const isStart = logData.operation.first === true;
			const triggeringAccount =
				logData.protoPayload.authenticationInfo.principalEmail;

			let deploymentMessage = `Function: ${functionName} has ${
				isStart ? "started 🟡" : "finished 🚀"
			} deploying.\n\nTriggered by service account: ${triggeringAccount}`;

			// I'm using axios to make an API Call, you can make an API Call with any library you want.
			const { default: axios } = require("axios");
			axios.post(SLACK_WEBHOOK_URL, { text: deploymentMessage });
		} catch {
			/**/
		}
		return true;
	});
```

Post deployment of this function, you'll notice that the Pub/Sub topic we created now has a subscription, that's our deployed cloud function listening to any messages in the Pub/Sub Topic.

When we deploy any other function, TADA! 🎉We get notifications for the start and completion of deployments for functions.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fgetting-notified-when-your-cloud-functions-deploy%2Fsecondaryimages%2Fimage1659857239024.png?alt=media&token=4d55c12e-54bb-4151-bdf7-426d52a166ae)

That's all folks! 🤝 Cloud Logging is a very useful service as it keeps track of all logs relating to your infrastructure running on Google Cloud, similar to its AWS counterpart CloudWatch, it can be used to set up all sorts of things like analytics dashboard for infra usage, alerting like the use case we saw above and whatnot.
