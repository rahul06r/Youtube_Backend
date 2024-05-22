import { asyncHandler } from "../utils/asynchandler.js";


import { ApiError } from "../utils/ApiError.js"

import { User } from "../models/user.model.js"



import { uploadOnCloudinary } from "../utils/cloudinary.js"



import { ApiResponse } from "../utils/ApiResponse.js";


import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessandrefeshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefershToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })


        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and referesh token")

    }

}



const registerUser = asyncHandler(async (req, res) => {
    // testing
    // res.status(200).json({
    //     message:"Ok"
    // })

    // 


    // get user details from frontend
    // validation -isempty
    // check if user already exist - username and email
    // check for image ,avatar image
    // upload it to cloudinary (avatar)
    // create user object {create entry in db}
    // remove password and refresh token id field from response
    // check for user creation
    // return response (res)


    // start
    const { username, email, fullName, password } = req.body
    // 
    // console.log("LOGGing the Req.Body", req.body);


    console.log("Email", email);
    // if (fullName==="") {
    //     throw new ApiError(400,"FullName is required" )

    // }

    if (
        [fullName, email, password, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All Fileds are required")


    }



    // 
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    console.log("Existing user ???", existingUser);

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exist")
    }

    // 

    // console.log("Req files ", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files?.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;

    }


    console.log("AVATAR IMAGE LOCAL PATH: ! \t ", avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required(LOCAl)")

    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);


    // 
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")

    }


    // user Creation DB


    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    })


    // checking user creation existence and used for response to send back
    const createdUser = await User.findById(user._id).select("-password -refreshToken")


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong in registering the user")

    }

    // return created user

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered successfully")
    )



})



const loginUser = asyncHandler(async (req, res) => {
    // data from req.body
    // username or email
    // find the user by above condition
    // password check
    // generate access and refersh token
    // send cookies
    // send response true or false

    const { username, email, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "Username or email required!!")

    }


    const user = await User.findOne({
        $or: [{ username }, { email }]
    })


    // 
    if (!user) {
        throw new ApiError(404, "User not found!")
    }

    // 
    const isPasswordCorrect = await user.isPasswordCorrect(password)


    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password is incorrect!")
    }


    // 
    const { accessToken, refreshToken } = await generateAccessandrefeshTokens(user._id)
    // const { accessToken, refreshToken:newRefreshToken } = await generateAccessandrefeshTokens(user?._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: true
    }


    return res.status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User Logged In Successfully"
            )
        )
})




const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
                // refreshToken: "" or null
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    // const options = {
    //     httpOnly: true,
    // }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out Successfully!!!"))
})



// const refreshAccessToken = asyncHandler(async (req, res) => {
//     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
//     console.log("Incoming token Refresh", incomingRefreshToken);


//     if (!incomingRefreshToken) {
//         throw new ApiError(401, "Unauthorized request")

//     }
//     try {
//         const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SCERET)


//         const user = await User.findById(decodedToken?._id)

//         if (!user) {
//             throw new ApiError(401, "Invalid Refresh token")
//         }

//         if (incomingRefreshToken !== user?.refreshToken) {
//             throw new ApiError(401, "Refresh token is used or expired")


//         }


//         const options = {
//             httpOnly: true,
//             secure: true
//         }

//         // newRefreshToken is given bcz it is setting the value
//         const { accessToken, newRefreshToken } = await generateAccessandrefeshTokens(user?._id)



//         return res
//             .status(200)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", newRefreshToken, options)
//             .json(
//                 new ApiResponse(
//                     200,
//                     {
//                         accessToken, refreshToken: newRefreshToken
//                     },
//                     "Access Token Refreshed successfully!!!! "
//                 )
//             )
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Invalid Refresh token")
//     }

// })

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SCERET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessandrefeshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})





// change password or update password
const changePassword = asyncHandler(async (req, res) => {
    const { oldpassword, newPassword } = req.body;
    // const { oldpassword, newPassword,confirmPassword } = req.body;
    const user = await User.findById(req.user?._id);

    // for addding confirm password
    // if (!(confirmPassword === newPassword)) {
    //     throw new ApiError(400, "Both should be same")

    // }


    const isOldPasswordCorrect = await user.isPasswordCorrect(oldpassword);

    if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password!");
    }

    user.password = newPassword;
    await user.save({
        validateBeforeSave: false
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed successfully!!"))
})



// get user 
const getcurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})


// update Accoutndeatils
const updateAccountDeatils = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "All Fields are required!!")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName, email
        }
    }, { new: true }).select("-password")

    return res.status(200)
        .json(
            new ApiResponse(200, user, "User Account details Upadted Succesfully")
        )
})
// Avatar upadte
const userAvatarUpdate = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image File is Missing!!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)


    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading file!!(Avatar)")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id, {
        $set: {
            avatar: avatar.url
        }
    },
        { new: true }
    ).select("-password")



    return res.status(200)
        .json(
            new ApiResponse(200, user, "Avatar Image Updated Successfully!!")
        )
})
// Cover upadte
const userCoverUpdate = asyncHandler(async (req, res) => {
    const coverLocalPath = req.file?.path;
    if (!coverLocalPath) {
        throw new ApiError(400, "Cover Image File is Missing!!")
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath)


    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading file!!(Cover Image)")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id, {
        $set: {
            coverImage: coverImage.url
        }
    },
        { new: true }
    ).select("-password")


    return res.status(200)
        .json(
            new ApiResponse(200, user, "Cover Image Updated Successfully!!")
        )
})





const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }


    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions", //change name to lowercase
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",//change name to lowercase
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                email: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                username: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,

            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist!!")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, channel[0], "user Channel fected sucessfully")
        )
})
// 






// 
const getUserWatchHistroy = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        }, {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [ //subpipeline
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res.status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, "User watch History Fetched Successfully")
        )
})





export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getcurrentUser,
    updateAccountDeatils,
    userAvatarUpdate,
    userCoverUpdate,
    getUserChannelProfile,
    getUserWatchHistroy
}