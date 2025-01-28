import { Prisma } from "@prisma/client"
import { ExternalAttachmentField } from "./external-attachment-field"
import { Button } from "./ui/button"
import {
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
} from "./ui/form"
import { UseFormReturn } from "react-hook-form"

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{
    select: { name: true, link: true }
}>

export function AttachmentsEditForm({ form, attachments }: { form: UseFormReturn<any>, attachments: AttachmentType[] }) {
    return (
        <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
                <FormItem className="flex flex-col grow">
                    <FormControl>
                        <>
                        {attachments && attachments.length > 0 && (
                            <>
                                {field.value.length > 0 && <FormLabel className="text-2xl font-semibold leading-none tracking-tight">{`Associated Attachments`}</FormLabel>}
                                {field.value.length > 0 && (
                                    <ol className="flex flex-col gap-2">
                                        {field.value.map((paper: AttachmentType, index: number) => (
                                            <ExternalAttachmentField 
                                                key={index}
                                                index={index}
                                                value={paper}
                                                onDelete={() => {
                                                    form.setValue(
                                                        "attachments",
                                                        field?.value?.filter((t: AttachmentType, i: number) => i !== index)
                                                    )
                                                }}
                                                onValueChange={newValue => {
                                                    form.setValue(
                                                        "attachments",
                                                        field?.value?.map((currentValue: AttachmentType, i: number) => i === index ? newValue : currentValue)
                                                    )
                                                }}
                                            />
                                        ))}
                                    </ol>
                                )}
                            </>
                        )}
                        <Button
                            variant="secondary"
                            onClick={(e: any) => {
                                e.preventDefault()
                                form.setValue("attachments", [
                                    ...(field?.value || []),
                                    { name: '', link: '' }
                                ])
                            }}
                        >{`Add an Associated Paper`}</Button>
                        </>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
    )
}