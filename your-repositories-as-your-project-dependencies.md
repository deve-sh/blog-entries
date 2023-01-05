# Your Repositories as your Project Dependencies

![Your Package Manager + Your Repositories = ✨](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fyour-repositories-as-your-project-dependencies%2Fprimaryimage.jpg?alt=media&token=a92b6abf-3a85-400c-af58-46f20824da9b)

Once your JavaScript project gets large enough, you'll inevitably end up splitting it into multiple repositories or directories in a monorepo (The contest is not between those two approaches in this post).

Once you do so, sooner or later there will be a requirement to share code between multiple repositories.

For a monorepo setup you can always use one of the directories as a common package and install it in the dependent project directories (But that comes with a ton of versioning and deployment challenges).

If you decide to keep your common dependency as a separate codebase, you could obviously publish it to a package registry like [npm](https://www.npmjs.com/) or [priv](https://www.privjs.com/) but the packages you publish to these registries are public unless you pay for the service and managing public and private dependencies is a big pain, I once spent 4 hours working with a private package install which was somehow causing public package installs to fail, just so you know what I am talking about.

If you're an adventurer, you could build your own package registry, good luck if you decide to do that and move every other package your projects rely on to it. 👨‍💻

The simplest way so far that I know of is to simply use your Git registry as your package registry, for example, GitHub. This is not to be confused with [GitHub packages](https://github.com/features/packages) which is a service to enable package build and deployment to different registries.

If you're in awe I don't blame you, when I first discovered that your package manager (npm, yarn, pnpm or any other one you use) has inbuilt support for using a GitHub repository as a dependency for your project. All you need to do is specify:

```
"my-repository": "git+https://github.com/<username>/<repository>.git"
```

run `npm install` 

and your package manager will take care of it.

### Working with Private Repositories 🔏

Now one thing comes up, how do I handle private repositories?

Using private repositories is pretty simple, you would need authorization from your Git provider to do so. In the case of GitHub, you would need to specify a [Private Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) in the install path for the installation to work, and similarly for GitLab, Bitbucket and other providers.

Once you have your token to tell the git provider that you have access to the repo, you need to update your dependency path in package.json to the following path:

```
"my-repository": "git+https://<your-token>@github.com/<username>/<repository>.git"
```
and voilà, it should work!

### Private repositories without the token in install paths 🔑

Now for those of you who are thinking "Wait, doesn't think expose my Personal Access token for others to see?", you're correct. This is a problem.

To solve it we have a very neat solution if you have control of the environment where you're running the installation commands (For example a CI/CD environment like GitHub Actions, Vercel or your local instance), we can simply set our token as an environment variable and tell Git on the device to use our token in all the calls it makes to the Git provider.

We can do it using the `git --config` command.

But first, let's set our token generated in the previous section as an environment variable called `GITHUB_TOKEN` (Check the guide to set environment variables in the environment you're using) how to do that.

Now we'll tell Git to use the token with every call it makes to GitHub.

```
git config --global url."https://${GITHUB_TOKEN}@github.com".insteadOf "https://github.com"
```

We can now remove the token from our package.json and it'll still work as expected. ✨

### Versioning 🌲

The most crucial thing with packages and dependencies is versioning, you don't want changes you push to your repositories to unintentionally break projects that depend on them, worse yet, different projects might have individual teams working on them and not all would be in sync with your dependency's latest version.

So far we've only seen using dependencies with their default branch and the latest commit that the Git provider will push to your package manager when requested.

There are 3 major ways to do versioning for your dependency in terms of repository-based dependencies:
- Maintain separate branches for different projects or versions (Favourable but cumbersome so we won't even get into it)
- Use commit hashes
- Use [Tags](https://www.atlassian.com/git/tutorials/inspecting-a-repository/git-tag) for each major release

Both commit hashes and tags work the same way, they tell about a point in time in your repository, you can change your dependency install path in your package.json file to pick up changes from that commit or tag by appending `#` with your commit hash or tag name to it:

```
"my-repository": "git+https://github.com/<username>/<repository>.git#<commit hash or tag name>"
```

This should solve most of your versioning requirements. To avoid any caching issues it also makes sense to update your repository's package.json version every time you make a major push.

### A small note 📓

In the case of repository-based dependencies, it is often recommended to have one branch that acts as your distribution branch and other branches on which you work and test. Once the testing is done, you push it to the distribution branch.

This becomes even more important when you're working on code that needs to be compiled before distribution (Like React components that need to be transpiled from JSX to Plain JavaScript before they can be used).

Keep this flow in mind in case you go ahead with repository-based dependencies. You might want to set up a CI/CD flow for your dependency to generate distribution builds automatically or create test distribution builds for branches you work on.