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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { FaT, FaTrash } from "react-icons/fa6"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select"
import { RFP_OPEN_TO_TYPE_OPTIONS } from "@/lib/types"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "./ui/calendar"

type RFPType = Prisma.RFPGetPayload<{
    omit: { id: true, createdAt: true, updatedAt: true, researchFocus: true }
    include: { 
        contacts: { 
            select: { name: true, role: true, email: true } 
        }, 
        attachments: {
            select: { name: true, link: true }
        }
    }
}>
type ContactType = RFPType['contacts'][0]
type AttachmentType = RFPType['attachments'][0]

export function RFPEditForm({ form, RFP }: { form: UseFormReturn<any>, RFP: RFPType }) {
    return (
        <FormItem>
            <FormControl>
                {RFP ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>RFP</CardTitle>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-4">
                            <FormItem className="w-full grid grid-cols-[80px_auto] items-center gap-4">
                                <FormLabel className="text-md">{`Name`}</FormLabel>
                                <FormField 
                                    control={form.control}
                                    name="RFP.name"
                                    render={({field}) => (
                                        <Input
                                            className="h-full"
                                            id="RFPName"
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
                                    name="RFP.description"
                                    render={({field}) => (
                                        <Textarea
                                            id="RFPDescription"
                                            placeholder={`Enter a description for this RFP`}
                                            // defaultValue={field.value || ''}
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </FormItem>

                            <Separator />

                            <FormField 
                                control={form.control}
                                name="RFP.contacts"
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
                                                            "RFP.contacts",
                                                            field?.value?.filter((t: ContactType, i: number) => i !== index)
                                                        )
                                                    }}
                                                    onValueChange={newValue => {
                                                        form.setValue(
                                                            "RFP.contacts",
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
                                            form.setValue("RFP.contacts", [
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
                                name="RFP.attachments"
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
                                                            "RFP.attachments",
                                                            field?.value?.filter((t: AttachmentType, i: number) => i !== index)
                                                        )
                                                    }}
                                                    onValueChange={newValue => {
                                                        form.setValue(
                                                            "RFP.attachments",
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
                                            form.setValue("RFP.attachments", [
                                                ...(field.value),
                                                { name: "", link: "" }
                                            ])
                                        }}
                                    >{`Add an attachment`}</Button>
                                    </>
                                )}
                            />

                            <Separator />

                            <FormItem className="w-full grid grid-cols-[80px_auto] items-center gap-4">
                                <FormLabel className="text-md">{`Budget`}</FormLabel>
                                <FormField 
                                    control={form.control}
                                    name="RFP.funding"
                                    render={({field}) => (
                                        <Input
                                            className="h-full"
                                            id="RFPBudget"
                                            type="number"
                                            placeholder={`Enter a number`}
                                            defaultValue={field.value}
                                            onChange={e =>
                                                field.onChange(
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem className="w-full grid grid-cols-[80px_auto] items-center gap-4">
                                <FormLabel className="text-md">{`Open to`}</FormLabel>
                                <FormField 
                                    control={form.control}
                                    name="RFP.openTo"
                                    render={({field}) => (
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Open to work from..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {RFP_OPEN_TO_TYPE_OPTIONS.map((type, index) => (
                                                    <SelectItem key={index} value={type.value}>{type.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormItem>

                            <FormItem className="w-full grid grid-cols-[80px_auto] items-center gap-4">
                                <FormLabel className="text-md">{`Start`}</FormLabel>
                                <FormField 
                                    control={form.control}
                                    name="RFP.startDate"
                                    render={({field}) => (
                                        <Popover >
                                            <PopoverTrigger asChild>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || new Date()}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </FormItem>

                            <FormItem className="w-full grid grid-cols-[80px_auto] items-center gap-4">
                                <FormLabel className="text-md">{`End`}</FormLabel>
                                <FormField 
                                    control={form.control}
                                    name="RFP.endDate"
                                    render={({field}) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || new Date()}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </FormItem>
                        </CardContent>

                        <CardFooter>
                            <Button
                                className="w-full"
                                variant="destructive"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault()
                                    form.setValue("RFP", undefined)
                                }}
                            >
                                <FaTrash />
                                {`Remove RFP`}
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Button
                        className="w-full"
                        variant="secondary"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            form.setValue("RFP", {
                                name: '',
                                funding: 0,
                                description: null,
                                contacts: [],
                                attachments: [],
                                openTo: 'ALL',
                                startDate: null,
                                endDate: null
                            })
                        }}
                    >{`Add a RFP`}</Button>
                )}
            </FormControl>
        </FormItem>
    )
}