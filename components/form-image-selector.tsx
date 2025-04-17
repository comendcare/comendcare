"use client"

import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {FileWithPreview, ImageSelector} from "@/components/image-selector";
import {FileWithPath, useDropzone} from "react-dropzone";
import {toast} from "sonner";
import {acceptedFiletypes, cn, getPublicFile, sleep} from "@/lib/utils";
import { Pencil, Trash2Icon, Upload } from "lucide-react";
import { difference } from "lodash";
import { Button } from "./ui/button";

export const FormImageSelector = ({
                                     className = "",
                                     form,
                                     name,
                                     title,
                                     description,
                                     aspect,
                                     img,
                                     selectedFile,
                                     setSelectedFile
                                 }: {
    className?: string,
    form: any,
    name: string,
    title: string,
    description?: string,
    aspect: number,
    img: string | undefined | null,
    selectedFile: FileWithPreview | null,
    setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>
}) => {

    useEffect(() => {
        const init = async () => {
            if (img) {
                try {
                    const userPhoto: File = await getPublicFile(img)
                    if (userPhoto) {
                        const fileWithPreview = Object.assign(userPhoto, {
                            preview: URL.createObjectURL(userPhoto),
                        })
                        setSelectedFile(fileWithPreview)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
        }

        init()
    }, [])

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
                            <ImageSelector
                                aspect={aspect}
                                selectedFile={selectedFile}
                                setSelectedFile={(file: FileWithPreview | null) => {
                                    if (!file) {
                                        setSelectedFile(null)
                                    } else {
                                        setSelectedFile(file)
                                    }

                                    field.onChange(file?.preview) // Update form field value
                                }}
                                className={className}
                            />
                        </div>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}
