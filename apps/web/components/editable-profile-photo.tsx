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
import {centerAspectCrop, DialogImageSelector, FileWithPreview} from "@comend/components/image-selector";
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
        // setSelectedFileProfile(null)

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
                                                    <DialogImageSelector
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
