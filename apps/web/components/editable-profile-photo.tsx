"use client";

import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogClose,
    DialogFooter,
} from "@comend/components/ui/dialog";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@comend/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
// import {FormImageSelector} from "@comend/components/form-image-selector";
import {centerAspectCrop, FileWithPreview} from "@comend/components/image-selector";
import {toast} from "sonner";
import {handleImageDelete, handleImageUpload} from "@comend/lib/upload";
import {updateOrganization} from "@comend/lib/actions";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Button} from "@comend/components/ui/button";
import {Pencil, Trash2Icon, Upload, Image} from "lucide-react";
import { ProfilePhoto } from "@comend/components/profile-photo";
import LoadingDots from "@comend/components/icons/loading-dots";
import { ScrollArea, Scrollbar } from "@radix-ui/react-scroll-area";
import { UnsavedChangesDialog } from "./unsaved-changes-dialog";
import { acceptedFiletypes, cn, sleep, getPublicFile } from "@comend/lib/utils";
import { FileWithPath, useDropzone } from "react-dropzone";
import ReactCrop, {
    centerCrop,
    convertToPixelCrop,
    makeAspectCrop,
    type Crop,
    type PixelCrop,
} from "react-image-crop"
import { Avatar, AvatarFallback, AvatarImage } from "@comend/components/ui/avatar";

const editOrgProfileImageSchema = z.object({
    image: z.string().nullable().optional(),
    headerImage: z.string().nullable().optional(),
});

