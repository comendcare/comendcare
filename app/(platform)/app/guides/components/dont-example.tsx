import { CircleX } from "lucide-react"

interface DontExampleProps {
    emphasizedWords: string
    contentWords: string
    blockquotes: string[]
}

export default function DontExample({ emphasizedWords, contentWords, blockquotes }: DontExampleProps) {
    return (
        <div className="flex flex-row gap-x-3 p-4 border-l border-red-600">
            <CircleX className="mt-1 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
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
