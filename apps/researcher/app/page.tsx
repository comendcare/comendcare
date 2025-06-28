import {redirect} from "next/navigation";

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN

export default function ProviderLandingPage() {
    redirect(process.env.NEXT_PUBLIC_VERCEL_ENV
        ? `https://${rootDomain}/profile` : `http://${rootDomain}/profile`)
}
