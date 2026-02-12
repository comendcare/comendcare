// lib/ai/retrieve.ts
"use server"

import { aiSearchTypesense } from "./ai-typesense"

export async function retrieveForAssistant(message: string) {
    // Keep this small: the LLM should not be fed your whole docs
    const hits = await aiSearchTypesense({ q: message, perCollection: 4, totalLimit: 10 })

    // Convert to a compact context payload
    return hits.map((h) => ({
        type: h.collection,
        id: h.id,
        snippet: h.snippet,
        // keep minimal “preview” fields only
        preview: pickPreviewFields(h.collection, h.doc),
    }))
}

function pickPreviewFields(collection: string, doc: any) {
    switch (collection) {
        case "organizations":
            return { name: doc.name, description: doc.description }
        case "companies":
            return { title: doc.title, companyType: doc.companyType, website: doc.website, tags: doc.tags }
        case "rfps":
            return { title: doc.title, description: doc.description, startDate: doc.startDate, endDate: doc.endDate }
        case "research-plans":
            return { title: doc.title, description: doc.description, organization: doc.organization?.name }
        default:
            // fallback: keep only safe, short fields
            return { title: doc.title, name: doc.name, description: doc.description }
    }
}
