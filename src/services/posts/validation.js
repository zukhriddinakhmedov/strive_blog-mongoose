import { body } from "express-validator"

export const postsValidation = [
    body("category").exists().withMessage("Please add the category"),
    body("title").exists().withMessage("Please add the title for your post"),
    body("cover").exists().withMessage("Please add the image for your blog post"),
    body("readTime").exists().withMessage("Please add the read time"),
    body("author").exists().withMessage("Please add the name and avatar for the author"),
    body("content").exists().withMessage("Please add content for your blog post")
]