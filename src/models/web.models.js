import mongoose, { Schema } from "mongoose";



const webSchema = new mongoose.Schema({

    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    webUrl: {
        type: String,
    },
    matchedSkills:[
        {
            type: String,
        }
    ],
    profileSummary: {
        type: String,
    }
})

export const Webcheck = mongoose.model("Webcheck", webSchema)