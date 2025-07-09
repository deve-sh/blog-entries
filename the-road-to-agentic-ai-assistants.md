# The Road to Agentic AI Assistants

![Photo by Matheus Bertelli from Pexels](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fthe-road-to-agentic-ai-assistants%2Fprimaryimage.jpg?alt=media&token=dcca8b1f-ced6-41a8-ac91-96d6c943afbd)

A friend of mine was booking a ride a few days ago on [Ola's app](https://www.olacabs.com/). After a thousand popups and ads that spring up for stuff that is completely unnecessary or justifiable from ordering food to personal loans before you even get to the screen to select your location, we were in (Seriously, who wants to get a 10 lakh rupee personal loan when trying to book a cab?).

The app still showed us one more ad above the location selector. But this time, it was for an Agentic AI Assistant that Ola had developed which could order food for you, hail rides for you etc. Functions that were available inside the Ola app already but given how hard it was to get to that point, I wasn't surprised we need assistants for this.

This although got me thinking, the allure of Agentic AI Assistants is nothing new. We know Jarvis or Friday from Iron Man, we know about the million Python projects that do a basic version of speech recognition with pre-filled commands or basic Natural Language Processing.

Why haven't we seen true mass market agentic assistants yet? With the advent of Large Language Models, shouldn't this be a reality by now? Why aren't we seeing more Agentic AI Assistants that can do a lot more across a lot more verticals of life? And what is the road to building them from here?

This post is about trying to answer those questions. Let's dive in.

### First off, what is an "Agentic AI Assistant"?

When you first watched Iron Man, be it in the theatres in 2008 or much later as part of an Avengers movie. What stood out for him was his tech, the fact that he could speak a command and Jarvis or Friday (And much later, E.D.I.T.H) would give him the answers. This was way cooler than any Batman and Alfred dynamic.

Since the dawn of civilization (At least technology), humans have been trying to build capabilities where you don't need another human to understand your commands and do those things for you. This is where "Agentic AI Assistants" come in.

Agentic refers to a software having "agency" or "capability" to perform something without much intervention.

Assistant is what Alfred is to Batman (More of a butler but you get the point), helps him out with his day and his crime-fighting.

And lastly, AI is a broad term that today is a buzzword for Large-Language-Models trained on human language built to understand what you're saying, i.e: You type or speak something and a model can understand the context of what you're trying to say and get it done. So it can then go around with its agency to get it done by the means it deems most optimal.

Do note that when one talks about Agentic AI Assistants, the three words are individual components that are connected to each other. The AI is responsible for understanding speech or text prompted to it (I.E: Things like "Order pizza for me from the closest Domino's") and then translating it into machine instructions for the computer to execute, the assistant is the voice interface or the textbox and chat screen you type these commands into and the agent part are the available APIs which plug an order into Domino's servers.

The stack for pretty much any AI Agent looks like the following.

![Base Layer for Agentic AI Assistants.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fthe-road-to-agentic-ai-assistants%2Fsecondaryimages%2FBase%20Layer%20for%20Agentic%20AI%20Assistants1751432185176.png?alt=media&token=2e2e9f50-b108-427b-9d4a-c055616f36e1)

We'll look at the individual stacks and the challenges with each in this post.

### We've had Google Assistant, Alexa and others for a long time? Why is this time any different?

I remember the announcement of Google Assistant (I was not old enough to care during the release of Siri unfortunately), just being able to speak something like "Okay Google, what's the weather right now?" and it being able to answer that question for you and a million other questions, regardless of the use case, sounded like a dream.

The end goal, of a digital assistant like Google Assistant, Alexa or Samsung's Bixby is that developers recognize the potential of voice commands and build plugins for these assistants in their apps. I.E: Someone being able to say "Play XYZ song on Spotify" and Google Assistant plugs in to Spotify to play the song requested by the user.

But there's a problem, actually a few of them:
- Anyone who's lived through the evolution of something like Amazon's Alexa or Apple's Siri knows that their voice capabilities have gotten worse, and not better. This is WHILE Large Language Models have gotten incredible at recognizing voice context.
- Even over a decade later, not all apps have integrations for these assistants.

There is no clear answer to why the first point stands true. Why the second is not true is fairly straightforward: Digital assistant integrations are "pull" in nature, you ask developers to build integrations for your assistant. Something not every team or app has bandwidth and resources for, or even the broad use-cases to justify spending time on building something not everyone will use.

This is where LLM-based agents can shine. And the reason for that is very simple: Instead of having to ask developers to build APIs specific to integrations with digital assistants, you just ask developers to build general APIs for "actions" in their apps and the LLM decides which API to hit. I.E: Making it a push model, the developer's efforts are limited to just designing and building an app on APIs they were going to use anyway.

Better yet? This is not limited to voice, they can do so via "prompts" or all sorts of custom user interfaces.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fthe-road-to-agentic-ai-assistants%2Fsecondaryimages%2Fimage1751980249618.png?alt=media&token=d34ed4c7-d5bd-4edc-a500-0568066083ba)

