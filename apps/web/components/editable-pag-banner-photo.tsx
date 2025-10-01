"use client";

import React, {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
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
import { Pencil } from "lucide-react";
import { PAGBannerPhoto } from "@comend/components/pag-banner-photo";

const editOrgProfileImageSchema = z.object({
    image: z.string().nullable().optional(),
    headerImage: z.string().nullable().optional(),
});

export function EditablePAGBannerPhoto({
                                   img,
                               }: {
    img: string | null | undefined;
}) {
    const {data: session} = useSession();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [selectedFileHeader, setSelectedFileHeader] = useState<FileWithPreview | null>(null);
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
        if (!session?.user?.organizationId) {
            toast.error("You're not signed into an organization right now.");
            return;
        }

        const formData = new FormData();

        if (selectedFileHeader && values.headerImage && values.headerImage !== defaultOrganizationValues?.headerImage) {
            try {
                const imgUrl = await handleImageUpload(selectedFileHeader as File, values.headerImage);
                if (imgUrl) {
                    formData.set("headerImage", imgUrl);
                }
            } catch (error) {
                console.error("Failed to upload header image:", error);
                toast.error("Image upload failed.");
                return;
            }
        }

        if (values.headerImage !== img && img) {
            await handleImageDelete(img)
        }

        try {
            await updateOrganization(session.user.organizationId, formData);
            toast.success("Organization profile updated successfully!");
            setIsCropping(false)
            setOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    return (
        <div className="relative w-full">
            {/* Banner Image */}
            <PAGBannerPhoto img={img} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 p-2 bg-white shadow-md rounded-full"
                        data-testid="edit-banner-btn"
                        disabled={session?.user?.membership?.role !== "owner"}
                    >
                        <Pencil className="w-4 h-4"/>
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto" data-testid="banner-dialog">
                    <DialogHeader>
                        <DialogTitle>Edit organization banner image</DialogTitle>
                        <DialogDescription>
                            {"This will be used as the header image on your organization's profile. (16x4)"}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...editOrgForm}>
                        <form onSubmit={editOrgForm.handleSubmit(onProfileFormSubmit)} className="space-y-8">
                            <FormImageSelector
                                form={editOrgForm}
                                name="headerImage"
                                title=""
                                description=""
                                aspect={16 / 4}
                                img={img}
                                selectedFile={selectedFileHeader}
                                setSelectedFile={setSelectedFileHeader}
                                className="rounded h-[100px] w-[400px] mx-auto"
                                setIsCropping={setIsCropping}
                                testIdPrefix="cover"
                            />
                            <Button 
                                type="submit" 
                                className="w-fit"
                                disabled={isCropping}
                                data-testid="dialog-save-btn"
                            >
                                Save
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
