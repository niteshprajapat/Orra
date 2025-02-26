import User from "../models/user.model.js";
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendOTPEmail, sendVerificationEmail } from "../utils/emailHandler.js";


// register
export const register = async (req, res) => {
    try {
        const { username, email, password, fullname } = req.body;

        if (!username || !email || !password || !fullname) {
            return res.status(404).json({
                success: false,
                message: "All fields are required!",
            });
        }


        const isEmailExists = await User.findOne({ email });
        if (isEmailExists) {
            return res.status(400).json({
                success: false,
                message: "Email already exists!",
            });
        }


        const isUsernameExists = await User.findOne({ username });
        if (isUsernameExists) {
            return res.status(400).json({
                success: false,
                message: "Username already exists!",
            });
        }


        const hashedPassword = await argon2.hash(password);
        console.log("hashedPassword", hashedPassword);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            fullname,
        });


        user.password = null;
        return res.status(200).json({
            success: true,
            message: "User Account created Successfully!",
            user
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in Register API!",
        })
    }
}


// login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).json({
                success: false,
                message: "All fields are required!",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials!",
            });
        }

        const isPasswordMatched = await argon2.verify(user.password, password);
        if (!isPasswordMatched) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials!",
            });
        }

        console.log("user => ", user);

        if (user.isVerified) {
            const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1d',
            });

            return res.status(200).cookie("orra", token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: 'strict',
            }).json({
                success: true,
                message: "User LoggedIn Successfully!",
                user,
            });
        } else {

            const min = Math.pow(10, 5);;
            const max = Math.pow(10, 6) - 1;;
            const otp = crypto.randomInt(min, max);
            console.log("otp => ", otp, typeof (otp));

            user.otp = otp;
            user.optExpires = new Date(Date.now() + 5 * 60 * 1000);

            await user.save();

            await sendOTPEmail(user.email, otp);
            console.log("user", user);

            return res.status(200).json({
                success: true,
                message: "OTP has sent to your email",
            });
        }

        // token
        // const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        //     expiresIn: '1d',
        // });

        // return res.status(200).cookie("orra", token, {
        //     httpOnly: true,
        //     maxAge: 24 * 60 * 60 * 1000,
        //     sameSite: 'strict',
        // }).json({
        //     success: true,
        //     message: "User LoggedIn Successfully!",
        //     user,
        // });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in Login API!",
        });
    }
}


// logout
export const logout = async (req, res) => {
    try {

        res.clearCookie("orra");

        return res.status(200).cookie("orra", "", {
            httpOnly: true,
            maxAge: 0,
        }).json({
            success: true,
            message: "User Logout Successfully!",
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in Logout API!",
        });
    }
}



// verifyAccount
export const verifyAccount = async (req, res) => {
    try {

        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        console.log("VERY => ", user);
        console.log("VERY => ", typeof otp);
        console.log("VERY => ", typeof user.otp);


        if (!otp || !user.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid request!"
            });
        }

        if (Date.now() > user.optExpires) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired!",
            });
        }

        if (otp !== user.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP!"
            });
        }

        user.otp = undefined;
        user.optExpires = undefined;
        user.isVerified = true;

        await user.save();

        await sendVerificationEmail(user.email);

        user.password = undefined;
        return res.status(200).json({
            success: true,
            message: "Your account has been verified Successfully!",
            user,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in verifyAccount API!",
        });
    }
}


// resend OTP
export const resentOtp = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        const min = Math.pow(10, 5);
        const max = Math.pow(10, 6) - 1;
        const otp = crypto.randomInt(min, max);


        user.otp = otp;
        user.optExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await sendOTPEmail(user.email, otp);

        return res.status(200).json({
            success: true,
            message: "OTP Resent Successfully!"
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in resentOtp API!",
        });
    }
}