import User from '../models/user.model.js';
import jwt, { decode } from 'jsonwebtoken';


export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.orra || req.headers.authorization.replace("Bearer ", "");
        console.log("tokennn", token);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized! Please login first!",
            });
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded", decoded);

        if (!decoded) {
            return res.status(400).json({
                success: false,
                message: "Invalid Token!",
            });
        }

        const user = await User.findById(decoded._id);
        console.log("user", user);


        req.user = user;

        next();

    } catch (error) {
        console.log(error);
    }
}


// isAdmmin
export const isAdmin = async (req, res, next) => {
    try {
        const role = req.user.role;
        console.log("role", role);


        if (role !== "admin") {
            return res.status(400).json({
                success: false,
                message: "Invalid Role",
            });
        }

        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Invalid Role",
        })
    }
}