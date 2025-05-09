import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cards } from "./components/faq-card-deck"
import Link from "next/link"
// import TextHover from "@/components/animations/text-hover"
// import Footer from "@/components/footer"

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
        <main className="w-full h-full">
            <div className="w-full container relative flex gap-8 bg-white mx-auto max-w-8xl px-6 py-4 sm:py-8 lg:px-8">
                <div className="hidden lg:block lg:sticky lg:top-4 self-start">
                    <h1 className="col-span-full text-2xl md:text-3xl font-semibold min-w-fit text-nowrap">Comend Guides</h1>
                    {cards.map((card, index) => (
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
                    ))}
                </div>
                <div>{children}</div>
            </div>
            {/* <Footer /> */}
        </main>
    )
}
