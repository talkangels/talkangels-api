require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.E_MAIL,
        pass: process.env.SMT_PASSWORD
    }
});

const sendForgotPasswordEmail = async ({ recipientEmail, subject, htmlFormat }) => {
    try {
        const mailOptions = {
            from: process.env.E_MAIL,
            to: recipientEmail,
            subject: subject,
            html: htmlFormat
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = sendForgotPasswordEmail;