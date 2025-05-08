import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import type { ArticleType } from "@/lib/articles"

interface PreviewCardPropsType {
    index: number
    article: ArticleType
    imgHeight: number
    imgWidth: number
}

export default function PreviewCard({
    index,
    article,
    imgHeight,
    imgWidth
}: PreviewCardPropsType) {
    return (
        <Link href={article.href}>
            <Card key={index} className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle>{article.prompt}</CardTitle>
                    <CardDescription>
                        {article.description ? article.description : ""}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grow">
                    {article.thumbnailSrc ? (
                        <Image // use thumbnail screenshot where available
                            src={article.thumbnailSrc || ""}
                            alt="preview image"
                        />
                    ) : (
                        <Image // dynamically pull page preview if thumbnail is not available
                            src={`https://api.microlink.io/?${article.imgParams}`}
                            width={imgWidth}
                            height={imgHeight}
                            quality={50}
                            layout={"fixed"}
                            priority={true}
                            className="rounded-lg"
                            alt="preview image"
                        />
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}
