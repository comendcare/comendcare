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
import { Trash } from "lucide-react"

type AssetType = Prisma.AssetGetPayload<{ 
    omit: { id: true, createdAt: true, updatedAt: true }
    include: { 
        contacts: { 
            select: { name: true, role: true, email: true, affiliation: true } 
        }, 
        attachments: {
            select: { name: true, link: true }
        }
    } 
}>
type ContactType = AssetType['contacts'][0]
type AttachmentType = AssetType['attachments'][0]

export function AssetEditForm({ form, asset }: { form: UseFormReturn<any>, asset: AssetType }) {
    return (
        <FormItem>
            <FormControl>
                {asset ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Asset</CardTitle>
                            <CardDescription>A research asset is any resource, tool, or data that helps advance scientific studies, such as samples or datasets.</CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-4">
                            <FormItem className="w-full grid grid-cols-[80px_auto] items-center gap-4">
                            <FormLabel className="text-md">{`Name`}</FormLabel>
                            <FormField 
                                control={form.control}
                                name="asset.name"
                                render={({field}) => (
                                    <Input
                                        className="h-full"
                                        id="assetName"
                                        placeholder={`Enter a name`}
                                        defaultValue={field.value}
                                        {...field}
                                    />
                                )}
                            />
                            </FormItem>

                            <FormItem className="w-full flex flex-col">
                            <FormLabel className="text-md">{`Description`}</FormLabel>
                            <FormField 
                                control={form.control}
                                name="asset.description"
                                render={({field}) => (
                                    <Textarea
                                        id="assetDescription"
                                        placeholder={`Enter a description for this asset`}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            </FormItem>

                            <Separator />

                            <FormField 
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
                            />
                            
                            <Separator />
                        
                            <FormField 
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
                            />
                        </CardContent>

                        <CardFooter>
                            <Button
                                className="w-full"
                                variant="destructive"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault()
                                    form.setValue("asset", undefined)
                                }}
                            >
                                <Trash />
                                {`Remove Asset`}
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Button
                        className="w-full"
                        variant="secondary"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            form.setValue("asset", {
                                name: '',
                                description: null,
                                contacts: [],
                                attachments: [],
                            })
                        }}
                    >{`Add an Asset`}</Button>
                )}
            </FormControl>
            <FormMessage />
        </FormItem>
    )
}