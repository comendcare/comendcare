"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {FaPen, FaPencil} from "react-icons/fa6";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";

const DATE_REQUIRED_ERROR = "Date is required."

const invitationFormSchema = z.object({
    name: z.string().min(3, {
        message: "Your name must be at least 3 characters.",
    }),
    numPatients: z.number().min(1, {
        message: "Your name must be at least 1 characters.",
    }),
    raised: z.number(),
    founded: z
        .object(
            {
                from: z.date(),
                to: z.date().optional()
            },
            { required_error: DATE_REQUIRED_ERROR }
        )
        .refine(date => {
            return !!date.from
        }, DATE_REQUIRED_ERROR),
})


export default function EditProfileHeaderDialog() {
    const router = useRouter();

    const form = useForm<z.infer<typeof invitationFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(invitationFormSchema),
    })

    async function onSubmit(values: z.infer<typeof invitationFormSchema>) {

    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    className="gap-x-2"
                >
                    <FaPen/>
                    Edit header
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit about
                    </DialogTitle>
                    <DialogDescription>
                        {`Make changes to your profile here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Organization name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Test org"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The name of your organization.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="numPatients"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Number of patients
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="123"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The approximate or exact number of patients part of your organization.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="raised"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Amount raised
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="100000"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The amount of funding raised for your organization.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="numPatients"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Date founded
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Spongebob Squarepants"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The approximate or exact date your organization was founded.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}