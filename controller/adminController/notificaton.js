const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../../middleware/errorHandler");
const User = require("../../models/userModel");
const { checkTokenValidity, sendNotification } = require("../../utils/notificationUtils");
const puppeteer = require('puppeteer');
const { Readable } = require('stream');



const sendNotifictionUser = async (req, res, next) => {
    try {
        const { title, body, userIds, angel_id, type } = req.body;
        if (!title || !body || !type) {
            return next(new ErrorHandler("Title, Body and Type are required for notifications", StatusCodes.BAD_REQUEST));
        }

        let users;
        if (!userIds) {
            users = await User.find({});
        } else {
            users = await User.find({ _id: { $in: userIds } });
        }

        const notifications = [];
        for (const user of users) {
            if (user.fcmToken) {
                const isTokenValid = await checkTokenValidity(user.fcmToken);
                if (isTokenValid) {
                    const data = { angel_id: angel_id || '', type: type, };
                    await sendNotification(user.fcmToken, title, body, data);
                    notifications.push({ user: user._id, status: "sent" });
                } else {
                    notifications.push({ user: user._id, status: "token_invalid" });
                }
            } else {
                notifications.push({ user: user._id, status: "token_missing" });
            }
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Notifications sent successfully",
            notifications: notifications
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

async function generatePDF(title, content, res) {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #666;
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p>${content}</p>
        </body>
        </html>
    `;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

        const pdfBuffer = await page.pdf({ format: 'A4' });

        await browser.close();

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');

        // Send the PDF buffer in the response
        const readableStream = new Readable();
        readableStream.push(pdfBuffer);
        readableStream.push(null); // End of file

        readableStream.pipe(res);
        console.log('PDF generated and sent in response.');
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
}


const downlodePdf = async (req, res, next) => {
    const title = 'Sample PDF';
    const content = 'This is a dynamically generated PDF.';
    generatePDF(title, content, res);
}

module.exports = {
    sendNotifictionUser,
    downlodePdf
}