import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Comend Researcher Hub",
        short_name: "Comend Researcher Hub",
        description: "Comend's Researcher Hub for Academic and Industry researchers.",
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
