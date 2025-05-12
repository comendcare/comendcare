import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
})

export type Task = z.infer<typeof taskSchema>

export const biosampleSchema = z.object({
  type: z.string(),
  diagnoses: z.string(),
  institution: z.string(),
  pathology: z.string(),
  preservationMethod: z.string(),
  preservation: z.string(),
  donorAge: z.union([z.string(), z.number()]),
  donorSex: z.string(),
  clinicalData: z.string(),
  country: z.string(),
  donorRace: z.string(),
  treatments: z.string(),
  pmi: z.string(),
  volume: z.union([z.string(), z.number(), z.null()]),
  mass: z.union([z.string(), z.number(), z.null()]),
  area: z.union([z.string(), z.number(), z.null()]),
})

export type Biosample = z.infer<typeof biosampleSchema>
