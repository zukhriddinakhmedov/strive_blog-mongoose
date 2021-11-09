import express from "express"
import uniqid from "uniqid"
import createHttpError from "http-errors"
import { validationResult } from "express-validator"
import { postsValidation } from "./validation.js"
import { readPosts, writePost } from "../../library/fs-tools.js"
import { pipeline } from "stream"
import { getPdfReadableStream } from "../../library/pdf-tools.js"
import { sendNewPostEmail } from "../../library/email-tools.js"


const postsRouter = express.Router()

postsRouter.get("/", async (req, res, next) => {
    try {
        const posts = await readPosts()
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
postsRouter.post("/", postsValidation, async (req, res, next) => {
    try {
        const notValidated = validationResult(req)

        if (!notValidated.isEmpty()) {
            next(createHttpError(400, { notValidated }))
        } else {
            const newPost = { ...req.body, createdAt: new Date(), id: uniqid() }
            const posts = await readPosts()

            posts.push(newPost)

            await writePost(posts)
            res.status(201).send({ id: newPost.id })
        }
    } catch (error) {
        next(error)
    }
})
postsRouter.get("/:postId", async (req, res, next) => {
    try {
        const posts = await readPosts()
        const post = posts.find(post => post.id === req.params.postId)
        if (post) {
            res.send(post)
        } else {
            next(createHttpError(404), `Post with id  of ${req.params.postId} is not found`)
        }
    } catch (error) {
        next(error)
    }
})
postsRouter.put("/:postId", async (req, res, next) => {
    try {
        const posts = await readPosts()
        const index = posts.findIndex(post => post.id === req.params.postId)
        const postToEdit = posts[index]

        const updatedParams = req.body
        const updatedPost = { ...postToEdit, ...updatedParams }

        posts[index] = updatedPost

        await writePost(posts)
        res.send(updatedPost)
    } catch (error) {
        next(error)
    }
})
postsRouter.delete("/:postId", async (req, res, next) => {
    try {
        const posts = await readPosts()
        const notdeletedPost = posts.filter(post => post.id !== req.params.postId)

        await writePost(notdeletedPost)

        res.status(204).send()

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

export default postsRouter