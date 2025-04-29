"use client"

import React, { useEffect } from "react"
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
import { CropIcon, Image, Pencil, Trash2Icon, Upload } from "lucide-react"
import {acceptedFiletypes, cn, getPublicFile, sleep} from "@/lib/utils";
import { toast } from "sonner"
import {FileWithPath, useDropzone} from "react-dropzone";

export type FileWithPreview = File & { preview: string }

interface ImageSelectorProps {
    selectedFile: FileWithPreview | null
    setSelectedFile: (file: FileWithPreview | null) => void,
    aspect: number,
    className?: string,
    setParentIsCropping: React.Dispatch<React.SetStateAction<boolean>>
}

export function ImageSelector({
    selectedFile,
    setSelectedFile,
    aspect,
    className = "",
    setParentIsCropping
}: ImageSelectorProps) {
    const imgRef = React.useRef<HTMLImageElement | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)

    const [crop, setCrop] = React.useState<Crop>()
    const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>("")
    const [croppedImage, setCroppedImage] = React.useState<string>("")
    const [isCropping, setIsCropping] = React.useState<boolean>(false)
    const [cropFile, setCropFile] = React.useState<FileWithPreview | null>(selectedFile)

    useEffect(() => {
        setParentIsCropping(isCropping)
    }, [isCropping])

    const handleClick = async () => {
        // setSelectedFile(null) // de-select any previously selected file
        // await sleep(100) // allow file de-select to take effect

        fileInputRef.current?.click() // Open file dialog
    }

    const setFileInputRef = (node: HTMLInputElement | null) => {
        if (node) {
            // setIsCropping(false)
            fileInputRef.current = node;
        }
    }

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
    
            // Fill the canvas with a white background
            ctx.fillStyle = "#ffffff"; // Set background color to white
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with white
        
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

    async function onCrop() {
        try {
            setCroppedImage(croppedImageUrl)
            setIsCropping(false)

            if (!cropFile) throw Error('No file selected to crop')
 
            const newSelectedFile = Object.assign(cropFile, {
                preview: croppedImageUrl
            })

            console.log(`onCrop, setSelectedFile`, newSelectedFile)
            setSelectedFile(newSelectedFile)
        } catch (error) {
            console.error(`Error`, error)
            alert("Something went wrong!")
        }
    }

    const onDrop = React.useCallback(
        (acceptedFiles: FileWithPath[]) => {
            const file = acceptedFiles[0];
            if (!file) {
                // toast.error("No file selected!")
                console.error("No file selected!")
                return
            }

            // Additional check to exclude SVG
            if (file.type !== "image/jpg" && file.type !== "image/jpeg" && file.type !== "image/png") {
                toast.error("Only .jpg, .jpeg, and .png files are allowed. Please select a valid image format.")
                console.error("Only .jpg, .jpeg, and .png files are allowed. Please select a valid image format.")
                return
            }

            // Check file size (5 MB limit), image upload size is limited by the next server actions bodySizeLimit
            // defined in next.config.js
            const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
            if (file.size > maxSizeInBytes) {
                toast.error("File size exceeds 5 MB. Please select a smaller image.")
                console.error("File size exceeds 5 MB. Please select a smaller image.")
                return
            }

            const fileWithPreview = Object.assign(file, {
                preview: URL.createObjectURL(file),
            })

            console.log(`onDrop, setSelectedFile`, fileWithPreview)
            // setSelectedFile(fileWithPreview)
            setCropFile(fileWithPreview)
            setIsCropping(true)
        },
        []
    )

    const {getRootProps, getInputProps} = useDropzone({
        onDrop: onDrop,
        accept: acceptedFiletypes,
        noClick: true
    })

    return (
        <>
        {isCropping ? (
            // user is currently cropping the image, show cropping UI
            <div className="p-0 gap-0 max-h-[90vh] overflow-hidden">
                <div className="p-6 size-full max-h-full">
                    <ReactCrop
                        crop={crop}
                        onComplete={(c) => onCropComplete(c)}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        aspect={aspect}
                        className="w-full max-h-[40vh]"
                    >
                        <img
                            className="w-full object-cover"
                            ref={imgRef}
                            src={cropFile?.preview}
                            onLoad={onImageLoad}
                        />
                    </ReactCrop>
                </div>
                <div className={cn("w-full flex justify-center gap-2")}>
                    <Button 
                        size={"sm"} 
                        className="w-fit" 
                        variant={"secondary"} 
                        onClick={() => {
                            setIsCropping(false)
                            setCropFile(null)
                        }}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" size={"sm"} className="w-fit" onClick={onCrop}>
                        <CropIcon className="mr-1.5 size-4" />
                        Crop
                    </Button>
                </div>
            </div>
        ) : (
            // user has not previously selected an image, show fallback
            <>
            <Avatar
                {...getRootProps()}
                className={cn("size-36 cursor-pointer ring-offset-2 ring-2 ring-slate-200", className)}
            >
                <input
                    type="file"
                    accept="image/jpg, image/jpeg, image/png"
                    // callback ref, so we can trigger opening the file select dialog from inside ImageCropper
                    ref={setFileInputRef}
                    className="hidden"
                    onChange={(e: any) => onDrop([...e.target.files] as FileWithPath[])}
                />
                <AvatarImage
                    src={croppedImage ? croppedImage : selectedFile?.preview}
                    alt="@shadcn"
                    className={cn("object-cover", className)}
                    onClick={handleClick}
                />
                <AvatarFallback
                    onClick={handleClick}
                    className={cn("text-center flex flex-col justify-center gap-y-4", className)}>
                    <Upload />
                    Click or drop!
                </AvatarFallback>
            </Avatar>
            <div className={cn("w-full flex justify-center gap-2", selectedFile ? "" : "hidden")}>
                <Button
                    size={"sm"}
                    type="reset"
                    className="w-fit"
                    variant={"outline"}
                    onClick={() => {
                        setSelectedFile(null)
                        setCropFile(null)
                    }}
                >
                    <Trash2Icon className="mr-1.5 size-4" />
                    Delete
                </Button>
                <Button
                    size={"sm"}
                    type="reset"
                    className="w-fit"
                    variant={"outline"}
                    onClick={() => {
                        setCropFile(selectedFile)
                        setIsCropping(true)
                    }}
                >
                    <Pencil className="mr-1.5 size-4" />
                    Edit
                </Button>
                <Button
                    size={"sm"}
                    type="reset"
                    className="w-fit"
                    variant={"outline"}
                    onClick={() => handleClick()}
                >
                    <Image />
                    Select New Photo
                </Button>
            </div>
            </>
        )}
        </>
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
                width: 100,
                height: 100,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}