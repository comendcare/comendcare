export function fixPlatformName(platform: string) {
    const map: {
        [key: string]: string
    } = {
        pubmed: "PubMed"
    }
    return map[platform]
}

