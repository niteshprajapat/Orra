import User from "../models/user.model.js";


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