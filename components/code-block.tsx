import { CodeBlock } from "react-code-block"
import { Button } from "@/components/ui/button"

export default function CopyCodeBlock({ code, language }: { code: string; language: string }) {
    const copyCode = () => {
        // Logic to copy `code`
        try {
            navigator.clipboard.writeText(code)
        } catch (error) {
            // sonner or toast
        }
    }

    return (
        <CodeBlock code={code} language={language}>
            <div className="relative">
                <CodeBlock.Code 
                    className="bg-gray-900 !p-6 rounded-xl shadow-lg max-w-md overflow-y-auto"
                    onCopy={(e: any) => {
                        // console.log("Code copied!");
                        // Optionally, you can access the copied text:
                        // const copiedText = window.getSelection()?.toString();
                        // console.log("Copied text:", copiedText);
                        // You can also trigger a toast, analytics event, etc.
                    }}
                >
                    <div className="table-row">
                        <CodeBlock.LineNumber className="table-cell pr-4 text-sm text-gray-500 text-right select-none" />
                        <CodeBlock.LineContent className="table-cell">
                            <CodeBlock.Token />
                        </CodeBlock.LineContent>
                    </div>
                </CodeBlock.Code>

                <Button
                    className="bg-gray-500 rounded-full px-3.5 py-1.5 absolute top-2 right-5 text-sm font-semibold"
                    onClick={() => copyCode()}
                >
                    Copy code
                </Button>
            </div>
        </CodeBlock>
    )
}
