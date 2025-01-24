"use client"

import React from "react"
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    type Crop,
    type PixelCrop,
} from "react-image-crop"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"

import "react-image-crop/dist/ReactCrop.css"
import { CropIcon, Trash2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export type FileWithPreview = File & { preview: string }

interface ImageCropperProps {
    dialogOpen: boolean
    setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    selectedFile: FileWithPreview | null
    setSelectedFile: (file: FileWithPreview | null) => void,
    aspect: number,
    className?: string
}

export function ImageCropper({
                                 dialogOpen,
                                 setDialogOpen,
                                 selectedFile,
                                 setSelectedFile,
                                 aspect,
                                 className = ""
                             }: ImageCropperProps) {
    const imgRef = React.useRef<HTMLImageElement | null>(null)

    const [crop, setCrop] = React.useState<Crop>()
    const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>("")
    const [croppedImage, setCroppedImage] = React.useState<string>("")

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }

    function onCropComplete(crop: PixelCrop) {
        if (imgRef.current && crop.width && crop.height) {
            const croppedImageUrl = getCroppedImg(imgRef.current, crop)
            setCroppedImageUrl(croppedImageUrl)
        }
    }

    function getCroppedImg(
        image: HTMLImageElement,
        crop: PixelCrop,
        format: "image/jpeg" | "image/jpg" | "image/png" = "image/jpeg", // Use JPEG by default
        quality: number = 0.8 // Set a lower quality for lossy formats
    ): string {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
    
        // Set canvas dimensions based on the crop size and image scaling
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
    
        const ctx = canvas.getContext("2d");
    
        if (ctx) {
            // Disable image smoothing for pixel-perfect results (optional)
            ctx.imageSmoothingEnabled = false;
    
            // Draw the cropped image onto the canvas
            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width * scaleX,
                crop.height * scaleY
            );
        }
    
        // Return the cropped image as a data URL with the specified format and quality
        return canvas.toDataURL(format, quality);
    }

    // function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    //     const canvas = document.createElement("canvas")
    //     const scaleX = image.naturalWidth / image.width
    //     const scaleY = image.naturalHeight / image.height

    //     canvas.width = crop.width * scaleX
    //     canvas.height = crop.height * scaleY

    //     const ctx = canvas.getContext("2d")

    //     if (ctx) {
    //         ctx.imageSmoothingEnabled = false

    //         ctx.drawImage(
    //             image,
    //             crop.x * scaleX,
    //             crop.y * scaleY,
    //             crop.width * scaleX,
    //             crop.height * scaleY,
    //             0,
    //             0,
    //             crop.width * scaleX,
    //             crop.height * scaleY,
    //         )
    //     }

    //     return canvas.toDataURL("image/png", 1.0)
    // }

    async function onCrop() {
        try {
            setCroppedImage(croppedImageUrl)
            setDialogOpen(false)

            if (!selectedFile) throw Error('No selected file')
 
            const newSelectedFile = Object.assign(selectedFile, {
                preview: croppedImageUrl
            })

            setSelectedFile(newSelectedFile)
        } catch (error) {
            console.error(`Error`, error)
            alert("Something went wrong!")
        }
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
                <Avatar className={cn("size-36 cursor-pointer ring-offset-2 ring-2 ring-slate-200", className)}>
                    <AvatarImage
                        src={croppedImage ? croppedImage : selectedFile?.preview}
                        alt="@shadcn"
                        className={cn("object-cover", className)}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </DialogTrigger>
            <DialogContent className="p-0 gap-0">
                <div className="p-6 size-full">
                    <ReactCrop
                        crop={crop}
                        onComplete={(c) => onCropComplete(c)}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        aspect={aspect}
                        className="w-full"
                    >
                        <img
                            className="w-full"
                            ref={imgRef}
                            src={selectedFile?.preview}
                            onLoad={onImageLoad}
                        />
                    </ReactCrop>
                </div>
                <DialogFooter className="p-6 pt-0 justify-center ">
                    <DialogClose asChild>
                        <Button
                            size={"sm"}
                            type="reset"
                            className="w-fit"
                            variant={"outline"}
                            onClick={() => {
                                setSelectedFile(null)
                            }}
                        >
                            <Trash2Icon className="mr-1.5 size-4" />
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" size={"sm"} className="w-fit" onClick={onCrop}>
                        <CropIcon className="mr-1.5 size-4" />
                        Crop
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Helper function to center the crop
export function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
): Crop {
    return centerCrop(
        makeAspectCrop(
            {
                unit: "%",
                width: 50,
                height: 50,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}