### The roadblocks to Agentic AI Assistants today

While we would love to think of a world where everything we speak or type is available to us at a fingertip, that isn't the world we live in. In the world today, APIs for even famous apps are closed to anyone outside (Either that or there's no documentation which is almost equally unfruitful) or there don't exist APIs in the first place.

Another problem you can see today is an extension of what we talked above, most "AI Agents" being built are built in a single vertical or a single operational space, i.e: They can either work in a specific business area (Accounting Agents, Documentation Agents, Coding Agents etc) or work on data from a single company (Agents built by something like AWS for AWS related tasks etc).

The second problem is very easily solvable by the abstraction of agents. You have one agent that acts as a manager/delegation layer for which agent is right for the job the user wants to execute.

The first problem, however, is much more difficult to solve. If the API is not available, services that try building agents try working around this limitation by automation scripts using tools like [Playwright's](http://playwright.dev/) version of Chromium (which Chrome is built on) which aren't super reliable and constantly fall under problems caused by Captchas.

The first problem cannot be solved until all teams at all notable apps take an API-first approach to their problems and don't have an incentive to expose their APIs for certain actions (Which isn't a great deal, because for someone like Amazon to make its APIs available to Public AI Agents, means taking away visitors from their homepage where they sell ads, leading to heavy losses for them).

On top of this, there are other issues plaguing AI Agents today in the context of large-language-models:
- Context-Window limitations: Prompts, system context or history provided to an LLM can only be of a limited length, causing problems when it gets too large or just fails and consumes a lot of compute.
- Chain-of-thought limitations: We'll look at what this is, and what this problem encompasses in a coming section.

### Enter Operators

OpenAI recently demoed its Operator. And while I am in no position to say whether the demo was staged like everything else we see today with companies just looking to create hype, it does reflect what the community trying to use AI has been looking forward to for a while.

Operator basically allows you to tell an interface what you want to accomplish and the tool does it for you step-by-step.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fthe-road-to-agentic-ai-assistants%2Fsecondaryimages%2Fimage1751692309746.png?alt=media&token=19bcdab1-9bbd-4273-a329-574f77593287)

