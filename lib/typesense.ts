/*
 *  Our JavaScript client library works on both the server and the browser.
 *  When using the library on the browser, please be sure to use the
 *  search-only API Key rather than the master API key since the latter
 *  has write access to Typesense and you don't want to expose that.
 */
import Typesense from "typesense";
// const Typesense = require('typesense')

console.log(process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY)
console.log(process.env.NEXT_PUBLIC_TYPESENSE_NODE)
console.log(process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY)
export const typesense = new Typesense.Client({
    'nodes': [{
        'host': process.env.NEXT_PUBLIC_TYPESENSE_NODE || "", // For self-hosting locally use "localhost"
        'port': 443,      // For self-hosting locally use "8108"
        'protocol': 'https'   // For self-hosting locally use "http"
    }],
    'apiKey': (process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
            ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
            : process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY)
        || "",
    'connectionTimeoutSeconds': 2
})
