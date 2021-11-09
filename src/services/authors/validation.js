import { body } from "express-validator"

export const authorsValidation = [
    body("name").exists().withMessage("Name is required"),
    body("surname").exists().withMessage("Surname is required"),
    body("email").exists().withMessage("Email is required").isEmail().withMessage("Email is not in the right format")
]
