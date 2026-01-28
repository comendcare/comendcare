import React from "react";

export function PAGBannerPhoto({
    img,
}: {
    img: string | null | undefined;
}) {
    return (
        img ? (
            <div className={"min-h-32 object-cover lg:min-h-48 bg-secondary"} >
                <img 
                    className="object-cover w-full"
                    src={img} alt="" 
                    data-testid="banner-img"
                />
            </div>
        ) : (
            <div 
                className={"h-32 w-full object-cover lg:h-48 bg-secondary"} 
                data-testid="banner-img"
            />
        )
    )
}
