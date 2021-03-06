import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import { join } from "path"
import postsRouter from "./services/posts/index.js"
import filesRouter from "./services/files/index.js"
import { badRequestHandler, unauthorisedErrorHandler, notFoundHandler, internaServerlErrorHandler } from "./errorHandlers.js"
import yaml from "yamljs"
import swaggerUI from "swagger-ui-express"
import mongoose from "mongoose"
import authorsRouter from "./services/authors/index.js"

const server = express()

const publicFolderPath = join(process.cwd(), "/public")

const yamlDocument = yaml.load(join(process.cwd(), "./src/yml.yml"))
// --------------------------GLOBAL MIDDLEWARES----------------------
const whitelist = [process.env.FE_LOCAL_URL, process.env.FE_PROD_URL]
const corsOpts = {
    origin: function (origin, next) {
        console.log("Current origin: ", origin)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            next(null, true)
        } else {
            next(new Error("The error occured with cors"))
        }
    }
}

server.use(express.static(publicFolderPath))
server.use(cors(corsOpts))
server.use(express.json())

// ---------------------------ENDPOINTS----------------------
server.use("/posts", postsRouter)
server.use("/authors", authorsRouter)
server.use("/files", filesRouter)
server.use("/docs", swaggerUI.serve, swaggerUI.setup(yamlDocument))
// --------------------------ERROR MIDDLEWARES--------------------
server.use(badRequestHandler)
server.use(unauthorisedErrorHandler)
server.use(notFoundHandler)
server.use(internaServerlErrorHandler)

const port = process.env.PORT

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
    console.log("Mongo Connected")

    server.listen(port, () => {
        console.table(listEndpoints(server))

        console.log(`Server is running on port ${port}`)
    })
})

mongoose.connection.on("error", err => {
    console.log(err)
})