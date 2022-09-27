# Using GitHub Actions with GitHub Pages (Main + Preview Builds)

![GitHub Actions is a great tool to automate every process you can imagine.](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fusing-github-actions-with-github-pages-to-publish-preview-builds%2Fprimaryimage.jpg?alt=media&token=72e42b28-b955-480d-a6e3-a06017ca0875)

While working on projects, we often end up with workflows where to deploy your project, you will have to follow a few steps. May it be deploying to an EC2 instance from your GitHub Repository, deploying to a Kubernetes cluster on pushing to the main branch or even running tests for your codebase to ensure before pushing to production, the steps are clear and automatable.

[GitHub Actions](https://github.com/features/actions) is a solution that helps you do the aforementioned automation with ease and almost always, just a few lines of code. Many times, the workflows you're looking for are already built for you, and readily available in the GitHub Actions catalogue.

A simple `.github/workflows` YAML File can help you automate the most complicated workflows for your repository.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fusing-github-actions-with-github-pages-to-publish-preview-builds%2Fsecondaryimages%2Fimage1664024081626.png?alt=media&token=3bc1d3eb-bf19-4d74-a67d-daf374a724e8)

GitHub Actions allows you to run scripts on events like pushing to the repository, pushing to certain branches and even on the creation of PRs with changes to specific files and folders in the repository.