This does work around the "APIs not being exposed" problem we talked about in the previous step but opens a whole can of worms when it comes to ethical questions like Captchas or Bot spams (But I think we have seen those concerns go down the drain with a lot of LLM development relying on ethically questionable practices already - [Such as ignoring robots.txt and wrecking the open internet in the quest for more data to train the models on](https://www.linkedin.com/posts/gergelyorosz_ai-crawlers-are-wrecking-the-open-internet-activity-7310948088838303762-BHBx/)).

This, however, is a step on the road to Agentic AI Assistants as an LLM underneath is definitely being used to "understand" the page's context.

### Enter Model Context Protocol

For those of you who don't know what [MCP](https://modelcontextprotocol.io/introduction) is, it's a standardization mechanism for different LLMs to invoke external APIs built and distributed by developers. This plugs in very well with our vision of a truly agentic AI assistant. How? Different LLMs like OpenAI's ChatGPT, Claude by Anthropic that build the foundation for these agents can communicate with external APIs with a common interface.

MCP has been gaining momentum in the engineering community, but I see the true value of it coming in the form of empowering someone who isn't an engineer to get things done, right from their LLM window, I.E, Claude/ ChatGPT Desktop.

Configuring MCP servers in your desktop clients today requires a lot of manual steps (Often very technical), which hinders a seamless experience that users could have.

Imagine you're a single-person business. Being able to ask your LLM Client questions like the ones below and have them acted on unlocks huge productivity gains and removes the limitation on LLMs as being just "Output generators" and are right in the arena of capabilities that MCP unlocks.
- "Create a payment link for 2000 rupees and generate an invoice too" -> Razorpay's MCP server takes care of it for you.
- "How many WhatsApp support tickets from last week are still open?" -> Periskope's MCP server gives you that answer.

The way I see this happening is by building for the common man:
- Registries that help discover and auto-fetch MCP definitions on demand. Postman already has a growing collection of MCP APIs.
- Installers for MCP-based APIs into your LLM client (Similar to how no one unpacks and runs commands manually for a software they've downloaded, a packaged installer does all that). This does open questions on how authentication will broadly work with these servers, but that can be figured out.
- More remote hosted MCP servers instead of ones that need you to install anything on your device (APIs abstracted by MCP are remote APIs anyway, and thus could be executed as cURL commands in response to a user prompt) -- Simple configuration popups for purposes such as authentication from your LLM Client would be easy starting points.
- Mechanisms for LLM clients to know which services their user is subscribed to, and use MCP registries to work with these services (Would be great to have, but can open unprecedented privacy and security concerns).

Also, expect registries for MCP APIs to transform into "marketplaces" where regular users find what they need and get started with prompting immediately.

### The road ahead - My summary

My simple opinion is that Agentic AI Assistants, however helpful when limited to individual apps, would only have mass appeal when they can do a lot of things across a lot of domains.

What has stopped that from happening already are of course API availability and restrictions, but also just general business model conflicts. When you can get everything done via an Agent, how will anyone sell ads to you throughout the flow? Something that has been and continues to be a prime way for the internet to monetize your presence.

Picture this, you speak to your assistant "Get me cheapest tickets to the cricket match happening next week". To make something like this happen, several steps have to be executed:
- The LLM responsible, first has to understand what "tickets" mean, pretty standard.
- The LLM then needs to know what time and week it is to determine what next week means (It seems pretty standard until you realize that LLMs don't have this context by default - You have to feed it in with each prompt and they can't do math so it's tricky to add or subtract "time" or "days" from timestamps)
- The LLM needs to know which site or app you book your tickets on, and needs to have APIs available for it to act on your behalf (authorisation protocols).
- The APIs also need to have the right parameters in place to search for tickets and the API specification has to be digestible for the LLM to understand the query structure to send in the call.
- The APIs also need payment consensus protocols that allow for bookings to be made with "credits" or "payment information" you've given the assistant access to (Definitely no can of worms here).
- In case there is any confusion, there also have to be protocols in place to ring the user up and confirm between choices. This alone will need the LLM to have contextual understanding of who you are and the choices that are okay with you.

This process is for tickets, but this has to be repeated for every single action you'd possibly perform on any app you use daily, which you intend to use with your AI Assistant.

To make it happen. The world will have to see a few shifts:
- The comfort of businesses in exposing APIs or functionality in a way that doesn't harm their business models.
- Finding alternative ways of monetization if that's getting in the way of us creating useful Agents.
- Building APIs that are cognizant of the fact that an AI assistant might use them in the future.
- Context windows to get much much bigger for an LLM to understand and digest what is being asked of it.
- Chain-of-thought windows to execute long tasks, we've seen with LLMs that they tend to forget key details from just a few messages ago. This isn't surprising because with context-window restrictions, an LLM has to effectively "summarize" the previous messages in a chat and skip over details it feels are irrelevant. The problem? It doesn't know which details are and are not relevant to us.

I wouldn't say we're anywhere close to where we need to be. But we also can't disregard the fact that technology moves fast and so does the world around it. Don't be surprised if something comes up that makes all the steps above no-brainers, the beauty is in the things you can't predict.