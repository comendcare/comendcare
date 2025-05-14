import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getNotionDatabaseAndContents, getNotionDatabaseContent, getNotionPage } from "@/lib/notion"
import { cards } from "./components/faq-card-deck"
import Link from "next/link"
// import TextHover from "@/components/animations/text-hover"
// import Footer from "@/components/footer"

// export const metadata = {
//     title: `Guides `,
//     description: `Frequently asked questions and further notes about this rare disease repository.`,
//     keywords: `Comend, Librarey, Rare Disease, Disability Resource Guide, Support, FAQ`,
//     openGraph: {
//         title: `FAQ - Librarey`,
//         images: ``,
//         description: `Frequently asked questions and further notes about this rare disease repository.`,
//         locale: `en_US`
//     }
// }

export default async function FAQLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const faqDBKey = '1f3801a6fddc8010b610f8175f5cccf9'
    const {database, content, pages} = await getNotionDatabaseAndContents(faqDBKey)

    // console.log(`sections`, database.properties.Section)
    // if (database.properties.Section.type === 'select') console.log(database.properties.Section.select.options)
    // console.log(`pages`, pages.map((page: any) => page.properties.Section.select))
    console.log(`pages`, (pages as any[]).map(page => page))

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
                                        {/* {card.prompts.map((prompt, index) => (
                                            <Link href={prompt.href} key={index}>
                                                {prompt.prompt}
                                            </Link>
                                        ))} */}
                                        {pages.filter((page: any) => page.properties.Section.type === 'select' && page.properties.Section.select.name === option.name).map((page: any, index: number) => (
                                            <Link href={`/app/guides/${page.id}`} key={index}>
                                                {page.properties.Name.title?.[0].text.content}
                                            </Link>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    ))}
                    {/* {cards.map((card, index) => (
                        <div key={index}>
                            <Accordion type="single" collapsible className="w-full" defaultValue={card.heading}>
                                <AccordionItem value={card.heading}>
                                    <AccordionTrigger className="p-2 flex flex-row text-left">
                                        {card.heading}
                                    </AccordionTrigger>
                                    <AccordionContent className="flex flex-col space-y-1 px-2">
                                        {card.prompts.map((prompt, index) => (
                                            <Link href={prompt.href} key={index}>
                                                {prompt.prompt}
                                            </Link>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    ))} */}
                </div>
                <div>{children}</div>
            </div>
            {/* <Footer /> */}
        </main>
    )
}
