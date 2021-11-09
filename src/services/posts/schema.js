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
    author: {
        name: {type: String, required: true},
        avatar: {type: String, required: true}
    },
    content: {type: String, required: true}
},{
    timestamps: true
}
)

export default model("BlogPost", BlogPostsSchema)