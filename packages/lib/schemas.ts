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

export const getNewColumnFormSchema = (existingKeywords: string[]) =>
    z.object({
        keyword: z
            .string()
            .min(2, "Keyword must be at least 2 characters long.")
            .max(
                20,
                "Please shorten your keyword or phrase to fewer than 20 characters."
            )
            .superRefine((keyword, ctx) => {
                if (existingKeywords.includes(keyword.toLowerCase())) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `A monitor for "${keyword}" already exists.`
                    })
                }
            }),
        enhanced: z.boolean(),
        rss: z.optional(z.string().url())
    })
