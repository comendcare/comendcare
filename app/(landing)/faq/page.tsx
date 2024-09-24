import { FAQsWithGrid } from "@/components/layout/sections/faq";

const FAQs = [
    {
        question: "Where does our data come from?",
        answer:
            "We have seeded our marketplace using existing online databases like PubMed. Soon, researchers and contractors will be able to claim and edit their pages.",
        contactLink: false,
    },
    {
        question: "How do we make money?",
        answer:
            "We are extremely intentional about aligning our incentives with patient groups. To do so, our current plan is to introduce low transaction fees, curate research for biopharma, and ultimately share revenue with patient groups through IP facilitated through our platform.",
        contactLink: true,
    },
    {
        question: "What do we do with your data?",
        answer:
            "Although we do not currently capture patient data, our platform is totally secure. With your consent, we will use your data to create market research that is intended to attract biopharma to rare diseases and patient groups.",
        contactLink: false,
    },
    {
        question: "Why are we doing this?",
        answer:
            "We are a team of technology enthusiasts, rare disease parents, and citizen scientists who wish to improve the social processes of science, and recognize that patient advocates are the best suited to leading innovation.",
        contactLink: false,
    },
    {
        question: "What happens if we shut down?",
        answer:
            "We know how detrimental it can be when companies in the rare disease space wind down. We are committed to establishing and sharing plans to safeguard and return your data and efforts in the unfortunate case that we cannot sustain our operations. We will be proactive about informing the community on challenges that arise for our future.",
        contactLink: false,
    },
  ];

export default function FAQPage () {
    return (
        <div
            className="container max-w-7xl mx-auto flex flex-col justify-center items-center space-y-16 py-24 md:py-24 mt-16"
        >
            <FAQsWithGrid faqs={FAQs} />
        </div>
    )
}