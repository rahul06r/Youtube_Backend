import { asyncHandler } from "../utils/asynchandler.js";


import { ApiError } from "../utils/ApiError.js"

import { User } from "../models/user.model.js"



import { uploadOnCloudinary } from "../utils/cloudinary.js"



import { ApiResponse } from "../utils/ApiResponse.js";


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
            $set: {
                refreshToken: undefined
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



export {
    registerUser,
    loginUser,
    logoutUser
}