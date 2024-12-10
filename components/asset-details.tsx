import { Prisma } from "@prisma/client"
import { ExternalAttachmentField } from "./external-attachment-field"
import { ExternalContactField } from "./external-contact-field"
import { Button } from "./ui/button"
import {
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { FaTrash } from "react-icons/fa6"

type AssetType = Prisma.AssetGetPayload<{ 
    omit: { id: true, createdAt: true, updatedAt: true }
    include: { 
        contacts: { 
            select: { name: true, role: true, email: true } 
        }, 
        attachments: {
            select: { name: true, link: true }
        }
    } 
}>
type ContactType = AssetType['contacts'][0]
type AttachmentType = AssetType['attachments'][0]

export function AssetDetails({ asset }: { asset: AssetType }) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{asset.name}</CardTitle>
                    <CardDescription>{asset.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                    <Separator />

                    {/* <FormField 
                        control={form.control}
                        name="asset.contacts"
                        render={({field}) => (
                            <>
                            {field.value.length > 0 && <FormLabel className="text-md">{`Contacts`}</FormLabel>}
                            {field.value.length > 0 && (
                                <ol className="flex flex-col gap-2">
                                    {field.value.map((contact: ContactType, index: number) => (
                                        <ExternalContactField 
                                            key={index}
                                            index={index}
                                            value={contact}
                                            onDelete={() => {
                                                form.setValue(
                                                    "asset.contacts",
                                                    field?.value?.filter((t: ContactType, i: number) => i !== index)
                                                )
                                            }}
                                            onValueChange={newValue => {
                                                form.setValue(
                                                    "asset.contacts",
                                                    field?.value?.map((currentValue: ContactType, i: number) => i === index ? newValue : currentValue)
                                                )
                                            }}
                                        />
                                    ))}
                                </ol>
                            )}
                            <Button
                                variant="secondary"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault()
                                    form.setValue("asset.contacts", [
                                        ...(field.value),
                                        { name: "", email: "", role: null }
                                    ])
                                }}
                            >{`Add a contact`}</Button>
                            </>
                        )}
                    /> */}
                    
                    <Separator />
                
                    {/* <FormField 
                        control={form.control}
                        name="asset.attachments"
                        render={({field}) => (
                            <>
                            {field.value.length > 0 && <FormLabel className="text-md">{`Attachments`}</FormLabel>}
                            {field.value.length > 0 && (
                                <ol className="flex flex-col gap-2">
                                    {field.value.map((attachment: AttachmentType, index: number) => (
                                        <ExternalAttachmentField 
                                            key={index}
                                            index={index}
                                            value={attachment}
                                            onDelete={() => {
                                                form.setValue(
                                                    "asset.attachments",
                                                    field?.value?.filter((t: AttachmentType, i: number) => i !== index)
                                                )
                                            }}
                                            onValueChange={newValue => {
                                                form.setValue(
                                                    "asset.attachments",
                                                    field?.value?.map((currentValue: AttachmentType, i: number) => i === index ? newValue : currentValue)
                                                )
                                            }}
                                        />
                                    ))}
                                </ol>
                            )}
                            <Button
                                variant="secondary"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault()
                                    form.setValue("asset.attachments", [
                                        ...(field.value),
                                        { name: "", link: "" }
                                    ])
                                }}
                            >{`Add an attachment`}</Button>
                            </>
                        )}
                    /> */}
                </CardContent>
            </Card>
        </>
    )
}