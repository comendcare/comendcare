"use client"

import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import React, {useCallback, useRef, useState} from "react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {FileWithPreview, ImageCropper} from "@/components/image-cropper";
import {FileWithPath, useDropzone} from "react-dropzone";
import {toast} from "sonner";
import {acceptedFiletypes, cn, sleep} from "@/lib/utils";
import { Upload } from "lucide-react";

export const FormImageCropper = ({
                                     className = "",
                                     form,
                                     name,
                                     title,
                                     description,
                                     aspect,
                                     selectedFile,
                                     setSelectedFile
                                 }: {
    className?: string,
    form: any,
    name: string,
    title: string,
    description?: string,
    aspect: number,
    selectedFile: FileWithPreview | null,
    setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>
}) => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [inputKey, setInputKey] = useState(0); // Initial key for the input

    const setFileInputRef = (node: HTMLInputElement | null) => {
        if (node) {
            fileInputRef.current = node;
        }
    };

    const onDrop = useCallback(
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

            setSelectedFile(fileWithPreview)
            setDialogOpen(true)
        },
        []
    );

    const {getRootProps, getInputProps} = useDropzone({
        onDrop: onDrop,
        accept: acceptedFiletypes,
        noClick: true
    });


    const handleClick = async () => {
        setSelectedFile(null) // de-select any previously selected file
        await sleep(100) // allow file de-select to take effect

        fileInputRef.current?.click() // Open file dialog
    };

    return (
        <FormField
            control={form.control}
            name={name}
            render={({field}) => (
                <FormItem>
                    <FormLabel>
                        {title}
                    </FormLabel>
                    {description &&
                        <FormDescription>
                            {description}
                        </FormDescription>
                    }
                    <FormControl>
                        <div className="flex flex-col items-start space-y-4">
                            {selectedFile ? (
                                <ImageCropper
                                    aspect={aspect}
                                    dialogOpen={isDialogOpen}
                                    setDialogOpen={setDialogOpen}
                                    selectedFile={selectedFile}
                                    setSelectedFile={(file: FileWithPreview | null) => {
                                        // console.log(`set selected file`, file)
                                        if (!file) {
                                            setSelectedFile(null)
                                        } else {
                                            setSelectedFile(file)
                                        }

                                        field.onChange(file?.preview) // Update form field value
                                    }}
                                    className={className}
                                    handleFileSelectOpen={handleClick}
                                />
                            ) : (
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
                                    <AvatarFallback
                                        onClick={handleClick}
                                        className={cn("text-center flex flex-col justify-center gap-y-4", className)}>
                                        <Upload />
                                        Click or drop!
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}
