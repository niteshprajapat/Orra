import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import WatchHistory from "../models/watchHistory.model.js";
import crypto from 'crypto';
import { updateEmailRequest, verifyEmailUpdateEmail } from "../utils/emailHandler.js";
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';



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

            const notification = await Notification.create({
                sender: loggedInUserId,
                receiver: userId,
                type: "subscription",
            });

            await notification.save();

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


// getListofSubscribers
export const getListofSubscribers = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId Not Found!",
            });
        }

        const user = await User.findById(userId).select("subscribers").lean().populate({
            path: "subscribers",
            select: "fullname username email"
        });

        // const user = await User.aggregate([
        //     {
        //         $match: {
        //             _id: new mongoose.Schema.Types.ObjectId(userId),
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             subscribers: 1,
        //         },
        //     }
        // ]);



        return res.status(200).json({
            success: true,
            message: "Fetch all subscribers of user",
            user,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getListofSubscribers API!",
        });
    }
}


// getListofSubscriberTo
export const getListofSubscribedTo = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "UserId Not Found!",
            });
        }

        const user = await User.findById(userId).select("subscribedTo").lean().populate({
            path: "subscribedTo",
            select: "fullname username email"
        });

        return res.status(200).json({
            success: true,
            message: "Fetch all subscribedTo of user",
            user,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getListofSubscribedTo API!",
        });
    }
}





// uploadProfilePhoto
export const uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user._id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "File is required!",
            });
        }

        const user = await User.findById(userId);

        if (user.profilePicture.public_id) {
            await cloudinary.uploader.destroy(user.profilePicture.public_id);
        }

        const result = await cloudinary.uploader.upload(file.path, {
            folder: "profile_photos"
        });

        // Delete the file from disk after successful upload
        fs.unlinkSync(file.path);

        user.profilePicture.url = result.secure_url;
        user.profilePicture.public_id = result.public_id;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile Photo Uploaded Successfully!",
            profilePicture: user.profilePicture,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in uploadProfilePhoto API!",
        });
    }
}

// deleteProfilePhoto
export const deleteProfilePhoto = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user.profilePicture.public_id) {
            return res.status(400).json({
                success: false,
                message: "No Profile Photo Found!",
            })
        }

        // Delete from cloudinary
        await cloudinary.uploader.destroy(user.profilePicture.public_id);

        // Remove from DB
        user.profilePicture.url = "";
        user.profilePicture.public_id = "";

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile Photo Deleted!",
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteProfilePhoto API!",
        });
    }
}









// uploadCoverImage
export const uploadCoverImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "File is required!",
            });
        }

        const user = await User.findById(userId);

        if (user.coverImage.public_id) {
            await cloudinary.uploader.destroy(user.coverImage.public_id);
        }

        const result = await cloudinary.uploader.upload(file.path, {
            folder: "cover_images"
        });


        // Delete the file from disk after successful upload
        fs.unlinkSync(file.path);

        user.coverImage.url = result.secure_url;
        user.coverImage.public_id = result.public_id;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Cover Image Uploaded Successfully!",
            coverImage: user.coverImage,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in uploadProfilePhoto API!",
        });
    }
}


// deleteCoverImage
export const deleteCoverImage = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user.coverImage.public_id) {
            return res.status(400).json({
                success: false,
                message: "No Cover Image Found!",
            })
        }

        // Delete from cloudinary
        await cloudinary.uploader.destroy(user.coverImage.public_id);

        // Remove from DB
        user.coverImage.url = "";
        user.coverImage.public_id = "";

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Cover Image Deleted!",
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteProfilePhoto API!",
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

