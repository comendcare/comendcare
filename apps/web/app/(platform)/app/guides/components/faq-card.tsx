import Link from "next/link"

interface FAQCardProps {
    heading: string
    description: string
    prompts: {
        prompt: string
        href: string
    }[]
}

export default function FAQCard({ heading, description, prompts }: FAQCardProps) {
    return (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white border border-gray-200 shadow">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">{heading}</h3>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
                <ul role="list" className="divide-y divide-gray-200">
                    {prompts.map(prompt => (
                        <li key={prompt.href} className="py-4">
                            <Link href={prompt.href} className="hover:text-blue-600 hover:underline">
                                {prompt.prompt}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
