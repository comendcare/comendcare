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
import { FaCalendar, FaCheck, FaListCheck } from "react-icons/fa6";
import { ScrollArea } from "./ui/scroll-area";

const newRoadmapFormSchema = z.object({})

const sampleMilestones = [
    {
        title: 'Natural History Study',
        description: 'Our observational research effort that follows individuals with a specific disease over time, collecting data on how the disease develops and progresses without intervention.',
        papers: [],
        tasks: []
    },
    {
        title: 'Review Literature',
        description: 'Examine existing research to better understand the disease, identify gaps in knowledge, and assess the latest findings on potential treatments.',
        papers: [],
        tasks: []
    },
    {
        title: 'Identify Existing Disease Models',
        description: 'Research and evaluate lab models.',
        status: 'INPROGRESS',
        papers: [],
        tasks: []
    },
    {
        title: 'Construct Mouse Models',
        description: '',
        status: 'INPROGRESS',
        papers: [],
        tasks: [
            { name: 'Secure Funding' },
            { name: 'Ethical Standards Advocacy' },
            { name: 'Prioritize Model Features', description: 'Work with researchers to prioritize features in the model that most directly address patient needs and research goals.' }
        ]
    },
    {
        title: 'Construct Patient-Derived Cells',
        description: 'Work with researchers to create cell lines that replicate disease characteristics.',
        papers: [],
        tasks: [
            { name: 'Coordinate Patient Participation' },
            { name: 'Secure Funding' },
            { name: 'Determine Cell Model Relevancy', description: 'Determine if each cell model is relevant for testing therapies and studying disease mechanisms that refect our patients real experiences.'}
        ]
    },
    {
        title: 'Design ASO Construct',
        description: 'Design an ASO (Antisense Oligonucleotide) construct that specifically targets the genetic mutations driving our disease.',
        papers: [],
        tasks: []
    },
    {
        title: 'Produce Plasmid',
        description: 'Create a DNA template essential for developing and testing therapies.',
        papers: [],
        tasks: []
    },
    {
        title: 'Proof-Of-Concept Study',
        description: 'Design and conduct initial experiments to demonstrate that a potential therapy or intervention can effectively target the disease.',
        papers: [],
        tasks: []
    },
    {
        title: 'Animal Toxicology Study',
        description: 'Conduct preclinical trials to evaluate the safety and potential side effects of a therapy.',
        papers: [],
        tasks: []
    }
]

const sampleRoadmaps = [
    {
        title: 'ASO Roadmap',
        description: 'By developing an ASO therapy, we aim to address the underlying genetic cause of our rare disease. Our plan outlines each stage, from identifying the target gene to advancing through clinical trials, with the goal of bringing a safe and effective treatment to patients who urgently need it.',
        milestones: sampleMilestones
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
        <ScrollArea className="h-full w-full">
            <div className="flex flex-col justify-left gap-8 p-20">
            <h1 className="text-3xl text-bold">Create your Roadmap</h1>

            <div className="w-full flex flex-col">
                <div className="flex flex-col gap-4 w-full">
                <p>Start from a milestone template.</p>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {sampleMilestones.map((milestoneData, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 2xl:basis-1/4">
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
                                                    <FaCheck size={20} className="h-4 w-4 text-green-500"/>
                                                    <p className="grow">{task.name}</p>
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
                </div>

                <div className="flex flex-col gap-4">
                <p>Start from a roadmap template.</p>
                <Carousel
                    opts={{
                        align: "start"
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {sampleRoadmaps.map((roadmapData, index) => (
                            <CarouselItem key={index} className="xl:basis-1/2">
                                <button onClick={() => createTemplateRoadmap(roadmapData)}>
                                <Card className="bg-white shadow-sm rounded-lg overflow-hidden text-left">
                                    <CardHeader>
                                        <CardTitle>{roadmapData.title}</CardTitle>
                                        <CardDescription>
                                            {roadmapData.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-2">
                                        <h5 className="text-lg">Roadmap Milestones</h5>
                                        <ul className="flex flex-col gap-2">
                                            {roadmapData.milestones?.map((milestone, index) => (
                                                <li key={index} className="flex flex-row gap-2 items-center">
                                                    <FaCheck size={20} className="h-4 w-4 text-green-500"/>
                                                    <p className="grow">{milestone.title}</p>
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
                </div>
            </div>

            <div className="flex flex-row space-x-2">
                <Button onClick={createEmptyRoadmap}>Create an empty roadmap</Button>
            </div>
            </div>
        </ScrollArea>
    )
}

