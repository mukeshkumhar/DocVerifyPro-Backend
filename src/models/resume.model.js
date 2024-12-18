import mongoose, { Schema } from "mongoose";



const resumeSchema = new mongoose.Schema({

    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    matchScore: {
        type: Number,
        default: 0
    },
    matchedSkills: [
        {
            type: String,
        }
    ],
    profileSummary: {
        type: String,
    }
})


export const Resume = mongoose.model("Resume", resumeSchema)