import User from "../models/user.model.js";
import crypto from 'crypto';
import { updateEmailRequest, verifyEmailUpdateEmail } from "../utils/emailHandler.js";


// getUserById
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId Not Found!"
            });
        }

        const user = await User.findById(userId);


        if (user.isDelete) {
            return res.status(400).json({
                success: false,
                message: "User Not Found!"
            });
        }


        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: "User Found with UserId!",
            user,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getUserById API!",
        });
    }
}

// meProfile
export const meProfile = async (req, res) => {
    try {
        const user = req.user;

        return res.status(200).json({
            success: true,
            message: "Fetched your Profile",
            user,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getUserById API!",
        });
    }
}

// updateProfile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullname, username, bio, location, twitterlink, linkedinlink, githublink, personalwebsitelink } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId Not Found!",
            });
        }

        const user = await User.findById(userId);

        if (user.isDelete) {
            return res.status(400).json({
                success: false,
                message: "Your account is Temporary Deleted!"
            });
        }

        // if (fullname) {
        //     user.fullname = fullname
        // }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    fullname,
                    username,
                    bio,
                    location,
                    socialLinks: {
                        twitter: twitterlink,
                        linkedin: linkedinlink,
                        github: githublink,
                        personalWebsite: personalwebsitelink,
                    }
                }
            },
            {
                new: true,
            }
        );

        updatedUser.password = undefined;

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully!",
            user: updatedUser,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getUserById API!",
        });
    }
}


// loginDevices
export const loginHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const devices = req.useragent
        const ipAddress = req.ip;

        const user = await User.findById(userId);
        user.loginHistory.push({
            ip: ipAddress,
            device: `${devices.browser} on ${devices.os}`,
        });

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Fetched Login Devices History",
            loginDeviceHistory: user.loginHistory,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in loginHistory API!",
        });
    }
}


// deleteUserById
export const deleteUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);

        if (user.isDelete) {
            return res.status(200).json({
                success: true,
                message: "User already deleted!",
            });
        }

        user.isDelete = true;
        await user.save();



        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully!",
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getUserById API!",
        });
    }
}



// subscribeUser
export const subscribeUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const loggedInUserId = req.user._id;

        const user = await User.findById(userId);
        const loggedinUser = await User.findById(loggedInUserId);

        if (userId.toString() === loggedInUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You can't subscribe to yourself!",
            });
        }

        if (user.isDelete) {
            return res.status(400).json({
                success: false,
                message: "Cant subscribe: User is deleted!",
            });
        }


        if (!loggedinUser.subscribedTo.includes(userId)) {
            await User.findByIdAndUpdate(
                loggedInUserId,
                {
                    $push: {
                        subscribedTo: userId
                    }
                },
                { new: true }
            );

            await User.findByIdAndUpdate(userId, { $push: { subscribers: loggedInUserId } }, { new: true });

            return res.status(200).json({
                success: true,
                message: `You Subscribed to ${user.fullname}`,
            });


        } else {
            return res.status(200).json({
                success: true,
                message: `You already Subscribed to ${user.fullname}`,
            });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in subscribeUser API!",
        });
    }
}

// unSubscribeUser
export const unSubscribeUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const loggedInUserId = req.user._id;

        const user = await User.findById(userId);
        const loggedinUser = await User.findById(loggedInUserId);

        if (userId.toString() === loggedInUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You can't unsubscribe to yourself!",
            });
        }

        if (user.isDelete) {
            return res.status(400).json({
                success: false,
                message: "Cant unsubscribe: User is deleted!",
            });
        }


        if (loggedinUser.subscribedTo.includes(userId)) {
            await User.findByIdAndUpdate(
                loggedInUserId,
                {
                    $pull: {
                        subscribedTo: userId
                    }
                },
                { new: true }
            );

            await User.findByIdAndUpdate(userId, { $pull: { subscribers: loggedInUserId } }, { new: true });

            return res.status(200).json({
                success: true,
                message: `You Unsubscribed to ${user.fullname}`,
            });


        } else {
            return res.status(200).json({
                success: true,
                message: `You already Unubscribed to ${user.fullname}`,
            });
        }







    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in subscribeUser API!",
        });
    }
}


