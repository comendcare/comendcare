import {CallToAction} from '@/components/CallToAction'
import {Faqs} from '@/components/Faqs'
import {Footer} from '@/components/Footer'
import {Header} from '@/components/Header'
import {Hero} from '@/components/Hero'
import {Pricing} from '@/components/Pricing'
import {PrimaryFeatures} from '@/components/PrimaryFeatures'
import {ProductSuite} from '@/components/ProductSuite'
import {Testimonials} from '@/components/Testimonials'
import Blog from "@/components/Blog";
import {Vision} from "@/components/Vision";
import {Mission} from "@/components/Mission";
import Playground from "@/components/Playground";

export default function Home() {
    return (
        <>
            <main>
                <Hero/>
                {/*<PrimaryFeatures/>*/}
                <Mission />
                <Playground />
                <ProductSuite/>
                {/*<Blog />*/}
                <CallToAction/>
                {/*<Testimonials/>*/}
                {/*<Pricing/>*/}
                {/*<Faqs/>*/}
            </main>
            <Footer/>
        </>
    )
}
