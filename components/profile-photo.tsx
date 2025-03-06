"use client"

import React, {useState} from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import {Form} from "@/components/ui/form";
import {cn} from "@/lib/utils";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormImageCropper} from "@/components/edit-pag-profile-page-dialog";
import {FileWithPreview} from "@/components/image-cropper";
import {toast} from "sonner";
import {handleImageUpload} from "@/lib/upload";
import {updateOrganization} from "@/lib/actions";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

const editOrgProfileImageSchema = z.object({
    image: z.string().optional(),
    headerImage: z.string().optional()
})

export function ProfilePhoto({
                                 img,
                                 name,
                                 textSize,
                                 className,
                                 editable
                             }: {
    img: string | null | undefined;
    name: string | null | undefined;
    textSize?: "small" | "medium" | "large";
    className?: string | null | undefined;
    editable?: boolean
}) {
    const {data: session} = useSession()
    const router = useRouter()
    const [open, setOpen] = useState(false);
    const [selectedFileProfile, setSelectedFileProfile] = useState<FileWithPreview | null>(null);
    const [defaultOrganizationValues, setDefaultOrganizationValues] = useState<z.infer<typeof editOrgProfileImageSchema> | undefined>(undefined);

    const editOrgForm = useForm<z.infer<typeof editOrgProfileImageSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgProfileImageSchema),
        defaultValues: defaultOrganizationValues
    })

    async function onProfileFormSubmit(values: z.infer<typeof editOrgProfileImageSchema>) {
        console.log("Hi")
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();
        // Handle the selected profile image upload
        // only upload if the image has changed
        if (selectedFileProfile && values.image && values.image !== defaultOrganizationValues?.image) {
            try {
                const imgUrl = await handleImageUpload(selectedFileProfile as File, values.image);
                if (imgUrl) {
                    formData.set("image", imgUrl); // Update the FormData with the uploaded image URL
                }
            } catch (error) {
                console.error("Failed to upload image:", error);
                toast.error("Image upload failed.");
                return;
            }
        }

        try {
            await updateOrganization(formData, session.user.organizationId);
            toast.success("Organization profile updated successfully!");
            setOpen(false)
            router.refresh(); // Refresh the page to reflect changes
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    return (
        editable ? (
            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
            }}>
                <DialogTrigger asChild>
                    <Avatar className={cn("relative rounded-full ring-4 ring-white hover:cursor-pointer", className)}>
                        <AvatarImage src={img || undefined} alt={name || ""}/>
                        <AvatarFallback className={cn(
                            "h-full w-full",
                            textSize === "small" && "text-2xl",
                            textSize === "medium" && "text-4xl",
                            textSize === "large" && "text-6xl"
                        )}>
                            {name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit organization profile picture</DialogTitle>
                        <DialogDescription>
                            {"Make changes to your profile picture here. Click save when you're done."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...editOrgForm}>
                        <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-8">
                            <FormImageCropper
                                form={editOrgForm}
                                name="image"
                                title=""
                                aspect={1}
                                selectedFile={selectedFileProfile}
                                setSelectedFile={setSelectedFileProfile}
                                className="mx-auto"
                            />
                            <Button type="submit" className="w-fit">Save</Button>

                        </form>
                    </Form>

                </DialogContent>
            </Dialog>
        ) : (
            <Avatar className={cn("relative rounded-full ring-4 ring-white", className)}>
                <AvatarImage src={img || undefined} alt={name || ""}/>
                <AvatarFallback className={cn(
                    "h-full w-full",
                    textSize === "small" && "text-2xl",
                    textSize === "medium" && "text-4xl",
                    textSize === "large" && "text-6xl"
                )}>
                    {name?.[0]}
                </AvatarFallback>
            </Avatar>
        )
    );
}
