import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ReactMarkdown from "react-markdown"

export default function FAQTab(props: { faq: { question: string; answer: string } }) {
    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    {props.faq.question}
                </AccordionTrigger>
                <AccordionContent>
                    <p className="text-base leading-7 text-gray-600">
                        <ReactMarkdown>{props.faq.answer}</ReactMarkdown>
                    </p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
