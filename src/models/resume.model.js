import mongoose, { Schema } from "mongoose";



const resumeSchema = new mongoose.Schema({

    name: {
        type: String
    },
    contact: {
        type: String
    },
    email: {
        type: String
    },
    address:{
        type: String
    },
    percentage:{
        type: Number,
        default: 0,
    },
    projects:[{
        projectName:{
            type: String,
        },
        projectSummary:{
            type: String,
        },
    }],
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

})


export const Resume = mongoose.model("Resume", resumeSchema)