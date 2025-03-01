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


export const forgotPasswordEmmail = async (userEmail, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `Orra <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "OTP for forgot password",
            text: 'Forgot Password OTP',
            html: `<p>OTP for forgot password: ${otp}</p>`
        });

        console.log(`OTP email sent. ${info.messageId}`);

    } catch (error) {
        console.log(error);
    }
}


// This is actual function
export const updateEmailRequest = async (userEmail, token) => {
    try {
        const info = await transporter.sendMail({
            from: `Orra <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Token for email update",
            text: 'Email Update Token',
            html: `<p>Token for email update: ${token}</p>`
        });

        console.log(`Token email sent. ${info.messageId}`);

    } catch (error) {
        console.log(error);
    }
}





export const verifyEmailUpdateEmail = async (userEmail) => {
    try {
        const info = await transporter.sendMail({
            from: `Orra <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Email Updated",
            text: 'Email Updated',
            html: `<p>
                    Congratulations 🚀🚀 

                    Your email updated Successfully!🔥🚀
            </p>`
        });

        console.log(`Email Updated . ${info.messageId}`);

    } catch (error) {
        console.log(error);
    }
}


