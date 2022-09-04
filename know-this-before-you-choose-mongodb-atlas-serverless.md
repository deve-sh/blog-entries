# Know This Before You Choose MongoDB Atlas Serverless

![MongoDB Atlas Serverless Home Page](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fknow-this-before-you-choose-mongodb-atlas-serverless%2Fprimaryimage.jpg?alt=media&token=a79be4bc-ff05-40b2-9635-fea73254ce86)

> Serverless is fantastic, but sometimes the way things are priced can come back to bite you in the back!

I was using MongoDB Atlas extensively in one of my projects, after all, it's an excellent managed database service with a fantastic aggregation pipeline for all the basic analytics and stats my application needed.

Some days, however, my MongoDB Cluster (An M1 instance) used to hit its connection limits (500 connections - I was using Serverless functions that scaled up and down as traffic levels variated) and further reads and writes used to be blocked until the connections cooled off; now I could, of course, switch it to an M10 instance to push the connection limit to 1500, but that would have cost me upwards of $40 instead of the $9 I was incurring at that point, just for my database.

So I had a few options:
- Look for a database alternative.
- Group my Serverless HTTPS functions to a regular always-online Node.js instance so the connection numbers would always be maintained and predictable.

### Enter MongoDB Atlas Serverless

Neither of the points was appealing to me. So one day I hear about MongoDB serverless, a new service that MongoDB was launching that would allow infinite scale and a pay-as-you-go option for MongoDB Databases. I was elated, and couldn't be happier, I could pay for what I used, and I didn't have to worry about my connection limit expiring, way to go!

So, for those of you who need some context as to what "serverless" is, it's a model where you don't have to worry about provisioning and managing servers for services you run. For example, if I have to host an API, I could ask Amazon Web Services to give me an [EC2](https://aws.amazon.com/ec2/) instance, always on, and charge me $9 a month for that, or I could use a service like AWS [Lambda](https://aws.amazon.com/lambda/) to host my APIs in a way where I just tell AWS the code I need to run, and it will take care of the background provisioning of the servers needed and create as many servers as needed for the number of requests coming in and I pay for what I used at the end of the month.

Similarly, my MongoDB Atlas database cluster could only handle at max 500 connections at a time, I needed more, and there wasn't a service that could help me do that. With MongoDB Atlas Serverless, all that stress goes away.

Even the pricing was too good to be true:

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fknow-this-before-you-choose-mongodb-atlas-serverless%2Fsecondaryimages%2Fimage1662213348161.png?alt=media&token=fe633ac2-1c74-4dda-bc8d-c16db66db293)

So I quickly created a Serverless cluster, migrated my database contents, and became one of the early adopters of MongoDB serverless.

### What's the problem?

Apart from having to update your drivers for MongoDB in your code, there is a much bigger problem with MongoDB serverless:

> The Pricing for Serverless isn't clear, and the consumption is not transparent either.

When I said the pricing was too good to be true, like 10 cents for a million reads, I meant it was too good to be true.

I was in the habit of taking cheap prices for database reads and writes for granted, given Firebase has a free tier that just makes it really really difficult to even get out of that free tier without having a lot of users (A company I worked with that uses every single Firebase service you can image, generates a sizeable revenue, has a lot of users, has a Firebase bill of less than $8 a month), so at the time of reading *$0.1/Million Reads* was enough for me to believe it.

It's in the fine print that the very definition of "Reads" and "Writes" is modified by MongoDB.

On top of that, all Indexing, data backups, and data transfers are charged extra. Of course, I don't expect those to be free, but the pricing should be understandable by regular devs and upfront. Writing $0.1/Million Reads upfront and then renaming reads as "Read Processing Units" isn't being upfront. Every document that I store in MongoDB serverless could be billed 8 times just because it generates 4 indexes of 256 Bytes and is 16 KB large, and that is exactly what happened with me.

As a side note, there is no way for anyone to know how many RPUs a single document or operation charged or used because there is no transparent way to know, without literally being a Data Scientist that can navigate MongoDB's charts interface for database usage monitoring.

### Have a Look

The takeaway is that it's much better to just stick with a MongoDB Shared cluster if your database traffic is predictable and optimize the usage from your application instead of using MongoDB serverless.

MongoDB serverless can be a lifesaver in case your application had really unpredictable traffic where spikes in the number of requests are frequent. But MongoDB has a lot of ironing out to do in its serverless service, because at no point in the bill below or any invoice will you get a detailed breakdown (By day, by week, by operation) of the usage and cost that your database incurred.

All you'll be left with is a bill that will have a higher-than-expected cost against the "Serverless" section.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fknow-this-before-you-choose-mongodb-atlas-serverless%2Fsecondaryimages%2Fimage1661785901629.png?alt=media&token=09bbc9f7-8384-4f8c-a64b-227cb5fda759)

I don't blame anyone for it, I should have read the fine print more carefully and done the planning accordingly and MongoDB Atlas explicitly states that Serverless service is still in its early stages, and I'm sure by the time a lot of people read this, MongoDB Atlas would have made significant progress on the part where users are able to get a better view and understanding of their billing.

I have no plans to stop using MongoDB, of course. It's my go-to database whenever I have to put a backend in the middle.