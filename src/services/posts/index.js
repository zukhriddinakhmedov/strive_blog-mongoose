import express from "express"
import createHttpError from "http-errors"
import { pipeline } from "stream"
import { getPdfReadableStream } from "../../library/pdf-tools.js"
import { sendNewPostEmail } from "../../library/email-tools.js"
import BlogPostModel from "./schema.js"
import CommentModel from "../comments/schema.js"


const postsRouter = express.Router()

postsRouter.get("/", async (req, res, next) => {
    try {
        const posts = await BlogPostModel.find()

        res.send(posts)
    } catch (error) {
        next(error)
    }
})
postsRouter.get("/:id/pdf", async (req, res, next) => {
    try {
        const posts = await readPosts()
        const post = posts.find((post) => post.id === req.params.id)
        if (!post) {
            res
                .status(404)
                .send({ message: `blog with ${req.params.id} is not found` })
        }
        const pdfStream = await getPdfReadableStream(post)
        res.setHeader("Content-Type", "application/pdf")
        pipeline(pdfStream, res, err => {
            if (err) next(err)
        })
    } catch (error) {
        next(error)
    }
})
postsRouter.post("/",  async (req, res, next) => {
    try {
        const newPost = new BlogPostModel(req.body)

        const {_id} = await newPost.save()
        res.status(201).send({_id})
    } catch (error) {
        next(error)
    }
})
postsRouter.get("/:postId", async (req, res, next) => {
    try {
        const id = req.params.postId
        const post = await BlogPostModel.findById(id)
        if(post) {
            res.send(post)
        }else{
            next(createHttpError(404, `Post with id ${id} is not found`))
        }
    } catch (error) {
        console.log("Error", error)
        next(error)
    }
})
postsRouter.put("/:postId", async (req, res, next) => {
    try {
       const id = req.params.postId
       const updatedPost = await BlogPostModel.findByIdAndUpdate(id, req.body, {new: true} )
       
       if(updatedPost) {
           res.send(updatedPost)
       }else{
           next(createHttpError(404, `Post with id ${id} is not found`))
       }
    } catch (error) {
        next(error)
    }
})
postsRouter.delete("/:postId", async (req, res, next) => {
    try {
        const id = req.params.postId
        const deletedPost = await BlogPostModel.findByIdAndDelete(id)
        if(deletedPost) {
            res.status(204).send()
        }else{
            next(createHttpError(404, `Post with id ${id} is not found`))
        }
    } catch (error) {
        next(error)
    }
})

postsRouter.post("/email", async (req, res, next) => {
    try {
        const { email } = req.body

        await sendNewPostEmail(email)

        res.send("email has been sent")
    } catch (error) {
        next(error)
    }
})

postsRouter.get("/:postId/comments",async (req,res,next) => {
    try {
        const posts = await BlogPostModel.findById(req.params.postId)
        if(posts) {
            res.send(posts)
        }else{
            next(createHttpError(404, `Blog post with id ${req.params.postId} is not found`))
        }
    } catch (error) {
        next(error)
    }
})

postsRouter.post("/:postId/comments", async (req,res,next) => {
        try {
            const commented = await CommentModel.findById(req.body.commentId, {_id: 0} )

            if(commented) {
                const commentToPost = {...commented.toObject(), commentDate: new Date() }

                const updatedPost = await BlogPostModel.findByIdAndUpdate(
                    req.params.postId,
                    {$push: {comments: commentToPost} },
                    {new: true}
                )
                if(updatedPost){
                    res.send(updatedPost)
                }else{
                    next(createHttpError(404, `Blog post with ${req.params.postId} is not found`))
                }
            }else{
                next(createHttpError(404, `Comment with id ${req.body.commentId} is not found`))
            }
        } catch (error) {
            next(error)
        }
    } 
)

export default postsRouter