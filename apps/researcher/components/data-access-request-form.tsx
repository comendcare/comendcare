"use client"

import {useEffect, useState} from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@comend/components/ui/form"
import { Input } from "@comend/components/ui/input"
import { Textarea } from "@comend/components/ui/textarea"
import { Button } from "@comend/components/ui/button"
import { Checkbox } from "@comend/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@comend/components/ui/radio-group"
import { Label } from "@comend/components/ui/label"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import LoadingDots from "@comend/components/icons/loading-dots"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comend/components/ui/card"
import {ArrowLeft, FileText} from "lucide-react";
import { createMaterialAndDataAccessRequest } from "@comend/lib/actions"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/packages/components/ui/select";
import type {Option} from "@/packages/lib/types";
import {getAllOrganizations} from "@/packages/lib/fetchers";

const dataAccessRequestSchema = z.object({
    // Basic Request Info
    title: z.string().min(3, { message: "Title is required and must be at least 3 characters long." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    organizationId: z.string().min(1, { message: "You must select an organization." }),
    openToCollab: z.enum(["yes", "no"], { required_error: "Please indicate collaboration preference." }),

    // Research Project Details
    projectTitle: z.string().min(5, { message: "Project title is required and must be at least 5 characters." }),
    projectDescription: z.string().min(20, { message: "Project description must be at least 20 characters." }),
    dataPurpose: z.string().min(10, { message: "Purpose of data request is required." }),
    fundingSource: z.string().optional(),
    hasIrbApproval: z.enum(["yes", "no"], { required_error: "IRB approval status is required." }),
    irbProtocolNumber: z.string().optional(),
    irbExplanation: z.string().optional(),
    disseminationPlan: z.string().min(10, { message: "Dissemination plan is required." }),
    patientSignificance: z.string().min(10, { message: "Patient significance is required." }),

    // Requested Data
    dataTypes: z.array(z.string()).min(1, { message: "At least one data type must be selected." }),
    additionalDataDetails: z.string().optional(),
    participantSelection: z.enum(["all", "select"], { required_error: "Participant selection is required." }),
    selectedParticipants: z.array(z.string()).optional(),
    dataCriteria: z.string().optional(),
    needsLinkedSamples: z.enum(["yes", "no"], { required_error: "Linked samples preference is required." }),

    // Data Security & Usage
    hasCollaborators: z.enum(["yes", "no"], { required_error: "Collaborator information is required." }),
    collaboratorDetails: z.string().optional(),
    dataStorage: z.string().min(10, { message: "Data storage and security plan is required." }),
    isCommercial: z.enum(["yes", "no"], { required_error: "Commercial use information is required." }),
    commercialDetails: z.string().optional(),
    usesAI: z.enum(["yes", "no"], { required_error: "AI/ML usage information is required." }),
    aiDetails: z.string().optional(),

    agreesToUpdates: z.enum(["yes"], { required_error: "Agreement to provide updates is required." }),
    agreesToSummary: z.enum(["yes"], { required_error: "Agreement to provide summary is required." }),

    // Data Use Agreement
    agreements: z.array(z.string()).min(4, { message: "All agreements must be accepted." }),
})

const dataTypeOptions = [
    { id: "clinical", label: "Clinical Diagnosis" },
    { id: "genomic", label: "Genomic Data" },
    { id: "phenotypic", label: "Phenotypic Data" },
    { id: "imaging", label: "Imaging" },
    { id: "survey", label: "Survey Data" },
]

const agreementItems = [
    {
        id: "approved-use",
        text: "I confirm that the requested data will be used solely for the approved research project.",
    },
    {
        id: "acknowledge",
        text: "I agree to acknowledge Project 8p as a data source in any publications or presentations resulting from this research using language which will be provided by Project 8p.",
    },
    {
        id: "privacy-guidelines",
        text: "I agree to follow all applicable data privacy and security guidelines as outlined by my institution.",
    },
    {
        id: "no-reidentify",
        text: "I agree that I will not re-identify any data or contact individuals who have contributed data or samples made available through this portal.",
    },
]

// Mock participant options - replace with actual data
const participantOptions = [
    { id: "participant-1", label: "Participant 001 - Age 25, Mutation A" },
    { id: "participant-2", label: "Participant 002 - Age 30, Mutation B" },
    { id: "participant-3", label: "Participant 003 - Age 18, Mutation C" },
]

export default function DataAccessRequestForm({ datasetIds = [] }: { datasetIds: string[] }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [organizations, setOrganizations] = useState<Option[]>([])
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof dataAccessRequestSchema>>({
        resolver: zodResolver(dataAccessRequestSchema),
        defaultValues: {
            projectTitle: "",
            projectDescription: "",
            dataPurpose: "",
            fundingSource: "",
            hasIrbApproval: "no",
            irbProtocolNumber: "",
            irbExplanation: "",
            disseminationPlan: "",
            patientSignificance: "",

            dataTypes: [],
            additionalDataDetails: "",
            participantSelection: "all",
            selectedParticipants: [],
            dataCriteria: "",
            needsLinkedSamples: "no",

            hasCollaborators: "no",
            collaboratorDetails: "",
            dataStorage: "",
            isCommercial: "no",
            commercialDetails: "",
            usesAI: "no",
            aiDetails: "",

            openToCollab: "no",
            agreesToUpdates: "yes",
            agreesToSummary: "yes",

            agreements: [],
        },
    })

    const watchHasIrbApproval = form.watch("hasIrbApproval")
    const watchHasCollaborators = form.watch("hasCollaborators")
    const watchIsCommercial = form.watch("isCommercial")
    const watchUsesAI = form.watch("usesAI")
    const watchParticipantSelection = form.watch("participantSelection")
    const watchNeedsLinkedSamples = form.watch("needsLinkedSamples")

    async function onSubmit(values: z.infer<typeof dataAccessRequestSchema>) {
        setLoading(true)

        try {
            const formData = new FormData()
            const data = {
                projectDetails: {
                    title: values.projectTitle,
                    description: values.projectDescription,
                    purpose: values.dataPurpose,
                    fundingSource: values.fundingSource,
                    hasIrbApproval: values.hasIrbApproval === "yes",
                    irbProtocolNumber: values.irbProtocolNumber,
                    irbExplanation: values.irbExplanation,
                    disseminationPlan: values.disseminationPlan,
                    patientSignificance: values.patientSignificance,
                },
                requestedData: {
                    dataTypes: values.dataTypes,
                    additionalDetails: values.additionalDataDetails,
                    participantSelection: values.participantSelection,
                    selectedParticipants: values.selectedParticipants,
                    dataCriteria: values.dataCriteria,
                    needsLinkedSamples: values.needsLinkedSamples === "yes",
                },
                dataSecurity: {
                    hasCollaborators: values.hasCollaborators === "yes",
                    collaboratorDetails: values.collaboratorDetails,
                    dataStorage: values.dataStorage,
                    isCommercial: values.isCommercial === "yes",
                    commercialDetails: values.commercialDetails,
                    usesAI: values.usesAI === "yes",
                    aiDetails: values.aiDetails,
                },
                collaboration: {
                    openToCollab: values.openToCollab === "yes",
                    agreesToUpdates: values.agreesToUpdates === "yes",
                    agreesToSummary: values.agreesToSummary === "yes",
                },
                agreements: values.agreements,
                datasetIds,
            }

            formData.append("data", JSON.stringify(data))

            const res = await createMaterialAndDataAccessRequest(session?.user.id, formData)
            if (res?.error) {
                toast.error(res.error)
                return
            }

            toast.success("Data access request submitted successfully!")
            if (watchNeedsLinkedSamples) {
                router.push("/new-biosample-request")
            } else {
                router.push("/requests")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred during submission.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        async function fetchOrgs() {
            try {
                const response = await getAllOrganizations({
                    id: true,
                    name: true,
                    description: true,
                })
                if (response.success && Array.isArray(response.data)) {
                    const orgOptions = response.data.map((org: any) => ({
                        label: org.name,
                        value: org.id,
                        data: org,
                    }))
                    setOrganizations(orgOptions)
                } else {
                    toast.error("Failed to load organizations.")
                }
            } catch (error) {
                toast.error("Error loading organizations.")
                console.error(error)
            }
        }
        fetchOrgs()
    }, [])

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <Button variant="secondary" onClick={() => router.push("/data")} className="w-min">
                    <ArrowLeft />
                    Back to data samples
                </Button>
                <h1 className="text-3xl font-bold">Project 8p Data Access Request Form</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Complete this form to request access to Project 8p data for your research project. All requests will be
                    reviewed for scientific merit and compliance with data use policies.
                </p>
            </div>

            {datasetIds.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Requested Datasets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {datasetIds.map((id) => (
                                <li key={id}>{id}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                        <FileText className="h-5 w-5" />📄 Available Datasets
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700">
                    <p>Click here to view more details on available datasets before submitting your request.</p>
                </CardContent>
            </Card>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Request Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Request Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="organizationId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Organization</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose an organization..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {organizations.map((org) => (
                                                    <SelectItem key={org.value} value={org.value}>
                                                        {org.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Request Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Access to tissue samples from study X" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brief Request Overview</FormLabel>
                                        <FormControl>
                                            <Textarea rows={3} placeholder="Provide a brief overview of your request..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="openToCollab"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Would you be open to collaboration with Project 8p researchers?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="collab-yes" />
                                                    <Label htmlFor="collab-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="collab-no" />
                                                    <Label htmlFor="collab-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>


                    {/* Research Project Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Research Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="projectTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title of Research Project</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your research project title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="projectDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brief Description of Research</FormLabel>
                                        <FormControl>
                                            <Textarea rows={4} placeholder="Describe your research project..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dataPurpose"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Purpose of Data Request</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., biomarker discovery, genotype-phenotype correlation, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fundingSource"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Funding Source(s) (if applicable)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter funding sources" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hasIrbApproval"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Has this research been approved by an Institutional Review Board (IRB) or Ethics Committee?
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="irb-yes" />
                                                    <Label htmlFor="irb-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="irb-no" />
                                                    <Label htmlFor="irb-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchHasIrbApproval === "yes" && (
                                <FormField
                                    control={form.control}
                                    name="irbProtocolNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>IRB Protocol Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter IRB protocol number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {watchHasIrbApproval === "no" && (
                                <FormField
                                    control={form.control}
                                    name="irbExplanation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Explain why IRB approval is not required</FormLabel>
                                            <FormControl>
                                                <Textarea rows={3} placeholder="Explain why IRB approval is not required..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="disseminationPlan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dissemination plan of analysis and findings</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Describe how you plan to disseminate your findings..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="patientSignificance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Significance for patients and/or families</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Describe the significance of this research for patients and families..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Requested Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Requested Data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="dataTypes"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Type(s) of Data Needed</FormLabel>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {dataTypeOptions.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="dataTypes"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(item.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, item.id])
                                                                                : field.onChange(field.value?.filter((value) => value !== item.id))
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">{item.label}</FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="additionalDataDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Additional Request Details</FormLabel>
                                        <FormControl>
                                            <Textarea rows={3} placeholder="Additional request detail" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="participantSelection"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Please select participants</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-col space-y-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="all" id="all-participants" />
                                                    <Label htmlFor="all-participants">All available</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="select" id="select-participants" />
                                                    <Label htmlFor="select-participants">Select Participants</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchParticipantSelection === "select" && (
                                <FormField
                                    control={form.control}
                                    name="selectedParticipants"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Select Specific Participants</FormLabel>
                                            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-3">
                                                {participantOptions.map((participant) => (
                                                    <FormField
                                                        key={participant.id}
                                                        control={form.control}
                                                        name="selectedParticipants"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={participant.id}
                                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(participant.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...(field.value || []), participant.id])
                                                                                    : field.onChange(field.value?.filter((value) => value !== participant.id))
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal text-sm">{participant.label}</FormLabel>
                                                                </FormItem>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="dataCriteria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specific Data Criteria (if any)</FormLabel>
                                        <FormControl>
                                            <Textarea rows={3} placeholder="e.g., age range, mutation type, clinical phenotype" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="needsLinkedSamples"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Do you need linked sample access from the Project 8p Biobank?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="samples-yes" />
                                                    <Label htmlFor="samples-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="samples-no" />
                                                    <Label htmlFor="samples-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchNeedsLinkedSamples === "yes" && (
                                <Card className="border-orange-200 bg-orange-50">
                                    <CardContent className="pt-4">
                                        <p className="text-sm text-orange-700">
                                            You will need to complete a sample request form to request the linked samples.
                                        </p>
                                        <p className="text-sm text-orange-700">
                                            Following submission of this request, you will be forwarded to the corresponding linked request form.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>

                    {/* Data Security & Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Security & Usage</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="hasCollaborators"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Will this data be shared with any collaborators outside your institution?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="collab-yes" />
                                                    <Label htmlFor="collab-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="collab-no" />
                                                    <Label htmlFor="collab-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {watchHasCollaborators === "yes" && (
                                <FormField
                                    control={form.control}
                                    name="collaboratorDetails"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Provide details about collaborators</FormLabel>
                                            <FormControl>
                                                <Textarea rows={3} placeholder="Describe your collaborators and their role..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="dataStorage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>How will the data be stored and secured?</FormLabel>
                                        <FormControl>
                                            <Textarea rows={3} placeholder="Describe your data storage and security measures..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isCommercial"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Will this data be used for commercial purposes?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="commercial-yes" />
                                                    <Label htmlFor="commercial-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="commercial-no" />
                                                    <Label htmlFor="commercial-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {watchIsCommercial === "yes" && (
                                <FormField
                                    control={form.control}
                                    name="commercialDetails"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Provide details about commercial use</FormLabel>
                                            <FormControl>
                                                <Textarea rows={3} placeholder="Describe the commercial applications..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="usesAI"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Will this data be used for AI or machine learning applications?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="ai-yes" />
                                                    <Label htmlFor="ai-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="ai-no" />
                                                    <Label htmlFor="ai-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {watchUsesAI === "yes" && (
                                <FormField
                                    control={form.control}
                                    name="aiDetails"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Provide details about AI/ML applications</FormLabel>
                                            <FormControl>
                                                <Textarea rows={3} placeholder="Describe how AI/ML will be used..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Collaboration & Reporting */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Collaboration & Reporting</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="openToCollab"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Would you be open to collaboration with Project 8p researchers?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="open-collab-yes" />
                                                    <Label htmlFor="open-collab-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="open-collab-no" />
                                                    <Label htmlFor="open-collab-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="agreesToUpdates"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Do you agree to provide periodic updates on your research progress using the data? (Required)
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="updates-yes" />
                                                    <Label htmlFor="updates-yes">Yes</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="agreesToSummary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Do you agree to submit a summary of findings to Project 8p upon completion of your study?
                                            (Required)
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="summary-yes" />
                                                    <Label htmlFor="summary-yes">Yes</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Data Use Agreement */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Use Agreement</CardTitle>
                            <CardDescription>Please review and accept all acknowledgments below</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="agreements"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Acknowledgment (all required)</FormLabel>
                                        <div className="space-y-4">
                                            {agreementItems.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="agreements"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(item.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, item.id])
                                                                                : field.onChange(field.value?.filter((value) => value !== item.id))
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal leading-relaxed">{item.text}</FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-center">
                        <Button type="submit" disabled={loading} size="lg" className="px-8">
                            {loading ? <LoadingDots color="#ffffff" /> : "📩 Submit Request"}
                        </Button>
                    </div>
                </form>
            </Form>

            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                    <p className="text-sm text-blue-700">
                        💡 <strong>Questions?</strong> If you have any questions about this request or the process, please reach out
                        to{" "}
                        <a href="mailto:portal@project8p.org" className="underline">
                            portal@project8p.org
                        </a>
                        .
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