// forceDeleteUserByUserId
export const forceDeleteUserByUserId = async (req, res) => {
    try {

        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found!",
            });
        }

        // user user's videos and associate data
        const videos = await Video.find({ userId });

        for (const video of videos) {
            if (video.videoUrl.public_id) {
                await cloudinary.uploader.destroy(video.videoUrl.public_id, {
                    resource_type: "video",
                })
            }

            if (video.thumbnail.public_id) {
                await cloudinary.uploader.destroy(video.thumbnail.public_id, {
                    resource_type: "image",
                });
            }

            await Comment.deleteMany({ videoId: video._id });
            await Notification.deleteMany({ videoId: video._id });
            await WatchHistory.updateMany(
                { "videos.videoId": video._id },
                {
                    $pull: {
                        videos: {
                            videoId: video._id
                        }
                    }
                }
            );

            await video.save();
        }


        if (user.profilePicture.public_id) {
            await cloudinary.uploader.destroy(user.profilePicture.public_id)
        }
        if (user.coverImage.public_id) {
            await cloudinary.uploader.destroy(user.coverImage.public_id)
        }


        await Comment.deleteMany({ userId });
        await Notification.deleteMany({
            $or: [
                { sender: userId },
                { receiver: userId }
            ],
        });
        await WatchHistory.deleteMany({ userId });

        await User.updateMany(
            { subscribedTo: userId },
            {
                $pull: { subscribedTo: userId }
            }
        );

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: "User and all associated data permanently deleted",
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in changeStatus API!",
        });
    }
}

// bulkChangeUserStatus
export const bulkChangeUserStatus = async (req, res) => {
    try {

        const { userIds, status } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User IDs array is required!"
            });
        }

        if (!["active", "suspended", "banned"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status! Use 'active', 'banned', or 'suspended'",
            });
        }


        const updatedData = await User.updateMany(
            {
                _id: { $in: userIds },
                status: { $ne: status },
                isDelete: false,
            },
            {
                $set: { status }
            }
        );

        // Map status to notification type
        const statusToTypeMap = {
            active: "user_activated",
            banned: "user_banned",
            suspended: "user_suspended",
        };


        const notifications = userIds.map((userId) => ({
            sender: req.user._id,
            receiver: userId,
            type: statusToTypeMap[status],
            priority: "high"
        }));

        await Notification.insertMany(notifications);


        return res.status(200).json({
            success: true,
            message: `Successfully updated ${updatedData.modifiedCount} users to ${status}`,
            modifiedCount: updatedData.modifiedCount,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in changeStatus API!",
        });
    }
}

// getUserStats
export const getUserStats = async (req, res) => {
    try {

        const users = await User.aggregate([
            {
                $facet: {
                    totalUsers: [
                        { $match: { isDelete: false } },
                        { $count: "count" },
                    ],
                    activeUsers: [
                        { $match: { isDelete: false, status: "active" } },
                        { $count: "count" },
                    ],
                    bannedUsers: [
                        { $match: { isDelete: false, status: "banned" } },
                        { $count: "count" },
                    ],
                    suspendedUsers: [
                        { $match: { isDelete: false, status: "suspended" } },
                        { $count: "count" },
                    ],
                    newUsersLast30Days: [
                        {
                            $match: {
                                isDelete: false,
                                joinedOn: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                            }
                        },
                        { $count: "count" }
                    ],
                }
            },
            {
                $project: {
                    totalUsers: { $arrayElemAt: ["$totalUsers.count", 0] },
                    activeUsers: { $arrayElemAt: ["$activeUsers.count", 0] },
                    bannedUsers: { $arrayElemAt: ["$bannedUsers.count", 0] },
                    suspendedUsers: { $arrayElemAt: ["$suspendedUsers.count", 0] },
                    newUsersLast30Days: { $arrayElemAt: ["$newUsersLast30Days.count", 0] },
                }
            }
        ]);


        return res.status(200).json({
            success: true,
            data: users[0] || {
                totalUsers: 0,
                activeUsers: 0,
                bannedUsers: 0,
                suspendedUsers: 0,
                newUsersLast30Days: 0,
                verifiedUsers: 0
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in changeStatus API!",
        });
    }
}

