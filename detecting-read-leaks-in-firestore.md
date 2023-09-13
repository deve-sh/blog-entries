# Quick Guide: Detecting Read Leaks in Firestore

![Firestore is a great database until you're being charged for a number of reads that's beyond your app traffic](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fprimaryimage.jpg?alt=media&token=21fd0dba-03c1-4471-b1f1-8f5514e7303b)

> The great thing about Firebase is that there is no backend you have to worry about. The bad thing about Firebase is that there is no backend you have to worry about.

When working with [Firebase](https://firebase.google.com/) you often don't get the kind of control you would want with a ton of tools and methods that you would be used to in a traditional backend setup, like observability and latency metrics.

Granted, Firebase takes care of a lot of headaches for you, but there are chances things might go wrong from your application layer when integrating its services like [Firestore](https://firebase.google.com/products/firestore), [Authentication](https://firebase.google.com/products/auth) or [Cloud Functions](https://firebase.google.com/products/functions). You wouldn't even know, simply because the kind of controls and monitoring you have with a backend you set up don't exist with Firebase.

There is no way to get notified when there's a DDOS attack, a read leak or a leak in your application code that's causing an infinite number of Firestore calls or Function calls until the bill comes in.

This is something that happened to me when I was building a product that wasn't used by a ton of people but cost me a ton of money because I had somehow incurred 14.5 Million Reads to Firestore in a single month (Ouch!). The beginning of next month's trajectory looked something like this:
![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fsecondaryimages%2Fimage1694624284572.png?alt=media&token=f43cff60-a1a9-430e-803d-547645c04fbd)

It was apparent that there was a "read leak" in my application. In this post, I'll tell you what you need to know to understand where such read leaks can be occurring as with a big application it can get a little tricky to identify the source of leaks, especially when you're reading documents at several places.

And mind you, Firebase's usage doesn't update in real-time and it follows a model of "eventual consistency" where the usage data can be accurately updated even 3-4 days after you've incurred the reads, which means the 600K+ reads in the screenshot above could become 1.5M by the time the final reads are counted and bill is generated.

## Using Audit Logs to Detect Read Leaks

So it turns out that "you don't get observability" over Firebase services is a lie.  Since Firebase comes under the [Google Cloud Platform](https://cloud.google.com/), it has great integration features with [Google Cloud Logging](https://cloud.google.com/logging). One such service that allows us to get observability over the usage of our Firebase services is [Audit Logs](https://cloud.google.com/logging/docs/audit).

"Audit Logs" is originally an IAM concept built for accountability and traceability where every single operation performed by anyone in an org is stored and is traceable. In Google Cloud Logging, we can use it to log read and write operations for Firestore.

The best part? Google Cloud Logging and Audit Logs are free if you use their default retention period (90 days, which is more than enough to point out and trace any issues)!

Let's turn on Firestore Audit Logs.
- Go to your Google Cloud Platform dashboard and navigate to your Firebase project from the project selector.
- Search for Audit Logs in the search bar
![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fsecondaryimages%2Fimage1694624942078.png?alt=media&token=c3c62cf0-ef62-4a39-8b29-a937df0e9f68)
- Search for "Firestore/Datastore API" and click on it.
- Enable Data Reads and Data Write for your API. You can choose to do with only "Data Reads" as well if you're only trying to view read patterns.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fsecondaryimages%2Fimage1694624991317.png?alt=media&token=75ac71e9-f2ac-4bfa-8639-12098f0965f2)

- Save your preference and your logging should start from now.

> Note that it takes a while for the data to fill in since the logging starts from the point of time you enabled it, it won't help you fix problems that have occurred in the past.

#### Let's see our Read Logs

Now that you've enabled Audit Logs, operations for reads will start showing up in your cloud logging dashboard. Search for Logging in your Cloud Console and navigate to your logs.

Select a timeframe for when you want to see read operations.
![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fsecondaryimages%2Fimage1694625223820.png?alt=media&token=0dca02ae-732c-4fb1-991c-02629ff1b405)

Find the list of logs that have `Firestore.Listen` in them, these are your read operations. Click on that tag and it will filter out logs for only that operation.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fsecondaryimages%2Fimage1694625831508.png?alt=media&token=9d46e24e-188a-4abf-aaf1-722afe95016d)

Enable histogram view to see when reads spike and for convenience click on any histogram spike to see the logs for that time frame.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fsecondaryimages%2Fimage1694625387552.png?alt=media&token=893aa43c-69cc-44a9-99b8-6c5eb334bb2e)

Here is when things get interesting, Google Cloud logging is super powerful. You can do the following with this information now:
- Go further to see the document IDs of the documents that are being read.
- See authentication information (Email of the user etc.) who accessed this document if Firebase auth was involved.
- Create alerts for spikes.

To get the IDs of documents that are being read, we would update the “Summary” that’s shown to us. Click on “Edit” next to Summary.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fsecondaryimages%2Fimage1694625513156.png?alt=media&token=5b125efc-0523-4660-aa60-29acef3331dd)

Make the following changes and click on Apply. You can add multiple summary fields if you want.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fsecondaryimages%2Fimage1694625547159.png?alt=media&token=89fb8fd7-b279-4623-b01c-f180c43a094e)

You will now get a comprehensive list with the document IDs highlighted, which you can scroll through and identify the most common pattern to identify a read leak.

Voila! We have what we need to identify a read leak and pattern in our application and fix it! ✨

## Alternative but Harder Approach: Firebase Key Visualizer

If you're looking to go with a hardcore approach, you can also use the [Firestore Key Visualizer](https://cloud.google.com/firestore/docs/key-visualizer).

Explaining it is out of this post's scope, but as a summary, once you enable it, it tells you the most commonly read and written document IDs and creates a heatmap of access patterns as well as performance metrics.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdetecting-read-leaks-in-firestore%2Fsecondaryimages%2Fimage1694625908534.png?alt=media&token=0ec6690b-1cd4-415e-84b8-ae8b2fb50419)