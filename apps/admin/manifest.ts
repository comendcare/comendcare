import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Comend Admin",
        short_name: "Comend Admin",
        description: "Comend's Admin Dashboard for exclusive use by members of the Comend team.",
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
