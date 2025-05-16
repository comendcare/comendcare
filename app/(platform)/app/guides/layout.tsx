import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getNotionDatabaseAndContents } from "@/lib/notion"
import Link from "next/link"

export default async function FAQLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const faqDBKey = '1f3801a6fddc8010b610f8175f5cccf9'
    const {database, content, pages} = await getNotionDatabaseAndContents(faqDBKey)

    const filteredPages = (
        process.env.NEXT_PUBLIC_NODE_ENV === 'production'
            ? pages
                .filter((page: any) => page.properties.Status.type === 'status' && page.properties.Status.status === 'Published (in production)')
                .filter((page: any) => page.properties.Section)
                .filter((page: any) => page.public_url)
            : pages
                .filter((page: any) => page.public_url)
    )

    return (
        <main className="w-full h-full">
            <div className="w-full container relative flex gap-8 bg-white mx-auto max-w-8xl px-6 py-4 sm:py-8 lg:px-8">
                <div className="hidden lg:block lg:sticky lg:top-4 self-start">
                    <h1 className="col-span-full text-2xl md:text-3xl font-semibold min-w-fit text-nowrap">Comend Guides</h1>
                    {database.properties.Section.type === 'select' && database.properties.Section.select.options.map((option, index) => (
                        <div key={index}>
                            <Accordion type="single" collapsible className="w-full" defaultValue={option.name}>
                                <AccordionItem value={option.name}>
                                    <AccordionTrigger className="p-2 flex flex-row text-left">
                                        {option.name}
                                    </AccordionTrigger>
                                    <AccordionContent className="flex flex-col space-y-1 px-2">
                                        {filteredPages.filter((page: any) => page.properties.Section.type === 'select' && page.properties.Section.select.name === option.name).map((page: any, index: number) => (
                                            <Link href={`/app/guides/${page.id}`} key={index}>
                                                {page.properties.Name.title?.[0].text.content}
                                            </Link>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    ))}
                </div>
                <div>{children}</div>
            </div>
        </main>
    )
}
