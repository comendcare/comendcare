"use client"

import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {EmojiPicker} from "@/components/emoji-picker"
import {Textarea} from "@/components/ui/textarea";
import {getSession} from "@/lib/auth";
import {FaGlobe} from "react-icons/fa6";
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react";


const formSchema = z.object({
    post: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
})


export default async function NewPostDialog() {
    const {data: session} = useSession()

    const form = useForm<z.infer<typeof formSchema>>({
        mode: "onChange",
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    New post
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-40 sm:w-1/3">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <DialogHeader>
                            <DialogTitle>
                                Create a new post
                            </DialogTitle>
                        </DialogHeader>
                        <FormField
                            control={form.control}
                            name="post"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            className="border-0 text-2xl p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            placeholder={`What's on your mind, ${session?.user.name?.split(" ")[0]}?`}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <EmojiPicker
                            onChange={(value) => {
                                // Append the emoji to the "post" field's current value
                                const currentValue = form.getValues("post") || "";
                                form.setValue("post", currentValue + value, {
                                    shouldValidate: true,
                                });
                            }}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex flex-row items-center gap-x-2">
                                <FaGlobe/>
                                Everyone can comment
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    Everyone
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Users from organizations you follow
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Only users from organizations you mention
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DialogFooter>
                            <Button type="submit">
                                Post
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}