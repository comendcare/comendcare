import React from "react"
import Breadcrumbs from "../components/breadcrumbs"
import FAQFeedback from "../components/faq-feedback"
import { getNotionPage } from "@/lib/notion"

export default async function NotionFAQPage({params}: {params: {id: string}}) {
    const page: any = await getNotionPage(params.id)
    // const client = new Client({ auth: process.env.NOTION_API_KEY })
    // const page = await client.pages.retrieve({ page_id: params.id })
    // const notion = new NotionAPI()
    // const recordMap = await notion.getPage(params.id)

    return (
        <>
            <div className="bg-white px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-base leading-7 text-gray-700">
                    <article className="prose prose-lg flex flex-col mx-auto w-full max-w-4xl format format-sm sm:format-base lg:format-lg format-blue">
                        <div className="not-prose">
                            <Breadcrumbs pathname={`/app/guides/${page.properties.Name.title?.[0].text.content}`} />
                        </div>

                        <div>
                            <h1>TEST CONTENT</h1>
                            {/* <NotionRenderer recordMap={recordMap} fullPage={true} darkMode={false} /> */}
                        </div>

                        <FAQFeedback />
                    </article>
                </div>
            </div>
        </>
    )
}
