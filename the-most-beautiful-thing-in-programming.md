# The Most Beautiful Thing in Programming

![Photo by cottonbro from Pexels: https://www.pexels.com/photo/boy-in-white-shirt-sitting-in-front-of-computer-4709286](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fthe-most-beautiful-thing-in-programming%2Fprimaryimage.jpg?alt=media&token=3bf246db-6474-4283-abad-0351e288119e)

"**How 7 lines of code turned into a $36 Billion Empire**" read the title of [a post](https://entrepreneurshandbook.co/two-reasons-why-these-7-lines-of-code-turned-into-a-36-billion-empire-6d2b2d1a8da2?gi=c9ee8e87404a) I read recently on Medium. The post was about how Stripe empowered many businesses to accept payments by embedding a small snippet. There was much more to the integration (Everyone who's ever integrated a payment gateway knows), but it was a fantastic concept for marketing!

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fthe-most-beautiful-thing-in-programming%2Fsecondaryimages%2Fimage1659623176978.png?alt=media&token=23f14ba7-4e57-4fe3-9c1e-2278de0977c8)

The primary forces driving the adoption of payment gateways are developers, who have a lot of power to influence the choices of software the companies they work for end up adopting. Stripe didn't go after getting sizable contracts to build custom payment gateway solutions for big corporates (Something that was the norm back then). Instead, they appealed to developers and let them do the bidding for them.

The heading got me thinking, what's so great about "Just 7 Lines of code"? It takes me more lines of code to print "Hello World" in Java. And that's when it hit me; that's the point!

The fact that a developer could perform a simple checkout in fewer lines than it took to write a Hello World Program in Java back in the day was a unique selling point for them!

Humans are simplicity-loving creatures; no matter how fancy we try to act, at our core, we still require only essential things to satisfy us. Simple things are easy to understand, easy to implement, and easy to debug.

Those 7 lines of code were appealing because of the following reasons:

- **Lesser Lines of code mean lesser errors**: There's only so much that could go wrong in those many lines. Ask a developer, and they'll tell you what a blessing it is to have something complex done simply.
- **Lesser Lines of code mean better accountability**: If anything goes wrong, a simple search in the code will tell you whether it's your fault or Stripe's internal fault.
- **Lesser Lines of code mean easier debugging**: Do I even need to say anything about this?
- **Lesser Lines of code mean more time developing the actual engine of the business**: Developers can quickly integrate checkout and move to more business-facing features.

### The Most Beautiful Thing

After talking about the beauty of those 7 lines of code, and the impact the marketing had based on those 7 lines of code, it's time I reveal the crux of it all. The most beautiful thing in programming, in software development, and possibly the world, in my opinion, is **abstraction**, simplicity born from hiding the complex.

Those 7 lines (Or 9 lines if you counted) of code just make a network call to a Stripe server to get a charge ID. Now, the Stripe API Endpoint, even back in 2011, would most likely be running on thousands if not tens of thousands of lines of code, but we never get to or have to worry about any of that as we can simply make a call to Stripe's API and expect it to do its job. This is what an abstraction is. In the real world, the best example is how we drive cars but don't worry about how the internals of the car work.

A quick search for the meaning of APIs would reveal that they are the drivers of abstractions in today's world. Hotstar's mobile app doesn't care about the servers that stream the video to your device, they just request the servers to stream the video to them, and that's it. Similarly, the servers do not have to worry about what's happening in the app; its sole responsibility is to serve the video requested and be done with that batch of work.

The world is full of abstractions; what you're reading this on (If you've printed this, what are you doing?) is an abstraction in the form of a touchscreen or a keyboard and a screen. Programming just takes abstractions to a whole new level.

Everything in programming is an abstraction; the only truth is the binary 0 and 1 that make everything run.

Binaries are abstracted by low-level languages like Assembly, which is abstracted by slightly less low-level languages like Fortran or COBOL, then C, then C++, then Python and JavaScript, and so on.

### How New Programming Languages Find their need

When I was in college, we were taught C with a dash of Assembly and Java. When our professors were in college, they were taught Fortran and COBOL. These languages are vastly different; most colleges today teach Python with a dash of Java (Or the other way if they like to torture their students).