export function EditableProfilePhoto({
    img,
    name,
    textSize,
    className,
}: {
    img: string | null | undefined;
    name: string | null | undefined;
    textSize?: "small" | "medium" | "large";
    className?: string | null | undefined;
}) {
    const {data: session} = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [unsavedChangesIsOpen, setUnsavedChangesIsOpen] = useState(false)
    const [open, setOpen] = useState(false);
    const [selectedFileProfile, setSelectedFileProfile] = useState<FileWithPreview | null>(null);
    const [defaultOrganizationValues, setDefaultOrganizationValues] = useState<
        z.infer<typeof editOrgProfileImageSchema> | undefined
    >(undefined);
    const [isCropping, setIsCropping] = useState(false)
    const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>("")
    const [cropFile, setCropFile] = React.useState<FileWithPreview | null>(selectedFileProfile)

    const editOrgForm = useForm<z.infer<typeof editOrgProfileImageSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgProfileImageSchema),
        defaultValues: defaultOrganizationValues,
    });

    async function onProfileFormSubmit(values: z.infer<typeof editOrgProfileImageSchema>) {
        // setIsCropping(false)
        // await sleep(500)
        const newSelectedFile = await onCrop()
        console.log(`new selected file`, newSelectedFile)
        console.log(`values`, values)
        console.log(`value is default`, values.image == defaultOrganizationValues?.image)
        setIsSaving(true)
        setLoading(true)
        try {
            if (!session?.user?.organizationId) {
                toast.error("You're not signed into an organization right now.");
                return;
            }

            const formData = new FormData();

            if (newSelectedFile && newSelectedFile.preview && newSelectedFile.preview !== defaultOrganizationValues?.image) {
                try {
                    const imgUrl = await handleImageUpload(newSelectedFile as File, newSelectedFile.preview);
                    if (imgUrl) {
                        formData.set("image", imgUrl);
                    }
                } catch (error) {
                    console.error("Failed to upload image:", error);
                    toast.error("Image upload failed.");
                    return;
                }
            }

            if (!newSelectedFile) {
                // no file selected, set profile image to null, allow deleting profile photo
                formData.set("image", "")
            }

            if ((!newSelectedFile || newSelectedFile.preview !== defaultOrganizationValues?.image) && img) {
                // if the image is being changed, delete the old image in our google cloud storage bucket
                console.log(`handle delete`)
                await handleImageDelete(img)
            }

            await updateOrganization(session.user.organizationId, formData);
            toast.success("Organization profile updated successfully!");
            // setHasCropped(false);
            setOpen(false);
            closeDialog()
            window.location.reload()
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        } finally {
            setLoading(false)
        }
    }

    const closeDialog = () => {
        setOpen(false)
        setIsClosing(false)
        setUnsavedChangesIsOpen(false)
        setIsCropping(false)
        setSelectedFileProfile(null)

        editOrgForm.reset(defaultOrganizationValues)
    }

    const handleClose = () => {
        if (Object.keys(editOrgForm.formState.dirtyFields).length > 0 || isCropping) {
            // form is dirty, give user the option to save/discard unsaved changes
            setUnsavedChangesIsOpen(true)
        } else {
            // form is not dirty, close regularly
            closeDialog()
        }
    }

    useEffect(() => {
        if (isClosing) handleClose() // external close, handle closing with option for saving unsaved changes
    }, [isClosing])

    useEffect(() => {
        // if the user has closed the unsaved changes dialog, end the isClosing state of all other dialogs
        // all dialogs should be either fully closed or fully open
        if (!unsavedChangesIsOpen) setIsClosing(false)
    }, [unsavedChangesIsOpen])

    async function onCrop() {
        try {
            setIsCropping(false)

            if (!cropFile) {
                // throw Error('No file selected to crop')
                console.error(`No file selected to crop`)
                return undefined
            }

            const newSelectedFile = Object.assign(cropFile, {
                preview: croppedImageUrl
            })

            console.log(`onCrop, setSelectedFile`, newSelectedFile)
            setSelectedFileProfile(newSelectedFile)
            return newSelectedFile
        } catch (error) {
            console.error(`Error`, error)
            alert("Something went wrong!")
        }
    }


    useEffect(() => {
        const init = async () => {
            if (img) {
                try {
                    const userPhoto: File = await getPublicFile(img)
                    if (userPhoto) {
                        const fileWithPreview = Object.assign(userPhoto, {
                            preview: URL.createObjectURL(userPhoto),
                        })
                        setSelectedFileProfile(fileWithPreview)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
        }

        init()
    }, [])

    return (
        <div className="relative inline-block">
            <ProfilePhoto img={img} name={name} textSize={textSize} className={className}/>

            <Dialog 
                open={open} 
                onOpenChange={(open) => {
                    if (!open) setIsClosing(true)
                    else setOpen(true)
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute bottom-0 right-0 p-0.5 bg-white shadow-md rounded-full"
                        data-testid="edit-avatar-btn"
                    >
                        <Pencil className="w-1 h-1"/>
                    </Button>
                </DialogTrigger>
                <DialogContent data-testid="avatar-dialog">
                    <DialogHeader>
                        <DialogTitle>Edit organization profile picture</DialogTitle>
                        <DialogDescription>
                            {"Make changes to your profile picture here. Click save when you're done."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...editOrgForm}>
                        <ScrollArea className={"max-h-[80vh] -mr-2 pr-3 pb-12"} type={"always"}>
                            <Scrollbar />
                            <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-8">
                                <FormField
                                    control={editOrgForm.control}
                                    name={'image'}
                                    render={({field}) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex flex-col items-start space-y-4">
                                                    <ImageSelector
                                                        aspect={1}
                                                        selectedFile={selectedFileProfile}
                                                        setSelectedFile={(file: FileWithPreview | null) => {
                                                            if (!file) {
                                                                setSelectedFileProfile(null);
                                                                field.onChange(null);
                                                            } else {
                                                                setSelectedFileProfile(file);
                                                                field.onChange(file.preview);
                                                            }
                                                        }}
                                                        className={"mx-auto"}
                                                        parentIsCropping={isCropping}
                                                        setParentIsCropping={setIsCropping}
                                                        fileInputTestId={`avatar-file-input`}
                                                        cropToolbarTestId="crop-toolbar"
                                                        cropButtonTestId="crop-btn"
                                                        onCrop={onCrop}
                                                        croppedImageUrl={croppedImageUrl}
                                                        setCroppedImageUrl={setCroppedImageUrl}
                                                        cropFile={cropFile}
                                                        setCropFile={setCropFile}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="absolute right-4 bottom-0 flex gap-2">
                                <DialogClose asChild>
                                    <Button 
                                        variant={"secondary"}
                                        onClick={() => {handleClose()}}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant={"cta"}
                                    type="submit"
                                    data-testid="dialog-save-btn"
                                    disabled={!editOrgForm.formState.isValid || isSaving}
                                >
                                    {isSaving 
                                        ? (
                                            <div className="w-[81px] flex justify-center items-center">
                                                <LoadingDots/>
                                            </div>
                                        ) 
                                        : ("Save changes")
                                    }
                                </Button>
                                </div>
                            </form>
                        </ScrollArea>

                        <UnsavedChangesDialog 
                            isSaving={isSaving}
                            isClosing={isClosing}
                            setIsClosing={setIsClosing}
                            isOpen={unsavedChangesIsOpen}
                            setIsOpen={setUnsavedChangesIsOpen}
                            closeDialog={closeDialog}
                            form={editOrgForm}
                            formSubmit={onProfileFormSubmit}
                        />
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface ImageSelectorProps {
    selectedFile: FileWithPreview | null
    setSelectedFile: (file: FileWithPreview | null) => void,
    aspect: number,
    className?: string,
    parentIsCropping: boolean,
    setParentIsCropping: React.Dispatch<React.SetStateAction<boolean>>
    fileInputTestId?: string
    cropToolbarTestId?: string
    cropButtonTestId?: string
    onCrop?: () => any,
    cropFile: FileWithPreview | null,
    setCropFile: React.Dispatch<FileWithPreview | null>,
    croppedImageUrl: string,
    setCroppedImageUrl: React.Dispatch<string>
}

export function ImageSelector({
                                selectedFile,
                                setSelectedFile,
                                aspect,
                                className = "",
                                parentIsCropping,
                                setParentIsCropping,
                                fileInputTestId,
                                cropToolbarTestId,
                                cropButtonTestId,
                                onCrop,
                                cropFile,
                                setCropFile,
                                croppedImageUrl,
                                setCroppedImageUrl,
                            }: ImageSelectorProps) {
    const imgRef = React.useRef<HTMLImageElement | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)

    const [crop, setCrop] = React.useState<Crop>()
    const [croppedImage, setCroppedImage] = React.useState<string>("")
    const [isCropping, setIsCropping] = React.useState<boolean>(false)

    useEffect(() => {
        setParentIsCropping(isCropping)
    }, [isCropping])

    useEffect(() => {
        if (isCropping && !parentIsCropping) {
            // if the parent is exiting the cropping state, save the crop
            if (onCrop) {
                onCrop()
            }
        }
    }, [parentIsCropping])

    const handleClick = async () => {
        fileInputRef.current?.click() // Open file dialog
    }

    const setFileInputRef = (node: HTMLInputElement | null) => {
        if (node) {
            fileInputRef.current = node;
        }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const {width, height} = e.currentTarget
            const newCrop = centerAspectCrop(width, height, aspect)
            setCrop(newCrop)

            const pixelCrop = convertToPixelCrop(newCrop, width, height)

            if (imgRef.current && pixelCrop.width && pixelCrop.height) {
                const croppedImageUrl = getCroppedImg(imgRef.current, pixelCrop)
                setCroppedImageUrl(croppedImageUrl)
            }
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
                <div className="p-0 gap-0 overflow-hidden w-full">
                    <div className="p-6 size-full max-h-full w-full">
                        <ReactCrop
                            crop={crop}
                            onComplete={(c) => onCropComplete(c)}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            aspect={aspect}
                            className="w-full"
                        >
                            <img
                                className="w-full object-cover"
                                ref={imgRef}
                                src={cropFile?.preview}
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
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
                            data-testid={fileInputTestId}
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
                            <Upload/>
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
                            <Trash2Icon className="mr-1.5 size-4"/>
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
                            <Pencil className="mr-1.5 size-4"/>
                            Edit
                        </Button>
                        <Button
                            size={"sm"}
                            type="reset"
                            className="w-fit"
                            variant={"outline"}
                            onClick={() => handleClick()}
                        >
                            <Image/>
                            Select New Photo
                        </Button>
                    </div>
                </>
            )}
        </>
    )
}
