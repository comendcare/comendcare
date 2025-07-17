"use client"

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
import { useEffect, useState } from "react"
import { createMaterialAndDataAccessRequest } from "@comend/lib/actions"
import { getAllOrganizations } from "@comend/lib/fetchers"
import type { Option } from "@comend/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@comend/components/ui/select"
import LoadingDots from "@comend/components/icons/loading-dots"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comend/components/ui/card"

const accessRequestSchema = z.object({
    // Basic Request Info
    title: z.string().min(3, { message: "Title is required and must be at least 3 characters long." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    organizationId: z.string().min(1, { message: "You must select an organization." }),
    openToCollab: z.enum(["yes", "no"], { required_error: "Please indicate collaboration preference." }),

    // Research Project Details
    studyTitle: z.string().min(5, { message: "Study title is required." }),
    studyDescription: z.string().min(20, { message: "Study description must be at least 20 characters." }),
    justification: z.string().min(20, { message: "Justification must be at least 20 characters." }),
    hasIrbApproval: z.enum(["yes", "no"]),
    irbStatus: z.string().optional(),
    hasRisks: z.enum(["yes", "no"]),
    riskDescription: z.string().optional(),
    disseminationPlan: z.string().min(10, { message: "Please describe your dissemination plan." }),
    patientSignificance: z.string().min(10, { message: "Please describe the significance for patients/families." }),

    // Sample Collection Details
    sampleTypes: z.array(z.string()).min(1, { message: "At least one sample type must be selected." }),
    otherSampleType: z.string().optional(),
    participantCount: z.number().min(1, { message: "Number of participants must be at least 1." }),
    processingRequirements: z.string().optional(),

    // Logistics
    timeline: z.string().min(5, { message: "Timeline is required." }),
    logisticsContact: z.string().email({ message: "Valid logistics contact email is required." }),
    providesCollectionKit: z.enum(["yes", "no"]),
    needsCollectionMaterials: z.enum(["yes", "no"]),
    participantCompensation: z.enum(["yes", "no"]),
    compensationDetails: z.string().optional(),
    shippingAddress: z.string().optional(),
    fedexAccount: z.string().optional(),
    shippingMethod: z.string().optional(),
    shippingContact: z.string().optional(),
    shippingPhone: z.string().optional(),

    // Commercial Use
    isCommercial: z.enum(["yes", "no"]),
    fundingOrganization: z.string().optional(),

    // Agreements
    agreements: z.array(z.string()).min(5, { message: "All agreements must be accepted." }),
})

const sampleTypeOptions = [
    { id: "blood", label: "Blood" },
    { id: "saliva", label: "Saliva" },
    { id: "buccal", label: "Buccal Swab" },
    { id: "urine", label: "Urine" },
    { id: "stool", label: "Stool" },
    { id: "skin", label: "Skin Biopsy" },
    { id: "fibroblasts", label: "Fibroblasts" },
    { id: "other", label: "Other" },
]

const agreementItems = [
    {
        id: "minimize-burden",
        text: "I understand that study participants are rare and valuable, and I will minimize participant burden.",
    },
    {
        id: "return-samples",
        text: "I agree to return any unused biosamples rather than discard them.",
    },
    {
        id: "acknowledge",
        text: "I agree to acknowledge the organization in publications and provide updates on research progress.",
    },
    {
        id: "share-data",
        text: "I agree to share de-identified data generated from these samples with the organization upon request.",
    },
    {
        id: "understand-review",
        text: "I understand that my request is subject to ethical, logistical, and scientific review, and that approval is not guaranteed.",
    },
]

export default function MaterialAndDataAccessRequestForm() {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [organizations, setOrganizations] = useState<Option[]>([])
    const [selectedOrg, setSelectedOrg] = useState<any>(null)

    const form = useForm<z.infer<typeof accessRequestSchema>>({
        resolver: zodResolver(accessRequestSchema),
        defaultValues: {
            title: "",
            description: "",
            organizationId: "",
            studyTitle: "",
            studyDescription: "",
            justification: "",
            hasIrbApproval: "no",
            irbStatus: "",
            hasRisks: "no",
            riskDescription: "",
            sampleTypes: [],
            otherSampleType: "",
            participantCount: 1,
            processingRequirements: "",
            timeline: "",
            logisticsContact: "",
            providesCollectionKit: "no",
            needsCollectionMaterials: "no",
            participantCompensation: "no",
            compensationDetails: "",
            shippingAddress: "",
            fedexAccount: "",
            isCommercial: "no",
            fundingOrganization: "",
            agreements: [],
        },
    })

    const watchHasIrbApproval = form.watch("hasIrbApproval")
    const watchHasRisks = form.watch("hasRisks")
    const watchSampleTypes = form.watch("sampleTypes")
    const watchProvidesKit = form.watch("providesCollectionKit")
    const watchCompensation = form.watch("participantCompensation")
    const watchIsCommercial = form.watch("isCommercial")
    const watchOrganizationId = form.watch("organizationId")

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

    useEffect(() => {
        if (watchOrganizationId) {
            const org = organizations.find((o) => o.value === watchOrganizationId)
            setSelectedOrg(org?.data)
        }
    }, [watchOrganizationId, organizations])

    async function onSubmit(values: z.infer<typeof accessRequestSchema>) {
        setLoading(true)

        const formData = new FormData()

        const data = {
            name: values.title,
            description: values.description,
            organizationId: values.organizationId,
            openToCollab: values.openToCollab === "yes",
            projectDetails: {
                studyTitle: values.studyTitle,
                studyDescription: values.studyDescription,
                justification: values.justification,
                hasIrbApproval: values.hasIrbApproval === "yes",
                irbStatus: values.irbStatus,
                hasRisks: values.hasRisks === "yes",
                riskDescription: values.riskDescription,
                disseminationPlan: values.disseminationPlan,
                patientSignificance: values.patientSignificance,
            },
            sampleDetails: {
                sampleTypes: values.sampleTypes,
                otherSampleType: values.otherSampleType,
                participantCount: values.participantCount,
                processingRequirements: values.processingRequirements,
            },
            logistics: {
                timeline: values.timeline,
                logisticsContact: values.logisticsContact,
                providesCollectionKit: values.providesCollectionKit === "yes",
                needsCollectionMaterials: values.needsCollectionMaterials === "yes",
                participantCompensation: values.participantCompensation === "yes",
                compensationDetails: values.compensationDetails,
                shippingAddress: values.shippingAddress,
                fedexAccount: values.fedexAccount,
                shippingMethod: values.shippingMethod,
                shippingContact: values.shippingContact,
                shippingPhone: values.shippingPhone,
            },
            commercial: {
                isCommercial: values.isCommercial === "yes",
                fundingOrganization: values.fundingOrganization,
            },
            agreements: values.agreements,
        }

        formData.append("data", JSON.stringify(data))

        try {
            const res = await createMaterialAndDataAccessRequest(session?.user.id, formData)
            if (res?.error) {
                toast.error(res.error)
                return
            }
            toast.success("Request submitted successfully!")
            router.push("/requests")
        } catch (error) {
            console.error(error)
            toast.error("An error occurred during submission.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">De Novo Sample Collection Request</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    This form is for researchers requesting de novo biosample collection from study participants. Requests will be
                    reviewed based on scientific merit, ethical considerations, participant burden, and logistical feasibility.
                </p>
            </div>

            {selectedOrg && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-800">Important Notes for {selectedOrg.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-blue-700">
                        <p>✅ Researchers must provide a clear justification for why existing biosamples are insufficient.</p>
                        <p>✅ Requests must have IRB approval or documentation of an exemption.</p>
                        <p>✅ If approved, {selectedOrg.name} will coordinate with participants for sample collection.</p>
                        <p>✅ Researchers must agree to return any unused samples to {selectedOrg.name}.</p>
                        <p>✅ If the request is for commercial research purposes, additional fees and agreements may apply.</p>
                    </CardContent>
                </Card>
            )}

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
                                name="studyTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title of Research Study</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your study title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="studyDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brief Study Description & Objectives</FormLabel>
                                        <FormControl>
                                            <Textarea rows={4} placeholder="Describe your study objectives and methodology..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="justification"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Why is de novo sample collection necessary?</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={4}
                                                placeholder="Explain why existing biobank samples are insufficient and describe any specific participant criteria required..."
                                                {...field}
                                            />
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
                                        <FormLabel>Has this study received IRB approval?</FormLabel>
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

                            {watchHasIrbApproval === "no" && (
                                <FormField
                                    control={form.control}
                                    name="irbStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Explain status of IRB submission or exemption</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    rows={3}
                                                    placeholder="Describe the current status of your IRB application or exemption..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="hasRisks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Are there any risks to participants associated with this collection?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="risks-yes" />
                                                    <Label htmlFor="risks-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="risks-no" />
                                                    <Label htmlFor="risks-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchHasRisks === "yes" && (
                                <FormField
                                    control={form.control}
                                    name="riskDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Explain the risks</FormLabel>
                                            <FormControl>
                                                <Textarea rows={3} placeholder="Describe the potential risks to participants..." {...field} />
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
                                        <FormLabel>Dissemination Plan of Analysis and Findings</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe how you intend to share the results of this research..." rows={3} {...field} />
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
                                        <FormLabel>Significance for Patients and/or Families</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe how this research could benefit patients or families..." rows={3} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </CardContent>
                    </Card>

                    {/* Sample Collection Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sample Collection Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="sampleTypes"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Type of Samples Requested (Check all that apply)</FormLabel>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {sampleTypeOptions.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="sampleTypes"
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

                            {watchSampleTypes?.includes("other") && (
                                <FormField
                                    control={form.control}
                                    name="otherSampleType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Specify Other Sample Type</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Specify the other sample type" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="participantCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Participants Needed</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="processingRequirements"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specific Sample Processing or Storage Requirements (if any)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Describe any special processing or storage requirements..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Sample Collection & Logistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sample Collection & Logistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="timeline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Timeline for Collection</FormLabel>
                                        <FormControl>
                                            <Textarea rows={2} placeholder="e.g., Within 3 months, by end of 2024, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="logisticsContact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Point of contact email address for sample logistics</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="logistics@university.edu" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="providesCollectionKit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Will you provide a collection kit?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="kit-yes" />
                                                    <Label htmlFor="kit-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="kit-no" />
                                                    <Label htmlFor="kit-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchProvidesKit === "no" && (
                                <FormField
                                    control={form.control}
                                    name="needsCollectionMaterials"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Do you require the organization to provide collection materials?</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="flex flex-row space-x-6"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="yes" id="materials-yes" />
                                                        <Label htmlFor="materials-yes">Yes</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="no" id="materials-no" />
                                                        <Label htmlFor="materials-no">No</Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="participantCompensation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Will participants be compensated for participation?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-row space-x-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="comp-yes" />
                                                    <Label htmlFor="comp-yes">Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="comp-no" />
                                                    <Label htmlFor="comp-no">No</Label>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchCompensation === "yes" && (
                                <FormField
                                    control={form.control}
                                    name="compensationDetails"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Specify amount and method</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., $50 gift card, $25 cash" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="shippingAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shipping Address for Sample Delivery (if applicable)</FormLabel>
                                            <FormControl>
                                                <Textarea rows={3} placeholder="Enter complete shipping address..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="fedexAccount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>FedEx Account Number for Shipping Costs</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter FedEx account number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="shippingMethod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preferred Shipping Method</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., FedEx, World Courier, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="shippingContact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shipping Contact Person (if different)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Name of alternate contact for shipping" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="shippingPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number for Shipping Inquiries</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Alternate phone number for shipping coordination" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                        </CardContent>
                    </Card>

                    {/* Commercial vs Non-Commercial Use */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Commercial vs. Non-Commercial Use</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="isCommercial"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Is this study funded by a commercial entity (e.g., pharma, biotech, industry-sponsored research)?
                                        </FormLabel>
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
                                <>
                                    <FormField
                                        control={form.control}
                                        name="fundingOrganization"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Specify the funding organization</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Pfizer, Genentech, etc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Card className="border-orange-200 bg-orange-50">
                                        <CardHeader>
                                            <CardTitle className="text-orange-800">Important Note for Commercial Use Requests</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm text-orange-700">
                                            <p>
                                                • Requests classified as commercial use may require a Material Transfer Agreement (MTA) or Data
                                                Licensing Agreement (DLA).
                                            </p>
                                            <p>
                                                • The organization reserves the right to apply cost recovery fees for sample collection and
                                                distribution.
                                            </p>
                                            <p>
                                                • Any intellectual property (IP) generated using biosamples may be subject to further discussion
                                                regarding rights and royalties.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Acknowledgments & Agreements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Acknowledgments & Agreements</CardTitle>
                            <CardDescription>Please review and accept all agreements below</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="agreements"
                                render={() => (
                                    <FormItem>
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
                            {loading ? <LoadingDots color="#ffffff" /> : "Submit Request"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
