import mongoose from "mongoose"

const {Schema , model } = mongoose

const commentSchema = new Schema ({
    text: {type: String, required: true},
    rank: {type: Number},
},
{
    timestamps: true
}
)

export default model("Comment", commentSchema)