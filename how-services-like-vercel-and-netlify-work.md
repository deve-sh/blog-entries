# How Services like Vercel & Netlify work

![Before they came around, it wasn't all fun and games hosting even a simple website](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-services-like-vercel-and-netlify-work%2Fprimaryimage.jpg?alt=media&token=573941e2-cac9-4876-9313-8e912826b95e)

An 11-year-old me was sitting one evening on my computer next to the balcony, it was drizzling, but I couldn't care less about the rain as I was creating the first version of my website with HTML and CSS from whatever I had learned back then from a book I had borrowed from a senior friend from school.

Good old days, just a plain website was all you needed to get started on the web, no JavaScript was needed, and no interactivity was needed.

It was so early for the web in India, that I didn't even know how to host and publish my website on the web, I was just excited about pushing something and bragging to my friends the next day at school to visit devesh.com when they got home and see my photo and be amazed.

If you're wondering what my website looked like, just go to [https://www.stroustrup.com/](https://www.stroustrup.com) and you'll know (BTW, this guy is the creator of C++).

Once the website was done, and it was indeed a work of art 😛, what I needed to do was publish it, but I didn't know it at that time how to do it.

Thankfully for me, Google Search back then wasn't horrible and a search even for "How to put my website on the web for others to see" did yield useful results unlike the 100 ads you get served for web hosting companies today that don't tell you how to do it, but rather just try to sell you a hosting plan, assuming you already know how to do everything (Trust me, the degrading quality of search on Google is an advantage for local consultancy shops that specialize in areas that require no sophisticated knowledge like simple web hosting, given normal day-to-day people are not able to find useful step-by-step instructions on how to do something that simple and give up because all they see are ads).

I quickly understood that if I had to publish a website on devesh.com, I first had to buy that "domain". Well, there went my dreams of bragging to my classmates because where is an 11-year-old kid going to get the 500 rupees needed at that time to buy that domain?

So I added a "for free" at the end of my search query, and voila I got results that were ready to host my website for free, but there was a catch, the website would be hosted on their domain, I'll just get to upload my website files and they'll give me a subdomain like devesh.webs.com (Not my website BTW). By the time I could finish it off, my mother stormed in as I had been on the computer for the past 4 hours and I needed to get started studying for the next day, Sheh.

The search didn't end there. A rabbit hole of exploration led me to understand things like FTP, HTTP and SSL Certificates over the next week. And I realized the web wasn't filled with people just randomly making websites and calling it a day, it was much deeper than that, and a lot of work was required to get even a basic website up and running. So I shelved the plan for my 

That didn't stop a lot of companies like [Vercel](https://vercel.com/), [Netlify](https://netlify.com/) in the later stages of the web from making it so simple to build and host a website that you would forget the complicated process behind it, and that's become their whole business model to an extent.

In this post, we'll explore the process website hosting providers like Vercel take to open up your website to the world, and do it beautifully.

For me personally, Vercel has added more value to my development lifecycle than any other provider or tooling, which would be visible from my patronage of Vercel through several of my blog posts.

I cover most things from the lens of Vercel but these principles also translate to other providers such as Netlify.

### Enough Story, let's get started

We'll explore the following topics and then understand how everything comes together:

1. How your project is built
2. Where built assets are hosted
3. How Vercel serves your website
4. How Vercel serves your website on your Domain/Subdomain - The process of how custom domains get linked to Vercel Projects

### How Your Project is built and served

If you're a software engineer, there's no better sight than seeing your project go live. With tools like Vercel, you would link it to your project's Git repository via an [OAuth Flow](https://blog.devesh.tech/post/what-is-oauth-and-why-it-is-awesome) from [GitHub](https://github.com/), [GitLab](https://gitlab.com/) or [BitBucket](https://bitbucket.org/) and telling it some additional information such as the build command (For example: `npm run build`), the build folder etc.

> Vercel also takes care of framework-specific constraints and requirements. For example: [Next.js](https://blog.devesh.tech/post/how-nextjs-renders-your-react-app) is a framework that doesn't generate HTML, CSS and JS like all static site generators, but rather requires a full-power Node.js server to work and serve a website. Vercel takes care of that natively with 0 additional configuration required from your end.

Vercel then adds an `on-commit` [webhook](https://blog.devesh.tech/post/what-are-webhooks-and-how-do-i-use-one) to your repository where GitHub notifies Vercel whenever you push a commit.

Vercel then spins up a worker server that clones your repository, runs the `build` command that you told it to and uploads the static website build outputs (HTML files, CSS Assets and JS Chunks) to an [AWS S3 bucket](https://aws.amazon.com/s3/) and puts them behind a [global CDN](https://www.akamai.com/glossary/what-is-a-cdn).

For repositories with dynamic API functions, Vercel keeps a mapping of the Function name, and the URL to execute it on its servers later.

![How Vercel integrates with your project.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-hosting-services-like-vercel-and-netlify-work%2Fsecondaryimages%2FHow%20Vercel%20integrates%20with%20your%20project1720170679298.png?alt=media&token=50ac879f-d55c-4457-ba70-cb7c441804b1)

It sets up the routing rules to its main server to forward requests for these assets to the user and caches them.

![Basic Vercel Routing Table.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-hosting-services-like-vercel-and-netlify-work%2Fsecondaryimages%2FBasic%20Vercel%20Routing%20Table1720170707812.png?alt=media&token=69d25edb-ff39-429d-ae61-68130af9cc3c)

### How your website gets served

There are several ways to serve a website once all of its assets are uploaded. Remember, even to serve a static file, there has to be a server sitting somewhere, fetching that file from its storage or whichever storage provider it uses like AWS S3 or Google Cloud Storage, and stream it back to the consumer.

The most straightforward approach to serve a website would be:

- Provision a load balancer at your IP Address (We'll see SSL later)
- Have the load balancer point to a swarm of servers that you're running, these could be "pods" running on a global Kubernetes cluster if dealing with a large number of requests or needing to scale elastically. All these pods would point to the same IP Address dictated by your load balancer (I'm pretty sure you could even do this via a Lambda that can scale up infinitely and down to 0 as needed).
- For each request, say `devesh.tech/logo.png` route and stream back the resource that maps to the deployment matching the `domain` and the `pathname` obtained from the request.
- For dynamic websites with frameworks such as Next.js, the request could be to an API handler, in which case it helps that the pods running also run on Node.js itself (The underlying engine used for Next.js API Endpoints), Vercel can simply sanitize requests and executes the required code.

![Serving Websites.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-hosting-services-like-vercel-and-netlify-work%2Fsecondaryimages%2FServing%20Websites1720269780143.png?alt=media&token=2418b7cd-3c1a-4226-bb7a-075c970c3140)

### SSL Certificate Provisioning

Website serving is just one part of the job, no one would use your site if users constantly get a "Your connection to this site is not secure" error before visiting. [HTTPS](https://www.cloudflare.com/learning/ssl/what-is-https/) is now a bare necessity and to encrypt data between the server and the user, we need [an SSL Certificate](https://www.cloudflare.com/learning/ssl/what-is-an-ssl-certificate/).

Speaking of Vercel, it uses [Let's Encrypt](https://letsencrypt.org/) (An API-based free SSL Certificate provider) to provision SSL Certificates for websites hosted with it.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-hosting-services-like-vercel-and-netlify-work%2Fsecondaryimages%2Fimage1720326163343.png?alt=media&token=477f9088-fd38-4bda-8c03-368b7bb46839)

The process for issuing an SSL Certificate is simple:
1. Tell the SSL Authority like Let's Encrypt that you want an SSL Certificate for a URL, say abc.vercel.app.
2. The authority gives you a challenge like setting a DNS Record on your domain to prove that you own the URL (Imagine the havoc if anyone could provision), for example, Let's Encrypt will ask Vercel to serve a file at a random specified path on the URL.
3. Vercel completes the challenge and Let's Encrypt generates an SSL Certificate and gives it to Vercel.
4. Vercel registers the certificate in its Database and for requests coming to that URL does a TLS Handshake using that certificate for the browser to encrypt data coming to it.
5. Vercel runs a background CRON Job to renew any certificates expiring and refresh them in its database.

Now, one valid question would be "How does Vercel serve a certificate for multiple domains from a single server?" For that, it uses a technique called [SNI or Server Name Indication](https://www.cloudflare.com/learning/ssl/what-is-sni/) where a server on a single IP Address (The Kubernetes cluster behind the load balancer serving all the requests) can serve SSL Certificates for multiple domains that point to it.

Do also note that for subdomains hosted on `*.vercel.app`, Vercel would most likely have a wildcard SSL certificate that can be used on all subdomains of `vercel.app`, and is issued once, used forever (With obvious renewals every few weeks).

### Custom domain linking to projects

To understand this, we first need to know how DNS resolution happens and what happens when you point your domain to another IP Address/URL.

You can check this amazing video out to understand the process of DNS Resolution and how intricately beautiful and robust it is.

[https://www.youtube.com/watch?v=g_gKI2HCElk](https://www.youtube.com/watch?v=g_gKI2HCElk)

Step 1: Providers like Vercel procure static IP Addresses from AWS tools such as Route 53 or the ISPs directly, and set up DNS Resolvers to those IP Addresses.

Step 2: The user tells Vercel their domain or subdomain.

![User domain registration.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-vercel-and-netlify-serve-a-website-on-your-domain%2Fsecondaryimages%2FUser%20domain%20registration1720075717962.png?alt=media&token=84d1fde4-38bf-4faa-9774-88b7095d68da)

Step 3: Vercel tells the user to set their domain's DNS entries to point to Vercel's servers ([A Record](https://www.cloudflare.com/learning/dns/dns-records/dns-a-record/) in the case of a top-level domain and [CNAME record](https://www.cloudflare.com/learning/dns/dns-records/dns-cname-record/) in the case of a subdomain). The user updates these DNS Records on their domain's DNS Dashboard.

![Updating DNS Records.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-vercel-and-netlify-serve-a-website-on-your-domain%2Fsecondaryimages%2FUpdating%20DNS%20Records1720075792974.png?alt=media&token=c99ffd30-1827-41a3-b935-046a130db85d)

Step 4: Vercel verifies whether the provided values have been added to the website's DNS Records. BTW, this is something anyone can do, all DNS Entries of all websites [on the web are public](https://mxtoolbox.com/DnsLookup.aspx).

![Verification of DNS Records.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-vercel-and-netlify-serve-a-website-on-your-domain%2Fsecondaryimages%2FVerification%20of%20DNS%20Records1720075841441.png?alt=media&token=fe0935c1-0b85-4efb-99b7-7550e6f0ef45)

Step 5: The Nice Part - Serving Requests: Now that the domain points to Vercel's servers, all requests to say `blog.devesh.tech` come to Vercel and Vercel can send the right resource for the request.

![Serving Requests.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-vercel-and-netlify-serve-a-website-on-your-domain%2Fsecondaryimages%2FServing%20Requests1720075870855.png?alt=media&token=b0a830f1-900e-476f-8d6a-3b121a716b5c)

### SSL Certificate Provisioning on linked custom domains

The process for SSL Certificate provisioning on custom domains you link to projects is the same as seen in a previous section.

All Vercel has to do is make an API Call to Let's Encrypt to generate a challenge and obtain an SSL Certificate, this challenge can be completed because, in the previous step, you added DNS Entries to point your domain to Vercel's servers.

With the DNS entries set by you, requests made to your domain end up on Vercel's server, so Vercel can complete the necessary challenge presented by Let's Encrypt like serving some random data on a random path or setting a random DNS TXT Record and obtain the SSL Certificate.

From there, it just has to handle SNI for the requests coming to your domain and renewals via its periodic CRON Job.

### Executing on the edge

Edge Compute is a way for functions and code to run close to the users who 
made the request. A user sitting in India should be served data from a server sitting in India.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-hosting-services-like-vercel-and-netlify-work%2Fsecondaryimages%2Fimage1720343126213.png?alt=media&token=44250021-5496-4b29-9661-e75218f3d1c1)

How Vercel and any edge compute offering achieves it is very straightforward. Remember that Vercel only has a few IP Addresses that it serves requests from, this gives it an advantage.

Whenever a request is made to an endpoint, the DNS Resolution process is fairly simple, your router reaches out to the nearest known DNS Resolver recursively until it finds an IP Address. The instant the request finds an IP Address, it stops the search and starts the actual request.

They can leverage this beauty of DNS and have servers set up in different parts of the world, pointing to the same IP Address. The server closest to the user in most cases will be the one that would be searched and resolved first, and this server can run the necessary computation and send back the required data.

This is essentially how Edge Compute and CDNs work.

This does come with some added complexity underneath, for example, Vercel has to ensure they have caches and databases close to the servers in different regions as well (Or at least multiple database nodes in different areas of the world with data being replicated between them).

### That was overwhelming. But there's a lot more to it.

Vercel and providers like it have spent years crafting the experiences.

Since Vercel has a lot of control (It is the centralized server, serving assets and requests) it can also do a ton of other cool stuff that add an immense amount of value to developer experience, developer productivity as well as product experience, like:
- Serving additional assets that [enable collaboration between team members](https://vercel.com/blog/introducing-commenting-on-preview-deployments) on a website.
- Hosting backend servers
- Enabling [preview builds](https://vercel.com/products/previews)
- Acting as a complete proxy for websites and restricting access to unauthorized users
- [Instrumenting analytics](https://vercel.com/products/observability) for observability into request-response times, user experience scores, logging and code performance.

And a ton more.

I hope this post was helpful, let me know what I should cover next.