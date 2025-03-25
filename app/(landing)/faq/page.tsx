import { FAQsWithGrid } from "@/components/layout/sections/faq"

const FAQs = [
    // {
    //     question: "Where does our data come from?",
    //     answer:
    //         "We have seeded our network using existing databases like PubMed. Soon, researchers and contractors will be able to claim and edit their pages.",
    //     contactLink: false,
    // },
    {
        question: "What does it cost?",
        answer:
            "Comend is free for patient groups. We make money by helping biopharma identify opportunities in rare diseases.",
        contactLink: true,
    },
    {
        question: "What do we do with your data?",
        answer:
            "In short — only what you consent to! We can currently collect and analyze data to improve our product, identify successful research strategies, and make the case for biopharma initiatives to support rare disease research. Note: Comend does not currently store patient-level data.",
        contactLink: false,
    },
    {
        question: "Why are we doing this?",
        answer:
            "We are a team of technology enthusiasts, rare disease parents, and citizen scientists who wish to improve the social processes of science and recognize that patient advocates are uniquely suited to lead the next generation of drug development.",
        contactLink: false,
    },
    {
        question: "What happens if we shut down?",
        answer: "We’ve seen companies wind down in the rare disease space and understand how big of a set back that can be to you and your community. We are committed to preserving and returning your data as much as possible and will be forthright about significant risks to our operations.",
        contactLink: false
    },
    {
        question: `What does "Comend" mean?`,
        answer:
            "Pronounced “KH-oh-mend”, Comend means to work together to fix things. \n" +
            "\n" +
            "We bring together the rare community and traditional life sciences ecosystem to forge a path toward precision medicines at scale.",
        contactLink: false,
    },
  ];

export default function FAQPage() {
    return (
        <div className="container max-w-7xl mx-auto flex flex-col justify-center items-center space-y-16 py-24 md:py-24 mt-16">
            <FAQsWithGrid faqs={FAQs} />
        </div>
    )
}
