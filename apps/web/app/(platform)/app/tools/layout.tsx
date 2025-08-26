"use client"
import React from "react";
import { ToolsNav } from "~web/components/tools-nav";

export default function ToolsLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="container relative flex flex-col items-center pt-4">
            <ToolsNav />
            {children}
        </div>
    )
}
