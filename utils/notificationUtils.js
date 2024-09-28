const admin = require("firebase-admin");
const serviceAccount = require('../serviceAccountKey.json');

// console.log(serviceAccount);


admin.initializeApp({
    credential: admin.credential.cert({
        type:process.env.FIREBASE_TYPE,
        project_id:process.env.FIREBASE_PROJECT_ID,
        private_key_id:process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email:process.env.FIREBASE_CLIENT_EMAIL,
        client_id:process.env.FIREBASE_CLIENT_ID,
        auth_uri:process.env.FIREBASE_AUTH_URI,
        token_uri:process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url:process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url:process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain:process.env.FIREBASE_DOMAIN
    })
});



const sendNotification = async (fcmToken, title, body, data) => {
    try {
        const message = {
            token: fcmToken,
            notification: {
                title: title,
                body: body
            },
            data: data
        };

        const response = await admin.messaging().send(message);

        if(response){
            console.log("send",response)
        } else {
            console.log("Invalid token")
        }

        return true
    } catch (error) {
      console.log("🚀 ~ sendNotification ~ error:", error)
    }
};

async function checkTokenValidity(token) {
    try {
        const message = {
            token: token,
            notification: {
                title: "Security Alert",
                body: "this account tries to log in on devices"
            },
        };
        const response = await admin.messaging().send(message);
        if(response){
            console.log("valid token",response)
        } else {
            console.log("Invalid token")
        }

        return true;
    } catch (error) {
        if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
            return false;
        } else {
            return true;
        }
    }
}
module.exports = {
    sendNotification,
    checkTokenValidity
};
