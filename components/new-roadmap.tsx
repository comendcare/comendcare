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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { createRoadmap } from "@/lib/actions";
import { truncate } from "@/lib/utils";
import { FaCalendar, FaListCheck } from "react-icons/fa6";

const newRoadmapFormSchema = z.object({})

const sampleMilestones = [
    {
        title: 'Milestone 1',
        description: 'This is the first Milestone',
        budget: 100000,
        papers: [],
        tasks: [
            {
                name: 'Task 1',
                status: 'TODO',
                orderPosition: 0,
                kanbanPosition: 0,
                checklist: [
                    { name: 'checklist item 1', complete: true },
                    { name: 'checklist item 2', commplete: false},
                    { name: 'checklist item 3', complete: false }
                ]
            },
            {
                name: 'Task 2',
                status: 'TODO',
                orderPosition: 0,
                kanbanPosition: 0,
                checklist: [
                    { name: 'checklist item 1', complete: true }
                ]
            }
        ]
    },
    {
        title: 'Milestone 2',
        description: 'This is my second milestone...',
        budget: 100000,
        papers: [],
        tasks: [
            {
                name: 'First task',
                status: 'TODO',
                orderPosition: 0,
                kanbanPosition: 0,
                checklist: []
            }
        ]
    },
    {
        title: 'Milestone 3',
        description: 'This is my third milestone...',
        budget: 100000,
        papers: [],
        tasks: [
            {
                name: 'First task',
                status: 'TODO',
                orderPosition: 0,
                kanbanPosition: 0,
                checklist: []
            }
        ]
    }
]

export default function NewRoadmapForm() {
    const {data: session} = useSession()
    const router = useRouter()

    const form = useForm<z.infer<typeof newRoadmapFormSchema>>({
        mode: "onChange",
        resolver: zodResolver(newRoadmapFormSchema)
    })

    async function createEmptyRoadmap() {
        if (session?.user?.organizationId) {
            const roadmap = await createRoadmap(session.user.organizationId)
            router.push(`/app/roadmap/${roadmap.id}`)
        } else {
            console.error(`organization id is not defined in the session:`, session)
        }
    }

    async function createTemplateRoadmap(roadmapData: any) {
        if (session?.user?.organizationId) {
            const roadmap = await createRoadmap(session.user.organizationId, roadmapData)
            router.push(`/app/roadmap/${roadmap.id}`)
        } else {
            console.error(`organization id is not defined in the session:`, session)
        }
    }

    return (
        <>
            <h1 className="text-2xl">Create your Roadmap</h1>
            <p>Select a sample milestone to hit the ground running.</p>

            <Carousel
                opts={{
                    align: "start"
                }}
                className="w-full max-w-sm"
            >
                <CarouselContent>
                    {sampleMilestones.map((milestoneData, index) => (
                        <CarouselItem key={index} className="lg:basis-1/2">
                            <button onClick={() => createTemplateRoadmap({ milestones: [milestoneData] })}>
                            <Card className="bg-white shadow-sm rounded-lg overflow-hidden text-left">
                                <CardHeader>
                                    <CardTitle>{milestoneData.title}</CardTitle>
                                    <CardDescription>
                                        {milestoneData.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-8">
                                    <ul className="flex flex-col gap-2">
                                        {milestoneData.tasks?.map((task, index) => (
                                            <li key={index} className="flex flex-row gap-2 items-center">
                                                <FaListCheck />
                                                <p>{task.name}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            </button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

            <div className="flex flex-row space-x-2">
                <Button onClick={createEmptyRoadmap}>Create an empty roadmap</Button>
            </div>
        </>
    )
}

