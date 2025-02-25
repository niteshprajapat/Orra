import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({});


const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});


export const sendOTPEmail = async (userEmail, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `Orra <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "OTP for account verification",
            text: 'Account Verification OTP',
            html: `<p>OTP for your account verification: ${otp}</p>`
        });

        console.log(`OTP email sent. ${info.messageId}`);

    } catch (error) {
        console.log(error);
    }
}


export const sendVerificationEmail = async (userEmail) => {
    try {
        const info = await transporter.sendMail({
            from: `Orra <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Account Verification",
            text: 'Account Verification OTP',
            html: `<p>
            
                    Congratulations 🚀🚀 

                    Your account has been verified!🔥🚀

            </p>`
        });

        console.log(`OTP email sent. ${info.messageId}`);

    } catch (error) {
        console.log(error);
    }
}
