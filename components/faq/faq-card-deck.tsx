import FAQCard from "./faq-card"
import { FaBookOpen, FaClipboardCheck, FaFloppyDisk, FaHandshakeSimple } from "react-icons/fa6"

export const cards = [
    {
        icon: <FaBookOpen />,
        heading: "Using Librarey",
        description: "Guides on how to use the features on Librarey.",
        prompts: [
            {
                prompt: "How to search for a resource",
                href: "/faq/how-to-search-for-a-resource"
            },
            {
                prompt: "How to filter for a resource",
                href: "/faq/how-to-filter-for-a-resource"
            },
            {
                prompt: "How to create an account",
                href: "/faq/how-to-create-an-account"
            },
            {
                prompt: "How to propose a new resource",
                href: "/faq/how-to-propose-a-resource"
            },
            // {
            //     prompt: "How to create a collection",
            //     href: "/faq/how-to-create-a-collection"
            // },
            {
                prompt: "How to leave a comment or reply",
                href: "/faq/how-to-write-a-comment"
            },
            {
                prompt: "How to report an issue or provide feedback",
                href: "/faq/how-to-report-issues-and-provide-feedback"
            },
            {
                prompt: "How to browse events",
                href: "/faq/how-to-browse-events"
            },
            {
                prompt: "How to propose an event",
                href: "/faq/how-to-propose-an-event"
            }
        ]
    },
    {
        icon: <FaClipboardCheck />,
        heading: "Rules and Policies",
        description: "Guidelines that users of Librarey should follow.",
        prompts: [
            {
                prompt: "Resource contribution guidelines",
                href: "/faq/contribution-guidelines"
            },
            {
                prompt: "Privacy policy",
                href: "https://comend.notion.site/Librarey-s-Policies-98d960fe48e34b97a5bb5b152266ecc2"
            },
            {
                prompt: "Terms and conditions",
                href: "/terms-of-service"
            }
        ]
    },
    {
        icon: <FaFloppyDisk />,
        heading: "Create Collection and Embed",
        description: "Create and add collection to your site",
        prompts: [
            {
                prompt: "How to create a collection",
                href: "/faq/how-to-create-a-collection"
            },
            {
                prompt: "Embed Librarey on your own website",
                href: "/faq/how-to-embed-librarey"
            }
        ]
    }
]

export default function FAQCardDeck() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {cards.map((card, index) => (
                <FAQCard key={index} heading={card.heading} description={card.description} prompts={card.prompts} />
            ))}
        </div>
    )
}