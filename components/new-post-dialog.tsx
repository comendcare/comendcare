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
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {EmojiPicker} from "@/components/emoji-picker"
import {Textarea} from "@/components/ui/textarea";
import {getSession} from "@/lib/auth";
import {FaGlobe} from "react-icons/fa6";
import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {Separator} from "@/components/ui/separator";
import {ProfilePhoto} from "@/components/profile-photo"
import {createPost, updateOrganization} from "@/lib/actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";


const formSchema = z.object({
    text: z.string().min(2, {
        message: "Post must be at least 2 characters.",
    }),
})


export default async function NewPostDialog() {
    const router = useRouter()
    const {data: session} = useSession()

    const form = useForm<z.infer<typeof formSchema>>({
        mode: "onChange",
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()

        Object.entries(values).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        try {
            await createPost(formData)
            toast.success("Post created successfully!");
            router.refresh(); // Refresh the page to reflect changes
        } catch (error) {
            console.error("Error updating organization:", error);
            toast.error("Failed to update organization profile.");
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-baseline gap-2 py-2 px-3">
                        <Link
                            className="flex gap-2"
                            href={`/profile/${""}`}
                        >
                            <ProfilePhoto
                                img={session?.user.image}
                                name={session?.user.name}
                                className="h-8 w-8 rounded-full"
                            />
                        </Link>
                        <Button
                            className="w-full bg-accent rounded-full dark:hover:brightness-110 justify-start text-muted-foreground text-sm py-2 line-clamp-2 h-8 md:h-8 text-left"
                            variant="ghost"
                            disabled={!session}
                        >
                            {`What's happening today, ${session?.user.name?.split(" ")[0]}?`}
                        </Button>
                    </CardHeader>
                    <Separator/>
                    <CardContent className="w-full flex p-2">

                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="min-w-40 sm:w-1/2 max-w-4xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <DialogHeader>
                            <DialogTitle>
                                Create a new post
                            </DialogTitle>
                        </DialogHeader>
                        <FormField
                            control={form.control}
                            name="text"
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
                                const currentValue = form.getValues("text") || "";
                                form.setValue("text", currentValue + value, {
                                    shouldValidate: true,
                                });
                            }}
                        />
                        <DialogFooter className="flex flex-row sm:justify-between w-full">
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
