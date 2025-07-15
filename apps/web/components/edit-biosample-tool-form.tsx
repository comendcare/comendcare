"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React, {useEffect, useRef, useState} from "react"
import {useForm, UseFormReturn} from "react-hook-form"
import {z} from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
    FormDescription,
} from "@comend/components/ui/form"
import {Input} from "@comend/components/ui/input"
import {Textarea} from "@comend/components/ui/textarea"
import {Button} from "@comend/components/ui/button"
import {ScrollArea, ScrollBar} from "@comend/components/ui/scroll-area"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog"
import {Asset, optionSchema} from "@comend/lib/types"
import {Institution, MilestoneType, Prisma, ToolType} from "@prisma/client"
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers"
import {useSession} from "next-auth/react"
import { AttachmentsFormField, ContactsFormField, PrivatePublicFormField } from "./edit-milestone-form"
import { toast } from "sonner"
import { Delete, Pin, Plus, Router, Trash } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"
import { ToolState, useToolStore } from "@/state/tool/toolStore"
import { useShallow } from "zustand/react/shallow"
import ProjectMultipleSelector from "./project-multiple-selector"
import { DeleteAssetDialog } from "./delete-asset-dialog"
import { badgeVariants } from "@comend/components/ui/badge"
// import { DeleteAssetDialog } from "./delete-tool-dialog"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { JsonObject } from "@prisma/client/runtime/library"
import type { Option } from "@comend/lib/types"
import { useRouter } from "next/navigation"
import { revalidate } from "@comend/lib/revalidate"
import { Separator } from "@/packages/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/components/ui/select"
import { map } from "lodash"

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>

