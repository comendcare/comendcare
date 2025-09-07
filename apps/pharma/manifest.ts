import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Comend Pharma Portal",
        short_name: "Comend Pharma Portal",
        description: "Comend's Pharma Portal for pharma clients.",
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
