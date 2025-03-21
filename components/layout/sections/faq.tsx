"use client"
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"

export function FAQsWithGrid({
    faqs
}: {
    faqs: { question: string; answer: string; contactLink: boolean }[]
}) {
    const columns = 3
    const faqsGrid: {
        question: string
        answer: string
        contactLink: boolean
    }[][] = Array.from({ length: columns }, () => [])
    faqs.forEach((faq, index) => {
        faqsGrid[index % columns].push(faq)
    })
    return (
        <div className="mx-auto grid max-w-7xl place-items-center gap-4 px-4 py-4 md:py-8">
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">
                Frequently asked questions
            </h2>
            <p className="max-w-lg text-center text-xl text-muted-foreground mb-8">
                We are here to help you with any questions you may have. If you
                don&apos;t find what you need, please {" "}
                <a href="/#contact" className="text-blue-500 underline">
                    contact us
                </a>
                .
            </p>
            <div className="hidden md:grid mt-10 w-full grid-cols-1 items-start gap-4 md:grid-cols-3">
                {faqsGrid.map((faqs, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="grid grid-cols-1 items-start gap-4"
                    >
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                contactLink={faq.contactLink}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <Accordion
                type="single"
                collapsible
                className="w-full max-w-lg md:hidden mt-10 mx-10"
            >
                {faqs.map((faq, index) => (
                    <AccordionItem
                        value={faq.question}
                        key={`accordion-${index}`}
                    >
                        <AccordionTrigger className="text-center font-bold">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base">
                            {faq.answer}

                            {faq.contactLink && (
                                <p className="text-muted-foreground text-base pt-4">
                                    {`Have thoughts? `}
                                    <a
                                        href="/contact"
                                        className="text-blue-500 underline"
                                    >
                                        Let us know.
                                    </a>
                                </p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

const FAQItem = ({
    question,
    answer,
    contactLink
}: {
    question: string
    answer: string
    contactLink: boolean
}) => {
    return (
        <Card
            key={question}
            className="bg-muted/50 dark:bg-card transition-all delay-75 group/number"
        >
            <CardHeader className="flex flex-col space-y-4">
                <CardTitle>{question}</CardTitle>
            </CardHeader>

            <CardContent className="text-muted-foreground">
                {answer}

                {contactLink && (
                    <p className="text-muted-foreground text-base pt-4">
                        {`Have thoughts? `}
                        <a href="/contact" className="text-blue-500 underline">
                            Let us know
                        </a>
                        .
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

// THIS IS THE OLD FAQ STUFF -------------------------------------
// import {
//     Accordion,
//     AccordionContent,
//     AccordionItem,
//     AccordionTrigger,
// } from "@/components/ui/accordion";

// interface FAQProps {
//     question: string;
//     answer: string;
//     value: string;
// }

// const FAQList: FAQProps[] = [
//     {
//         question: "What will this cost me?",
//         answer: "You can access our platform in its entirety, for free, forever. We make money through transaction fees and revenue sharing of commercialized IP.",
//         value: "item-1",
//     },
//     {
//         question: "How do you use my data?",
//         answer:
//             "We use your data to recommend relevant funding opportunities and generate application drafts. We also anonymize your data and share it with life sciences companies to help you attract industry interest. You can opt out of any use of your data at any time.",
//         value: "item-2",
//     },
//     {
//         question: "What are your privacy and security measures?",
//         answer:
//             "You name it, we’ve got it!",
//         value: "item-3",
//     },
//     {
//         question: "What are the risks of using your platform?",
//         answer:
//             "Have a concern you’d like to share? Contact us.",
//         value: "item-4",
//     },
// ];

// export const FAQSection = () => {
//     return (
//         <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
//             <div className="text-center mb-8">
//                 <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
//                     FAQs
//                 </h2>

//                 <h2 className="text-3xl md:text-4xl text-center font-bold">
//                     Common Questions
//                 </h2>
//             </div>

//             <Accordion type="single" collapsible className="AccordionRoot">
//                 {FAQList.map(({question, answer, value}) => (
//                     <AccordionItem key={value} value={value}>
//                         <AccordionTrigger className="text-left">
//                             {question}
//                         </AccordionTrigger>

//                         <AccordionContent>{answer}</AccordionContent>
//                     </AccordionItem>
//                 ))}
//             </Accordion>
//         </section>
//     );
// };
