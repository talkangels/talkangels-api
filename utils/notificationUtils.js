const admin = require("firebase-admin");
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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

        // Sending notification
        await admin.messaging().send(message);
    } catch (error) {

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
        await admin.messaging().send(message);
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
