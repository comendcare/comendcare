import {z} from "zod";

export const formSchema = z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    label: z.string(),
    priority: z.string(),
    author: z.string().optional(),
    createdOn: z.string(),
    submittedOn: z.string(),
    deadline: z.string()
})

export type UserForm = z.infer<typeof formSchema>
