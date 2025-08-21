export type FdaFeed = {
    name: string;                // human label
    provider: string;            // registry "provider"
    url: string;                 // RSS URL
};

// MedWatch provided by you; others via env to keep code flexible
export const FDA_FEEDS: FdaFeed[] = [
    {
        name: "MedWatch Safety Alerts",
        provider: "rss:fda:medwatch",
        url: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch/rss.xml",
    },
    // Fill these via env so you can change without code deploys.
    {
        name: "What's New: Drugs",
        provider: "rss:fda:whats-new-drugs",
        url: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/drugs/rss.xml",
    },
    {
        name: "What's New: Biologics (Vaccines, Blood, Biologics)",
        provider: "rss:fda:whats-new-vbb",
        url: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/biologics/rss.xml",
    },
    {
        name: "FDA Press Releases",
        provider: "rss:fda:press",
        url: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml",
    },
].filter(f => !!f.url);
