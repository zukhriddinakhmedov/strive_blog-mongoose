import PdfPrinter from "pdfmake"
import axios from "axios"
import striptags from "striptags"

const fonts = {
    Roboto: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
    },
}
const printer = new PdfPrinter(fonts)


export const getPdfReadableStream = async (post) => {
    let imagePart = {}
    if (post.cover) {
        const response = await axios.get(post.cover, {
            responseType: "arraybuffer",
        })
        const postCoverUrlParts = post.cover.split("/")
        const filename = postCoverUrlParts[postCoverUrlParts.length - 1]
        const [id, extension] = filename.split(".")
        const base64 = response.data.toString("base64")
        const base64Image = `data:image/${extension};base64,${base64}`
        imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] }
    }


    const docDefinition = {
        content: [
            imagePart,
            { text: post.category, style: "header", margin: [0, 0, 0, 40] },
            { text: post.title, style: "subHeader" },
            { text: striptags(post.content), lineHeight: 2, style: "subHeader" }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
            },
            subHeader: {
                fontSize: 14,
                bold: false
            }
        }
    }


    const pdfReadableStream = printer.createPdfKitDocument(docDefinition)

    pdfReadableStream.end()
    return pdfReadableStream
}
