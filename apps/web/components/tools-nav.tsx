import { TabNav } from "@comend/components/tab-nav";

export function ToolsNav({className}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <TabNav 
            className={className}
            baseLink={"/app/tools"}
        />
    )
}