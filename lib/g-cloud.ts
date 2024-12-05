/* eslint-disable camelcase */
"use server"
import { Storage } from '@google-cloud/storage'
import { uniqueId } from 'lodash';
import { nanoid } from 'nanoid';

/* 
    Google cloud, public only bucket.
    Use this bucket for files that will always be public (e.g. Organization Profile Photos)
*/
export async function fetchPublicFile(fileUrl: string) {
    try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        // Serialize the data into base64
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const fileName = fileUrl.split('/').pop() || 'unknown';

        return {
            name: fileName,
            type: blob.type,
            data: base64Data
        }
        } catch (error) {
        console.error('Error fetching file:', error)
        throw Error('Error fetching file')
    }
}

export async function uploadOrUpdatePublicImg(image: {
    name: string
    type: string
    data: string
} | undefined) {
    if (!image) return

    try {
        // Parse credentials from environment variable
        const keyFileJson = JSON.parse(process.env.G_CLOUD_KEY || '')

        // Initialize Google Cloud Storage
        const storage = new Storage({
            projectId: keyFileJson.project_id,
            credentials: {
                client_email: keyFileJson.client_email,
                private_key: keyFileJson.private_key,
            },
        })

        // Reference the target bucket
        const bucket = storage.bucket('comend-app-public')

        // Use the original image name for the file in the bucket
        let filename = image.name
        let file = bucket.file(filename)

        // Check if the file already exists
        const [exists] = await file.exists()

        if (exists) {
            console.log(`File ${filename} already exists. Updating...`)
            file.delete() // delete old profile photo
        } else {
            console.log(`File ${filename} does not exist. Creating...`)

            // create new unique file (name <uniqueId>-<filename>)
            // unique id avoids files having the same name
            filename = `${nanoid()}-${image.name}`
            file = bucket.file(filename)
        }

        // Convert the base64 image data to a Buffer
        const buffer = Buffer.from(image.data, 'base64')

        // Save or overwrite the file
        await file.save(buffer, {
            contentType: image.type,
            metadata: {
                cacheControl: 'no-cache, no-store, must-revalidate, max-age=31536000', // Set cache control for public files
            },
        })

        // Public URL for the file
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`

        return imageUrl
    } catch (e) {
        console.error('Failed to upload or update image:', e)
    }
}