const CountrySelectItems = () => {
    return (
        <>
            <SelectItem value="US">United States of America</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
            <SelectItem value="AF">Afghanistan</SelectItem>
            <SelectItem value="AL">Albania</SelectItem>
            <SelectItem value="DZ">Algeria</SelectItem>
            <SelectItem value="AD">Andorra</SelectItem>
            <SelectItem value="AO">Angola</SelectItem>
            <SelectItem value="AG">Antigua and Barbuda</SelectItem>
            <SelectItem value="AR">Argentina</SelectItem>
            <SelectItem value="AM">Armenia</SelectItem>
            <SelectItem value="AU">Australia</SelectItem>
            <SelectItem value="AT">Austria</SelectItem>
            <SelectItem value="AZ">Azerbaijan</SelectItem>
            <SelectItem value="BS">Bahamas</SelectItem>
            <SelectItem value="BH">Bahrain</SelectItem>
            <SelectItem value="BD">Bangladesh</SelectItem>
            <SelectItem value="BB">Barbados</SelectItem>
            <SelectItem value="BY">Belarus</SelectItem>
            <SelectItem value="BE">Belgium</SelectItem>
            <SelectItem value="BZ">Belize</SelectItem>
            <SelectItem value="BJ">Benin</SelectItem>
            <SelectItem value="BT">Bhutan</SelectItem>
            <SelectItem value="BO">Bolivia</SelectItem>
            <SelectItem value="BA">Bosnia and Herzegovina</SelectItem>
            <SelectItem value="BW">Botswana</SelectItem>
            <SelectItem value="BR">Brazil</SelectItem>
            <SelectItem value="BN">Brunei</SelectItem>
            <SelectItem value="BG">Bulgaria</SelectItem>
            <SelectItem value="BF">Burkina Faso</SelectItem>
            <SelectItem value="BI">Burundi</SelectItem>
            <SelectItem value="CV">Cabo Verde</SelectItem>
            <SelectItem value="KH">Cambodia</SelectItem>
            <SelectItem value="CM">Cameroon</SelectItem>
            <SelectItem value="CF">Central African Republic</SelectItem>
            <SelectItem value="TD">Chad</SelectItem>
            <SelectItem value="CL">Chile</SelectItem>
            <SelectItem value="CN">China</SelectItem>
            <SelectItem value="CO">Colombia</SelectItem>
            <SelectItem value="KM">Comoros</SelectItem>
            <SelectItem value="CD">Congo (DRC)</SelectItem>
            <SelectItem value="CG">Congo (Republic)</SelectItem>
            <SelectItem value="CR">Costa Rica</SelectItem>
            <SelectItem value="CI">Côte d’Ivoire</SelectItem>
            <SelectItem value="HR">Croatia</SelectItem>
            <SelectItem value="CU">Cuba</SelectItem>
            <SelectItem value="CY">Cyprus</SelectItem>
            <SelectItem value="CZ">Czechia</SelectItem>
            <SelectItem value="DK">Denmark</SelectItem>
            <SelectItem value="DJ">Djibouti</SelectItem>
            <SelectItem value="DM">Dominica</SelectItem>
            <SelectItem value="DO">Dominican Republic</SelectItem>
            <SelectItem value="EC">Ecuador</SelectItem>
            <SelectItem value="EG">Egypt</SelectItem>
            <SelectItem value="SV">El Salvador</SelectItem>
            <SelectItem value="GQ">Equatorial Guinea</SelectItem>
            <SelectItem value="ER">Eritrea</SelectItem>
            <SelectItem value="EE">Estonia</SelectItem>
            <SelectItem value="SZ">Eswatini</SelectItem>
            <SelectItem value="ET">Ethiopia</SelectItem>
            <SelectItem value="FJ">Fiji</SelectItem>
            <SelectItem value="FI">Finland</SelectItem>
            <SelectItem value="FR">France</SelectItem>
            <SelectItem value="GA">Gabon</SelectItem>
            <SelectItem value="GM">Gambia</SelectItem>
            <SelectItem value="GE">Georgia</SelectItem>
            <SelectItem value="DE">Germany</SelectItem>
            <SelectItem value="GH">Ghana</SelectItem>
            <SelectItem value="GR">Greece</SelectItem>
            <SelectItem value="GD">Grenada</SelectItem>
            <SelectItem value="GT">Guatemala</SelectItem>
            <SelectItem value="GN">Guinea</SelectItem>
            <SelectItem value="GW">Guinea-Bissau</SelectItem>
            <SelectItem value="GY">Guyana</SelectItem>
            <SelectItem value="HT">Haiti</SelectItem>
            <SelectItem value="HN">Honduras</SelectItem>
            <SelectItem value="HU">Hungary</SelectItem>
            <SelectItem value="IS">Iceland</SelectItem>
            <SelectItem value="IN">India</SelectItem>
            <SelectItem value="ID">Indonesia</SelectItem>
            <SelectItem value="IR">Iran</SelectItem>
            <SelectItem value="IQ">Iraq</SelectItem>
            <SelectItem value="IE">Ireland</SelectItem>
            <SelectItem value="IL">Israel</SelectItem>
            <SelectItem value="IT">Italy</SelectItem>
            <SelectItem value="JM">Jamaica</SelectItem>
            <SelectItem value="JP">Japan</SelectItem>
            <SelectItem value="JO">Jordan</SelectItem>
            <SelectItem value="KZ">Kazakhstan</SelectItem>
            <SelectItem value="KE">Kenya</SelectItem>
            <SelectItem value="KI">Kiribati</SelectItem>
            <SelectItem value="KP">North Korea</SelectItem>
            <SelectItem value="KR">South Korea</SelectItem>
            <SelectItem value="KW">Kuwait</SelectItem>
            <SelectItem value="KG">Kyrgyzstan</SelectItem>
            <SelectItem value="LA">Laos</SelectItem>
            <SelectItem value="LV">Latvia</SelectItem>
            <SelectItem value="LB">Lebanon</SelectItem>
            <SelectItem value="LS">Lesotho</SelectItem>
            <SelectItem value="LR">Liberia</SelectItem>
            <SelectItem value="LY">Libya</SelectItem>
            <SelectItem value="LI">Liechtenstein</SelectItem>
            <SelectItem value="LT">Lithuania</SelectItem>
            <SelectItem value="LU">Luxembourg</SelectItem>
            <SelectItem value="MG">Madagascar</SelectItem>
            <SelectItem value="MW">Malawi</SelectItem>
            <SelectItem value="MY">Malaysia</SelectItem>
            <SelectItem value="MV">Maldives</SelectItem>
            <SelectItem value="ML">Mali</SelectItem>
            <SelectItem value="MT">Malta</SelectItem>
            <SelectItem value="MH">Marshall Islands</SelectItem>
            <SelectItem value="MR">Mauritania</SelectItem>
            <SelectItem value="MU">Mauritius</SelectItem>
            <SelectItem value="MX">Mexico</SelectItem>
            <SelectItem value="FM">Micronesia</SelectItem>
            <SelectItem value="MD">Moldova</SelectItem>
            <SelectItem value="MC">Monaco</SelectItem>
            <SelectItem value="MN">Mongolia</SelectItem>
            <SelectItem value="ME">Montenegro</SelectItem>
            <SelectItem value="MA">Morocco</SelectItem>
            <SelectItem value="MZ">Mozambique</SelectItem>
            <SelectItem value="MM">Myanmar</SelectItem>
            <SelectItem value="NA">Namibia</SelectItem>
            <SelectItem value="NR">Nauru</SelectItem>
            <SelectItem value="NP">Nepal</SelectItem>
            <SelectItem value="NL">Netherlands</SelectItem>
            <SelectItem value="NZ">New Zealand</SelectItem>
            <SelectItem value="NI">Nicaragua</SelectItem>
            <SelectItem value="NE">Niger</SelectItem>
            <SelectItem value="NG">Nigeria</SelectItem>
            <SelectItem value="MK">North Macedonia</SelectItem>
            <SelectItem value="NO">Norway</SelectItem>
            <SelectItem value="OM">Oman</SelectItem>
            <SelectItem value="PK">Pakistan</SelectItem>
            <SelectItem value="PW">Palau</SelectItem>
            <SelectItem value="PS">Palestine</SelectItem>
            <SelectItem value="PA">Panama</SelectItem>
            <SelectItem value="PG">Papua New Guinea</SelectItem>
            <SelectItem value="PY">Paraguay</SelectItem>
            <SelectItem value="PE">Peru</SelectItem>
            <SelectItem value="PH">Philippines</SelectItem>
            <SelectItem value="PL">Poland</SelectItem>
            <SelectItem value="PT">Portugal</SelectItem>
            <SelectItem value="QA">Qatar</SelectItem>
            <SelectItem value="RO">Romania</SelectItem>
            <SelectItem value="RU">Russia</SelectItem>
            <SelectItem value="RW">Rwanda</SelectItem>
            <SelectItem value="KN">Saint Kitts and Nevis</SelectItem>
            <SelectItem value="LC">Saint Lucia</SelectItem>
            <SelectItem value="VC">Saint Vincent and the Grenadines</SelectItem>
            <SelectItem value="WS">Samoa</SelectItem>
            <SelectItem value="SM">San Marino</SelectItem>
            <SelectItem value="ST">Sao Tome and Principe</SelectItem>
            <SelectItem value="SA">Saudi Arabia</SelectItem>
            <SelectItem value="SN">Senegal</SelectItem>
            <SelectItem value="RS">Serbia</SelectItem>
            <SelectItem value="SC">Seychelles</SelectItem>
            <SelectItem value="SL">Sierra Leone</SelectItem>
            <SelectItem value="SG">Singapore</SelectItem>
            <SelectItem value="SK">Slovakia</SelectItem>
            <SelectItem value="SI">Slovenia</SelectItem>
            <SelectItem value="SB">Solomon Islands</SelectItem>
            <SelectItem value="SO">Somalia</SelectItem>
            <SelectItem value="ZA">South Africa</SelectItem>
            <SelectItem value="SS">South Sudan</SelectItem>
            <SelectItem value="ES">Spain</SelectItem>
            <SelectItem value="LK">Sri Lanka</SelectItem>
            <SelectItem value="SD">Sudan</SelectItem>
            <SelectItem value="SR">Suriname</SelectItem>
            <SelectItem value="SE">Sweden</SelectItem>
            <SelectItem value="CH">Switzerland</SelectItem>
            <SelectItem value="SY">Syria</SelectItem>
            <SelectItem value="TJ">Tajikistan</SelectItem>
            <SelectItem value="TZ">Tanzania</SelectItem>
            <SelectItem value="TH">Thailand</SelectItem>
            <SelectItem value="TL">Timor-Leste</SelectItem>
            <SelectItem value="TG">Togo</SelectItem>
            <SelectItem value="TO">Tonga</SelectItem>
            <SelectItem value="TT">Trinidad and Tobago</SelectItem>
            <SelectItem value="TN">Tunisia</SelectItem>
            <SelectItem value="TR">Turkey</SelectItem>
            <SelectItem value="TM">Turkmenistan</SelectItem>
            <SelectItem value="TV">Tuvalu</SelectItem>
            <SelectItem value="UG">Uganda</SelectItem>
            <SelectItem value="UA">Ukraine</SelectItem>
            <SelectItem value="AE">United Arab Emirates</SelectItem>
            <SelectItem value="GB">United Kingdom</SelectItem>
            <SelectItem value="UY">Uruguay</SelectItem>
            <SelectItem value="UZ">Uzbekistan</SelectItem>
            <SelectItem value="VU">Vanuatu</SelectItem>
            <SelectItem value="VE">Venezuela</SelectItem>
            <SelectItem value="VN">Vietnam</SelectItem>
            <SelectItem value="YE">Yemen</SelectItem>
            <SelectItem value="ZM">Zambia</SelectItem>
            <SelectItem value="ZW">Zimbabwe</SelectItem>
        </>
    )
}

