# Building a Real-Time Online Development Environment

![Photo by olia danilevich: https://www.pexels.com/photo/man-sitting-in-front-of-three-computers-4974915/](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-an-online-development-environment-like-codesandbox%2Fprimaryimage.jpg?alt=media&token=da419413-39fe-4d13-9c15-3542180d07f7)

If you're a developer who's been working with the JavaScript ecosystem for a long time, you know real-time online development environments are an indispensable part of the development experience.

I have been a big fan of services like [Codesandbox](https://codesandbox.io/) and [StackBlitz](https://stackblitz.com/) as they take away the entire pain of having to go through the setup process for your apps locally (Which is often the most time-consuming part of the process of getting started with a project) and also provide you with the flexibility to quickly prototype a project, run what you want to and even share samples and code with other people on the internet.

Needless to say, being the tinkerer I have inside me, wanted to learn how these systems worked internally, I had a fairly good idea but these services do not expose the workings of their systems (Of course) like an open-source project, it would have been great if they did but you can't have everything in life.

So this post is my journey of figuring out how to create a system similar to Codesandbox.

In this post, we won't be diving too deep into the code we'll be using to implement what we discuss, instead, we would just discuss the way we would implement the features or their flows.

For the code, check out the repository at [https://github.com/deve-sh/tranquil](https://github.com/deve-sh/tranquil) (Nice name right?).

Let's go!

### Laying Down The Expectations

We can't build the entirety of Codesandbox or StackBlitz in one go, of course, if we could, they wouldn't be so special and everybody would do it. In this post, we would only be focusing on building a simple RCE environment that mimics the basic functionality provided to us by Codesandbox, which includes: The ability to create a project from a template, view a list of files, edit them and see the output in real-time.

Let's lay down some basic functionalities and some technical grounds we would expect from the system:

- The user can create a new project, from a template, initially, we can simply have this be a React Project created using CRA or a Next.js project.
- Everything that is not .gitignored is stored in a database as a file entry, with content and other information like:

```
{
  "id": "<uuid>",
  "name": "<folder1>/<folder2>/<name>.<extension>" // The folders will just be rendered in the UI,
  "content": "..."  // This can be stored separately as well of course
}
```

- The user will see a list of files on the left of the screen, an editor at the centre, and a preview screen on the right.
- The code will be connected and running on a remote server, exposing a port on which the client app can show via an iframe.
- Every time a piece of code changes, the primary server makes a write to the database, and sends a signal to a socket on the remote code server with the updated file content, the remote code server writes it to its file system and the process running the app will refresh the application if required using HMR built into the application framework like Next.js and CRA.

### A Crux of how the system works

![Real Time Online Code Editor Flow.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fcreating-an-online-development-environment-like-codesandbox%2Fsecondaryimages%2FReal%20Time%20Online%20Code%20Editor%20Flow1659018680165.png?alt=media&token=237e6912-7779-4793-9f7a-0a9cf9f04771)

### What we would need

- For the front end, we'd be using React and Vite
- For styling, we would use Tailwind since it makes everything very simple
- Node.js for the main backend
- Socket.io and its client library will be heavily utilized for real-time two-way communication between the client, server and the remote instance running the code.
- A database like MongoDB for file content and metadata storage + retrieval. Could be an SQL Database as well.
- An [EC2](https://aws.amazon.com/ec2/) Instance to be spun up on project initialization to run the app.
- An app runner script that will be downloaded on our remote environment EC2 instances which will start the app, set up listeners for logs and crashes and broadcast them via the socket to the backend and through to the client.
- [CodeMirror](https://codemirror.net/) for the code editor on the front end with key binding support.
- [node-ssh](https://www.npmjs.com/package/node-ssh) for SSHing into our instance to copy project files into our EC2 instances.
- [wait-on](https://www.npmjs.com/package/wait-on) to run inside the EC2 instance to wait for the app to come live on the exposed port and notify the backend and client of it.
- A tunnelling software like [ngrok](https://ngrok.io/)/[localtunnel](https://localtunnel.me/) to expose an HTTPS endpoint for a short-lived dev session from the EC2 instance.

Now I know what a lot of you reading this might be thinking, "Why EC2? Why not Docker?"

Well I could use a Docker container, given the machine/remote instance to run the system is just one part of the stack, we could always swap the EC2 Instance for a Docker container.

I chose EC2 simply because of the native API AWS has to create an EC2 instance, but remote code execution services do use Docker containers to quickly spin up instances and execute code and limiting its scope and any vulnerabilities to just the Virtual Machine the container is running on, nothing more.

### Into The Technicals

- Our React Application rendering the front-end would display a list of projects to the user, fetched from the main server.
- The user selects a project they want to work on by clicking on it.
- At this point, two things happen:
    - The front end fetches the list of files and then calculates the id of the last file that was edited on the project.
    - The front end requests an endpoint (`/initialize`) that spins up a virtual environment server and sends its URL back to the front end.
- Using the data the front end received about the project, it renders a view of the files in the project and makes an API Call to get the file's contents that the user wants to make edits to. In the beginning, it would be the file that was last updated in the project.
- Every time the user makes a change to a file ([Debounced](https://www.freecodecamp.org/news/javascript-debounce-example/), or trigger-based using Ctrl + S, of course), the front-end makes a POST call to the main backend server to store an updated version of the file.
- Once the update is confirmed by the database, the backend makes a file change ping to the app runner script on the EC2 Instance with the updated file contents.
- The RCE server updates its file system and using the process running on its end, re-renders the output. It initiates a ping-back to the front end signalling to it that the IFrame responsible for rendering the application output should re-render using HMR built into CRA, Next.js and other frameworks.
- The RCE server script also listens for crashes, stdout and stderr to send them to the backend server to be forwarded in turn to the client.

### File Structure Representation for projects

We’ll use a simple flat file structure in our backend. For simplicity, we will not store directories individually and instead rely on the structure that AWS S3 uses where a directory is simply a prefix for a file name.

Our frontend will receive files in a flat array like the following:

```json
[
    {
        "_id": "63a7f7ec34daa9b3013cd59d",
        "projectId": "63a7f7ec34daa9b3013cd59c",
        "path": "next.config.js",
        "createdAt": "2022-12-25T07:12:44.192Z",
        "updatedAt": "2022-12-25T07:12:44.192Z"
    },
    {
        "_id": "63a7f7ec34daa9b3013cd59e",
        "projectId": "63a7f7ec34daa9b3013cd59c",
        "path": "package.json",
        "createdAt": "2022-12-25T07:12:44.192Z",
        "updatedAt": "2022-12-25T07:12:44.192Z"
    },
    {
        "_id": "63a7f7ec34daa9b3013cd59f",
        "projectId": "63a7f7ec34daa9b3013cd59c",
        "path": "pages/api/hello.js",
        "createdAt": "2022-12-25T07:12:44.192Z",
        "updatedAt": "2022-12-25T07:12:44.192Z"
    }
]
```

It will process this array on its end to create a nested file structure from it.

### Background: How [HMR](https://webpack.js.org/concepts/hot-module-replacement/) or Live Reloads work for apps

For the types of apps we would be supporting (Mainly React with [CRA](https://create-react-app.dev/) and [Next.js](https://nextjs.org/)), HMR comes built-in with the framework using a WebSocket connection established between the app running in the browser and the development server.

The server and the port that runs the CRA app also run the Webpack HMR Server.

In the case of React with CRA, simply creating a connection as a client to `ws://localhost:PORT/sockjs-node` will notify us whenever the files change and the server reloads. A similar approach is used by all frameworks like Next.js, Vite etc.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672669061360.png?alt=media&token=b3d27ec8-7df9-4dd8-b3b9-15c17a4ad8e7)

The payload for such update events will be of the form:

```json
{ "type": "hash", "data": "..." }
```

The message event received by the socket client for a file upload and HMR ping:

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672668915436.png?alt=media&token=9670db99-1f52-4c3b-b862-28bd931113e0)

> A thing to note is that we don't need to do any of that manual WebSocket connection setup inside our iframe that we'll use to display the app to the user, the framework internally takes care of reloading the app on a file change using JavaScript.

For other apps like Node.js apps, we can utilize Nodemon which provides us with APIs to listen for the process reloads on file changes.

### The Entire App Start Process

The app start process is a little intense and lengthy, make sure to click on the image below and read it from start to end.

![The whole app start process](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2FApp%20Start%20Process.svg?alt=media&token=052809be-8634-4516-9364-11f87c49a0f6)

There is a lot of information in the above flow, feel free to open the image in a new tab and read through it.

### Spinning up and terminating servers for running our code on demand 

The creation of servers for running our code and then pushing files into it for the project and subsequently readying it to accept further file updates and start our app is the most core part of this project.

To spin up new EC2 Instances we will use the [AWS SDK](https://www.npmjs.com/package/aws-sdk) with credentials we can get from our AWS IAM dashboard, we'll also use the SDK to make other API Calls throughout the life cycle.

We'll also need to create an [AMI](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html) with Node.js installed to use as the base for our EC2 instance (Like a Docker image for another image).

We'll also need a [security group](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html) to expose TCP ports from our instance and of course an [SSH Key](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html) to use for logging into the instance and running the app processes.

Before we can SSH into the EC2 instance we need to ensure the instance is healthy and that the health checks have passed for networking otherwise you'll get a failed response from AWS.

For reference: [Launching an EC2 Instance with AWS SDK](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-creating-an-instance.html).

We can use the `describeInstances` AWS SDK function to check for instance public URL and IP to pass to the front end and store in our database. ([Ref](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeInstances-property))

We can use the [describeInstanceStatus](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeInstanceStatus-property) SDK function to check for instance health checks for networking.

> Note that the health checks and public IPs are not available immediately, so you'll probably have to ping the AWS API until the data is available, **make sure to wait a few seconds between each call**, it's important to not hit the rate limit for your APIs in case you accidentally trigger a while loop that keeps hitting the AWS API to get instance status and public URL.

Once both the above are verified, only then do we proceed to copy our files onto the instance and start our app using node-ssh.

Once the number of socket connections for a project goes to 0, we can use the [terminateInstances](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#terminateInstances-property) SDK function to stop the associated instance.

### Socket-based updates for Project to the front end for logs and statuses

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672668324195.png?alt=media&token=a4f0a151-ffed-428d-be8f-1ada0834ef2e)

Each client instance for a project will be connected to our backend server. On top of this, the app script running on the remote code server will also be a special type of client.

We would use sockets to send information without polling from the backend to the client, for sending one-time info like file updates we would use simple REST API calls.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672668512610.png?alt=media&token=1908e3cc-40f6-4207-a8e6-5bae3b32d925)

The backend server will act as the middleman, no connection exists between the client and the app-runner script directly except for the iframe used to show the app, for security purposes.

The client joins the project in a [socket room](https://socket.io/docs/v3/rooms/) and receives pings from the backend as updates.

The app-runner script joins a separate room, it sends over logs and app-crash pings to the backend server which verifies the message (Using a secret key added to the message from the app-runner script).

Throughout the entire process of instance spin-up to health checks to project termination, there would be socket-based updates sent to the client to show the user in a terminal window.

![A basic look at the first version of socket based terminal output](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672668595020.png?alt=media&token=e3087517-19ae-4eae-addd-6b7464b76ad7)

### The Code Editor

Microsoft has open-sourced its VS Code Editor Interface: [Monaco Editor](https://github.com/microsoft/monaco-editor) for the web. This will take care of our requirement of coding and syntax highlighting in the browser, we could even add support for themes to our UI based on the plugins the library supports.

But Monaco is an extremely heavy library with an extremely high level of complexity, and hence, it's just better to use [CodeMirror](https://codemirror.net/) for our simple use case with a controlled editor, where we set the code for the active file received from the backend, allow the user to edit it, and use the `Ctrl + S / Cmd + S` key binding to confirm and send the update to the backend and subsequently to the app runner script.

### File Updates for project apps from the front end to the app runner

![How File Updates over the socket work](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2FHow%20File%20Updates%20over%20the%20socket%20work.svg?alt=media&token=4dbe0d6b-48c4-4009-9886-3bd1b6ad6603)

### Static File Uploads for Projects in Directories

Any remote code execution and development environment are incomplete without the ability to upload files from your system. And we'll also be supporting this feature.

All files at their core are composed of text. Hence, the file upload will be fairly standard, we would just ask the user to select a file, use browser APIs to get the text, check if the size is less than what we allow and send it as a regular create file operation with initial content as the text retrieved to our server.

The catch is that we only allow type: `text/**` and `application/**` files for future editing from uploaded files, all other file types are shown as a binary content screen to the user.

**Requisites:**
- An invisible file input.
- An `isReadableContent` flag for project files, to be deduced on the front end using the `file.type` attribute.
    
    ![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672668236225.png?alt=media&token=a9d6b91d-ecc6-4f43-8426-1dd18eb2c740)
    
- Usage of the `Blob.text()` method on the front end to read the content of the file and simply invoke the create file endpoint with the content as payload if `file.size` is less than 100KB.
- A binary data message to show the user to prevent them from editing or viewing unreadable data for a file.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672668252689.png?alt=media&token=69861431-093c-4324-826b-309b59cb8725)

### Environment Variables for Projects

Apps are incomplete without Environment variables, and I don't have to explain why.

For environment variables, we'll store them on the backend and expose them using a Linux script right before the app starts on the EC2 instance via our SSH tunnel from the backend (At the time of instance initialization or server restart).

We'll provide the user with a place in the project editor to enter a list of environment variables they want to incorporate into their projects. All the communication from the app regarding environment variables will happen over REST.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672669443547.png?alt=media&token=5dff4d7a-b336-49e9-b323-4a98ecb47643)

We will obviously encrypt their values using a secret before storage, and once stored, we'll not send environment variable values to the front end.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672669577910.png?alt=media&token=35527dca-5973-4151-a114-abb1c482e1c1)

We can also have protected environment variables like `PORT` and `NODE_ENV` to prevent manipulation of the dev environment.

### Project App Restarts

There would inevitably be the requirement for restarting the app server, it could be because of an environment variable change or an app crash.

In the event an app restart is required, the process will be simple:
- We send over a REST API call to the backend notifying it that we need a restart.
- The backend then sends over a socket ping to the app runner server associated with the project.
- The app runner server closes the currently running sub-process for the app and respawns it. Everything remains unchanged, the socket connection is not affected and the logs are streamed from the beginning.

### Dependency Installation

JavaScript apps are incomplete without dependencies. Implementation of dependency installation would be pretty straightforward, we won't handle installation from UI directly, but rather target the file that's changed whenever a dependency is installed to a project, which is `package.json`.

Any user who wants to install a dependency in the project can simply change the `dependencies` object in the `package.json` file and save it.

Our front end on detecting a Ctrl + S on `package.json` triggers an app server restart (Using the mechanism mentioned in the previous section) with the `npm install` command to run before the restart.

### HTTPS for Instances using Tunneling (Via ngrok or localtunnel)

HTTPS introduction for our apps on the EC2 instances is a big pain because we have to write scripts to generate certificates, renew them and then apply them over the network for the EC2 instance URL, or do it via Route53 APIs.

All of that is and always has been a huge pain.

This time I took the shortcut of using a tunnelling service called localtunnel, it’s a free option, an alternative to ngrok that allows you to create as many tunnels as needed and supports protocols like Web Sockets out of the box.

The reasons for choosing a tunnel over a static HTTPS connection using SSL certificates were:

- Issuing SSL Certificates is difficult.
- The connection to the project would be fairly short-lived, very rarely exceeding over 60 minutes. Hence, it becomes similar to the way we develop apps locally and just use tunnelling software like ngrok to expose it for webhooks usage or testing by other team members.

**The process looks like this:**

- In the app runner script, use the [localtunnel](https://www.npmjs.com/package/localtunnel) package to create a tunnel to port 3000.
- Send that tunnel URL as a broadcast to the project socket room. Via this broadcast, the front end will update and activate the iframe and all web socket requests for HMR will go through the tunnel URL.

![The Tunnel Flow](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672667473941.png?alt=media&token=34535394-d833-48bc-a211-7baf752d12dc)

### Limitation on the number of devices that can connect to a project at a time

To prevent abuse or unnecessary unintentional uses by people who have a habit of having more tabs opened than the days in their lives, we can implement a simple mechanism to limit the connections to a project.

Since we already know the number of connections to a project room, on every new request to join a project room we can check if the number of connections currently is the max. If it is, then we send back a **`project-socket-room-rejected`** status to the client and don’t join them in the room.

The client on receiving that status simply shows the user a message or closes the project editor window entirely.

![The backend socket code listening to check if more than one client is connected and reject any further connections](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672667729301.png?alt=media&token=7709dfea-853b-43f8-b767-fd30c90cbb5a)

![Frontend code to receive the project socket room join rejected ping](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672667698591.png?alt=media&token=5db69d46-17fb-4aaa-8e9d-13d904a00e76)

### The RCE in action

[RCE In action](https://www.youtube.com/embed/Dqt31d-K6CY)

### WebContainers: An Alternative to running code in a remote machine and instead running it on the user’s device in an isolated environment

After I was done building a big chunk of this project, [one of my friends](https://www.linkedin.com/in/rahulsuresh98/) shared this breathtaking post with me from StackBlitz:

[Introducing WebContainers: Run Node.js natively in your browser](https://blog.stackblitz.com/posts/introducing-webcontainers/)

![Image credits: Stackblitz blog post linked above](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fbuilding-a-real-time-dev-environment-like-codesandbox%2Fsecondaryimages%2Fimage1672667971194.png?alt=media&token=c2fe9463-fe24-40c0-8361-64f3aa66cdcd)

This was an amazing breakthrough and I feel it solves all the problems people come to associate with remote code execution. Do give it a read! Highly recommended.

If I were to build this system again, I would probably try building it using a similar technology or on top of the [open source web container core](https://github.com/stackblitz/webcontainer-core) implementation from StackBlitz.

---

And there you have it, folks, we built our own remote code execution system with templates, real-time project spin-up, file updates, HMR and a few other neat features! The result is not perfect, but it's not supposed to be. 😉

I hope this post was informative enough, hit me up with any suggestions or feedback.