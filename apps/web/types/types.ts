export type PubMedPublication = {
    title: string
    abstract: string
    authors: string[]
    keywords: string[]
    date: string
    url: string
    meta: {
        publishedDate: string
    }
    platform?: string // Optional, assuming it's not in your current data but expected in UI
    id?: string // Optional, not present in response but used in MatchCard props
    annotations?: string
    description?: string
    saved?: boolean
}
