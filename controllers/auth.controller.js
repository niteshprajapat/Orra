import User from "../models/user.model.js";
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';


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

        // token
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

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in Login API!",
        });
    }
}


// login
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
