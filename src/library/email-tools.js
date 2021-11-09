import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_KEY)

export const sendNewPostEmail = async recipientAddress => {
    const message = {
        to: recipientAddress,
        from: process.env.SENDER_EMAIL,
        subject: "New post has been posted",
        text: `Hello dear {author.name} new post has been posted and now it is live`
    }

    await sgMail.send(message)
}