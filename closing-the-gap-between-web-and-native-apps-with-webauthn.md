# Closing the gap between web and native apps with Fingerprint Auth

![WebAuthn is the new way to make authentication simpler](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fclosing-the-gap-between-web-and-native-apps-with-webauthn%2Fprimaryimage.jpg?alt=media&token=4eb863bb-5c26-41a9-8ad7-557cbd57623d)

Remember the days when you first got your hands on a phone with a fingerprint scanner? It was magical, to simply tap your finger on a surface of your phone and unlock it felt like the epitome of tech.

Even more, when this integration made its way onto apps, it became an instant hit with consumers. Payment and Banking Apps swiftly integrated the device's fingerprint onto their apps to make sure that even if someone stole your phone, they wouldn't be able to do anything unless they knew your device's passcode or had your finger (Something I hope never happens to anyone 😛).

There was a slight problem, if you were a web application developer and wanted to provide your users with the same kind of security available to native apps, you were out of luck, this privilege was for the longest time available only to native apps for mobile phones and desktops.

That is, until now. We have finally reached the point where web apps can do almost all the things we expect native apps to do, including authenticating users with fingerprints from their devices. Because guess what, a web app runs on top of a native app - Your browser, which has all the access needed to run any kind of operation as long as security constraints are taken care of.

