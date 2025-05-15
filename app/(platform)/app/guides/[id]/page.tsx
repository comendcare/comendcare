import React from "react"
import { BlockMapType } from "react-notion";
import { NotionPage } from "@/components/notion-page";

export default async function NotionFAQPage({params}: {params: {id: string}}) {
    const pageId = params.id;

    if (!pageId) {
        return;
    }

    const blockMap: BlockMapType = await fetch(
        `https://notion-api.splitbee.io/v1/page/${pageId}`
    ).then(res => res.json());


    if (!blockMap || Object.keys(blockMap).length === 0) {
        return (
        <div>
            <h3>No data found.</h3>
            <div> Make sure the pageId is valid.</div>
            <div>Only public pages are supported in this example.</div>
        </div>
        );
    }

    const title =
        blockMap[Object.keys(blockMap)[0]]?.value.properties.title[0][0];

    return (
        <div style={{ maxWidth: 768 }}>
            <NotionPage blockMap={blockMap} />
        </div>
    );
}
