"use client"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSession} from "next-auth/react"
import {createOrganization, createOrGetSite, updateOrganization} from "@/lib/actions";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import va from "@vercel/analytics";
import {useRouter} from "next/navigation";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import MultipleSelector, {Option} from "@/components/ui/multiple-selector";
import {Slider} from "@/components/ui/slider";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Card } from "@tremor/react";
import { CardContent, CardHeader } from "./ui/card";
import { createRoadmap } from "@/lib/actions";

const newRoadmapFormSchema = z.object({})

export default function NewRoadmapForm() {
    const {data: session} = useSession()
    const router = useRouter()

    const form = useForm<z.infer<typeof newRoadmapFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(newRoadmapFormSchema)
    })

    async function onSubmit(values: z.infer<typeof newRoadmapFormSchema>) {
        console.log(`submit form`, values)

        if (session?.user?.organizationId) {
            const roadmap = await createRoadmap(session.user.organizationId)
            router.push(`/app/roadmap/${roadmap.id}`)
        } else {
            console.error(`organization id is not defined in the session:`, session)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-1/2">
                <h1 className="text-2xl">Start with an example milestone</h1>
                <p>Select a sample milestone to hit the ground running.</p>

                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full max-w-sm"
                >
                    <CarouselContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                            <Card>
                                <CardContent className="flex items-center justify-center p-6">
                                <span className="text-3xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </Card>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>

                <div className="flex flex-row space-x-2">
                    <Button type="submit">Create an empty roadmap</Button>
                </div>
            </form>
        </Form>
    )
}

