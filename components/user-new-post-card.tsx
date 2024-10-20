"use client"

import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {FaPaperPlane} from "react-icons/fa6";
import * as z from "zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {createDicebearAvatar} from "@/lib/utils";

const newPostSchema = z.object({
    text: z
        .string()
});

type ProfileFormValues = z.infer<typeof newPostSchema>;

export const UserNewPostCard = () => {
    const [dataPayload, setDataPayload] = useState({
        text: "",
    });

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(newPostSchema),
        mode: "onChange",
    });


    async function onSubmit(data: ProfileFormValues) {
        // await makeRequest();
        // toast({
        //   title: "You submitted the following values:",
        //   description: (
        //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
        //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        //     </pre>
        //   ),
        // })
        console.log("form submitted");
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-row space-x-2 justify-between items-center">
                    <Avatar>
                        <AvatarImage src={createDicebearAvatar("", 50, 40, "identicon")}/>
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                            <FormField
                                control={form.control}
                                name="text"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                id="text"
                                                placeholder={"What's on your mind?"}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>

                    <Button
                        variant="ghost"
                        className="p-3 disabled:opacity-50"
                        disabled={form.watch("text")?.length === 0}
                    >
                        <FaPaperPlane/>
                    </Button>

                </CardTitle>
            </CardHeader>
        </Card>
    )
}