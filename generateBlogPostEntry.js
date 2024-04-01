const { execSync } = require("child_process");
const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./firebase_service_account.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const generateBlogPostEntry = async (docId) => {
	if (!docId) return process.exit(1);

	const post = await admin.firestore().collection("posts").doc(docId).get();
	let postMarkdown = `# ${post.data().title}\n\n![${
		post.data().mainImageAlt
	}](${post.data().mainImage})\n\n`;
	const postContent = await admin
		.firestore()
		.collection("postcontent")
		.doc(docId)
		.get();
	postMarkdown += postContent.data().content;
	const fileName = post.data().uniqueId + ".md";
	fs.writeFileSync(fileName, postMarkdown);
	let indexFile = fs.readFileSync("index.md", "utf-8");
	indexFile = indexFile.split("# Hobnob - Blog Entries").pop().trim();
	indexFile = `# Hobnob - Blog Entries

- [${post.data().title}](${fileName})  -  ${post
		.data()
		.createdAt.toDate()
		.toDateString()}\n${indexFile}`;

	fs.writeFileSync("index.md", indexFile);

	execSync(`git add ${fileName} index.md`);
	execSync(`git commit -m "Added Blog Post: ${post.data().title}"`);

	return process.exit(0);
};

generateBlogPostEntry("");
