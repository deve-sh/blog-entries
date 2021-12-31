# What's OAuth and why it is awesome!

![The OAuth Logo](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fwhat-is-oauth-and-why-it-is-awesome%2Fprimaryimage.jpg?alt=media&token=c7da91ab-cffa-488e-bf2f-f05501eab86a)

Imagine a world where if you wanted to let an app have access to your contacts, you would have to provide it with your username and password, sounds scary right? It isn't a wild thought for a lot of people, many actually had to do this in the early stages of the internet ecosystem. 

If you wanted to allow Facebook to access your Gmail Contact list a long time ago (When Google Contacts didn't even exist) to find your friends on behalf of you, you would have to tell Facebook your Gmail Username and Password, using which Facebook would go to Gmail and then get your contact list for you to view. Now, the very thought of this terrifies me today, and I am sure it would terrify you or anyone else as well. Passwords are never supposed to be told to anyone, let alone websites which might not even encrypt them before storage, even if they do, if the encryption's weak, it can easily be deciphered into your original password, compromising the safety of your account.

To counter this problem, the authentication protocol named OAuth was invented, it simply solved the problem of "How do I give you access to just my contacts without telling you my password, and how can I ensure I have the ability to revoke your access to my contacts anytime I please?"

### What is OAuth?

If you do a quick search for OAuth, it returns:

> OAuth is an open standard for access delegation, commonly used as a way for Internet users to grant websites or applications access to their information on other websites but without giving them the passwords.

It is self-explanatory, but at a deeper level, OAuth is basically just a standard that helps one service ask for access to another service on a user's behalf, for example, and most commonly, the email, name or phone number of the user once, and get a unique key to use to get the information it requires later as well. Overall maintaining the trust in the system, and giving the control of data in the hands of the end-users.

If you have ever signed in on a service with a third-party account like Google, Facebook or even services like Salesforce, Microsoft or the new "Sign In With Apple" button, it was made possible by OAuth.

Try this, if you have ever signed in to a service, say Trello or Todoist, or even this blog using Google, when you click on the "Sign In With Google" button for the first time, you are redirected to a page where Google tells you what bits of information the service requires from your account, if and only if you allow access to the bits of information is the external service, able to use it. 

You can go to your account's dashboard on Google later and see which apps have access to your account's information and can revoke it any time you please simply by the press of a button. This is the level of control and convenience that was unheard of previously, which is also why it's one of the most underrated, yet one of the most important implementations in the authorization and authentication space.

Interesting fact, all Google's authentication is handled by a central OAuth Service, if you go to Gmail and sign in, you are redirected to Google's OAuth Page to sign in first, and then Gmail picks mail access to your account using the OAuth service.

This article is very heavily inspired by a very insightful video about OAuth on YouTube that you can check out here: [What is OAuth and why does it matter? - OAuth in Five Minutes](https://www.youtube.com/watch?v=KT8ybowdyr0).

### Benefits Of OAuth
- The control is in your hand.
- Services only have access to a subset of information related to your account, that they have to get explicit permission from you to access.
- If there's a security compromise on the external service, you can revoke access at the click of a button.
- It means you only have to manage and remember the password of one account to sign in to multiple other services.
- It is not just limited to logging in and user authentication, OAuth powers a multitude of service-to-service communication and data interchanges such as Google Sheets or Google Forms integrating with Zapier, ClickUp integrating with Trello, etc.

### How To Implement OAuth

After all that I've told you about OAuth and its benefits, it naturally makes sense for the implementation to be the next part. Trust me here, I am not the best person to tell you this, since I till very recently, actually disliked OAuth for its added complexity of integration and implementation on your own system, plus some limitations that I've discussed in the upcoming section.
> The implementation of OAuth being harder means there are a lot of services that would rather just give you an API Key.

There are multiple tutorials for OAuth implementation, which one is the best is a question no one can answer since OAuth has multiple types of implementations, no standardization so you have to look up tutorials or documentation for each service.

### Problems / Limitations With OAuth
Not everything is always good, just like everything else, OAuth has its limitations, some of them are:
- Access to resources is Token Based, tokens are fairly easy to leak if not managed properly by the applications or used over an unencrypted network.
- As explained in the above section, for getting the most basic information about a user, you probably have to go through a long and tedious process.
- OAuth doesn't work the best when it comes to background jobs for user data and synchronization, because the server has to keep track of the expiry of tokens, refresh them every now and then and most importantly has to keep Refresh Tokens in the database, which can be catastrophic in case of a data leak or mismanagement since Refresh Tokens are not meant to expire quickly.
- Implementation is quite confusing, with various steps required to complete the flow for each service you want to communicate with.
- Since each third-party service caters to different types of data, the scopes of authorization, URLs, IDs and Token formats are all different for each service, making it difficult to maintain consistency and standardization across multiple implementations. You'll find yourself writing code for different OAuth providers very differently from the previous one.