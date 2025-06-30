import { FileWithPreview } from "@/packages/components/image-selector";
import { editOrgProfileImageSchema, ProfilePhoto as GenericProfilePhoto } from "@/packages/components/profile-photo";
import { updateOrganization } from "@/packages/lib/actions";
import { handleImageDelete, handleImageUpload } from "@/packages/lib/upload";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

export function ProfilePhoto({
                                orgId,
                                img,
                                name,
                                textSize,
                                className,
                                editable,
                             }: {
    orgId: string | null | undefined;
    img: string | null | undefined;
    name: string | null | undefined;
    textSize?: "small" | "medium" | "large";
    className?: string | null | undefined;
    editable?: boolean;
}) {
    const router = useRouter()
    
    const submitCallback = async (values: z.infer<typeof editOrgProfileImageSchema>, selectedFileProfile: FileWithPreview | null) => {
        const formData = new FormData();

        if (selectedFileProfile && values.image && values.image !== img) {
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

        try {
            await updateOrganization(orgId, formData);
            toast.success("Organization profile updated successfully!");
            // setHasCropped(false);
            // setIsCropping(false)
            // setOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }
    return <GenericProfilePhoto img={img} name={name} editable={editable} submitCallback={submitCallback} className={className}/>
}