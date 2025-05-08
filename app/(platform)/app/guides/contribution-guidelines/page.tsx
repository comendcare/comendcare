import Image from "next/image"
import React from "react"
import Breadcrumbs from "../components/breadcrumbs"
import Link from "next/link"
import DoExample from "../components/do-example"
import DontExample from "../components/dont-example"
import FaqArticleFooter from "../components/faq-article-footer"
import FAQFeedback from "../components/faq-feedback"

export default function ContributionGuidelines() {
    return (
        <>
            <div className="bg-white px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-base leading-7 text-gray-700">
                    <article className="prose prose-lg flex flex-col mx-auto w-full max-w-4xl format format-sm sm:format-base lg:format-lg format-blue">
                        <div className="not-prose">
                            <Breadcrumbs />
                        </div>
                        <header className="mt-6 not-format">
                            <address className="flex items-center mb-6 not-italic">
                                <div className="inline-flex items-center mr-3 text-sm text-gray-900">
                                    {/* <Image
                                        className="mr-4 w-16 h-16 rounded-full"
                                        src={flawnsonProfile}
                                        alt="Flawnson Tong"
                                    /> */}
                                    <div className="space-y-0">
                                        <a
                                            href="https://www.linkedin.com/in/flawnson/"
                                            rel="author"
                                            className="text-xl no-underline hover:underline text-gray-900"
                                        >
                                            Flawnson Tong
                                        </a>
                                        <p className="text-base font-light text-gray-500">Cofounder of Comend</p>
                                        <p className="text-base font-light text-gray-500">
                                            <time>January 16th, 2024</time>
                                        </p>
                                    </div>
                                </div>
                            </address>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                {`Librarey's resource contribution guidelines`}
                            </h1>
                            <p className="lead">
                                {`How to structure your new resource proposal to best help families.`}
                            </p>
                        </header>

                        <p>
                            {`Librarey began as a humble yet mighty document of hand-picked resources by Sierra Phillips, with the intention of helping families have the "aha" moment of finding a resource they needed earlier in their rare journey.
                            Everything we do is with the intention of making it easier for rare families to get the support they need.
                            If we can help just one family reach the support they need, this entire project is worth it.
                            We have found that there is a certain way that resources are best presented to families.
                            The goal of this guide is to make it easier for you to structure your new resource or resource improvement proposal.`}
                        </p>

                        <p>
                            {`Librarey's resource repository is fully supported by community contributions.
                            If you want to learn how to contribute a resource, follow the steps in `}
                            <Link href="#">this</Link> article.
                        </p>

                        <h2>{`Understanding Librarey`}</h2>
                        <p>
                            {`While this isn't necessary to know, you might be curious as to why certain
                            guidelines
                            have been put in place.
                            In order to understand why we've created these guidelines, there's some context we
                            can
                            provide.
                            If you want to skip straight to the guidelines, click `}
                            <Link href={"#contribution-guidelines"}>here.</Link>
                        </p>

                        <h3>{`Resource links are unique`}</h3>
                        <p>
                            {`Resources in Librarey use URLs (web links) as unique identifiers. This means you won't
                            be able to add the same link twice.
                            Different subdomains and pages within URLs are allowed however.`}
                        </p>
                        <br />
                        <div className="self-center mt-8 max-w-xl space-y-8 text-gray-600">
                            <div className="flex flex-col gap-y-2">
                                <DontExample
                                    emphasizedWords={"We don't accept"}
                                    contentWords={"the same exact domain."}
                                    blockquotes={["https://www.librarey.com/", "https://www.librarey.com/"]}
                                />
                                <DoExample
                                    emphasizedWords={"We accept"}
                                    contentWords={"unique subdomains and subpages."}
                                    blockquotes={[
                                        "https://www.librarey.com/",
                                        "https://www.librarey.com/resource/269eb9d3-9e88-4336-b877-672247328b63"
                                    ]}
                                />
                            </div>
                        </div>
                        <p>
                            {`The other key implication of this system is that you can't edit the link of an exisitng resource.
                            Instead you will have to submit a proposal for a new resource and we'll delete the old one.`}
                        </p>

                        <h3>{`Resource proposals are reviewed`}</h3>
                        <p>
                            {`Proposals for a new resource or an improvement to an existing resource are reviewed by the
                            Librarey team.
                            We may make some edits to your proposal before pushing the changes to the repository.
                            This may take a few days, and you will be notified by email when your proposal status
                            changes.`}
                        </p>

                        <h3>{`Resources are unranked`}</h3>
                        <p>
                            {`Search results aren’t ranked like on Google or Bing.
                            This means resources with more general categories, resource names with more keywords, or
                            writing SEO friendly descriptions won’t necessarily mean the resource gets more clicks
                            and views.
                            There are a few exceptions to this that we do on a per case basis while we figure out
                            the best way to rank search results.`}
                        </p>

                        <h3>{`These guidelines apply here on out`}</h3>
                        <p>
                            {`These rules and guidelines were written on January 21st 2024, and so resources and
                            proposals submitted before this date are exempt from these guidelines.`}
                        </p>

                        <h2 id="contribution-guidelines">{`Contribution Guidelines`}</h2>
                        <p>
                            {`There are a few guidelines that you should keep in mind whenever submitting a proposal
                            for a new resource or an improvement to an existing resource.`}
                            <ol className="list-decimal">
                                <li>{`Check if the new resource you want to propose is already on the website.`}</li>
                                <li>{`Don't use ALL CAPS when writing names or descriptions.`}</li>
                                <li>{`Check for spelling and grammar; we're only human!`}</li>
                            </ol>
                        </p>
                        {/*<blockquote className="font-semibold text-gray-900">*/}
                        {/*    <p>*/}
                        {/*        “Vel ultricies morbi odio facilisi ultrices accumsan donec lacus purus. Lectus*/}
                        {/*        nibh ullamcorper ac*/}
                        {/*        dictum justo in euismod. Risus aenean ut elit massa. In amet aliquet eget cras.*/}
                        {/*        Sem volutpat enim*/}
                        {/*        tristique.”*/}
                        {/*    </p>*/}
                        {/*</blockquote>*/}
                        {/*<figcaption className="flex items-center gap-x-4">*/}
                        {/*    <img*/}
                        {/*        className="h-6 w-6 flex-none rounded-full bg-gray-50"*/}
                        {/*        src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"*/}
                        {/*        alt=""*/}
                        {/*    />*/}
                        {/*    <div className="text-sm leading-6">*/}
                        {/*        <strong className="font-semibold text-gray-900">Maria Hill</strong> – Marketing*/}
                        {/*        Manager*/}
                        {/*    </div>*/}
                        {/*</figcaption>*/}
                        <h3>{`Link guidelines`}</h3>
                        <p>
                            <ul className="flex flex-col">
                                <li>{`All links must have the transfer protocol included.`}</li>
                                <div className="self-center my-8 max-w-xl space-y-8 text-gray-600">
                                    <div className="flex flex-col gap-y-2">
                                        <DontExample
                                            emphasizedWords={"Don't"}
                                            contentWords={"omit the https:// part of the url."}
                                            blockquotes={["www.librarey.com", "www.google.com"]}
                                        />
                                        <DoExample
                                            emphasizedWords={"Do"}
                                            contentWords={"include the https:// part of the url"}
                                            blockquotes={["https://www.librarey.com/", "https://www.google.com/"]}
                                        />
                                    </div>
                                </div>
                                <li>{`All links are case sensitive.`}</li>
                                <div className="self-center my-8 max-w-xl space-y-8 text-gray-600">
                                    <div className="flex flex-col gap-y-2">
                                        <DontExample
                                            emphasizedWords={"These are not the same"}
                                            contentWords={""}
                                            blockquotes={["https://www.Librarey.com/", "https://www.librarey.com/"]}
                                        />
                                    </div>
                                </div>
                            </ul>
                        </p>

                        {/*<figure className="mt-16">*/}
                        {/*    <img*/}
                        {/*        className="aspect-video rounded-xl bg-gray-50 object-cover"*/}
                        {/*        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=1310&h=873&q=80&facepad=3"*/}
                        {/*        alt=""*/}
                        {/*    />*/}
                        {/*    <figcaption className="mt-4 flex gap-x-2 text-sm leading-6 text-gray-500">*/}
                        {/*        <InformationCircleIcon className="mt-0.5 h-5 w-5 flex-none text-gray-300"*/}
                        {/*                               aria-hidden="true"/>*/}
                        {/*        Faucibus commodo massa rhoncus, volutpat.*/}
                        {/*    </figcaption>*/}
                        {/*</figure>*/}

                        <h3>{`Name guidelines`}</h3>
                        <p>
                            <ul className="flex flex-col">
                                <li>{`Names have a maximum character count of 100.`}</li>
                                <li>
                                    {`Acronyms are allowed in parentheses () following the full name of the organization.`}
                                </li>
                                <div className="self-center my-8 max-w-xl space-y-8 text-gray-600">
                                    <div className="flex flex-col gap-y-2">
                                        <DoExample
                                            emphasizedWords={"Do"}
                                            contentWords={"write acronyms in parentheses following the full name."}
                                            blockquotes={[
                                                "Administrative Command, Amphibious Forces, Pacific Fleet Subordinate Command (ADCOMSUBORDCOMPHIBSPAC)"
                                            ]}
                                        />
                                    </div>
                                </div>
                                <li>{`Symbols like ™️ or ©️ and emojis are not allowed.`}</li>
                                <div className="self-center my-8 max-w-xl space-y-8 text-gray-600">
                                    <div className="flex flex-col gap-y-2">
                                        <DontExample
                                            emphasizedWords={"Don't"}
                                            contentWords={"use symbols or emojis in the name of a resource."}
                                            blockquotes={["Cool product ™️", "Resource with a ❌"]}
                                        />
                                    </div>
                                </div>
                            </ul>
                        </p>

                        <h3>{`Description guidelines`}</h3>
                        <p>
                            <ul className="flex flex-col">
                                <li>{`Descriptions have a maximum character count of 500.`}</li>
                                <li>{`Descriptions can be written in 1st or 3rd person.`}</li>
                                <div className="self-center my-8 max-w-xl space-y-8 text-gray-600">
                                    <div className="flex flex-col gap-y-2">
                                        <DoExample
                                            emphasizedWords={"Do"}
                                            contentWords={"write in either 1st or 3rd person"}
                                            blockquotes={[
                                                "Librarey is a free search platform for rare disease resources. Launched in 2023 by Comend's cofounders and in partnership with Sierra Phillips, they have grown to over 4500 resources.",
                                                "We are a free search platform for rare disease resources. We launched in 2023 partnership with our friend Sierra Phillips and since then, we have grown to over 4500 resources."
                                            ]}
                                        />
                                    </div>
                                </div>
                            </ul>
                        </p>

                        <h3>{`Type guidelines`}</h3>
                        <p>
                            <ul className="flex flex-col">
                                <li>
                                    {`You can only choose one type.
                                    To help families find what they need, we ask that you please be as accurate and
                                    honest as possible.
                                    Here are some definitions that might help you choose the most applicable type.`}
                                    <ul>
                                        <li>
                                            <strong className="font-semibold text-gray-900">{`"Organizations"`}</strong>{" "}
                                            {`apply
                                            to non profits, charities, advocacy organizations, and
                                            any other group that does not sell products. The key here is that this
                                            resource is free.`}
                                        </li>
                                        <li>
                                            <strong className="font-semibold text-gray-900">{`"Product"`}</strong>{" "}
                                            {`applies
                                            to marketplaces, service providers, and of course,
                                            purchasable products. The key difference here is that users have to pay for
                                            this resource.`}
                                        </li>
                                        <li>
                                            <strong className="font-semibold text-gray-900">{`"Media"`}</strong>{" "}
                                            {`applies to
                                            pdf files, videos, news articles, and other more one-off
                                            content that is free for users to access.`}
                                        </li>
                                        <div className="self-center my-8 max-w-xl space-y-8 text-gray-600">
                                            <div className="flex flex-col gap-y-2">
                                                <DontExample
                                                    emphasizedWords={"Don't"}
                                                    contentWords={`pick "Organization" if your resource is not free.`}
                                                    blockquotes={[]}
                                                />
                                            </div>
                                        </div>
                                    </ul>
                                </li>
                            </ul>
                        </p>

                        <h3>{`Location guidelines`}</h3>
                        <p>
                            <ul className="flex flex-col">
                                <li>
                                    {`If your resource applies to several states, you can pick the state that your
                                    resource is most applicable to.`}
                                    <ul>
                                        <li>
                                            {`Alternatively, you can choose “Virtual” and specify what states your
                                            resource applies to in the description of your proposal`}
                                        </li>
                                        <li>
                                            {`Please choose locations that actually apply to a resource.
                                            The goal is to reach families who can actually benefit from a resource.`}
                                        </li>
                                    </ul>
                                    <div className="self-center my-8 max-w-xl space-y-8 text-gray-600">
                                        <div className="flex flex-col gap-y-2">
                                            <DoExample
                                                emphasizedWords={"Do"}
                                                contentWords={
                                                    "pick the most specific location that applies to your resource."
                                                }
                                                blockquotes={[]}
                                            />
                                            <DontExample
                                                emphasizedWords={"Don't"}
                                                contentWords={"pick 'US National' or 'Worldwide Global' just to maximize reach."}
                                                blockquotes={[]}
                                            />
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    {`Currently the only locations we support outside of US states are Canada, EU, and
                                    Australia. We're working on better support for internationl resources.`}
                                </li>
                            </ul>
                        </p>

                        <h3>{`Category guidelines`}</h3>
                        <p>
                            <ul className="flex flex-col">
                                <li>{`New resource proposals can only have a maximum of 5 topic categories.`}</li>
                                <div className="self-center my-8 max-w-xl space-y-8 text-gray-600">
                                    <div className="flex flex-col gap-y-2">
                                        <DoExample
                                            emphasizedWords={"Do"}
                                            contentWords={"pick 5 or fewer categories that apply to your resource."}
                                            blockquotes={[]}
                                        />
                                        <DontExample
                                            emphasizedWords={"Don't"}
                                            contentWords={"pick more than you need to just to reach 5 categories."}
                                            blockquotes={[]}
                                        />
                                    </div>
                                </div>
                            </ul>
                        </p>

                        <h2>{`Thank you for contributing!`}</h2>
                        <p>
                            {`When we launched Librarey in October of 2023, we had roughly 2700 resources.
                            Since then, we've grown to over 4500 resources and counting, all thanks to contributions
                            from the community.
                            We're excited to see Librarey continue to grow.
                            Thank you for helping families and supporting our mission.`}
                        </p>
                        <p>{`We truly can't do it without you.`}</p>

                        <FaqArticleFooter />
                        <FAQFeedback />
                    </article>
                </div>
            </div>
        </>
    )
}
