import express from "express"
import uniqid from "uniqid"
import createHttpError from "http-errors"
import { validationResult } from "express-validator"
import { authorsValidation } from "./validation.js"
import { readAuthors, writeAuthors } from "../../library/fs-tools.js"
import { getAuthorsReadableStream } from "../../library/fs-tools.js"
import json2csv from "json2csv"
import { pipeline } from "stream"

const authorsRouter = express.Router()


authorsRouter.get("/", async (req, res, next) => {
    try {
        const authors = await readAuthors()
        res.send(authors)
    } catch (error) {
        next(error)
    }
})

authorsRouter.get("/downloadCsv", (req, res, next) => {
    try {
        res.setHeader("Content-Disposition", "attachment; filename=authors.csv")
        const source = getAuthorsReadableStream()
        const transform = new json2csv.Transform({ fields: ["name", "surname", "email"] })
        const destination = res

        pipeline(source, transform, destination, err => {
            if (err) next(err)
        })
    } catch (error) {
        next(error)
    }
})
authorsRouter.post("/", authorsValidation, async (req, res, next) => {
    try {
        const errorList = validationResult(req)

        if (!errorList.isEmpty()) {
            NotExtended(createHttpError(400, { errorList }))
        } else {
            const newAuthor = {
                ...req.body, id: uniqid(),
                createdAt: new Date(),
            }
            const authors = await readAuthors()

            authors.push(newAuthor)
            await writeAuthors(authors)

            res.status(201).send({ id: newAuthor.id })
        }
    } catch (error) {
        next(error)
    }

})
// authorsRouter.post("/checkEmail", (req, res) => {
//     const { name, surname, email, dateOfBirth } = req.body
//     const newAuthor = {
//         id: uniqid(),
//         name,
//         surname,
//         email,
//         dateOfBirth,
//         createdAt: new Date(),
//     }
//     const authors = JSON.parse(fs.readFileSync(authorsFilePath).toString())
//     const emailIsThere = authors.some(
//         author => author.email === req.body.email)
//     if (emailIsThere) {
//         res.send(`Sorry the email is already in use ${false}`)
//     } else {
//         authors.push(newAuthor)
//         fs.writeFileSync(authorsJsonPath, JSON.stringify(authors))
//         return res.send(true)
//     }
// })
authorsRouter.get("/:authorId", async (req, res, next) => {
    try {
        const authors = readAuthors()

        const author = authors.find(author => author.id === req.params.authorId)
        if (author) {
            res.send(author)
        } else {
            next(createHttpError(404, `Author with id ${req.params.authorId} is not found`))
        }
    } catch (error) {
        next(error)
    }
})
authorsRouter.put("/:authorId", async (req, res, next) => {
    try {
        const authors = readAuthors()
        const indexOfAuthor = authors.findIndex(author => author.id === req.params.authorId)
        const updatedAuthor = { ...authors[indexOfAuthor], ...req.body }

        authors[indexOfAuthor] = updatedAuthor

        fs.writeFileSync(authorsJsonPath, JSON.stringify(authors))

        res.send(updatedAuthor)
    } catch (error) {
        next(error)
    }
})
authorsRouter.delete("/:authorId", async (req, res, next) => {
    try {
        const authors = readAuthors()
        const filteredAuthors = authors.filter(author => author.id !== req.params.authorId)
        fs.writeFileSync(authorsJsonPath, JSON.stringify(filteredAuthors))

        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default authorsRouter