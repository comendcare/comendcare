import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Comend Provider Portal",
        short_name: "Comend Provider Portal",
        description: "Comend's Provider Portal for service providers and CROs.",
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
