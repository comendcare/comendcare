import { FAQsWithGrid } from "@/components/layout/sections/faq"

const FAQs = [
    {
        question: "Where does our data come from?",
        answer:
            "We have seeded our network using existing databases like PubMed. Soon, researchers and contractors will be able to claim and edit their pages.",
        contactLink: false,
    },
    {
        question: "How do we make money?",
        answer:
            "We do not currently plan to charge patient groups for access to the platform and are extremely intentional about aligning our incentives. To sustain and grow our platform, we’ll attach fees to industry profiles, generate market research, and do revenue sharing on IP produced through our platform. Have thoughts? Let us know.",
        contactLink: true,
    },
    {
        question: "What do we do with your data?",
        answer:
            "We do not currently capture patient-level data, but meet GDPR standards for data privacy and security. With your consent, we will use information you share with us to create reports that will help biopharma launch new rare disease initiatives and partner with you.",
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
        answer: "We know how detrimental it can be when companies in the rare disease space wind down. We are committed to establishing and sharing plans to safeguard and return your data and efforts in the unfortunate case that we cannot sustain our operations. We will be proactive about informing the community on challenges that arise for our future.",
        contactLink: false
    },
    {
        question: `What does "Comend" mean?`,
        answer:
            "Pronounced KH-oh-mend. It means to work together to fix things. Particularly, in relation to patient-centricity, translational research, and drug development.",
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
