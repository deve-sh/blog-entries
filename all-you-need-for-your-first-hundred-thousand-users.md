# All You Need For Your First 100000 Users

![Photo by cottonbro from Pexels](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fall-you-need-for-your-first-ten-thousand-users%2Fprimaryimage.jpg?alt=media&token=6ba26643-1cf0-4208-813d-1611ee92a150)

We see stories of hyper-growth startups using bleeding-edge infrastructure all the time, I decided I'll provide my insights about all you actually need for getting to as many as 100000 users on your app and even more, without having to worry about downtime. You don't need 50 different services to keep your app up all the time, a few are all you need to get started and reach a good number of users. 

Bear in mind that after a certain number of users, closer to more than 20 Million, it makes more economic sense to have control over your infrastructure and to keep everything running, you do need to have over 50 services sometimes (Encompassing logging, monitoring, backend microservices, micro-frontends, storage solutions and whatnot). But most startups that I've worked with and built from the ground up are serving a good number of users without downtime with minimal configuration and a bill whose amount wouldn't even be largely noticeable on the Credit Card statement.

### The best way to scale is to not have to scale yourself

With a plethora of resources and platforms at your disposal, building an app that can scale as much as required is pretty easy today. With services like AWS Fargate, AutoScaling, Google Cloud's own App Engine or Firebase and a host of auto-scaling offerings from multiple cloud platforms have one selling point, that you focus on building and growing your app, and leave the hosting and deployment part to us.

Let's break down a few simple things you can do in various aspects of your app.

- **Version Control and Code Storage**: Forever free, you don't have to pay a single dime for your code storage, services like GitLab and GitHub would be more than happy to host your codebase and give you other features like pipelines, actions, environment variables, tag and release management and whatnot.
- **Frontend**: Use a platform like Vercel, they'll take care of hosting, deployment from your Git repository, they'll scale your website as much as needed, all for free up to 100GB of bandwidth consumed.
- **Backend**: For a scalable backend, horizontal scalability is an important aspect, the best way to have your backend be horizontally scalable is to split it into chunks of functionality, i.e: Instead of having a single big backend app taking care of all aspects of your backend, have multiple instances taking care of one aspect of the backend. I.E: Serverless functions, or as they are usually referred to, lambda functions. They can be scaled up individually, independent of the rest of the backend and are usually much faster. AWS Lambda, Google/Firebase Cloud Functions are great options to put your backend code on and just invoke your functions using a URL, GCP or AWS will take care of infinitely scaling those functions and all you have to do is pay a bill for the time your functions consumed throughout the month.
- **Logging, Analytics and Monitoring**: A lot of solutions are available as Pay-As-You-Go options for Logging and Error Monitoring, Google Analytics is the best analytics tool out there and is completely free, crash reporting can be done by Sentry and you can have Logstash, Kibana with ElasticSearch for logging or just use the one that's provided by the cloud provider like CloudWatch.
- **Storage**: This is the part where we have to worry the least about, just use Google Cloud Storage in case you're using GCP, or S3 in case of AWS. Both of them are infinitely scalable storage solutions that can be coupled with CDNs for super-fast content delivery as well as general user storage and even for other things like Application backups, log storage and whatnot.

The above techniques not only work for your first 100 Thousand users but should also work for millions in case it's done right and you don't mind a large bill once it gets that big. Although at a scale larger than that, it just makes more sense to have a dedicated infrastructure layer that you can provision and manage yourself. Dropbox is a good example of this, they used AWS S3 for File Storage on the cloud but due to the scale they're at today, they are moving parts of their infrastructure to in-house.

### Build from the ground to be scalable

When starting out a project that you want a lot of people to use, build it from the ground up with that assumption, a few loose ends due to time make sense, but a few good decisions at the beginning can make a large difference later when your app has scaled up and doesn't have too many bottlenecks that take weeks to resolve due to technical debt or the possibility of a scale-up not having been considered.

Choices like going with a NoSQL Database when you don't have too much-related data, configuring auto-scaling groups to scale up the number of servers starting with one server in the beginning, or better yet ditching all that and letting a Platform/Backend As A Service provider do all of that for you is one of the best options you have. It does open you to the possibility of downtimes when major providers like AWS, GCP or Azure go down but they have an SLA of 99.9999% so downtimes are very rare instances.

### Keep it simple, and loosely coupled

The more components of your application depend on each other, the more difficult it is going to be to scale them up, this isn't so important on the front end as it is on the backend, although it still is important on the front end in case your application grows larger, in which case we have the micro-frontend or proxy deployment patterns at our disposal. The last thing you want is getting over 10000 users and seeing constant drops in the requests that are being sent to your backend or the database you're using because your backend is not able to handle those requests.

As highlighted above, to achieve scalability, you need to keep things decoupled, have each backend component be responsible for doing one thing, and one thing alone, and each of those functions can be deployed separate from each other and scaled horizontally as requests come because there are going to be parts of your backend that'll receive more requests than the other and scaling the entire backend because of that wouldn't make sense (I.E: Vertically scaling).

### Tech Stack of choice

The tech stack I usually go with for most of the projects that I start is the following:
- **Frontend**: Next.js or Create React App, this is very subjective, I'll try other frameworks or libraries every now and then just to learn them and get a feel of what they offer, like Svelte, Remix, Vue.
- **Backend**: I usually go with a backend-as-a-service like Firebase or Supabase, but if I have to write a backend from scratch myself, I prefer Node.js with Express/Flask if you're a Python guy.
- **Database**: Firestore is a great choice for starting out, simply because there is infinite scalability and it comes with lightning-fast reads and writes and a lot of other features and integrates really well with other features offered by Firebase. MongoDB is my second choice, I usually use MongoDB Atlas but if I'm adventurous I'll spin up a MongoDB instance on EC2 and use that instead. For super-related data, I prefer a relational database with an ORM in front of it like Prisma with Postgres.
- **Platforms of choice**: For the front end, there is no other platform I would go with other than [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) and [Surge](https://surge.sh/) are good options but not even close to the ease and convenience that Vercel offers.
 For the back end, you can go with [Google Cloud Platform](https://cloud.google.com/), [AWS](https://aws.amazon.com) or [Heroku](https://heroku.com/), whichever one suits you, my choice for instances is AWS, but for managed app platform it's usually GCP's App Engine, but for a barebones setup, go with Heroku.