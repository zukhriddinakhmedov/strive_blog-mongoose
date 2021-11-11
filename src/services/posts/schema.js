import mongoose from "mongoose"

const {Schema, model} = mongoose

const BlogPostsSchema = new Schema({
    category: {type: String, required: true},
    title: { type: String, required: true},
    cover: { type: String, required: true},
    readTime : {
        value: {type: Number},
        unit: {type: String}
    },
    author: [{type: Schema.Types.ObjectId, ref: "Author"}],
    content: {type: String, required: true},
    comment: [
        {
            text: {type: String},
            rank: {type: Number},
            commentDate: {type: Date},
        }
    ]
},
{
    timestamps: true
}
)

export default model("BlogPost", BlogPostsSchema)