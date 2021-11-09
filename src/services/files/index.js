import express from "express"
import multer from "multer"

import { saveAvatar } from "../../library/fs-tools.js"
import { saveCover } from "../../library/fs-tools.js"
import { pipeline } from "stream"

import { getPdfReadableStream } from "../../library/pdf-tools.js"

const filesRouter = express.Router()

filesRouter.post("/:authorId/uploadAvatar", multer().single("avatar"), async (req, res, next) => {
    try {
        console.log(req.file)
        await saveAvatar(req.file.originalname, req.file.buffer)
        res.send("ok")
    } catch (error) {
        next(error)
    }
})

filesRouter.post("/:postId/uploadCover", multer().single("cover"), async (req, res, next) => {
    try {
        await saveCover(req.file.originalname, req.file.buffer)
        res.send("ok")
    } catch (error) {
        next(error)
    }
})

filesRouter.get("/downloadPdf", (req, res, next) => {
    try {
        res.setHeader("Content-Disposition", "attachment; filename=document.pdf")

        const source = getPdfReadableStream({ title: "Zukhriddin" })
        const destination = res
        pipeline(source, destination, err => {
            if (err) next(err)
        })
    } catch (error) {
        next(error)
    }
})

export default filesRouter