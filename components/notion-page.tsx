"use client"

// import Link from "next/link"
// import { BlockMapType, NotionRenderer } from "react-notion"
// import 'react-notion/src/styles.css'

// export function NotionPage({
//   blockMap,
// }: {
//   blockMap: BlockMapType
// }) {
//   if (!blockMap) {
//     return null
//   }

//   return (
//       <div className={"notion-code"}>
//       <NotionRenderer
//           blockMap={blockMap}
//           fullPage
//           customBlockComponents={{
//           page: ({ blockValue, renderComponent }) => (
//                 <Link href={`/${blockValue.id}`}>{renderComponent()}</Link>
//             )
//           }}
//       />
//       <style jsx global>{`
//           div :global(.notion-code) {
//           box-sizing: border-box;
//           }
//           body {
//           padding: 0;
//           margin: 0;
//           }
//       `}</style>
//       </div>
//   )
// }

import { type ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'

export function NotionPage({
	recordMap,
	rootPageId,
	showCoverImage = true
}: {
	recordMap: ExtendedRecordMap
	rootPageId?: string,
	showCoverImage?: boolean
}) {
	if (!recordMap) {
		return null
	}

	return (
		<NotionRenderer
			className="bg-transparent -mb-40"
			recordMap={recordMap}
			fullPage={true}
			darkMode={false}
			rootPageId={rootPageId}
			disableHeader={true}
			header={(<></>)}
			pageHeader={(
				<>
				<div className="-mt-12"></div>
				</>
			)}
			pageTitle={(<></>)}
			// pageCover={(<></>)}
			pageCover={showCoverImage ? undefined : <></>}
			pageFooter={(<></>)}
		/>
	)
}