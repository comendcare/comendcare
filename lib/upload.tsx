"use client"

import { deleteImg, uploadImg } from "./g-cloud"
import { getPublicFile } from "./utils"

export async function handleImageDelete(url: string) {
    try {
        const file: File = await getPublicFile(url)
        await deleteImg({
            name: file.name
        })
    } catch (e) {
        console.error(e)
    }
}

export async function handleImageUpload(file: File, data: string | undefined): Promise<string | undefined> {
    if (data == undefined) {
        console.error('No image data')
        return
    }

    const base64data = data.replace(/^data:image\/\w+;base64,/, "")
    const imageUrl = await uploadImg({
        name: file.name,
        type: file.type,
        data: base64data || "",
    })

    console.log(`image url`, imageUrl)
    return(imageUrl)
}