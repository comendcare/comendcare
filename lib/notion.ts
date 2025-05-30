/* eslint-disable camelcase */
"use server"

// Notion SDK for JavaScript
import { Client } from "@notionhq/client"

interface FeedbackTicketData {
    name: string
    email: string
    feedback: string
    imgUrls: string[]
}

interface FAQFeedbackTicketData {
    name: string
    email: string
    helpful: boolean
    issue_type: string
    issue_description: string
    article_prompt: string
    article_description: string
    article_path: string
}

export async function createGuidesFeedbackTicket(data: FAQFeedbackTicketData) {
    const client = new Client({ auth: process.env.NOTION_API_KEY })
    const newTicket = await client.pages.create({
        parent: {
            type: "database_id",
            database_id: "185801a6fddc803ebb42c42ed5d78e0b"
        },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: `Guides Feedback from ${data.name}`
                        }
                    }
                ]
            }
        },
        children: [
            {
                object: "block",
                heading_2: {
                    rich_text: [
                        {
                            text: {
                                content: "User Data"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                paragraph: {
                    rich_text: [
                        {
                            text: {
                                content: `Name: ${data.name}\nEmail: ${data.email}`
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                heading_2: {
                    rich_text: [
                        {
                            text: {
                                content: "User Feedback"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                paragraph: {
                    rich_text: [
                        {
                            text: {
                                content: `Issue Type: ${data.issue_type}\nIssue Description: ${data.issue_description}`
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                heading_2: {
                    rich_text: [
                        {
                            text: {
                                content: "Guides Article"
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                paragraph: {
                    rich_text: [
                        {
                            text: {
                                content: `Name: ${data.article_prompt}\nLink: ${data.article_path}`
                            }
                        }
                    ]
                }
            }
        ]
    })

    console.log(`New Guides Feedback ticket created`, newTicket)
}

export async function createFeedbackTicket(data: FeedbackTicketData) {
    const images: any[] = data.imgUrls.map(url => ({
        object: "block",
        type: "image",
        image: {
            type: "external",
            external: { url: url }
        }
    }))

    const children: any[] = [
        {
            object: "block",
            heading_2: {
                rich_text: [
                    {
                        text: {
                            content: "User Data"
                        }
                    }
                ]
            }
        },
        {
            object: "block",
            paragraph: {
                rich_text: [
                    {
                        text: {
                            content: `Name: ${data.name}\nEmail: ${data.email}`
                        }
                    }
                ]
            }
        },
        {
            object: "block",
            heading_2: {
                rich_text: [
                    {
                        text: {
                            content: "User Feedback"
                        }
                    }
                ]
            }
        },
        {
            object: "block",
            paragraph: {
                rich_text: [
                    {
                        text: {
                            content: data.feedback
                        }
                    }
                ]
            }
        }
    ].concat(images)

    const client = new Client({ auth: process.env.NOTION_API_KEY })
    const newTicket = await client.pages.create({
        parent: {
            type: "database_id",
            database_id: "185801a6fddc803ebb42c42ed5d78e0b"
        },
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: `Feedback from ${data.name}`
                        }
                    }
                ]
            }
        },
        children: children
    })

    console.log(`New ticket created: `, newTicket)
}

export async function getNotionDatabase(id: string) {
    const client = new Client({ auth: process.env.NOTION_API_KEY })
    return await client.databases.retrieve({ database_id: id })
}

export async function getNotionDatabaseContent(id: string) {
    const client = new Client({ auth: process.env.NOTION_API_KEY })
    return await client.databases.query({database_id: id})
}

export async function getNotionPage(id: string) {
    const client = new Client({ auth: process.env.NOTION_API_KEY })
        const pageDetails = await client.pages.retrieve({ page_id: id })
        const pageBlockChildren = await client.blocks.children.list({
            block_id: id,
            page_size: 50,
        })
        return {
            ...pageDetails,
            block_children: pageBlockChildren
        }
}

export async function getNotionDatabaseAndContents(id: string, sortBy?: {sorts: {property: string, direction: "ascending" | "descending"}[]}) {
    const client = new Client({ auth: process.env.NOTION_API_KEY })
    const database = await client.databases.retrieve({ database_id: id })
    const content = await client.databases.query({
        database_id: id,
        ...(sortBy ? sortBy : undefined)
    })

    // add page details to each page
    const pages = await Promise.all(content.results.map(async (result) => {
        return await getNotionPage(result.id)
    }))

    return {
        database,
        content,
        pages
    }
}