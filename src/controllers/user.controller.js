import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.accessToken = accessToken
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        console.log(user.accessToken, user.refreshToken)

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something want wrong while generating Access and refresh token");

    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { fullName, userName, email, password } = req.body;

    if (!fullName || !userName || !email || !password) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existingUser) {
        throw new ApiError(400, "User already exists with this username or email")
    }

    const user = await User.create({

        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select("-password")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(createdUser._id)

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Failed to generate access and refresh tokens")
    }


    console.log(createdUser)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { tokens: { accessToken, refreshToken }, user: createdUser }, "User registered Successfully")
        )

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!(email || password)) {
        throw new ApiError(404, "User or Password is required")
    }

    const user = await User.findOne({
        $or: [{ email }]
    })

    if (!user) {
        throw new ApiError("User does't exist");

    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Password");

    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    console.log(user)

    const loggedInUser = await User.findById(user._id).select("-password -accessToken -refreshToken")


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in Successfully")
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $unset: {
            accessToken: 1,
            refreshToken: 1,
        }
    },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized request");
    }

    console.log(incomingRefreshToken);

    try {
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        console.log(decodedToken);

        const user = await User.findById(decodedToken?._id)
        console.log(user)

        if (!user) {
            throw new ApiError(401, "Invalid refreshToken-> ");

        }

        if (incomingRefreshToken != user.refreshToken) {
            throw new ApiError(401, "Refresh token is expire or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken }, "AccessToken Refreshed"))

    } catch (error) {
        throw new ApiError(401, "Try file with this error->" + error?.message);
    }
})


const changeUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(400, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched Successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, userName } = req.body
    if (!fullName && !userName) {
        throw new ApiError(400, "Fields required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                userName: userName,
            }
        },
        { new: true }
    ).select("-password -accessToken -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))


})


export { registerUser, loginUser, logoutUser, refreshAccessToken, changeUserPassword, getCurrentUser, updateAccountDetails }