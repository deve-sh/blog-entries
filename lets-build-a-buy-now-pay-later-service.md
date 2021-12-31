# Let's Build a Buy Now Pay Later Service

![Photo by Anete Lusina from Pexels](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-build-a-buy-now-pay-later-service%2Fprimaryimage.jpg?alt=media&token=54f90d95-c5f8-4bf7-b943-9ffd5d4cd7f1)

Buy Now Pay Later companies have gotten extremely popular in the past few years, some became billion-dollar companies in 2021. Although the concept of BNPL is not at all new, many companies are present today that offer the services like Simpl, ZestMoney, Paytm, Afterpay, Klarna and who not, even big credit card companies are rumoured to enter the scene soon.

We are not here to judge the companies, because I'm personally not a fan, they encourage splurging and buying things you can't afford in the present, with the promise of paying for it in parts later. 

They are great services to use for people who are financially well off and have good spending habits to make some extra interest on their savings before their bill comes due, just like people have been using Credit Card Services for a long time. But it is a terrible idea to buy things with BNPL providers that you cannot afford. Again, not here to judge. 😛

In this post, we'll be creating a basic BNPL service from scratch because it's a great topic to build a personal project on.

The application should be able to handle the following main operations:
- User Authentication
- Users should be able to register a merchant, so they can receive payments using our service. The merchant should be provided identifiers/credentials that help the service identify the merchant for future transactions.
- The service should provide an API to create an order for a product on the merchant's platform.
- The service should provide a route to redirect the user to for payment of a created order.
- The user should be able to consent to the purchase of a product. On successful consent, the amount associated with the order should be added to the bill of the user and charged in the next billing cycle.

We'll take a look at the working of each of these steps one by one.

The tech stack I'll be using is the regular:
- [Next.js](https://nextjs.org/) for the frontend and backend (It offers serverless functions that allow me to not have to create a separate backend server to accomplish tasks that require stricter validation and intervention. Plus it allows us to server-side render pages so we can do some pre-processing on some important transaction flow pages and increase compatibility across devices)
- [Planetscale](https://planetscale.com/) for an SQL Database
- [TypeScript](https://www.typescriptlang.org/) for Type Checking and Safety
- [Chakra UI](https://chakra-ui.com/) for pre-built React components
- [Firebase Authentication](https://firebase.google.com/docs/auth) for User Authentication
- [Zustand](https://zustand.now.sh) for cross-component state management.
- [Razorpay](https://razorpay.com) for collecting bill payments from users.

We'll name the service **Dashout**, pretty good name right? I know. Follow the code and development for Dashout on [this GitHub repository](https://github.com/deve-sh/dashout) since this article will mostly be focusing on the flow of processes rather than the actual code.

Unlike other "Let's build XYZ" posts, I'm not going to get into code in this post, mainly because I haven't even set it up yet myself. 😛

##### User Authentication

Now, as stated above, I'm not going to set up user authentication completely myself. There are tons of services that allow me to do that, like Firebase Authentication, which I'll be using here. The subtle difference here is that in tandem with Firebase Authentication, I'll be using PlanetScale to save information about the users.

So the moment a user logs in, we make a request to our backend to store or update the user's information based on the data we get from Firebase Authentication, the backend will be authorized based on the user's ID Token we get from Firebase Authentication and validate it using Firebase's Admin SDK.

##### Merchant Creation
The merchants on the platform will be created by the users themselves. Users can opt-in to be merchants as well, on clicking an "Add Merchant" button, they will be prompted to enter some core information about their company. On completion, the merchant is assigned and provided with a `client_id` and `client_secret` that they will use to create orders as well as redirect users to the appropriate payment page with the `order_id`.

##### Order Flow 
![Dashout - Order Flow.jpg](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-build-a-buy-now-pay-later-service%2Fsecondaryimages%2FDashout%20-%20Order%20Flow1640703257535.jpg?alt=media&token=bbd1985e-0066-498d-ba10-9925fab8f13a)

##### User Payment Flow for Pending Amount

![User Payments Flow.jpg](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Flets-build-a-buy-now-pay-later-service%2Fsecondaryimages%2FUser%20Payments%20Flow1640750489867.jpg?alt=media&token=32eac95d-fcfb-4caf-8400-e23af3c741c3)

##### Payment Notifications

Merchants can be asked to register a webhook at the time of creation to receive notifications of payments for orders that were created by them, this way the service can handle failures and success of payments and perform follow up tasks after a purchase. 

Failures of webhooks (Expiring a webhook after some failed attempts) and editing of webhook endpoints can be handled as well.

##### Things That Can be added
Now that we have an idea about how core things about the service will work, we can think about adding other things that this post missed as well, such as:
- Cancellation of orders that were placed with a refund credit to the user's tab.
- A snippet for merchants to copy that injects a Pay with Dashout button at the checkout screen.
- Rolling over bills for users to next month like Credit Cards
- Pay Bill in Parts like Quadpay

Make sure to expand the above list based on what more you think we can add.