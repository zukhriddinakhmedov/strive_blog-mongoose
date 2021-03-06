import express from "express"
import createHttpError from "http-errors"
import { pipeline } from "stream"
import { getPdfReadableStream } from "../../library/pdf-tools.js"
import { sendNewPostEmail } from "../../library/email-tools.js"
import BlogPostModel from "./schema.js"
import CommentModel from "../comments/schema.js"
import q2m from "query-to-mongo"


const postsRouter = express.Router()

postsRouter.get("/", async (req, res, next) => {
    try {
        const mongoQuery = q2m(req.query)
        console.log(mongoQuery)
        const total = await BlogPostModel.countDocuments(mongoQuery.criteria)
        const posts = await BlogPostModel.find(mongoQuery.criteria)
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)
        .populate({path: "author"})
        res.send({links: mongoQuery.links("/posts", total ), pageTotal: Math.ceil(total/ mongoQuery.options.limit), total, posts})
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
        .populate({path: "author"})
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
                const commentToPost = {...req.body, commentDate: new Date() }

                const updatedPost = await BlogPostModel.findByIdAndUpdate(
                    req.params.postId,
                    {$push: {comment: commentToPost} },
                    {new: true}
                )
                if(updatedPost){
                    res.send(updatedPost)
                }else{
                    next(createHttpError(404, `Blog post with ${req.params.postId} is not found`))
                }
        } catch (error) {
            next(error)
        }
    } 
)

postsRouter.get("/:postId/comments/:commentId", async (req,res,next) => {
    try {
        const post = await BlogPostModel.findById(req.params.postId)
        if(post) {
            const postedComment = post.comment.find(c => c._id.toString() === req.params.commentId)
            if(postedComment) {
                res.send(postedComment)
            }else{
                next(createHttpError(404, `Comment with id ${req.params.commentId} is not found`) )
            }
        }else{
            next(createHttpError(404,` Post with id ${req.params.postId} is not found`))
        }
    } catch (error) {
        next(error)
    }
})

postsRouter.put("/:postId/comments/:commentId", async (req,res,next) => {
    try {
        const post = await BlogPostModel.findById(req.params.postId)

        if(post) {
            const index = post.comment.findIndex(p => p._id.toString() === req.params.commentId)

            if(index !== -1) {
                post.comment[index] = {... post.comment[index].toObject(), ...req.body}
                await post.save()
                res.send(post)
            }else{
                next(createHttpError(404, `Comment with id ${req.params.commentId} is not found`))
            }
        }else{
            next(createHttpError(404, `Post with id ${req.params.postId} is not found`))
        }
    } catch (error) {
        next(error)
    }
})

postsRouter.delete("/:postId/comments/:commentId", async (req,res,next) => {
    try {
        const postToEdit = await BlogPostModel.findByIdAndUpdate(
            req.params.postId,
            {$pull: {comment: {_id: req.params.commentId}}},
            {new: true}
        )
        if(postToEdit) {
            res.send(postToEdit)
        }else{
            next(createHttpError(404, `Post with id ${req.params.postId} is not found`))
        }
    } catch (error) {
        next(error)
    }
})

export default postsRouter