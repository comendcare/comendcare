import React from "react";

export function PAGBannerPhoto({
    img,
}: {
    img: string | null | undefined;
}) {
    return (
        img ? (
            <img 
                className={"min-h-32 lg:min-h-48 object-cover bg-secondary"} 
                src={img} alt="" 
                data-testid="banner-img"
                onError={(e) => {
                    e.currentTarget.src = ""
                }}
            />
        ) : (
            <div 
                className={"h-32 w-full object-cover lg:h-48 bg-secondary"} 
                data-testid="banner-img"
            />
        )
    )
}
