import express from "express"
import AuthorModel from "./schema.js"

const authorsRouter = express.Router()

authorsRouter.post("/", async (req,res,next) => {
    try {
        const author = new AuthorModel(req.body)
        const {_id} = await author.save()
        
        res.status(201).send(_id)
    } catch (error) {
        next(error)
    }
})

export default authorsRouter