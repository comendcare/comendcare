/* eslint-disable camelcase */
"use server"

import { Storage } from "@google-cloud/storage"

export async function uploadImg(image: {
    name: string
    type: string
    data: string
}) {
    try {
        const keyFileJson = JSON.parse(
            process.env.G_CLOUD_KEY || ''
        )
        const storage = new Storage({
            projectId: keyFileJson.project_id,
            credentials: {
                client_email: keyFileJson.client_email,
                private_key: keyFileJson.private_key
            }
        })
        const bucket = storage.bucket('comend-app-public')

        const filename = `${Date.now()}-${image.name}`
        const file = bucket.file(filename)
        const buffer = Buffer.from(image.data, "base64")

        await file.save(buffer, {
            contentType: image.type
        })

        // public url
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`

        return imageUrl
    } catch (e) {
        console.error("Failed to upload image:", e)
    }
}

export async function uploadFeedbackImg(image: {
    name: string
    type: string
    data: string
}) {
    try {
        const keyFileJson = JSON.parse(
            process.env.G_CLOUD_KEY || ""
        )
        const storage = new Storage({
            projectId: keyFileJson.project_id,
            credentials: {
                client_email: keyFileJson.client_email,
                private_key: keyFileJson.private_key
            }
        })
        const bucket = storage.bucket("comend-app-feedback")

        const filename = `${Date.now()}-${image.name}`
        const file = bucket.file(filename)
        const buffer = Buffer.from(image.data, "base64")

        await file.save(buffer, {
            contentType: image.type
        })

        // public url
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`

        return imageUrl
    } catch (e) {
        console.error("Failed to upload image:", e)
    }
}

// export async function uploadOrUpdatePublicImg(image: {
//     name: string
//     type: string
//     data: string
// }) {
//     try {
//         // Parse credentials from environment variable
//         const keyFileJson = JSON.parse(process.env.G_CLOUD_KEY || '')

//         // Initialize Google Cloud Storage
//         const storage = new Storage({
//             projectId: keyFileJson.project_id,
//             credentials: {
//                 client_email: keyFileJson.client_email,
//                 private_key: keyFileJson.private_key,
//             },
//         })

//         // Reference the target bucket
//         const bucket = storage.bucket('comend-app-public')

//         // Use the original image name for the file in the bucket
//         let filename = image.name
//         let file = bucket.file(filename)

//         // Check if the file already exists
//         const [exists] = await file.exists()

//         if (exists) {
//             console.log(`File ${filename} already exists. Updating...`)
//             file.delete() // delete old profile photo
//         } else {
//             console.log(`File ${filename} does not exist. Creating...`)

//             // create new unique file (name <uniqueId>-<filename>)
//             // unique id avoids files having the same name
//             filename = `${Date.now()}-${image.name}`
//             file = bucket.file(filename)
//         }

//         // Convert the base64 image data to a Buffer
//         const buffer = Buffer.from(image.data, 'base64')

//         // Save or overwrite the file
//         await file.save(buffer, {
//             contentType: image.type,
//             metadata: {
//                 cacheControl: 'no-cache, no-store, must-revalidate, max-age=31536000', // Set cache control for public files
//             },
//         })

//         // Public URL for the file
//         const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`

//         return imageUrl
//     } catch (e) {
//         console.error('Failed to upload or update image:', e)
//     }
// }