"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
 
export function FAQsWithGrid({ faqs }: { faqs: { question: string, answer: string, contactLink: boolean }[]}) {
  const columns = 3;
  const faqsGrid: { question: string; answer: string, contactLink: boolean }[][] = Array.from(
    { length: columns },
    () => [],
  );
  faqs.forEach((faq, index) => {
    faqsGrid[index % columns].push(faq);
  });
  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-20 md:px-8 md:py-40">
      <h2 className="text-left text-3xl md:text-4xl font-bold mb-4">
        Frequently asked questions
      </h2>
      <p className="max-w-lg text-left text-xl text-muted-foreground mb-8">
        We are here to help you with any questions you may have. If you
        don&apos;t find what you need, please contact us through our{" "}
        <a
          href="/contact"
          className="text-blue-500 underline"
        >
          contact page
        </a>.
      </p>
      <div className="mt-10 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-3">
        {faqsGrid.map((faqs, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-1 items-start gap-4">
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
    </div>
  );
}
 
const FAQItem = ({
  question,
  answer,
  contactLink
}: {
  question: string;
  answer: string;
  contactLink: boolean
}) => {
  return (
    // <div className="rounded-2xl bg-white p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] dark:bg-neutral-900 dark:shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset]">
    //   <h3 className="text-black text-2xl font-semibold leading-none tracking-tight">
    //     {question}
    //   </h3>
 
    //   <p className="text-muted-foreground text-base">
    //     {answer}
    //   </p>

    //   {contactLink && (
    //     <p className="text-muted-foreground text-base">
    //         {`Have thoughts? `}
    //         <a
    //             href="/contact"
    //             className="text-blue-500 underline"
    //         >
    //             Let us know.
    //         </a>
    //     </p>
    //   )}
    // </div>

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
                    <a
                        href="/contact"
                        className="text-blue-500 underline"
                    >
                        Let us know.
                    </a>
                </p>
            )}
        </CardContent>
    </Card>
  );
};


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
