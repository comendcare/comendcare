import {redirect} from "next/navigation";

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN

export default function ResearcherLandingPage() {
    redirect(process.env.NEXT_PUBLIC_VERCEL_ENV
        ? `https://${rootDomain}/login` : `http://${rootDomain}/login`)
}
