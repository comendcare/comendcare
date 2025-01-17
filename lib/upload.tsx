"use client"

import { uploadImg } from "./g-cloud"

export async function handleImageUpload(file: File, data: string | undefined): Promise<string | undefined> {
    // return new Promise((resolve, reject) => {
    //     const reader = new FileReader()
    //     reader.readAsDataURL(file)

    //     reader.onloadend = async () => {
    //         if (data == undefined) {
    //             reject('No image data')
    //             return
    //         }

    //         const base64data = data.replace(/^data:image\/\w+;base64,/, "")

    //         const imageUrl = await uploadImg({
    //             name: file.name,
    //             type: file.type,
    //             data: base64data || "",
    //         })

    //         console.log(`image url`, imageUrl)
    //         resolve(imageUrl)
    //     }

    //     reader.onerror = error => {
    //         reject(error)
    //     }
    // })


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