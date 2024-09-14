import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
    question: string;
    answer: string;
    value: string;
}

const FAQList: FAQProps[] = [
    {
        question: "What will this cost me?",
        answer: "You can access our platform in its entirety, for free, forever. We make money through transaction fees and revenue sharing of commercialized IP.",
        value: "item-1",
    },
    {
        question: "How do you use my data?",
        answer:
            "We use your data to recommend relevant funding opportunities and generate application drafts. We also anonymize your data and share it with life sciences companies to help you attract industry interest. You can opt out of any use of your data at any time.",
        value: "item-2",
    },
    {
        question: "What are your privacy and security measures?",
        answer:
            "You name it, we’ve got it!",
        value: "item-3",
    },
    {
        question: "What are the risks of using your platform?",
        answer:
            "Have a concern you’d like to share? Contact us.",
        value: "item-4",
    },
];

export const FAQSection = () => {
    return (
        <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
            <div className="text-center mb-8">
                <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
                    FAQs
                </h2>

                <h2 className="text-3xl md:text-4xl text-center font-bold">
                    Common Questions
                </h2>
            </div>

            <Accordion type="single" collapsible className="AccordionRoot">
                {FAQList.map(({question, answer, value}) => (
                    <AccordionItem key={value} value={value}>
                        <AccordionTrigger className="text-left">
                            {question}
                        </AccordionTrigger>

                        <AccordionContent>{answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
};
