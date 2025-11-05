import z from "zod"
import { Option, optionSchema } from "@/packages/lib/types"

export type FacilityType = 'cro' | 'institution'

// export const createFacilityForm = z.object({
//     type: z.custom<FacilityType>(),
//     name: z.string(),
//     tools: z.array(z.custom<Option>()).optional(),
// })

export const companyFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    website: z.string().url("Enter a valid URL"),
    type: z.string(),
    yearFounded: z.string().regex(/^\d{4}$/, "Enter a valid year").optional(),
    headquarters: z.string().optional(),
    services: z.array(optionSchema).optional(),
    certifications: z.array(optionSchema).optional(),
    tags: z.array(optionSchema).optional(),
    tools: z.array(z.custom<Option>()).optional(),
})

export const institutionFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    tools: z.array(z.custom<Option>()).optional(),
})