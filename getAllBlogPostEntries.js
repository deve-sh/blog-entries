const { execSync } = require("child_process");
const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./firebase_service_account.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const getAllBlogPostEntries = async () => {
	try {
		let posts = await admin
			.firestore()
			.collection("posts")
			.where("isDraft", "==", false)
			.orderBy("createdAt", "desc")
			.get();

		let indexFileContents = `# Blog Entries - Hobnob\n\n`;

		for (let post of posts.docs) {
			let postMarkdown = `# ${post.data().title}\n\n![${
				post.data().mainImageAlt
			}](${post.data().mainImage})\n\n`;
			const postContent = await admin
				.firestore()
				.collection("postcontent")
				.doc(post.id)
				.get();
			postMarkdown += postContent.data().content;
			const fileName = `${post.data().uniqueId}.md`;
			indexFileContents += `- [${post.data().title}](${fileName})  -  ${post
				.data()
				.createdAt.toDate()
				.toDateString()}\n`;
			if (!fs.existsSync(fileName)) {
				fs.writeFileSync(fileName, postMarkdown);
				execSync(`git add ${fileName}`);
				execSync(`git commit -m "Added Blog Post: ${post.data().title}"`);
			}
		}

		fs.writeFileSync("index.md", indexFileContents);

		return true;
	} catch (err) {
		console.log(err);
	}
};

getAllBlogPostEntries();
