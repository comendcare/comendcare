import { encode } from "qss"
import { StaticImageData } from "next/image"
// import searchThumbnail from "@/public/screenshots/searchThumbnailScreenshot.png"
// import filterThumbnail from "@/public/screenshots/searchPageScreenshot.png"
// import signinThumbnail from "@/public/screenshots/signinThumbnailScreenshot.png"
// import contributeResoureceThumbnail from "@/public/screenshots/contributeResourceThumbnailScreenshot.png"
// import collectionsThumbnail from "@/public/screenshots/collectionsThumbnail.png"
// import commentsThumbnail from "@/public/screenshots/commentsThumbnail.png"
// import reportIssueThumbnail from "@/public/screenshots/reportIssueThumbnail.png"
// import contributionGuidelinesThumbnail from "@/public/screenshots/contributionGuidelinesThumbnail.png"
// import privacyPolicyThumbnail from "@/public/screenshots/privacyPolicyThumbnail.png"
// import termsOfServiceThumbnail from "@/public/screenshots/termsOfServiceThumbnail.png"
// import embedThumbnail from "@/public/screenshots/embedThumbnail.png"

export type TagType = "start" | "contribute" | "rules" | "resource" | "guide" | "collections"

export interface ArticleType {
    prompt: string
    description?: string
    href: string
    tags: TagType[]
    thumbnailSrc?: StaticImageData
    imgParams: string
}

export const imgWidth = 400
export const imgHeight = 250

export const articles: ArticleType[] = [
    {
        prompt: "Resource contribution guidelines",
        description:
            "How to structure your new resource proposal to best help families.",
        href: "/app/guides/contribution-guidelines",
        tags: ["contribute", "guide"],
        // thumbnailSrc: contributionGuidelinesThumbnail,
        imgParams: encode({
            // url: "https://www.librarey.com/faq/contribution-guidelines",
            screenshot: true,
            meta: false,
            embed: "screenshot.url",
            colorScheme: "dark",
            "viewport.isMobile": true,
            "viewport.deviceScaleFactor": 1,
            "viewport.width": imgWidth * 3,
            "viewport.height": imgHeight * 3
        })
    },
]
