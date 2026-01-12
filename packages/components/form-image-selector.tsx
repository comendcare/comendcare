"use client"

import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "./ui/form";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {FileWithPreview, ImageSelector} from "./image-selector";
import {acceptedFiletypes, cn, getPublicFile, sleep} from "./../../packages/lib/utils";

export const FormImageSelector = ({
                                      className = "",
                                      form,
                                      name,
                                      title,
                                      description,
                                      aspect,
                                      img,
                                      selectedFile,
                                      setSelectedFile,
                                      isCropping,
                                      setIsCropping,
                                      testIdPrefix
                                  }: {
    className?: string,
    form: any,
    name: string,
    title: string,
    description?: string,
    aspect: number,
    img: string | undefined | null,
    selectedFile: FileWithPreview | null,
    setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>,
    isCropping: boolean,
    setIsCropping: React.Dispatch<React.SetStateAction<boolean>>
    testIdPrefix?: string,
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
                                        setSelectedFile(null);
                                        field.onChange(null);
                                    } else {
                                        setSelectedFile(file);
                                        field.onChange(file.preview);
                                    }
                                }}
                                className={className}
                                parentIsCropping={isCropping}
                                setParentIsCropping={setIsCropping}
                                fileInputTestId={
                                    testIdPrefix ? `${testIdPrefix}-file-input` : undefined
                                }
                                cropToolbarTestId="crop-toolbar"
                                cropButtonTestId="crop-btn"
                            />
                        </div>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}
