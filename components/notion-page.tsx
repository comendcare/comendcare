"use client"

import Link from "next/link"
import { BlockMapType, NotionRenderer } from "react-notion"
import 'react-notion/src/styles.css'

export function NotionPage({
  blockMap,
}: {
  blockMap: BlockMapType
}) {
  if (!blockMap) {
    return null
  }

  return (
      <div className={"notion-code"}>
      <NotionRenderer
          blockMap={blockMap}
          fullPage
          customBlockComponents={{
          page: ({ blockValue, renderComponent }) => (
                <Link href={`/${blockValue.id}`}>{renderComponent()}</Link>
            )
          }}
      />
      <style jsx global>{`
          div :global(.notion-code) {
          box-sizing: border-box;
          }
          body {
          padding: 0;
          margin: 0;
          }
      `}</style>
      </div>
  )
}