const editAssetForm = z.object({
    title: z
        .string({
            required_error: "Please provide a title"
        })
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    types: z.array(optionSchema)
        .min(1, "Type is required")
        .max(1, "Max one type"),
    otherTypeDetails: z.string().optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    isPinned: z.boolean(),
    isPrivate: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    milestones: z.array(z.custom<Milestone>()).optional(),

    // biosmaple properties
    institution: z.custom<Institution>().optional(),
    anatomicalSite: z.string().optional(),
    pathology: z.string().optional(),
    preservationMethod: z.string().optional(),
    preservation: z.string().optional(),
    methodOfTransport: z.string().optional(),
    clinicalData: z.string().optional(),
    currentCountry: z.string().optional(),
    countryOfCollection: z.string().optional(),
    pmi: z.string().optional(),
    volume: z.string().optional(),
    mass: z.string().optional(),
    area: z.string().optional(),
    repository: z.string().optional(),
    productCode: z.string().optional(),
    priceUSD: z.string().optional(),
    priceGBP: z.string().optional(),
    priceEUR: z.string().optional(),
    premiumGroup: z.string().optional(),
    caseId: z.string().optional(),
    specimenId: z.string().optional(),
    format: z.string().optional(),
    subFormat: z.string().optional(),
    biosampleDiagnosis: z.string().optional(),
    measurement: z.number().optional(),
    significantVariantPositive: z.string().optional(),
    significantVariantWildtype: z.string().optional(),
    fusionPositive: z.string().optional(),
    fusionWildtype: z.string().optional(),
    cnvAbnormal: z.boolean().optional(),
    cnvNormal: z.boolean().optional(),
    hlaType: z.string().optional(),
    icf: z.string().optional(),
    irbLetter: z.string().optional(),
    yearOfExcision: z.string().optional(),
    classifier: z.string().optional(),
    primaryTumorOrgan: z.string().optional(),
    stage: z.string().optional(),
    stageGroup: z.string().optional(),
    serology: z.string().optional(),
    clinicalTestResults: z.string().optional(),
    serumAvailable: z.boolean().optional(),
    plasmaAvailable: z.boolean().optional(),
    wholeBloodAvailable: z.boolean().optional(),
    ffpeTumorAvailable: z.boolean().optional(),
    frozenTumorAvailable: z.boolean().optional(),
    er: z.string().optional(),
    pr: z.string().optional(),
    hercepTest: z.string().optional(),
    matchedPairId: z.string().optional(),
    mirroredPairId: z.string().optional(),
    donorAgeAtExcision: z.string().optional(),

    // donor properties
    age: z.string().optional(),
    sex: z.string().optional(),
    gender: z.string().optional(),
    race: z.string().optional(),
    ethnicity: z.string().optional(),
    treatments: z.array(z.string()).optional(),
    primaryDiagnosis: z.string().optional(),
    diagnoses: z.array(z.string()).optional(),
    yearOfDeath: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    bmi: z.string().optional(),
    menopausalStatus: z.boolean().optional(),
    ageAtLastMenstualPeriod: z.string().optional(),
    numberOfPregnancies: z.string().optional(),
    numberOfLiveBirths: z.string().optional(),
    smokingStatus: z.boolean().optional(),
    cigarettesPerDay: z.string().optional(),
    alcoholStatus: z.boolean().optional(),
    drinksPerDay: z.string().optional(),
    alcoholDuration: z.string().optional(),
    medications: z.array(z.string()).optional(),
    causeOfDeath: z.string().optional(),
    conditionSeverity: z.string().optional(),
})

