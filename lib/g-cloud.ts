/* eslint-disable camelcase */
"use server"
import { Storage } from '@google-cloud/storage'
import { uniqueId } from 'lodash';

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
    uniqueId: string
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
        } else {
            console.log(`File ${filename} does not exist. Creating...`)

            // create new unique file (name <uniqueId>-<filename>)
            // unique id avoids files having the same name
            filename = `${image.uniqueId}-${image.name}`
            file = bucket.file(filename)
        }

        // Convert the base64 image data to a Buffer
        const buffer = Buffer.from(image.data, 'base64')

        // Save or overwrite the file
        await file.save(buffer, {
            contentType: image.type,
            metadata: {
                cacheControl: 'public, max-age=31536000', // Set cache control for public files
            },
        })

        // Public URL for the file
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`

        return imageUrl
    } catch (e) {
        console.error('Failed to upload or update image:', e)
    }
}

// export async function uploadPublicImg(image: {
//     name: string
//     type: string
//     data: string
// } | undefined) {
//     if (!image) return

//     try {
//         const keyFileJson = JSON.parse(
//             process.env.G_CLOUD_KEY || ""
//         )
//         const storage = new Storage({
//             projectId: keyFileJson.project_id,
//             credentials: {
//                 client_email: keyFileJson.client_email,
//                 private_key: keyFileJson.private_key
//             }
//         })
//         const bucket = storage.bucket('comend-app-public')

//         const filename = `${Date.now()}-${image.name}`
//         const file = bucket.file(filename)
//         const buffer = Buffer.from(image.data, "base64")

//         await file.save(buffer, { 
//             contentType: image.type
//         })

//         // public url
//         const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`

//         return imageUrl
//     } catch (e) {
//         console.error("Failed to upload image:", e)
//     }
// }

// export async function fetchImageAsBase64(url: string | null): Promise<string | undefined> {
//     try {
//         if (!url) return

//         // Fetch the image data
//         const response = await fetch(url);

//         // Ensure the response is OK
//         if (!response.ok) {
//             throw new Error(`Failed to fetch image. Status: ${response.status}`);
//         }

//         // Read the response as a Blob
//         const blob = await response.blob();

//         // Convert the Blob to a base64 string
//         return await new Promise((resolve, reject) => {
//             const reader = new FileReader()
//             reader.onloadend = () => {
//                 // resolve(reader?.result?.split(",")[1]); // Remove data URL prefix
//                 resolve(reader?.result as string)
//             }
//             reader.onerror = reject;
//             reader.readAsDataURL(blob);
//         });
//     } catch (error) {
//         console.error("Error fetching base64 image data:", error);
//         throw error;
//     }
// }

// ACCESS TO PUBLIC/PRIVATE BUCKET
// export class GCloudPublicPrivateBucket {
    
//     async uploadFile(bucketName: string, filePath: string, destination: string, isPublic: boolean) {
//         const options: any = {
//             destination,
//             metadata: {
//                 cacheControl: 'no-cache',
//             },
//         };
    
//         if (isPublic) {
//             options.metadata = { ...options.metadata, predefinedAcl: 'publicRead' };
//         }
    
//         await storage.bucket(bucketName).upload(filePath, options);
//         console.log(`${filePath} uploaded to ${bucketName}`);
//     }
    
//     // async generateSignedUrl(bucketName: string, fileName: string, expiresInSeconds: number) {
//     //     const options = {
//     //         version: 'v4',
//     //         action: 'read',
//     //         expires: Date.now() + expiresInSeconds * 1000, // e.g., 15 minutes
//     //     };
    
//     //     const [url] = await storage
//     //         .bucket(bucketName)
//     //         .file(fileName)
//     //         .getSignedUrl(options);
    
//     //     console.log(`Signed URL: ${url}`);
//     //     return url;
//     // }
    
//     // Usage:
//     // toggleFileAccess('my-bucket', 'path/to/file.txt', true); // Make public
//     // toggleFileAccess('my-bucket', 'path/to/file.txt', false); // Make private
//     async toggleFileAccess(bucketName: string, fileName: string, makePublic: boolean) {
//         const file = storage.bucket(bucketName).file(fileName);
    
//         if (makePublic) {
//             await file.makePublic();
//             console.log(`${fileName} is now public.`);
//         } else {
//             await file.makePrivate({ strict: true });
//             console.log(`${fileName} is now private.`);
//         }
//     }
// }