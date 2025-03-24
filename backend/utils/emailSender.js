import nodemailer from "nodemailer";
import dotenv from "dotenv";

export const sendConfirmationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
        auth: {
            user: 'clemcheyrou@gmail.com',
            pass: process.env.GOOGLE_PASS,
        },
    });

	const confirmationUrl = `http://localhost:3000/register?token=${token}`;
    const mailOptions = {
        from: 'clemcheyrou@gmail.com',
        to: email,
        subject: 'Email Confirmation',
        text: `Please confirm your email by clicking the link: ${confirmationUrl}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('error sending email:', error);
    }
};

export const sendResetPasswordEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
        auth: {
            user: 'clemcheyrou@gmail.com',
            pass: process.env.GOOGLE_PASS,
        },
    });

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        text: `Click the link to reset your password: ${resetLink}`,
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });
};
