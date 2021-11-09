import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { createReadStream } from "fs"

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")

const postsJsonPath = join(dataFolderPath, "posts.json")
const authorsJsonPath = join(dataFolderPath, "authors.json")
const authorFolderPath = join(process.cwd(), "./public/img/authors")
const postsFolderPath = join(process.cwd(), "./public/img/blogPosts")

export const readPosts = () => readJSON(postsJsonPath)
export const writePost = posts => writeJSON(postsJsonPath, posts)
export const readAuthors = () => readJSON(authorsJsonPath)
export const writeAuthors = authors => writeJSON(authorsJsonPath, authors)

export const saveAvatar = (fileName, contentAsBuffer) => writeFile(join(authorFolderPath, fileName), contentAsBuffer)
export const saveCover = (fileName, contentAsBuffer) => writeFile(join(postsFolderPath, fileName), contentAsBuffer)
export const saveAuthorPictures = (fileName, contentAsBuffer) => writeFile(join(publicFolderPath, fileName), contentAsBuffer)

export const getAuthorsReadableStream = () => createReadStream(authorsJsonPath)