import { BookOpen, Clipboard, Save } from "lucide-react"
import FAQCard from "./faq-card"

export const cards = [
    // {
    //     icon: <BookOpen />,
    //     heading: "Using Librarey",
    //     description: "Guides on how to use the features on Librarey.",
    //     prompts: [
    //         {
    //             prompt: "How to search for a resource",
    //             href: "/app/guides/how-to-search-for-a-resource"
    //         },
    //         {
    //             prompt: "How to filter for a resource",
    //             href: "/app/guides/how-to-filter-for-a-resource"
    //         },
    //         {
    //             prompt: "How to create an account",
    //             href: "/app/guides/how-to-create-an-account"
    //         },
    //         {
    //             prompt: "How to propose a new resource",
    //             href: "/app/guides/how-to-propose-a-resource"
    //         },
    //         {
    //             prompt: "How to leave a comment or reply",
    //             href: "/app/guides/how-to-write-a-comment"
    //         },
    //         {
    //             prompt: "How to report an issue or provide feedback",
    //             href: "/app/guides/how-to-report-issues-and-provide-feedback"
    //         },
    //         {
    //             prompt: "How to browse events",
    //             href: "/app/guides/how-to-browse-events"
    //         },
    //         {
    //             prompt: "How to propose an event",
    //             href: "/app/guides/how-to-propose-an-event"
    //         }
    //     ]
    // },
    {
        icon: <Clipboard />,
        heading: "Rules and Policies",
        description: "Guidelines that users of Librarey should follow.",
        prompts: [
            {
                prompt: "Resource contribution guidelines",
                href: "/app/guides/contribution-guidelines"
            },
            {
                prompt: "Privacy policy",
                href: "https://comend.notion.site/Librarey-s-Policies-98d960fe48e34b97a5bb5b152266ecc2"
            },
            // {
            //     prompt: "Terms and conditions",
            //     href: "/terms-of-service"
            // }
        ]
    },
    // {
    //     icon: <Save />,
    //     heading: "Create Collection and Embed",
    //     description: "Create and add collection to your site",
    //     prompts: [
    //         {
    //             prompt: "How to create a collection",
    //             href: "/app/guides/how-to-create-a-collection"
    //         },
    //         {
    //             prompt: "Embed Librarey on your own website",
    //             href: "/app/guides/how-to-embed-librarey"
    //         }
    //     ]
    // }
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
