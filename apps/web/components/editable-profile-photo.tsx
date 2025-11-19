"use client";

import React, {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogClose,
} from "@comend/components/ui/dialog";
import {Form} from "@comend/components/ui/form";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormImageSelector} from "@comend/components/form-image-selector";
import {FileWithPreview} from "@comend/components/image-selector";
import {toast} from "sonner";
import {handleImageDelete, handleImageUpload} from "@comend/lib/upload";
import {updateOrganization} from "@comend/lib/actions";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Button} from "@comend/components/ui/button";
import {Pencil} from "lucide-react";
import { ProfilePhoto } from "@comend/components/profile-photo";
import LoadingDots from "@comend/components/icons/loading-dots";

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
    const [open, setOpen] = useState(false);
    const [selectedFileProfile, setSelectedFileProfile] = useState<FileWithPreview | null>(null);
    const [defaultOrganizationValues, setDefaultOrganizationValues] = useState<
        z.infer<typeof editOrgProfileImageSchema> | undefined
    >(undefined);
    const [isCropping, setIsCropping] = useState(false)

    const editOrgForm = useForm<z.infer<typeof editOrgProfileImageSchema>>({
        mode: "onChange",
        resolver: zodResolver(editOrgProfileImageSchema),
        defaultValues: defaultOrganizationValues,
    });

    async function onProfileFormSubmit(values: z.infer<typeof editOrgProfileImageSchema>) {
        setLoading(true)
        try {
            if (!session?.user?.organizationId) {
                toast.error("You're not signed into an organization right now.");
                return;
            }

            const formData = new FormData();

            if (selectedFileProfile && values.image && values.image !== defaultOrganizationValues?.image) {
                try {
                    const imgUrl = await handleImageUpload(selectedFileProfile as File, values.image);
                    if (imgUrl) {
                        formData.set("image", imgUrl);
                    }
                } catch (error) {
                    console.error("Failed to upload image:", error);
                    toast.error("Image upload failed.");
                    return;
                }
            }

            if (!selectedFileProfile) {
                // no file selected, set profile image to null, allow deleting profile photo
                formData.set("image", "")
            }

            if (values.image !== img && img) {
                // if the image is being changed, delete the old image in our google cloud storage bucket
                await handleImageDelete(img)
            }

            await updateOrganization(session.user.organizationId, formData);
            toast.success("Organization profile updated successfully!");
            // setHasCropped(false);
            setIsCropping(false)
            setOpen(false);
            window.location.reload()
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative inline-block">
            <ProfilePhoto img={img} name={name} textSize={textSize} className={className}/>

            <Dialog open={open} onOpenChange={setOpen}>
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
                <DialogContent className="max-h-[80vh] overflow-y-auto" data-testid="avatar-dialog">
                    <DialogHeader>
                        <DialogTitle>Edit organization profile picture</DialogTitle>
                        <DialogDescription>
                            {"Make changes to your profile picture here. Click save when you're done."}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...editOrgForm}>
                        <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-8">
                            <FormImageSelector
                                form={editOrgForm}
                                name="image"
                                title=""
                                aspect={1}
                                img={img}
                                selectedFile={selectedFileProfile}
                                setSelectedFile={setSelectedFileProfile}
                                className="mx-auto"
                                setIsCropping={setIsCropping}
                                testIdPrefix="avatar"
                            />
                            <Button
                                type="submit"
                                className="w-fit"
                                disabled={loading || isCropping}
                                data-testid="dialog-save-btn"
                            >
                                {loading ? <LoadingDots color="#808080"/> : "Save"}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
