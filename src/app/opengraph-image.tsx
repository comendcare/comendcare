import { ImageResponse } from "next/og"
import { encode } from "qss"
import { NextRequest } from "next/server"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "Comend"
export const size = {
    width: 1200,
    height: 630
}

export const contentType = "image/png"

// Image generation
export default async function Image(req: NextRequest): Promise<ImageResponse> {
    console.log(req)
    const params = encode({
        url: "https://www.joincomend.com/",
        screenshot: true,
        meta: false,
        embed: "screenshot.url",
        colorScheme: "dark",
        "viewport.isMobile": true,
        "viewport.deviceScaleFactor": 1,
        "viewport.width": size.width,
        "viewport.height": size.height
    })
    const src = `https://api.microlink.io/?${params}`

    return new ImageResponse(
        (
            <div
                style={{
                    width: size.width,
                    height: size.height,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center"
                    }}
                />
            </div>
        ),
        {
            width: size.width,
            height: size.height
        }
    )
}
