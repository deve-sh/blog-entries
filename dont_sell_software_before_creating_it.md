# Don't sell software before you have created it.

![Photo by fauxels from Pexels](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fdont_sell_software_before_creating_it%2Fprimaryimage.jpg?alt=media&token=a2103746-0278-4f1c-ac37-1fd30d9a5d3d)

"Devesh we would need you to get the product ready for release by tomorrow! Without fail. Our customers are asking for the" Said the CEO of a startup I worked with for a few months. Turns out the customers he was talking about were people who had already paid for the product I was working on and were asking to get their hands on it. The catch? The product was far from ready. Not only was the product not ready for release, but it also would not be ready for another month at the minimum.

The customers were told the product was ready for use before they signed the paperwork required and handed over the cash. That time was around four months before I joined that startup. If you have been reading a few of my blogs lately, you might know that I am a proponent of the lean startup methodology, where you test market demand before you build something so as to not waste precious time building something that nobody might pay for.

However, one aspect of lean methodology that doesn't work in the case of software is when you sell your customers on an "Idea" that you have only in your head. And it's not the "Would you pay for something like this?" conversation, it's the "It's ready for use. Pay up and take it away." conversation.

If you show me a product that solves a problem of mine that no other product can, I would hand you money immediately. But if you tell me that "You will be able to get your hands on this product next month." then I would be asking for my money back and wonder why you told me the product was ready if you needed a month to roll it out. For me, it's now or when you have the product ready, but never before the product is ready.

The reason why this aspect doesn't work is what I want to explain in this article.

### The difference between "Would you pay for this?" and "It's ready. Hand over the money!"

I've worked at two kinds of startups, one that asks a potential customer what the problem is that they have and whether they would be willing to pay for something that solved it (This is my preferred startup, you would probably know this if you've read this far) and the other kind that asks if a potential customer has a problem and tells them the solution, shows them a bunch of screenshots that someone designed on Figma and asks them to pay up as soon as possible (These kinds of startups I despise).

The first issue with the second kind of startup is that it shows that the startup is literally lying, which in most cases could land the startup in legal troubles.

Another thing to note is that the first kind of startup has tested market demand for a problem, and whether to solve it or not is completely up to them, they have not promised the end user anything or committed to a deadline, they are not in the kind of pressure that the second kind of startup will be since they have already received the payment. It's all roses until one realizes that hiring for developers starts after this market test is completed.

### The benefits of "Hand over the money"
Okay, before I explain why I feel this approach is wrong. Let me tell you what are the benefits.

First and foremost, you get the money upfront. You don't have to actually wait for the product to be built to get that cash you wanted.

Second, since you have the money upfront, you can now focus on hiring the developers to develop the product for you. In this scenario, you are in a better position to hire developers considering you have the money you need to pay them. Most startups hire developers the first time they receive cash from their customers, use that cash up for paying the first few developers to get a sample product ready for use and then sell it to more customers to get more money and turn a profit at the end of the day.

### The downsides of "Hand over the money"
Now, the downsides of this approach.

First and foremost, since you have the money upfront, you have to build the product and deliver within the provided timeline. And please don't hit me with the "You can delay it a little." or "You can always say no later if there is not enough demand." Of course, you can, but would it be wise to do that? It leads only to you losing your credibility. 

The pressure of rolling a product out might be good for some people, but I don't like having the unnecessary pressure of rolling a half-done product.

The second drawback of this approach is from a technical development point of view since the product has to be released quickly, the developers are under the intense pressure of rolling just the bare minimum product out, which in most cases, leads to messy codebases, bad decisions in design and architecture and workarounds everywhere.

This is the biggest reason this approach is not something software products should adopt, this approach might work in other segments, but definitely not software.

The general consensus usually is to build a product quick, ship it and then work on improving it while maintaining it. Guess what? Once you ship the product, since the developers didn't make good design decisions and wrote messy code, there are bound to be bugs. And when the customer calls you up reporting a bug, the developers hurry to fix it, and then they realize the mess they got themselves into as they can't find the part of the codebase responsible for the bug.

Moreover, since the codebase is messy, maintaining it or even improving it is messy. Every new feature breaks a couple of existing features and no one knows why, every fix creates the need for five more fixes. After a certain point, the original developers who worked on the codebase give up and either start demanding a rewrite of the entire system or simply call it a day and quit.

Seeing the sluggish speed of development, the startup has to agree to the complete rewrite, but the rewrite takes more time than expected, in fact, chances are that it might never be completed considering the new system needs to do everything the old system did and also keep up with the changes happening in the old system.

Worse yet, if the developers quit, the new developers that come on board find themselves in a codebase that has not been thought through and is being used by actual people (Which, if you know, makes it all the more difficult to implement any new changes). The new developers follow the same path and start looking for better places to work (I personally do this very often), what happens at this stage is the developers themselves start making tradeoffs in the codebase considering they won't be around for long and whatever tradeoff they make in the codebase is going to be someone else's headache very soon.

I am pretty sure if you have worked with software teams long enough, you must know some of them that follow the above pattern of work.

### Final Thoughts

I might seem very harsh on this approach. Primarily because I feel that building great software is an art and should never be rushed. It's not selling a product before you have built it that makes me feel bad, it's what happens after that sale that is the problem.

Software, small scale or large scale should always be written in the best possible manner. It's okay to be in a rush to push things out to customers, but just because we are in a rush, should not mean we make poorly thought through design choices and mistakes.

"I'll come back and fix this later." is all fine until you realize that you suddenly have fifteen such files in the codebase that need a look or worse yet, a complete rewrite, and new features and bug fixes are piling up on top. The obvious choice is to fix the bugs and start working on the new features and boom, suddenly you have a software system in which multiple things break for apparently no reason, and instead of fifteen files, the entire codebase suddenly needs a rewrite.

Don't get into such situations. Not to be too biased here, it's very easy to make such poor decisions in a hurry when you have not sold the product yet but are building it in a rush so you can close that client that promised they will pay for a solution to their problem. In fact, it's pretty common. The problems I listed above are problems common to many software development teams, but are most common when the "We have it ready, hand over the money." approach is taken and the person selling the product has no idea what it takes to achieve a solution on the development side.