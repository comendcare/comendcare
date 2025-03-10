"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import Papa from "papaparse"
import { DialogClose } from "./ui/dialog"
import { toast } from "sonner"

const formSchema = z.object({
    file: z
        .instanceof(File)  // Check that the input is indeed a File object
        .refine((file) => file.name.endsWith('.csv'), {
            message: 'Please upload a .csv file.',
        }),
});

export function FileUploadForm({accept, onSubmit}: {accept: string, onSubmit: (file: File | undefined) => void}) {
    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(formSchema)
    })
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue("file", event.target.files?.[0])
        form.trigger("file")
        if (event.target.files?.[0].name.endsWith(".csv")) {
            setSelectedFile(event.target.files?.[0] || undefined)
        } else {
            // toast('Error!', {
            //     description: `Please upload a valid .csv file.`
            // })
        }
    }

    const handleSubmitClick = (data: any) => {
        onSubmit(selectedFile)
    }

    useEffect(() => {
        console.log(`form is valid`, form.formState)
    }, [form.formState])

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmitClick)}
                className="flex flex-col gap-8 py-4"
            >
                <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                        <FormItem>
                            <FormLabel>
                                Upload file
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept={accept}
                                    onChange={handleFileChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogClose className="w-fit self-end">
                    <Button
                        variant={"cta"}
                        className="w-fit"
                        type="submit"
                        disabled={!form.formState.isValid}
                    >
                        Upload
                    </Button>
                </DialogClose>
            </form>
        </Form>
    )
}
