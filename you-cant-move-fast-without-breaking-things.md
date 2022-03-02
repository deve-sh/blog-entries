# You Can't Move Fast Without Breaking Things

![Photo by Vitaliy Mitrofanenko from Pexels](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fyou-cant-move-fast-without-breaking-things%2Fprimaryimage.jpg?alt=media&token=f4fad6f1-5b66-4268-a902-222bebe36311)

"Move fast and break things" is a phrase synonymous with "breakneck speed of growth" in tech startups, the upper management will throw it around whenever they need a line to motivate a group of engineers that are working 12 hours a day already, to release a product that the CEO needs by tomorrow.

There are, however, severe consequences of the "move fast and break things" approach to getting features developed and rolled out. Even Mark Zuckerberg credited with the very creation of this iconic quote that a lot of tomorrow's aspiring entrepreneurs live by has criticized this approach to product building. In terms of tech products, there's a fundamental problem to using this approach.

### Moving Fast

Products in tech are built using code, and code is one of the few things in the world that keeps getting worse just by sitting there as time goes on. The code one writes to get something up and running is the same code that the person despises and swears to never touch again just a year later, even though nothing really has changed and the product is still fulfilling the requirement it was supposed to in the beginning.

The reason for the above is simple, code isn't objective, there are hundreds of ways to do a single thing with code and different people use different methods to solve the same problem, some objectively better than the other. The more time and thought you give a problem, the better code you can write to build something.

The problem with moving fast when engineering something is that you or the engineers working on a product will never have enough time to give the best approach a thought, and instead go ahead with whatever the best approach seems to get the first bit of the product up and running. This almost always results in the product incurring [Technical Debt](https://en.wikipedia.org/wiki/Technical_debt).

This usually isn't a big problem when the engineers have the time to fix the problems they create. More often than not, in the code reviews, due to the tight deadlines, fellow engineers will write something that would like similar to the following:

> This can be written in a better way, please take care of this in the next merge request.

There is a fundamental flaw in this approach, humans can't be trusted with fixing things later. Humans are hardwired to not worry too much about things that others have told them that they can worry about tomorrow. The engineers will swear during the review that they will come back and repay the debt they incur during the "move fast" process, but with an organization that emphasises moving fast, there will be a different product the same engineers will be working on next week and the technical debt, instead of being repaid, will keep getting bigger accumulating interest by each passing day.

Come next week, there are already meetings scheduled where everyone applauds the engineers for getting things delivered at a breakneck pace, and the engineers get a false sense of achievement where their peers are just cementing the belief that compromising code quality is okay as long as the outcome is favourable or at the very least, gives the upper management what it wants.

### Breaking Things

Ask an engineer what happens when they compromise code quality for fast execution, most of them will reply "Things break!", "Bugs are born!". If they don't tell either one of the above, they're not software engineers. Now, "Move Fast and Break Things" doesn't mean "Be sloppy while you race to get features built", it means that "breaking things is okay while building things fast, as long as the breakage don't become a big problem".

With moving fast, things will break, there is nothing in the world that can stop that from happening, but as long as the breakages are manageable, it is fine. The problem, however, is when that breakage isn't fixed later, and instead, a similar compromise is made for other new features in development.

It sets an example for other Software Engineers to follow because refactoring an old bit of code that isn't right but does the job is harder than just working around it and introducing more technical debt that gets the job done right now. This, if you notice, is a vicious cycle where one person puts the onus of cleaning up the code on a person that comes in later. I've done this, every engineer reading this has done this at some point in time, if not, they haven't been engineering long enough because no company, no engineer is immune to this.

More often than not, the engineer who needs context at a later point in time to fix the code can't get it, because the person responsible has left the company already. If you are an engineer, you know this happens more often than one realizes. Over time, the breakages become so bad that building more stuff on top of it becomes a challenge and at that point, the engineers demand a rewrite of the entire app.

### Solution

To put it simply, as long as products are being built and a company has a "The CEO said this should be ready by this week, so it should be ready by this week" culture of making things, this problem isn't going away. For this to go away, the management needs to be aware of the risks involved with trying to ship products at a high speed, the world of code is more complicated than they expect, it is worse if the people in upper management aren't engineers themselves.

For this problem to be solved, simply put, engineers should be willing to push back against super-tight deadlines that force them to take on technical debt and break existing things in the process. Along with that, the management demanding new features to be shipped also has to understand when their demands are reasonable and when they are just absurd. Without the two agreeing on common ground, it's not possible to eliminate this problem.
