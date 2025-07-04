import {JSDOM} from "jsdom"


interface ArticleData {
    pmid: string
    title: string
    abstract: string
    keywords: string[]
    formattedPublishedDate: string
    publishedDate: string
    authors: any
}

function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function extractArticleData(xml: string): ArticleData {
    // Create a JSDOM instance from the XML string
    const dom = new JSDOM(xml, {
        contentType: "application/xml"
    })

    // Use standard DOM query methods to find AbstractText elements
    const pmidElement = dom.window.document.querySelector("PMID")
    const abstractTextElements =
        dom.window.document.querySelectorAll("AbstractText")
    const articleTitleElements =
        dom.window.document.querySelectorAll("ArticleTitle")
    const keywordElements = dom.window.document.querySelectorAll("Keyword")

    // Map over the NodeList to extract text content of each element
    const pmid = pmidElement?.textContent || ""
    const abstractTexts = Array.from(abstractTextElements).map(
        element => element.textContent || ""
    )
    const articleTitle = Array.from(articleTitleElements).map(
        element => element.textContent || ""
    )
    const keywords = Array.from(keywordElements).map(
        element => element.textContent || ""
    )

    const authorElements = dom.window.document.querySelectorAll("Author")

    // Map over the NodeList to extract details of each Author element
    const authors = Array.from(authorElements).map(authorElement => {
        const lastName =
            authorElement.querySelector("LastName")?.textContent || ""
        const foreName =
            authorElement.querySelector("ForeName")?.textContent || ""
        const affiliation =
            authorElement.querySelector("Affiliation")?.textContent || ""

        return {
            name: `${foreName} ${lastName}`.trim(),
            affiliation: affiliation
        }
    })

    // Use standard DOM query methods to find the PubMedPubDate element with PubStatus="accepted"
    const pubDateElement = dom.window.document.querySelector(
        'PubMedPubDate[PubStatus="accepted"]'
    )

    // Extract the Year, Month, and Day elements
    const year = pubDateElement?.querySelector("Year")?.textContent || ""
    const month = pubDateElement?.querySelector("Month")?.textContent || ""
    const day = pubDateElement?.querySelector("Day")?.textContent || ""

    // Convert the month number to the month name
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
    const monthIndex = parseInt(month, 10) - 1 // Adjust month number to index (0-11)
    const monthName = monthNames[monthIndex]

    // Format the date (If month is undefined, return empty string as date)
    const formattedDate = monthName ? `${monthName} ${day}, ${year}` : ""
    const date = `${year}/${month}/${day}`

    return {
        pmid: pmid,
        title: articleTitle.join(""),
        authors: authors,
        abstract: abstractTexts.join("\n"),
        formattedPublishedDate: formattedDate,
        publishedDate: date,
        keywords: keywords
    }
}

export const getPubMedSearchResultIds = async (
    query: string,
    cursor: number = 0,
    limit: number = 10
) => {
    // retmax 10000 is the maximum results the API can return
    // retmode can be XML or JSON, obviously we pick JSON
    const queryAPIURL = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=${limit}&retstart=${cursor}&retmode=json&api_key=${process.env.NCBI_API_KEY}`
    const response = await fetch(queryAPIURL)
    const responseData = await response.json()
    const responseDataIds = responseData.esearchresult.idlist.map(function (
        id: string
    ) {
        return parseInt(id)
    })

    return responseDataIds
}

export async function getPubMedSearchResultData(ids: number[]): Promise<any[]> {
    const queryAPIBaseURL = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&rettype=abstract&api_key=${process.env.NCBI_API_KEY}`
    let results: any[] = []

    // Function to fetch data for a single ID
    const fetchDataForId = async (id: number) => {
        const response = await fetch(`${queryAPIBaseURL}&id=${id}`)
        const responseData = await response.text()
        return extractArticleData(responseData)
    }

    // PubMed API is rate-limited to 3 requests per second
    // Process the IDs in batches of 2, waiting 1 second between each batch
    for (let i = 0; i < ids.length; i += 5) {
        const batch = ids.slice(i, i + 5)
        const batchResults = await Promise.all(
            batch.map(id => fetchDataForId(id))
        )
        results = [...results, ...batchResults]

        // Wait for 2 seconds before proceeding to the next batch, unless it's the last batch
        if (i + 3 < ids.length) {
            await delay(1000)
        }
    }

    return results
}