If you've used Google's Multi-Factor Authentication for your account (Which you absolutely should do if you haven't yet), you would have noticed a new section called "Passkeys". Passkeys are nothing but device-level authentication credentials like Windows Hello or your phone's/laptop's fingerprint scanner. They can be both a way for passwordless authentication as well as a Multi-Factor Authentication method.

In this post, we'll look at how to integrate your device's fingerprint scanner with your web app.

You can check out this amazing reference for whatever we're building [here](https://webauthn.guide/).

### Some groundwork: Public & Private Keys

In the world of encryption, there are two main types: Symmetric and Asymmetric.

Symmetric encryption is very simple, encrypting and decrypting data with a single string that both the person who encrypts the data and the person who decrypts the data know.

Asymmetric encryption on the other hand, is a little tricky, it involves two keys that are mathematically linked to each other (Think of them like two numbers that add to another number, say 40. There are an infinite number of numerical sets that can add up to 40 if you include fractional number). In this method, the data is "signed" or encrypted using one key and can be decrypted only via the second key.

What does all this have to do with authenticating via Fingerprints for your Web applications? We're about to find out in a few minutes.

What public-private key pairs allow you to do is establish very strong trust between two devices, such as your mobile phone and your application's server. If any information is signed and sent by your mobile phone, while only being accessible via system APIs that are backed by your Fingerprint, then your server can verify that the data it has received has come from your device and can proceed, otherwise it can block the request and conclude that someone is trying to impersonate you.

It is all about establishing trust, and that's what the Browser's Credentials API allows us to do. It all might be a little confusing, but let's try looking at the implementation flow for a little clarity.

### [WebAuthn](https://webauthn.io/) - Making Passwordless Authentication Possible!

For a long time, mobile apps have had ways to store and retrieve credentials in them. This functionality has not been available to web apps, until now. Browsers have now added functionality for tapping into the device's native fingerprint scanner and USB key APIs + Storage APIs to store, retrieve and use credentials.

This API allows you to do what's referred to as "Passwordless authentication" via methods such as your device's PIN, FingerPrint Scanner, Hardware Keys/YubiKeys and any authentication methods your device supports. As long as the Operating System exposes an API for it, it is possible.

The API can be accessed via the `navigator.credentials` property:

```js
if ('credentials' in navigator) {
  // Supported
}
else {
  // Hide any Multi-Factor Authentication methods dependent on user device-based inputs
}
```

It is worth noting that WebAuthn supports all sorts of authentication including Passwords, in this post though, we'll focus on building a fingerprint scanner-based web app.

To access and validate the user's fingerprint via your web app, there are a few steps:
- Generate a public and private key pair using WebAuthn, this pair is "backed" by the user's fingerprint. You aren't asking the device to give you something that identifies your user's fingerprint, you're just asking it for a key that can only be accessed by the user's fingerprint/authorization.
- Store the public key on your server, the private key is stored by the Browser on the user's device when the user uses the app.
- When you have to verify the user's fingerprint, call the WebAuthn API on the user's device, this generates a signature signed by the device-stored secret key, send this signature to the server, and if the payload can be decrypted and validated by the public key then the user can be safely allowed to proceed.

In essence, the fingerprint of the user acts as the connector between the public key stored on your server with the private key stored on your device.

Let's get started.

Generate a public-private key pair on the user's device.

```typescript
const user = { ... };  // Object identifying the user signed in to your app right now.

const publicKeyCreateOptions = {
		// This is to make sure that the navigator doesn't run duplicate auth checks for the same user and the same auth instance.
		// And to prevent such replay-attacks
		challenge: stringToBuffer(uuid()),
		// Your app's information
		rp: {
			name: "Local WebAuthN Restricted App",
			id: window.location.hostname,
		},
		// Your user's information who this credential will be linked to
		user: {
			id: stringToBuffer(user.uid),
			name: user.identifier,
			displayName: user.displayName,
		},
		// Specifier for the algorithm type, this is the confusing part, but not something you have to worry about.
		// Unless of course, supercomputers and quantum computers figure out how to break public-private-key cryptography.
		pubKeyCredParams: [-7, -257].map((algId) => ({
			alg: algId,
			type: "public-key",
		})),
		// Whether this credential is being created for a cross-platform entity or from a platform-specific method available to the browser like OS's FingerPrint scanner or Windows Hello
		authenticatorSelection: {
			authenticatorAttachment: "platform",
		},
		timeout: 60000,
		// Whether the user details are stored in the authentication-generated information at the end of the process
		attestation: "none",
	} as PublicKeyCredentialCreationOptions;

const credential = await navigator.credentials.create({ publicKey: publicKeyCreateOptions });
```

This prompts the user for their fingerprint or in the case of a laptop, their password as the preferred mode of authorization.

![image.png](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fclosing-the-gap-between-web-and-native-apps-with-webauthn%2Fsecondaryimages%2Fimage1708279178114.png?alt=media&token=11d39844-d9d6-4217-be54-d34048b5ea2e)

On completing the challenge, a credential pair is created and stored on the device. And the browser returns the following payload with the public key that can be stored on the server paired with detaild/ID of the user who's trying to authenticate with your application:

```js
{
    id: 'ADSUllKQmbqdGtpu4sjseh4cg2TxSvrbcHDTBsv4NSSX9...',
    rawId: ArrayBuffer(59),
    response: AuthenticatorAttestationResponse {
        clientDataJSON: ArrayBuffer(121),
        attestationObject: ArrayBuffer(306),
    },
    type: 'public-key'
}
```

The `clientDataJSON` and `attestationObject` fields are [CBOR](https://cbor.io/) objects that can be decoded via a CBOR library but to validate the user we only need the `rawId` of the credential, most databases support storage of ArrayBuffers in some form.

**Move to attesting the user identity using the above credential**

```js
// Get the credential you created and stored in the previous step.
const storedCredential = await getCredentialFromDatabase();

const credentialGetterOptions = {
	challenge: stringToBuffer(uuid()),
	extensions: {},
	rpId: window.location.hostname,
	userVerification: "preferred",
	allowCredentials: [
		{
			id: storedCredential.rawId,
			type: "public-key",
			transports: ["internal"],
		},
	],
	timeout: 60000,
} as PublicKeyCredentialRequestOptions;

return navigator.credentials.get({ publicKey: credentialGetterOptions });
```

This prompts the user for their fingerprint again and gives us back a new Attestation object:

```js
PublicKeyCredential {
    id: 'ADSUllKQmbqdGtpu4sjseh4cg2TxSvrbcHDTBsv4NSSX9...',
    rawId: ArrayBuffer(59),
    response: AuthenticatorAssertionResponse {
        authenticatorData: ArrayBuffer(191),
        clientDataJSON: ArrayBuffer(118),
        signature: ArrayBuffer(70),
        userHandle: ArrayBuffer(10),
    },
    type: 'public-key'
}
```

This object contains a `signature` field which is signed using the secret key of the credential, we can send this to the backend, and verify the signature using our stored Public Key.

```js
const signedData = (authenticatorDataBytes + hashedClientDataJSON);

const signatureIsValid = verify(storedCredential.publicKey, 
    signature, signedData);

if (signatureIsValid) {
    return res.json({ valid: true });
} else {
    return res.status(401).json({ error: "Unauthorized" });  // Credential has been tampered with
}
```

### The Flow in a Nutshell

An amazing WebAuthn demo created by the folks at Google can be found [here](https://try-webauthn.appspot.com).

Please click on the image below to magnify the abovementioned flow in a nutshell.

![The WebAuthn flow involving user's device](https://firebasestorage.googleapis.com/v0/b/devesh-blog-3fbfc.appspot.com/o/postimages%2Fclosing-the-gap-between-web-and-native-apps-with-webauthn%2FWebAuthn%20Flow.png?alt=media&token=8fc8ec26-0ce8-4c63-a7b6-9d8f4bd93078)

### A Short Note

Most of the APIs supported by WebAuthn would be ways of multi-factor authentication, and not the primary means of authentication, which would most likely still be an Email-Password authentication or Phone-OTP authentication.

Unless, of course, you're building a web app that has to be scoped to a single device, in which case, go on to the last section of this post and have fun. 🕺

### For Lazy Engineers 😛: A simpler but inefficient hack for finger-print walls

If you're building a web app where the only thing you want is to lock the access locally to someone who is the owner of the device, effectively preventing someone who doesn't know the PIN.

You can simply use `navigator.credential.create` to invoke the device's fingerprint scanner, if the promise resolves, that means the challenge was completed correctly, if not, the access to the app is not unlocked.

```jsx
const [isUnlocked, setIsUnlocked] = useState(false);

useEffect(() => {
    navigator.credential.create(...)
        .then(() => setIsUnlocked(true));
}, []);

return !isUnlocked ? <BlockerScreen /> : <App />;
```

This has long-term effects on the number of credentials being created and stored on the device but if you wanted to you could do it. 😛

This is not 100% safe as this can be done on a mobile app but if the only check you have is a client-side check like the above, someone can simply go into the console and try getting the data they need by some other methods. Server-level public-private key authentication backed by a Fingerprint credential is the safest option to prevent such issues.