import { CheckCircle } from "lucide-react"

interface DoExampleProps {
    emphasizedWords: string
    contentWords: string
    blockquotes: string[]
}

export default function DoExample({ emphasizedWords, contentWords, blockquotes }: DoExampleProps) {
    return (
        <div className="flex flex-row gap-x-3 p-4 border-l border-green-600">
            <CheckCircle className="mt-1 h-5 w-5 flex-none text-green-600" aria-hidden="true" />
            <div>
                <strong className="font-semibold text-gray-900">{emphasizedWords}</strong>
                &nbsp;
                {contentWords}
                {blockquotes.map((blockquote, index) => (
                    <blockquote key={index} className="not-prose">
                        <p>{blockquote}</p>
                    </blockquote>
                ))}
            </div>
        </div>
    )
}