For a full list of what GitHub Actions can do, visit [GitHub Actions Documentation](https://docs.github.com/en/actions).

In this post, we'll be looking at using another service from GitHub, to host a static site, and create preview links for Pull Requests on our repository. This is very useful in case you're a team, that's building stuff like Static HTML Sites, and UI Libraries and needs to preview changes before merging them.

### What is GitHub Pages?

Apart from GitHub Actions, [GitHub Pages](https://pages.github.com/) is a service that allows you to host static websites from your repository source code at a convenient URL like <your-username-or-orgname>.github.io/<repository-name>.

It allows you to publish from the main branch or any specific branch you choose from.

There are certain limitations to GitHub Pages though:
- Since only static sites can be hosted on GitHub pages, applications that require some server-side code are out of luck.
- Applications that require some build step or pre-processing before hosting (Like Static React Apps or Gatsby apps) are harder to host on GitHub Pages.

Combining GitHub Pages with GitHub Actions can help us fix the second limitation, we can run automation on pushing to the repository, run the build step for our repository and then push it to a different branch that's connected to GitHub Pages.

### Setting a publish source for our GitHub Pages

We'll set our branch `gh-pages` to be deployed to GitHub Pages, and we'll push the output of our build step in GitHub Actions to that branch to publish.

To do so, navigate to your repository and go to **Settings**.

Go to **Pages** and select source as **Deploy from a branch**.

Choose the branch as `gh-pages` and Save the settings.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fusing-github-actions-with-github-pages-to-publish-preview-builds%2Fsecondaryimages%2Fimage1664086041555.png?alt=media&token=dc3ca864-9ded-4623-b4f2-49d893924163)

To follow the rest of the steps along, make sure to have a reference to GitHub Actions alongside you.

### Setting up the Action to publish to GitHub Pages on push to the main branch

First thing's first, we'll create a Workflow, where on pushing code to the main branch, we'll run an automation script to build our repository and then use a [pre-built GitHub action](https://github.com/marketplace/actions/push-git-subdirectory-as-branch) to push the output from the build folder to the branch we specified as the publishing source for GitHub Pages.

```yaml
# .github/workflows/publish-main-branch-to-github-pages.yaml
name: Build and Push to GitHub Pages

on:
  push:
    main

jobs:
  build:
    runs-on: ubuntu-latest
    name: Build and Push
    steps:
      - name: git-checkout
        uses: actions/checkout@v2

      - name: Install all dependencies
        run: npm ci
      
      - name: Build Repo
        run: npm run build

      - name: Push to GitHub Pages Branch
        uses: s0/git-publish-subdir-action@develop
        env:
          REPO: self
          BRANCH: gh-pages
          FOLDER: build
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MESSAGE: 'Build: ({sha}) {msg}'
```

### Setting up the Action to publish preview builds for Pull Requests

Now that we've deployed our site to GitHub Pages, we can also do one very interesting thing, every time a new pull request is created, we can create a link on GitHub Actions to preview it. This is a very common use case which unfortunately GitHub Pages does not have direct support for.

So we'll hack around it a little. We'll pull the existing build branch for GitHub Actions, build our pull request's content and put it in a subfolder in the build branch, that way, the output for the main branch will be available at `https://<username>.github.io/<repo>` and the Preview Link for Pull Requests will be available at `https://<username>.github.io/<repo>/<pull-request-number>`. Sounds good? Let's write the action for this on the `pull-request` event that runs whenever a Pull Request has been opened or pushed.

```yaml
# .github/workflows/publish-pull-request-to-preview-link.yaml
name: Build Pull Request and Push it to Preview Link

on:
  pull_request:
    branches:
      - main # Only run this on PRs to the main branch

jobs:
  build:
    runs-on: ubuntu-latest
    name: Build and Push
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      GITHUB_PR_NUMBER: ${{ github.event.pull_request.number }}
    steps:
      - name: git-checkout
        uses: actions/checkout@v2

      - name: Install all dependencies
        run: npm i

      - name: Build
        run: npm run build

      - name: Pull Existing GitHub Pages branch
        run: git clone -b gh-pages https://${{ env.GITHUB_TOKEN }}@<Your Repository Link> existing-gh-pages-folder

      - name: Create PR's subfolder and move PR Build to it
        run: |
          rm -rf existing-gh-pages-folder/${{ env.GITHUB_PR_NUMBER }}
          mkdir existing-gh-pages-folder/${{ env.GITHUB_PR_NUMBER }}
          cp build/* existing-gh-pages-folder/${{ env.GITHUB_PR_NUMBER }}
          rm -rf existing-gh-pages-folder/.git

      - name: Push to GitHub Pages Branch
        uses: s0/git-publish-subdir-action@develop
        env:
          REPO: self
          BRANCH: gh-pages
          FOLDER: existing-gh-pages-folder
          GITHUB_TOKEN: ${{ env.GITHUB_TOKEN }}
          MESSAGE: "Build: ({sha}) {msg}"
```

Using existing GitHub Actions, you could even add an additional step that pushes a comment to your PR whenever the action completes running.

### Deleting Preview Builds on Closing/Merging of Pull Requests

Pull Requests have a limited life cycle, they are closed/merged when their utility is finished and hence we don't want our `gh-pages` branch to be clogged with numerous subfolders of PRs that have already been closed. Hence, we would run a GitHub Action to delete the subfolders associated with a PR whenever it is closed or merged.

This time, we'll utilize the `closed` type of the `pull-request` event of GitHub Actions.

```yaml
# .github/workflows/delete-preview-link-for-pull-request.yaml
name: Delete PR Preview Link

on:
  pull_request:
    types: [closed]

jobs:
  deleter:
    runs-on: ubuntu-latest
    name: Delete Existing Preview Link
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      GITHUB_PR_NUMBER: ${{ github.event.pull_request.number }}
    
    steps:
      - name: git-checkout
        uses: actions/checkout@v2

      - name: Pull Existing Build branch
        run: git clone -b gh-pages https://${{ env.GITHUB_TOKEN }}@<Your Repository Link> existing-gh-pages-folder
      
      - name: Remove PR's subdirectory
        run: |
          rm -rf existing-gh-pages-folder/${{ env.GITHUB_PR_NUMBER }}
          rm -rf existing-gh-pages-folder/.git

      - name: Push storybook
        uses: s0/git-publish-subdir-action@develop
        env:
          REPO: self
          BRANCH: gh-pages
          FOLDER: existing-gh-pages-folder
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MESSAGE: 'Build: ({sha}) {msg}'
```

Now, with that out of the way, you might wonder something, when a PR is merged to the main branch, and the GitHub action associated with the main branch runs, wouldn't that remove all the subfolders of currently opened PRs and invalidate their preview links? It sure will, and it's an interesting problem to solve, the task for you is to figure out the changes required in the first GitHub Action we wrote that would preserve the PR subfolders on the `gh-pages` branch and at the same time, publish the new main build.