const toolSelector = (state: ToolState) => ({
    toolTypes: state.toolTypes,
    createTool: state.createTool,
    updateTool: state.updateTool
})

export type Milestone = Prisma.MilestoneGetPayload<{include: {roadmap: true}}>

export function EditBiosampleToolForm({
    toolData,
    numAssetsPinned,
    closeDialog
}: {
    toolData: Partial<Asset>,
    numAssetsPinned: number,
    closeDialog?: () => void
}) {
    const initializing = useRef(true)
    const router = useRouter()
    const {data: session} = useSession()
    const [orgIsPublished, setOrgIsPublished] = useState(false)
    const { toolTypes, createTool, updateTool } = useToolStore(useShallow(toolSelector))
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)

    const form = useForm<z.infer<typeof editAssetForm>>({
        mode: "onChange",
        resolver: zodResolver(editAssetForm),
        defaultValues: {
            title: toolData?.title || "",
            description: toolData?.description || "",
            types: toolTypes
                        .filter(type => type.type === 'biosample')
                        .filter(toolType => (toolData?.types || [])
                        .includes(toolType.id))
                        .map(toolType => ({value: toolType.id, label: toolType.label}) as Option),
            otherTypeDetails: typeof toolData?.metadata === 'object' ? (toolData.metadata as {
                [key: string]: any
            })?.otherTypeDetails : undefined,
            attachments: toolData?.attachments || undefined,
            isPinned: toolData?.pinned || false,
            isPrivate: toolData?.private !== undefined ? toolData?.private : true,
            contacts: toolData?.contacts || undefined,
            milestones: (toolData?.milestones || []).map((milestone: any) => milestone.milestone) || [],
        }
    })

    const formData = {
        title: form.watch("title"),
        description: form.watch("description"),
        types: form.watch("types"),
        otherTypeDetails: form.watch("otherTypeDetails"),
        attachments: form.watch("attachments"),
        isPinned: form.watch("isPinned"),
        isPrivate: form.watch("isPrivate"),
        contacts: form.watch("contacts"),
        milestones: form.watch("milestones")
    }

    const handleFormSubmit = async (values: z.infer<typeof editAssetForm>) => {
        // console.log(`handle form submit`, values)
        const {
            title,
            description,
            types,
            otherTypeDetails,
            attachments,
            isPinned,
            isPrivate,
            contacts,
            milestones,
        } = values;

        const updateData: Partial<Asset> = {
            ...toolData,
            title,
            types: types.map(type => type.value),
            metadata: {
                ...(toolData?.metadata ? JSON.parse(JSON.stringify(toolData.metadata)) : undefined),
                otherTypeDetails: otherTypeDetails
            } as JsonObject,
            pinned: (!isPrivate && isPinned) || false, // only save pinned if tool is public
            private: isPrivate !== undefined && isPrivate !== null ? isPrivate : true,
            milestones: (milestones || []).map((milestone) => {
                return ({
                    milestoneId: milestone.id,
                    toolId: toolData.id  || '',
                })
            }),
            ...(description !== undefined && description !== null ? {description} : undefined),
            ...(attachments ? {attachments} : undefined),
            ...(contacts ? {contacts} : undefined),
        }

        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            );
            return;
        }

        try {
            if (toolData.id) {
                await updateTool(updateData, session.user.organizationId)
                toast.success(
                    "Tool updated successfully!",
                    {position: "bottom-left"}
                )
                await revalidate("/app/tools/biosample")
                router.refresh()
            } else {
                await createTool(updateData, session.user.organizationId)
                toast.success(
                    "Tool created successfully!",
                    {position: "bottom-left"}
                )
                await revalidate("/app/tools/biosample")
                router.refresh()
            }
            if (closeDialog) closeDialog()
        } catch (error) {
            console.error("Error creating or updating tool:", error);
            toast.error(
                "Failed to create or update tool.",
                {position: "bottom-left"}
            )
        }
    }

    // Initialization - Allow update once form is initialized
    useEffect(() => {
        const init = async () => {
            if (session?.user.organizationId) {
                const response = await getOrganizationFromOrganizationId(session.user.organizationId, {
                    id: true,
                    public: true,
                    verified: true,
                    published: true,
                    name: true,
                    description: true,
                    contactEmail: true,
                    logo: true,
                    image: true,
                    headerImage: true,
                    biopharmaConsentSettings: true,
                    subdomain: true,
                    customDomain: true,
                    statedGoal: true,
                    yearFounded: true,
                    incorporationStatus: true,
                    therapeuticsOfInterest: true,
                    therapeuticsInDevelopment: true,
                    website: true,
                    moneyRaised: true,
                    moneyDeployed: true,
                    researchBudget: true,
                    // address1                  String?
                    // address2                  String?
                    // formattedAddress          String?
                    // city                      String?
                    // region                    String?
                    // postalCode                String?
                    // country                   String?
                    // lat                       String?
                    // lng                       String?
                    createdAt: true,
                    updatedAt: true,
                    user: true,
                    userId: true,
                    roadmaps: true,
                    members: true,
                    clients: true,
                    invitations: true,
                    membershipRequests: true,
                    conditions: true,
                    kanban: true,
                    milestones: true,
                    platformNotifications: true,
                    reviews: true,
                    savedCompanies: true,
                    tools: true,
                    rfps: true,
                    metadata: true
                })
                if (response.success && response.data) {
                    setOrgIsPublished(response.data.published)
                }
            }

            // trigger a form validation if we're editing an tool, if the imported data is not valid, let the user know right away
            if (Object.keys(toolData).length > 0) form.trigger()

            initializing.current = false
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Form {...form}>
            <ScrollArea className={"max-h-[80vh] -mr-2 pr-3"} type={"always"}>
                <ScrollBar />
                <form
                    onSubmit={form.handleSubmit(handleFormSubmit)}
                    className="space-y-6 m-1"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>{`Title`}</FormLabel>
                                <FormControl>
                                    <Input
                                        id="title"
                                        placeholder={`Enter a title`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel >{`Description`}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="description"
                                        placeholder={`Enter a description...`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="types"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormLabel>{`Type`}</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={
                                            toolTypes
                                                .filter(type => type.type === 'biosample')
                                                .map(toolType => ({value: toolType.id, label: toolType.label})) as Option[]
                                        }
                                        hidePlaceholderWhenSelected={true}
                                        showHoverCard={false}
                                        placeholder="Select a type..."
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                        groupBy="roadmapTitle"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
        
                    {formData.types.map((type: any) => type?.value).includes("OTHER") && (
                        <>
                            <div>
                                <FormLabel className="text-md">{`Type Description`}</FormLabel>
                                <FormDescription>{`This will be used to improve the platform.`}</FormDescription>
                            </div>
                            <FormField
                                control={form.control}
                                name="otherTypeDetails"
                                render={({field}) => (
                                    <FormItem className="flex flex-col grow">
                                        <FormControl>
                                            <Textarea
                                                id="otherTypeDetails"
                                                placeholder={`Please enter a short description of your project type.`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    <FormItem className="flex gap-4 items-center">
                        <div className="grow">
                        <FormLabel>Visibility</FormLabel>
                        <FormDescription>
                            {`Private tools will not be shown to people outside of your organization.`}
                        </FormDescription>
                        </div>
                        <div className="w-[90px]">
                        <PrivatePublicFormField form={form} formData={formData} disabled={!orgIsPublished}/>
                        </div>
                    </FormItem>

                    {formData.isPrivate === false && (
                        <Tooltip>
                            <TooltipTrigger onClick={(e) => e.preventDefault()}>
                                <FormField 
                                    control={form.control}
                                    name="isPinned"
                                    render={({field}) => (
                                        <FormItem className="flex gap-2 items-center text-left">
                                            <div>
                                            <FormLabel>{`Pinned to Profile`}</FormLabel>
                                            <FormDescription>
                                                {`Showcase this Tool at the top of your organization’s Tool section so it's easy to find and stands out.`}
                                            </FormDescription>
                                            </div>
                                            <FormControl className="justify-self-end">
                                                <Button 
                                                    disabled={!toolData.pinned && numAssetsPinned >= 5}
                                                    variant="ghost" 
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        form.setValue("isPinned", !field.value)
                                                    }}
                                                >
                                                    {field.value ? <Pin fill="currentColor"/> : <Pin />}
                                                </Button>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TooltipTrigger>
                            {!toolData.pinned && numAssetsPinned >= 5 && (
                                <TooltipContent className="max-w-[200px]">
                                    <p>{`Pinning is limited to 5 tools. You already have 5 tools pinned. Please unpin another tool before pinning this tool.`}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    )}

                    <FormField
                        control={form.control}
                        name="milestones"
                        render={({field}) => (
                            <FormItem className="w-full mt-2">
                                <FormLabel >{`Linked Projects`}</FormLabel>
                                <FormControl>
                                    <ProjectMultipleSelector value={field.value} onChange={field.onChange}/>
                                </FormControl>
                                <FormMessage className="text-primary"/>
                            </FormItem>
                        )}
                    />

                    <ContactsFormField form={form} />
                    <AttachmentsFormField form={form} />

                    {/* temporarily hide additional tool form fields on production until this feature is ready... */}
                    {process.env.NEXT_PUBLIC_NODE_ENV !== "production" && (
                        <>
                        <Separator className="w-full"/>
                        <AdditionalBiosampleFields form={form} />

                        <Separator className="w-full"/>
                        <DonorFormFields form={form} />
                        </>
                    )}

                    <span className="flex gap-2 w-full justify-end">
                        <DialogClose asChild>
                            <Button 
                                variant={"secondary"} 
                                onClick={() => {if (closeDialog) closeDialog()}}
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button type="button" variant="destructive" onClick={() => setDeleteIsOpen(true)}>
                            Delete Tool
                        </Button>
                        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
                            <DeleteAssetDialog toolId={toolData.id} closeDialog={closeDialog}/>
                        </Dialog>
                        <DialogClose disabled={!form.formState.isValid}>
                            <Button
                                disabled={!form.formState.isValid}
                                variant={"cta"}
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleFormSubmit(form.getValues())
                                    if (closeDialog) closeDialog()
                                }}
                            >
                                Save Changes
                            </Button>
                        </DialogClose>
                    </span>
                </form>
            </ScrollArea>
        </Form>
    )
}

export const AdditionalBiosampleFields = ({form}: {form: any}) => {
    return (
        <>
        <h1 className="font-semibold text-md py-0 my-0">Biosample Information</h1>
        <div className="flex-col space-y-4">
            <FormField
                control={form.control}
                name="anatomicalSite"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Anatomical Site`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="anatomicalSite"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="pathology"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Pathology`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="pathology"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="preservationMethod"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Preservation Method`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select>
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FRESH">Fresh</SelectItem>
                                    <SelectItem value="FROZEN">Frozen</SelectItem>
                                    <SelectItem value="FFPE">Formalin-Fixed Paraffin-Embedded (FFPE)</SelectItem>
                                    <SelectItem value="RNALATER">Stabilized in RNAlater</SelectItem>
                                    <SelectItem value="LYOPHILIZED">Lyophilized (Freeze-Dried)</SelectItem>
                                    <SelectItem value="CRYOPRESERVED">Cryopreserved</SelectItem>
                                    <SelectItem value="ALCOHOL">Preserved in Alcohol</SelectItem>
                                    <SelectItem value="ROOMTEMP">Room Temperature Stabilized</SelectItem>
                                    <SelectItem value="FIXED_OTHER">Other Chemical Fixative</SelectItem>
                                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="methodOfTrasport"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Method of Transport`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select>
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AMBIENT">Ambient Temperature</SelectItem>
                                    <SelectItem value="COLD_PACK">Cold Pack (2–8°C)</SelectItem>
                                    <SelectItem value="DRY_ICE">Dry Ice (−78.5°C)</SelectItem>
                                    <SelectItem value="LN2">Liquid Nitrogen (LN₂)</SelectItem>
                                    <SelectItem value="COURIER">Courier / Hand Delivery</SelectItem>
                                    <SelectItem value="MAIL">Standard Mail / Postal Service</SelectItem>
                                    <SelectItem value="SPECIALIZED">Specialized Medical Transport</SelectItem>
                                    <SelectItem value="ELECTRONIC_TRACKING">Transport with Electronic Tracking</SelectItem>
                                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="clinicalData"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Clinical Data`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="clinicalData"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="currentCountry"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Current Location`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select>
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    <CountrySelectItems />
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="countryOfCollection"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Collection Location`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select>
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    <CountrySelectItems />
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="pmi"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`PMI (in hours)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="pmi"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="volume"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Volume (in ml)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="volume"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="mass"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Mass (in mg)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="mass"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="area"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Area (in square mm)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="area"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="repository"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Repository`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="weight"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="priceUSD"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Price USD`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="priceUSD"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="priceGBP"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Price GBP`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="priceGBP"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="priceEUR"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Price EUR`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="priceEUR"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="yearOfExcision"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Year of Excision`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="yearOfExcision"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="donorAgeAtExcision"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Donor Age at Excision`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="donorAgeAtExcision"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="biosampleDiagnosis"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Biosample Diagnosis`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="biosampleDiagnosis"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />
        </div>
        </>
    )
}

export const DonorFormFields = ({form}: {form: any}) => {
    return (
        <>
        <h1 className="font-semibold text-md py-0 my-0">Donor Information</h1>
        <div className="flex-col space-y-4">
            <FormField
                control={form.control}
                name="age"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Age`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="age"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="sex"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Sex`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select>
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Male</SelectItem>
                                    <SelectItem value="F">Female</SelectItem>
                                    <SelectItem value="I">Intersex</SelectItem>
                                    <SelectItem value="O">Other</SelectItem>
                                    <SelectItem value="U">Unknown</SelectItem>
                                    <SelectItem value="PNTS">Prefer not to say</SelectItem>
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="gender"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Gender`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select>
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Man</SelectItem>
                                    <SelectItem value="F">Woman</SelectItem>
                                    <SelectItem value="NB">Non-Binary</SelectItem>
                                    <SelectItem value="O">Other</SelectItem>
                                    <SelectItem value="U">Unknown</SelectItem>
                                    <SelectItem value="PNTS">Prefer not to say</SelectItem>
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            {/* Race selections from the National Center for Education Studies (US Gov) */}
            {/* https://nces.ed.gov/ipeds/report-your-data/race-ethnicity-definitions */}
            <FormField
                control={form.control}
                name="race"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Race`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select>
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AIAN">American Indian or Alaska Native</SelectItem>
                                    <SelectItem value="A">Asian</SelectItem>
                                    <SelectItem value="BAA">Black or African American</SelectItem>
                                    <SelectItem value="NHPI">Native Hawaiian or Other Pacific Islander</SelectItem>
                                    <SelectItem value="W">White</SelectItem>
                                    <SelectItem value="O">Other</SelectItem>
                                    <SelectItem value="U">Unknown</SelectItem>
                                    <SelectItem value="PNTS">Prefer not to say</SelectItem>
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            {/* Ethnicity selections from the National Center for Education Studies (US Gov) */}
            {/* https://nces.ed.gov/ipeds/report-your-data/race-ethnicity-definitions */}
            <FormField
                control={form.control}
                name="ethnicity"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Ethnicity`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="w-full">
                                <Select>
                                <SelectTrigger className="-mt-2 w-full h-[32px]">
                                    <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HL">Hispanic or Latino</SelectItem>
                                    <SelectItem value="NHL">Not Hispanic or Latino</SelectItem>
                                    <SelectItem value="O">Other</SelectItem>
                                    <SelectItem value="U">Unknown</SelectItem>
                                    <SelectItem value="PNTS">Prefer not to say</SelectItem>
                                </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="height"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Height`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="height"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="weight"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Weight`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="weight"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="bmi"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`BMI`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="bmi"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="primaryDiagnosis"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Primary Diagnosis`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="primaryDiagnosis"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="diagnoses"
                render={({field}) => (
                    <FormItem>
                        <div className="flex flex-row justify-between gap-2 items-center">
                            <FormLabel>{`Diagnoses`}</FormLabel>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="secondary"
                                        // size={"icon"}
                                        className="h-full w-[34px]"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault()
                                            form.setValue("diagnoses", [...(field.value || []),""])
                                        }}
                                    >
                                        <Plus/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                    {`Add a diagnosis`}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {field?.value && field.value.length > 0 && (
                            <ol className="flex flex-col gap-2">
                                {field.value.map((value: string, index: number) => (
                                    <span className="flex gap-2 w-full">
                                        <div className="w-full">
                                        <Input
                                            id={`diagnosis-${index}`}
                                            className="w-full"
                                            placeholder={`Enter a value`}
                                            value={value}
                                            onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                                let newValue = field.value
                                                newValue[index] = event.currentTarget.value
                                                form.setValue("diagnoses", newValue)
                                            }}
                                        />
                                        </div>
                                        <Button 
                                            className="row-start-1 col-start-3 lg:col-start-4 h-full w-[34px]" 
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                const newValue = field.value
                                                newValue.splice(index, 1)
                                                form.setValue("diagnoses", newValue)
                                            }}
                                        >
                                            <Trash />
                                        </Button>
                                    </span>
                                ))}
                            </ol>
                        )}

                        <FormMessage />

                    </FormItem>
                )}
            />  

            <FormField
                control={form.control}
                name="treatments"
                render={({field}) => (
                    <FormItem>
                        <div className="flex flex-row justify-between gap-2 items-center">
                            <FormLabel>{`Treatments`}</FormLabel>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="secondary"
                                        // size={"icon"}
                                        className="h-full w-[34px]"
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault()
                                            form.setValue("treatments", [...(field.value || []),""])
                                        }}
                                    >
                                        <Plus/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                    {`Add a treatment`}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {field?.value && field.value.length > 0 && (
                            <ol className="flex flex-col gap-2">
                                {field.value.map((value: string, index: number) => (
                                    <span className="flex gap-2 w-full">
                                        <div className="w-full">
                                        <Input
                                            id={`treatment-${index}`}
                                            className="w-full"
                                            placeholder={`Enter a value`}
                                            value={value}
                                            onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                                let newValue = field.value
                                                newValue[index] = event.currentTarget.value
                                                form.setValue("treatments", newValue)
                                            }}
                                        />
                                        </div>
                                        <Button 
                                            className="row-start-1 col-start-3 lg:col-start-4 h-full w-[34px]" 
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                const newValue = field.value
                                                newValue.splice(index, 1)
                                                form.setValue("treatments", newValue)
                                            }}
                                        >
                                            <Trash />
                                        </Button>
                                    </span>
                                ))}
                            </ol>
                        )}

                        <FormMessage />

                    </FormItem>
                )}
            /> 


            <FormField
                control={form.control}
                name="medications"
                render={({field}) => (
                    <FormItem>
                        <div className="flex flex-row justify-between gap-2 items-center">
                            <FormLabel>{`Medications`}</FormLabel>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="secondary"
                                        className="h-full w-[34px]"
                                        // size={"icon"}
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault()
                                            form.setValue("medications", [...(field.value || []),""])
                                        }}
                                    >
                                        <Plus/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left font-normal">
                                    {`Add a medication`}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {field?.value && field.value.length > 0 && (
                            <ol className="flex flex-col gap-2">
                                {field.value.map((value: string, index: number) => (
                                    <span className="flex gap-2 w-full">
                                        <div className="w-full">
                                        <Input
                                            id={`medication-${index}`}
                                            className="w-full"
                                            placeholder={`Enter a value`}
                                            value={value}
                                            onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                                let newValue = field.value
                                                newValue[index] = event.currentTarget.value
                                                form.setValue("medications", newValue)
                                            }}
                                        />
                                        </div>
                                        <Button 
                                            className="row-start-1 col-start-3 lg:col-start-4 h-full w-[34px]" 
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                const newValue = field.value
                                                newValue.splice(index, 1)
                                                form.setValue("medications", newValue)
                                            }}
                                        >
                                            <Trash />
                                        </Button>
                                    </span>
                                ))}
                            </ol>
                        )}

                        <FormMessage />

                    </FormItem>
                )}
            /> 

            <FormField
                control={form.control}
                name="conditionSeverity"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Condition Severity`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="conditionSeverity"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            {/* <FormField
                control={form.control}
                name="menopausalStatus"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Menopausal Status`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="menopausalStatus"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            /> */}

            {/* <FormField
                control={form.control}
                name="ageAtLastMenstrualPeriod"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Age at last Menstrual Period`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="ageAtLastMenstrualPeriod"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="numberOfPregnancies"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Number of Pregnancies`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="numberOfPregnancies"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="numberOfLiveBirths"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Number if Live Births`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="numberOfLiveBirths"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            /> */}

            {/* <FormField
                control={form.control}
                name="smokingStatus"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Smoking Status`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="smokingStatus"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            /> */}

            {/* <FormField
                control={form.control}
                name="cigarettesPerDay"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Cigarettes Per Day`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="cigarettesPerDay"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            /> */}

            {/* <FormField
                control={form.control}
                name="alcoholStatus"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Alcohol Status`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="alcoholStatus"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            /> */}

            {/* <FormField
                control={form.control}
                name="drinksPerDay"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Drinks Per Day`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="drinksPerDay"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="alcoholDuration"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Alcohol Duration (in years)`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="bmi"
                                    className="w-full"
                                    placeholder={`Enter a number`}
                                    type="number"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            /> */}

            <FormField
                control={form.control}
                name="causeOfDeath"
                render={({field}) => (
                    <FormItem className="w-full flex gap-4 items-center">
                        <FormLabel className="w-[80px]">{`Cause Of Death`}</FormLabel>
                        <div className="w-full">
                            <FormControl className="-mt-2 w-full">
                                <Input
                                    id="causeOfDeath"
                                    className="w-full"
                                    placeholder={`Enter a value`}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                )}
            />
        </div>
        </>
    )
}
