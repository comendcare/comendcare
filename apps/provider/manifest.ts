import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Comend",
        short_name: "Comend",
        description: "Software for rare disease patient groups",
        start_url: "/",
        display: "standalone",
        background_color: "#fff",
        theme_color: "#fff",
        icons: [
            {
                src: "/icon.ico",
                sizes: "any",
                type: "image/x-icon"
            }
        ]
    }
}
