const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
            attachments,   // ← new: array of { filename, path }
        });

        console.log(` Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(' Email failed:', error.message);
    }
};

module.exports = sendEmail;