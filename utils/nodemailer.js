const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'talkangels5524@gmail.com',
        pass: 'wacf jcct mqvj qzdw'
    }
});

const sendForgotPasswordEmail = async ({ recipientEmail, subject, htmlFormat }) => {
    try {
        const mailOptions = {
            from: 'talkangels5524@gmail.com',
            to: recipientEmail,
            subject: subject,
            html: htmlFormat
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        throw new Error('Failed to send forgot password email');
    }
};

module.exports = sendForgotPasswordEmail;