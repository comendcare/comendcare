import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cards } from "@/components/faq/faq-card-deck"
import Link from "next/link"
import TextHover from "@/components/animations/text-hover"

export const metadata = {
    title: `FAQ - Librarey`,
    description: `Frequently asked questions and further notes about this rare disease repository.`,
    keywords: `Comend, Librarey, Rare Disease, Disability Resource Guide, Support, FAQ`,
    openGraph: {
        title: `FAQ - Librarey`,
        images: ``,
        description: `Frequently asked questions and further notes about this rare disease repository.`,
        locale: `en_US`
    }
}

export default function FAQLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <main>
            <div className="container relative grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white mx-auto max-w-7xl px-6 py-4 sm:py-8 lg:px-8">
                <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 self-start">
                    {cards.map((card: any, index: number) => (
                        <div key={index}>
                            <Accordion type="single" collapsible className="w-full" defaultValue={card.heading}>
                                <AccordionItem value={card.heading}>
                                    <AccordionTrigger className="p-2 flex flex-row text-left">
                                        <TextHover>{card.heading}</TextHover>
                                    </AccordionTrigger>
                                    <AccordionContent className="flex flex-col space-y-1 px-2">
                                        {card.prompts.map((prompt: any, index: number) => (
                                            <Link href={prompt.href} key={index}>
                                                <TextHover>{prompt.prompt}</TextHover>
                                            </Link>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    ))}
                </div>
                <div className="col-span-1 lg:col-span-4">{children}</div>
            </div>
            {/* <Footer /> */}
        </main>
    )
}