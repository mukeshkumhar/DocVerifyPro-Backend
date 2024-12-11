import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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
    const { fullName, userName, email, password } = req.body

    if ([fullName, userName, email, password].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "All field are required")
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