// requestEmailUpdate
export const requestEmailUpdate = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const userId = req.user._id;

        if (!newEmail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            });
        }

        const user = await User.findById(userId);


        const existingEmail = await User.findOne({ email: newEmail });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "This email is already taken!",
            });
        }

        const emailToken = crypto.randomBytes(10).toString('hex');
        console.log("emailToken", emailToken);

        if (user.isVerified) {

            user.emailVerificationToken = emailToken;
            user.emailVerificationTokenExpires = new Date(Date.now() + 5 * 60 * 1000);

            await updateEmailRequest(newEmail, emailToken);

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Email Update token has sent to your email address!",
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Your email is not verified yet!",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in requestEmailUpdate API!",
        });
    }
}


// requestEmailUpdate
// export const requestEmailUpdate = async (req, res) => {
//     try {
//         const { newEmail } = req.body;
//         const userId = req.user._id;

//         if (!newEmail) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required!",
//             });
//         }

//         const user = await User.findById(userId);


//         const existingEmail = await User.findOne({ email: newEmail });
//         if (existingEmail) {
//             return res.status(400).json({
//                 success: false,
//                 message: "This email is already taken!",
//             });
//         }

//         const emailToken = crypto.randomBytes(10).toString('hex');
//         console.log("emailToken", emailToken);

//         const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;


//         if (user.isVerified) {

//             user.emailVerificationToken = emailToken;
//             user.emailVerificationTokenExpires = new Date(Date.now() + 5 * 60 * 1000);

//             // await updateEmailRequest(newEmail, emailToken);
//             await updateEmailRequest(newEmail, verificationLink);

//             await user.save();

//             return res.status(200).json({
//                 success: true,
//                 message: "Email Update token has sent to your email address!",
//             });
//         } else {
//             return res.status(200).json({
//                 success: true,
//                 message: "Your email is not verified yet!",
//             });
//         }

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Error in requestEmailUpdate API!",
//         });
//     }
// }

// verifyEmailUpdate
export const verifyEmailUpdate = async (req, res) => {
    try {
        const { emailToken, newEmail } = req.body;

        const user = await User.findOne({ emailVerificationToken: emailToken });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or Expired Token!",
            });
        }

        console.log("NEWUSER", user)

        if (new Date() > user.emailVerificationTokenExpires) {
            return res.status(400).json({
                success: false,
                message: "Token Expired!",
            });
        }

        if (user.emailVerificationToken !== emailToken) {
            return res.status(400).json({
                success: false,
                message: "Token doesnt matched!"
            });
        }

        user.email = newEmail;
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;

        await user.save();
        await verifyEmailUpdateEmail(newEmail);

        user.password = undefined;

        return res.status(200).json({
            success: true,
            message: "Email Updated Successfully!",
            user,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in requestEmailUpdate API!",
        });
    }
}










// ADMIN CONTROLLERS


// getAllUsers
export const getAllUsers = async (req, res) => {
    try {

        const users = await User.find({ isDelete: false });


        users.forEach((user) => {
            return user.password = undefined;
        })


        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully!",
            total: users.length,
            users,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getUserById API!",
        });
    }
}

// getAllDeletedUsers
export const getAllDeletedUsers = async (req, res) => {
    try {

        const users = await User.find({ isDelete: true });


        users.forEach((user) => {
            return user.password = undefined;
        })


        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully!",
            total: users.length,
            users,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getUserById API!",
        });
    }
}

// changeStatus
export const changeStatus = async (req, res) => {
    try {

        const { statusType } = req.body;
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (statusType.toLowerCase() === "banned") {
            user.status = "banned";
        } else if (statusType.toLowerCase() === "suspended") {
            user.status = "suspended";
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: `User status updated to ${statusType}`,
        })



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in changeStatus API!",
        });
    }
}