The nature you'll notice with these programming languages is they're all progressively more "beginner-friendly" and high-level. Programming Languages have had their users do boring stuff like memory allocation, garbage collection, type checking and whatnot for the longest time. Progressively, languages started to take care of memory allocation, garbage collection, and type allocation and checking. C++ is a language built on top of, as the name suggests, to have better memory management, garbage collection, streams and other features C did not support for.

Continue this cycle over and over again, and we end up with languages like Python, which reads like English yet is powerful enough to run some of the most powerful and hungry languages on the planet.

Programming Languages find requirements for evolving for various reasons; some of them are:

- Someone just wanted to create a new language; this is more prevalent today when programming languages are created left, right and centre because someone can create them.
- Specialization in requirements, JavaScript was born initially as a language to run in the browser; there are languages created every now and then for specific purposes. Dart, Go, and Rust are all languages born out of particular requirements.
- Programmers want to worry less; by that, I circle back to the same problem programmers face with memory leaks and garbage collection. There will be another school of programmers who do not like type strictness in languages. For all these issues, programming languages either evolve with versions or new ones are created building on top of existing languages.

> If solutions to problems that programmers face can be automated, there's no reason for them not to be. And that's what's achieved by the evolution or creation of new programming languages and compilers.

Every programming language is; hence, an abstraction and more languages are being created as further abstractions. Eventually, the replacement, or at least the attempt at the replacement of code with other code, although terrifying for programmers, is the most natural form of progression when it comes to evolution.

The consumers of programming languages, mainly developers, also have ways of abstracting the language's work.

### On Libraries and Frameworks

Speaking of programming languages, they are multi-purpose as well. JavaScript runs on the server, in the browser, and if you're a tinkerer, even on embedded devices. Similarly, Python powers servers and is also a very powerful language for data analytics.

What makes these languages multi-purpose is not what's built into them but rather the frameworks and libraries that are built using them. Node.js is a JavaScript framework that powers servers and Pandas is a library that powers data analytics with Python.

Libraries are nothing but utilities that someone thought would be useful enough to someone else or tedious enough to not write again. And hence decided to package the code into a bundle for use again (Read: Abstraction).

If you've used [React](https://reactjs.org/) or [jQuery](https://jquery.com/) or any of the hundreds of thousands of names listed on [npmjs.com](npmjs.com), then you've used a library. There are so many libraries today that I find it challenging to publish a package with a name that's not already taken; get ready for days when libraries names need to have special characters and digits in their name to be published 😛.

The programmers who built those libraries found something that simplified their life and decided it was worth sharing it with the world, so someone else didn't have to go through the hassle they did.

> All libraries are abstractions, but not all abstractions are libraries.

(Unless, of course, you build a library that's built to make life harder)

Abstractions are so beautiful that they are even applicable to opinions.
Frameworks are opinions of how things should be done. For example, when working on a web project, there are hundreds of ways to set up a folder structure, where routes will go, how database connections will happen, how data will flow from one page to another and so on.

Frameworks abstract all that to give you a structure of how things should be done, examples being [Next.js](https://nextjs.org/) or [Django](https://www.djangoproject.com/); taking away the burden of having to worry about how your project should be set up, how pages will be served to your users and patterns to implement common use cases like user authentication and SEO.

### On The Most Beautiful Thing

Midway through the post, I mentioned that abstractions are the most beautiful thing in programming; well, I might have exaggerated because apart from that, there are a few other things I feel are equally beautiful.

Although abstractions are beautiful, equally beautiful is the act of diving through abstractions and understanding things at their core.

> The fact that developers are willing to build solutions, package and give them to other developers, all without knowing them, is, to me, also the most beautiful thing and undoubtedly one of the most crucial developments this space has ever had!

Someone decided to write a library that enables me to sign in my users using Google with a single line of code.
Someone noticed that MongoDB's drivers lacked type safety and validations and decided to create [Mongoose](https://www.npmjs.com/package/mongoose), which runs most of the MongoDB connections and operations for Node.js projects.

This is the beauty of having such big information highways that everyone can contribute to and benefit from. This does create noise but also creates opportunities for exceptional developers and code to stand out.

We're living through a period where information sharing is free and accessible to everyone. The code we write each day is getting easier and easier to write, thanks to others who are deciding to share what they believe is helpful. A similar perspective could also be taken on life, but hey, I am just a developer for now.
