import mongoose from "mongoose"

const {Schema, model} = mongoose
const AuthorSchema = new Schema({
    name: {type: String, required: true },
    avatar: {type: String, required: true}
},
{
    timestamps: true
}
)

export default model("Author", AuthorSchema)