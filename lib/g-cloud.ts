/* eslint-disable camelcase */
"use server"
import { Storage } from '@google-cloud/storage'
// import fetch from 'node-fetch'

/* 
    Google cloud, public only bucket.
    Use this bucket for files that will always be public (e.g. Organization Profile Photos)
*/
export async function handleImageUpload(file: File, data: string | undefined): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onloadend = async () => {
            if (data == undefined) {
                reject('No image data')
                return
            }

            const base64data = data.replace(/^data:image\/\w+;base64,/, "")

            const imageUrl = await uploadPublicImg({
                name: file.name,
                type: file.type,
                data: base64data || ""
            })

            resolve(imageUrl)
        }

        reader.onerror = error => {
            reject(error)
        }
    })
}

export async function uploadPublicImg(image: {
    name: string
    type: string
    data: string
} | undefined) {
    if (!image) return

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