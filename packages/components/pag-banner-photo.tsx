"use client";

import React from "react";

export function PAGBannerPhoto({
    img,
}: {
    img: string | null | undefined;
}) {
    return (
        img ? (
            <img className={"w-full object-cover"} src={img || ""} alt=""/>
        ) : (
            <div className={"h-32 w-full object-cover lg:h-48 bg-secondary"}></div>
        )
    )
}
