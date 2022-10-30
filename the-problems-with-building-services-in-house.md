# The problems with building services and systems in-house

![Photo by Pixabay: https://www.pexels.com/photo/three-people-sitting-beside-table-416405/](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fthe-problems-with-building-services-in-house%2Fprimaryimage.jpg?alt=media&token=65deb474-245c-4831-a921-47d39277af5e)

On a hot evening, I'm sitting beside my laptop, exhausted from a day of work and discussions with a team. What for you may ask? To set up the build and deployment pipelines for a new internal app we were building.

Now with all my time in various startups, I was never used to having meetings for these things, the developers would be responsible for setting up the pipelines for the apps they create, but this company was different and more like any other big company you would expect. It had a team for everything, analytics, development, product management, system administration, security and infrastructure.

A simple app you need to build and push for the world to see, that takes only an hour to code could take more than a week to go live with approvals and requirements from all these teams.

The app we were trying to deploy, was a static web app. It only had HTML, CSS and JS output that could be hosted on a very simple server or better yet, on something as simple as [GitHub Pages](https://blog.devesh.tech/post/using-github-actions-with-github-pages-to-publish-preview-builds).

In a fit of frustration at how slow things were going, I simply shut down my browser instances. Fired up VS Code and wrote a simple [GitHub Action](https://github.com/features/actions) to build and deploy the app to GitHub Pages while the teams figured their stuff out, and it took me 15 minutes to do so, including some edge cases.

> It does not take any approvals to create a Pull Request for what you want to achieve.

My team lead was pleased with the output as it was exactly what we needed, his manager, however, took a different stand. He believed that we should rely on building services ourselves as they give us more control and flexibility plus the teams inside the company would be responsible for handling any issues that would come with it, instead of having to rely on something out of our control like GitHub Actions.

There's a good reason why these companies have separate teams and processes for everything, but many times it just slows things down (Just as a side note, after ditching the pipeline setup I had swiftly created, it took the teams another 1 month to set up an internal pipeline that did exactly what my setup did).

Now the control, flexibility and self-reliance argument might be valid at a scale where you need to start trusting your architecture and infrastructure. Most companies will take years to reach this stage and it's more beneficial for early-stage companies to not go into the rabbit hole of not trusting the world and building/hosting everything yourself.

The problem with the example I gave above was that the company I worked with, was not at a scale where it even needed a dedicated SRE team, let alone bother building an entire pipeline themselves for an app as simple as a few HTML, CSS and JS files that could be hosted on an S3 bucket and served via a CDN.

> Building something is hard enough already, it doesn't have to get more complicated.

### Benefits of using Managed Services

I am all for using managed services, like Vercel for hosting, GitHub Actions for CI/CD, AWS Fargate for container-based apps or simple AWS Lambda or GCP Cloud Functions for mini microservices-based code, MongoDB Atlas for hosting your MongoDB clusters.

Don't get me wrong, I am an advocate of the fact that you should know how things work in those managed services, but at the end of the day, you do not need to reinvent the wheel trying to build and host systems/services yourself.

And there are many reasons for that. As a note, when I say Managed Services, I mean services for anything, authentication, databases, hosting, pipelines etc where you simply use the service and pay a timely fee based on your usage instead of having to build things yourself. Take Firebase for Authentication, MongoDB Atlas for a database as a service, Vercel for hosting, and GitHub Actions for Pipelines as opposed to hosting a whole suite of Jenkins yourself.

#### Managed Services help you save time

If you've searched for a database in the past, chances are you have most likely encountered an installable and hostable version of those databases, and a managed Cloud offering which takes care of the provisioning, hosting and scaling for those databases.

For someone just starting, or an early-stage company it's beneficial to go with a managed cloud offering to save on the time it would take you to set the database up yourself or upgrade it in the future and run migrations.

#### Managed Service Companies are usually dedicated to a single craft

If you think about services like Vercel or Pagerduty, their entire stack is dedicated to one usage field. I.E: Deployments/Hosting and Incident Reporting respectively.

> The fact that they're dedicated services is what makes them great. You can count on them to deliver as their focus is not diverted.

For a starter, all the use cases they could imagine would be served by managed services.

Similarly, MongoDB Atlas and AWS RDS are databases as a service where databases that you could host and manage are taken care of for you, you just pay a simple bill. In most cases, when you're starting, you should prefer these services over hosting your databases yourself.

> If a company that specializes in X, starts focusing on Y to keep its systems running. The focus on X is diluted, leading to poor performance in both X and Y.

#### Managed Services can hire more experts in their field

If a logistics company wanted to set up an SRE Team, they would have to hire entry-level (Optionally), mid-level and senior-level Site Reliability Engineers depending on their budget. The cost of hiring these engineers and the services they would host and maintain comes from the overall budget of the company, money that the SRE team would compete for with other units of the company like marketing, sales etc.

With budgets, comes a cap on the spending a team can do for management and hiring. Hence, there's a cap on the number of people that a company can hire for a specific team, may it be the DevOps team or the Database Management Team.

Managed Service Companies like Vercel would have a cap, but they would have a bigger budget for an SRE team given their focus is on that craft. Hence, Vercel can hire more SRE experts that take care of their infrastructure and in turn the websites and apps you have hosted on them.

#### Managed Services have SLAs and are accountable

If there is an issue you're facing with a managed service, chances are, they're already on it and fixing it as you type in the support box.

That's because of something called an [SLA](https://www.techtarget.com/searchitchannel/definition/service-level-agreement) that requires them to service any downtime, customer issues or bugs in a certain timeframe.

Any issues not mitigated in that timeframe usually require them to provide you with usage credits or refunds on your bills.

Combine SLAs with a dedicated focus on one craft, and you get a solution with which you can sleep peacefully at night.

When building services internally, you can specify a team-level SLA where any issues raised with an SRE or a Database Management team have to be addressed and resolved in x time frame but when communication and problems happen inside an organisation, it doesn't take top priority in my experience.

#### It is entirely possible to build an app for millions without hosting/creating a single service yourself

I've covered this earlier in another blog post of mine: [All you need for your first 100000 users](https://blog.devesh.tech/post/all-you-need-for-your-first-hundred-thousand-users), but it's entirely possible to not create a provision a single server yourself for any backend or database, and have it scale up to millions of users.

Many companies that have a sharp focus on cost optimization do exactly this, they use managed services until the problems with managed services outweigh the benefits. Take Dropbox, for example, they used AWS S3 for all their file storage for the longest time, but after a certain point, they [shifted to a hybrid model](https://www.datacenterdynamics.com/en/analysis/how-dropbox-pulled-off-its-hybrid-cloud-transition/) for optimizing their costs and user experience.

Instagram got to millions of users with a handful of engineers, and the same is true for plenty of other companies. Do not over-engineer stuff and worry about building, hosting and managing services yourself at the start.

> In the beginning, the control, flexibility and self-dependence you get by provisioning and hosting your services yourself is probably worthless.