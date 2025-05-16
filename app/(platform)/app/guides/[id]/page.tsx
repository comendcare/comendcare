// import React from "react"
// import { BlockMapType } from "react-notion";
// import { NotionPage } from "@/components/notion-page";

// export default async function NotionFAQPage({params}: {params: {id: string}}) {
//     const pageId = params.id;

//     if (!pageId) {
//         return;
//     }

//     const blockMap: BlockMapType = await fetch(
//         `https://notion-api.splitbee.io/v1/page/${pageId}`
//     ).then(res => res.json());


//     if (!blockMap || Object.keys(blockMap).length === 0) {
//         return (
//         <div>
//             <h3>No data found.</h3>
//             <div> Make sure the pageId is valid.</div>
//             <div>Only public pages are supported in this example.</div>
//         </div>
//         );
//     }

//     const title =
//         blockMap[Object.keys(blockMap)[0]]?.value.properties.title[0][0];

//     return (
//         <div style={{ maxWidth: 768 }}>
//             <NotionPage blockMap={blockMap} />
//         </div>
//     );
// }

import { type ExtendedRecordMap } from 'notion-types'
import { NotionPage } from '@/components/notion-page'
import notion from '@/lib/react-notion'

import 'react-notion-x/src/styles.css'

export const revalidate = 10 // ISR: regenerate page every 10 seconds
export const runtime = 'nodejs' // Don't use 'edge'

function formatPageId(id: string): string {
  if (!id.includes('-') && id.length === 32) {
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
  }
  return id
}

export default async function NotionDynamicPage({
	params
}: {
	params: { id: string }
}) {
    const res = await fetch('https://www.notion.so/api/v3/loadPageChunk', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			pageId: formatPageId(params.id),
			limit: 50,
			chunkNumber: 0,
			verticalColumns: false
		})
	})

	const json = await res.json()

	try {
		return <NotionPage recordMap={json.recordMap} rootPageId={params.id} />
	} catch (error) {
			console.error('Failed to fetch page:', error)
	}

	return <p>FAILED to fetch</p>
}
