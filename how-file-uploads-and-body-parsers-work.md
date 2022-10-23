# How File Uploads and Body Parsers Work

![Photo by Brett Sayles: https://www.pexels.com/photo/web-banner-with-online-information-on-computer-3803517/](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-file-uploads-and-body-parsers-work%2Fprimaryimage.jpg?alt=media&token=71384e74-622e-4475-80ad-27942703f593)

File uploads and request bodies; as developers, we deal with them every day when communicating with an API, they form the very basis of all API Contracts out there. Yet a big chunk of us does not understand how they work (I didn't understand till about an hour before starting to write this post as matter of fact).

If you're like me, most of the time we offload the body parsing or file handling part to an external library like [`busboy`](https://www.npmjs.com/package/busboy), [`multer`](https://www.npmjs.com/package/multer) or [`multiparty`](https://www.npmjs.com/package/multiparty). But it's almost fascinating to understand how these libraries work.

In this post, we'll be looking at some basics of how file uploads and transmission of request bodies take place, we'll also create our body-parser middleware to attach `body` and `file` properties to our [Express](https://expressjs.com/) Server's requests.

### Let's get the simple out of the way

So when you submit a form, the default behaviour for the form is to redirect you to the URL in the `action` attribute with the `method` attribute passed to the form tag. If the `method` is `GET`, then the process is simple, it simply appends all the form data to the URL as query parameters and redirects the user. If it is a `POST` method though, it does something different:

- If you have a file input in your form and the `enctype` attribute set to `multipart/form-data` (More on this later in the post), the browser post submission of the form converts the file to binary and sends it over to the `action` URL as a readable stream of data to be picked up on the action page.
- If you don't have any `enctype` specified to the form, the browser collects all the form input data into a Buffer and sends the user to the `action` URL and sends the Buffer not as a URL entry but as a stream of data that can be read. This is where request bodies come in. If you've used Node.js, you're probably used to getting `req.body`, or in PHP you would get this data using `$_POST['input_name']`.

### The useful `Content-Length` header

The presence of a file or a request body can be determined using the `Content-Length` header (If it’s a partial data request the part of the data available is stored in the `content-range` header). Every time you make a request that has some data in its body, the `content-range` header is added with the length of the data in bytes.

```javascript
if(req.headers["Content-Length")
   // Do something with the data
```

### The form `enctype` attribute

The `enctype` attribute of a form tag tells the browser how the data submitted should be sent to the end URL. The default is `application/x-www-form-urlencoded` which sends data as query parameters in the URL if the submission method is `GET` and query parameter form via a stream of data to the end URL if the method is `POST`.

For files, the `enctype` needs to be `multipart/form-data`.

The `enctype` attribute directly affects the `Content-Type` header for the request made to the end URL for it to understand the format of the data being sent to it.

For requests where you don't directly depend on the `submit` event of a form (Using `event.preventDefault`) you would be using the `Content-Type` header to tell your server the kind of data you're sending. Most frontend libraries you would use to send data over to a server like [axios](https://www.npmjs.com/package/axios) will automatically append the appropriate `Content-Type` header to the request.

### How Data is read on the server

A network connection is opened to the web server and the data for the file or any data for that matter like JSON, URL Encoded Strings is sent over from the client.

The Node.js server in our case will create a [Readable stream](https://nodesource.com/blog/understanding-streams-in-nodejs/) of incoming data attached to the `request` object. This stream of incoming data can be read by [linking an event listener to `data`](https://nodejs.org/api/events.html#emitteroneventname-listener).

Then the body of the request can be read:

```javascript
app.post("/uploadfile", (req, res) => {
	req
		.on("data", (chunk) => {
			// Here, the chunk is part of or all the data sent from the client to the server.
			// Or a part of that data.
		})
		.on("end", () => {
			// Data transfer complete.
		});
});
```

### The format of the data received

If you send a file over in the request and use the chunk addition script above, you will get a body like the following:

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-file-uploads-and-body-parsers-work%2Fsecondaryimages%2Fimage1666439998360.png?alt=media&token=84bd8b14-584b-49a2-9c85-347c97ebc698)

This is the original data that composes the file (Mainly the unreadable characters).

The `boundary` attribute in the `content-type` header for the request helps us identify the files in the body and the limits to which it has been sent (Multiple chunks could be sent to upload a single file).

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-file-uploads-and-body-parsers-work%2Fsecondaryimages%2Fimage1666440187390.png?alt=media&token=13e973ed-df51-4bd7-8b5d-5210ff797ade)

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fhow-file-uploads-and-body-parsers-work%2Fsecondaryimages%2Fimage1666440051617.png?alt=media&token=19a492c2-8165-4238-a861-62e6f23052e3)

For other kinds of data like JSON or URL Encoded information, the data is a simple string which can be parsed accordingly.

### Let's Create Our Body Parsing and File Parsing middlewares for Express

Now that we have an understanding of how file uploads and request bodies work, we can work on creating the middleware that we use day to day in our Node.js projects from scratch.

##### A JSON Body Parsing Middleware for `Content-Type: application/json`

As mentioned earlier, request bodies are simply sent as text, which can then be parsed using `JSON.parse` if they are JSON. We can identify if the body being sent to the server is of type JSON using the `Content-Type` header.

The following middleware substitutes the `app.use(express.json())` middleware.

```javascript
const jsonBodyParserMiddleware = (req, _, next) => {
	let body = "";
	if (
		req.headers["Content-Length"] &&
		req.headers["Content-Type"] === "application/json"
	) {
		req
			.on("data", (chunk) => (body += chunk))
			.on("end", () => {
				req.body = JSON.parse(body);
				next();
			});
	} else next();
};
```

#### URL Encoded Body Parser for `Content-Type: application/x-www-form-urlencoded`

This substitutes the `app.use(express.urlencoded())` middleware. URL Encoded bodies have information in the form of URL Query Params: `a=1&b=2&c=something...`.

We'll do what we did for JSON bodies, only this time we'll use the `URLSearchParams` class available to us from the global scope and use that to parse the url-encoded body string.

```javascript
const urlEncodedBodyParserMiddleware = (req, _, next) => {
	const body = "";
	if (
		req.headers["Content-Length"] &&
		req.headers["Content-Type"] === "application/x-www-form-urlencoded"
	) {
		req
			.on("data", (chunk) => (body += chunk))
			.on("end", () => {
				const data = new URLSearchParams(body.toString());
				req.body = Object.fromEntries(data);
				next();
			});
	} else next();
};
```

#### File Parsing Middleware

This simple middleware would act similar to [`express-fileupload`](https://www.npmjs.com/package/express-fileupload) library that reads the file sent in the request and then attaches it to the `file` property of the request.

```javascript
const fileParserMiddleware = (req, _, next) => {
	const body = "";
	if (
		req.headers["Content-Length"] &&
		req.headers["Content-Type"].includes("multipart/form-data")
	) {
		req
			.on("data", (chunk) => (body += chunk))
			.on("end", () => {
				req.file = body;
				next();
			});
	} else next();
};
```

That brings us to a close on the basics of file uploads and body parsing, hope this post was insightful. ✌
