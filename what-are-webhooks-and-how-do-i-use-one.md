# What are Webhooks? How do I use one?

![Photo by Ketut Subiyanto: https://www.pexels.com/photo/city-man-people-woman-4963437/](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fwhat-are-webhooks-and-how-do-i-use-or-create-one%2Fprimaryimage.jpg?alt=media&token=962b7b8f-45c4-415f-87d3-26d14eb8279b)

### Payments - A Little Story

It's a rainy evening in June, around three years ago, I've just gotten off my laptop after a coding sprint for a feature I was working on for the guys at Unergia. My phone buzzes, it's a message on WhatsApp, fighting the urge to check it later after a break, I pick up the phone and see a message that reads "Devesh, we will likely need to set up Razorpay on our website, could you look into it?". For some context, at that point, we were building a solar aggregation platform, i.e: Installers would put up their proposals for solar projects we had aggregated and the customers could choose the best one. That was the online-only part, and everything else, including the entire money collection part, had been manual.

I had never worked with payments before, and the fact that I would need to build a feature that would be directly responsible for users' money was a daunting task. In hindsight, a lot of you reading this might know that modern payment gateways like [Razorpay](https://razorpay.com) or [Stripe](https://stripe.com) make integration super simple and very well documented. But that's the beauty of hindsight, it tells you things you would have been better off knowing right at the beginning.

Being the only developer there at the time, it took a little bit of researching and a lot of convincing myself to say "Okay, it might not be that hard, let's get started." And get started I did. I started integrating [Razorpay's standard checkout SDK](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/) into a new payment flow that was required, their API is sufficiently documented and my initial thought was that it's going to be pretty simple encompassing the following steps:

- User clicks on "Pay Installment"
- Razorpay's Standard Checkout SDK opens a popup for the users to pay
- The users make a payment
- Razorpay tells us that the payment went through, we confirm it with an additional API Call to Razorpay
- We show the user a success message and hurray, the payment is complete, and we have the money in our bank account to take a cut and pass the rest to the installer (Also possible with Razorpay's APIs but that was something we discovered later)

If you've integrated payment services in your app or have ever made any payments online, you will notice a fundamental issue with the above flow, payments are not black or white, they can have multiple states, i.e: A payment could be put in a pending state because one of the intermediaries was down, the clearinghouse was down, the receiver bank was down, NPCI itself was down.

We're very aware of the situations where we make a payment online, the money gets deducted from our accounts but we get confirmation of success much later or straight up a refund and the transaction is cancelled. This is exactly the case that I missed in my above flow, you might say this is a common rookie mistake of jumping in without fully analyzing all possible flows and you will be right. Given the time constraints, I had a hard time fully understanding all that could go wrong.

Nonetheless, I didn't hit a wall with this issue because Razorpay or any payment gateway's sandbox environments (Where you run tests as if you're making actual payments minus the money) have no "in-progress" status either fail or pass. And I skipped the part of the documentation where they tell everyone to use webhooks or some mechanism to handle payments that might get stuck due to any of the numerous aforementioned factors.

**Payments go live**: After around 3-4 days of work and testing in a sandbox environment, I was ready to go ahead and push the changes to production. With a deep breath, I got ready for the first payment from a customer the next day. The night passed in constant fear, ticking off all that could go wrong, I did have the "in-progress" payments thing in mind, but I assumed it won't go that wrong and most likely the payment will go through as expected. But I probably forgot the most important law that exists, Murphy's law:

> Anything that can go wrong will go wrong.

The next day came, and I was on call for the first automated payment to come through that our backend would have to reconcile with Razorpay's backend the moment their SDK told us the payment was completed, how hard could it be and what could go wrong? I eased in a little.

I got a call that afternoon, "Devesh, the customer didn't get any payment confirmation, his money got deducted though, can you check Razorpay?" I hurried to the Razorpay dashboard and to my horror, the first payment we got, was in the dreaded "In Progress" or "Pending" state, our backend had assumed that after the SDK gave the response that the payment went through, Razorpay's backend would give a successful "capturing" response immediately, which was not the case.

We quickly manually captured the payment, turns out it took around a minute extra for the confirmation of that payment to kick in and sent the customer a success message manually.

### Enter Webhooks

Consider this scenario, you're in a dine-in restaurant, and you place an order. Unless you're really hungry and desperate for food, you wouldn't go to the counter every 5 minutes and keep asking whether your food is ready. Instead, someone will bring your order to you or at least tell you when the food is ready, you just place an order and go on doing whatever else you wanted to do in the meantime.

Similarly, in the case of the payment example, I highlighted above, it would have made much more sense if there was a way for our app to know when a payment's status changes without having to ask Razorpay every 30-40 seconds which would not only be resource-consuming but also impractical. In such cases, enter Webhooks, they're automated messages the external service will send us when some event we're interested in occurs.

Webhooks are not just useful in payments, but also in a lot of other scenarios, like listening to your user's activities on other platforms. For example: When you submit a form on [Slack](https://slack.com/), there is an external server that receives a request with all the event information and sends back an appropriate response for Slack to work with. Similarly, Calendly uses webhooks to tell external apps that there's a meeting scheduled on the link they shared so the apps can send emails to them and so on.

There are multiple ways Services offer webhooks, a few of them include:

- The service will ask you for a single webhook endpoint and which events you are interested in, and will hit the endpoint only for those events. The handling of those events has to be done separately in your code. For example, we were interested in the `payment.failed` and `payment.captured` events from Razorpay, so those are the events we set up webhooks for.

```javascript
app.get("/webhookendpoint", (request, response) => {
    const { event } = request.body;
    if (event === 'user_submitted_form')
        // ... Do one thing
    else if (event === 'user_updated_profile')
        // ... Do something else
});
```

- The service asks you for the events you're interested in and a webhook endpoint for each of those URLs (This is rare but is still done in cases where multiple microservices/sub-systems are handling different events you're interested in from that service)
- The service asks you for a single webhook endpoint and sends you webhooks for all events that are present in their system, in this case, the choice of events you want to receive and handle, has to be done on your server since the external service will ping your server for all the events they support. This is again, not a very common approach, but as far as I remember, was followed by services like [Escrow](https://www.escrow.com/).

As you might guess, discovering webhooks (Ironically, from the documentation itself) was a "Eureka!" moment for me, and the flow for managing payments now became:

- User clicks on "Pay Installment"
- Razorpay's Standard Checkout SDK opens a popup for the users to pay
- The users make a payment
- Razorpay tells us that the payment went through, if it's a direct confirmation response like a Success or Error, we tell the user so. But if the response is not Binary, i.e: It's pending or capturing the payment from our backend takes a while, we tell the user that their payment is pending and that they'll be notified when the transaction goes through.
- We use the webhooks we set up on Razorpay, confirm whenever the payment goes through and notify the user as such. The transaction on the front-end till then shows a "Pending" state.

This has been a great gift and I would say, webhooks have been great overall at enabling communication between external systems and our systems.

We later set up a similar but much larger infra for handling Payments for all our clients at Solar Ladder, all handled by a Server Less Cloud function for listening to payment confirmations from Razorpay.

We even went one step ahead, and disabled manual checks to Razorpay for payment successes and instead set up real-time listeners between our frontend and our database, the webhook handler does the processing, updates the database and then the users see those payment statuses reflect real-time.

### Authentication

When you're working with Webhooks, you might encounter a security issue, where you might wonder "How do I ensure that the request I get is from the service I want?" And for this, there are a few approaches, but most of them work with the concept that you provide the service with a key that only your backend knows, and to verify that they're the ones hitting the server, they'll send that key in the request's headers or use that key to encrypt the request body on their end, and you can use the key to decrypt the request body when it reaches your server. Pretty simple communication overall.

The flow looks like this:

- You go to the external service's Dashboard to set up a webhook.
- The service asks you for the events you want to subscribe to, along with a `Secret` key they can send in the request headers or use to encrypt the request body or some parameter in the request.
- The service makes a call to your server for those events in the future, your server uses the key it stores in Environment Variables, to verify the request, if invalid, send back an error response, else send a success response and **keep processing the data in the background** (There's a reason why you want to send back responses quickly, and we'll discuss that in the next section)

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fwhat-are-webhooks-and-how-do-i-use-one%2Fsecondaryimages%2Fimage1652443833455.png?alt=media&token=0fef4057-0655-40dc-8fc4-bdd17f3d51e0)

### Idempotency

From [MDN's website](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent):

> An HTTP method is idempotent if an identical request can be made once or several times in a row with the same effect while leaving the server in the same state.

Sometimes, the services you subscribe to might have timeouts, that if your server doesn't respond in 5 seconds or just outright gives a failure response (Any status code other than 200-399), they'll do one of the following:

- Mark the request as failed, if there are multiple such failures in the future, your webhook endpoint might be disabled from their end.
- Mark this request as failed, and retry.
- Do nothing, keep sending further requests for future events but do nothing for the current failed request.

The issue of idempotency arises in the case of the second kind of webhook, picture this, you have a server that first takes a second to spin up (Probably even more if you have a Serverless Function like AWS Lambda or Google Cloud Functions that have [cold start times](https://dashbird.io/blog/can-we-solve-serverless-cold-starts/)) and then say 3.5 seconds to process the data given a lot about the application depends on payments, and then another second to send a response back. In such a scenario even though you performed all the operations as expected and promptly returned a response, the external service will mark it as having failed given the response time was over 5 seconds.

You might have guessed what might go wrong now, the external service retries the request but now, your server starts processing data that it already has previously, i.e: There is a possibility of inconsistency in your application if your server doesn't handle retried requests. To mitigate this, **idempotency** has to be introduced.

Two simple approaches to avoid data inconsistency from webhooks are:

- Use a unique identifier from a request and store it in a database that it has already started or been processed, next time a request comes, just make a query to first check whether the unique ID you receive in the request matches any existing entries in your database and whether the processing was successful or not. Most external services will send an `Event ID` with each request which stays consistent across all retried webhook requests and can be utilised to maintain data inconsistency possibilities. This is a great approach to achieving a simple level of idempotency, it's not fool-proof but works well in most scenarios until Murphy's Law decides to kick in again.
- Don't make the external service have to retry in the first place, the moment you get a webhook request, simply return a 200 response to the external service and keep processing the data in the background. All failures that happen post that point should ideally be handled in your application itself and sending a non-success response in those cases to the external service does not make sense at all. You will be making the external service pay for a mistake it did not make in the first place ( :P ).
