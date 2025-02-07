import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Resume } from "../models/resume.model.js";
import mongoose from "mongoose"

const resumeDetails = asyncHandler(async (req, res) => {
    const { name, contact, email, address, percentage } = req.body;

    const user = await User.findById(req.user?._id)


    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (!name || !contact || !email || !address || !percentage) {
        throw new ApiError(400, "All fields are required")
    }
    console.log(user?._id)

    const newResume = await Resume.create({
        name,
        contact,
        email,
        address,
        percentage,
        ownerId: user?._id,
    });

    if (!newResume) {
        throw new ApiError(500, "Failed to create resume")
    }

    const createdResume = await Resume.findById(newResume._id)

    user.resumeDetail.push(createdResume._id)
    await user.save();

    return res
        .status(201)
        .json(new ApiResponse(200, createdResume , "Resume created successfully"));
})

const AddProject = asyncHandler(async (req, res) => {
    const { projectName, projectSummary, resumeId } = req.body;

    const resume = await Resume.findById(resumeId)

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    resume.projects.push({projectName, projectSummary});

    await resume.save();
    return res
        .status(201)
        .json(new ApiResponse(200, resume , "project added successfully"));
})

const GetProjects = asyncHandler(async (req, res) => {
    const ownerId = req.user._id
    const resume = await Resume.find({ownerId})

    if (!resume) {
        throw new ApiError(404, "Resume not found");
    }

    return res 
    .status(200)
    .json(new ApiResponse(200, resume, "Resume fetched successfully"));

})


export { resumeDetails, AddProject, GetProjects };  // export the function to use in other files  // export