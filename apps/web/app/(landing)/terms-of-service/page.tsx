"use client";
import {format} from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React, {useState} from "react";
import ReactMarkdown from "react-markdown";
import {AnimatePresence, motion} from "framer-motion";
import {IconMenu} from "@tabler/icons-react";
import Flawnson from "@/public/profiles/Flawnson2.jpeg"
import rehypeSlug from "rehype-slug";

const tosMarkdown = `

Welcome to **Comend**, a platform designed to empower patient organizations, researchers, and service providers in the rare disease ecosystem. By accessing or using Comend, you agree to comply with the following Terms of Service.

---

## 👤 User Conduct

You agree not to:

- Violate any applicable laws or regulations.
- Use Comend for illegal, harmful, or misleading activities.
- Share content that is offensive, defamatory, or violates third-party rights.
- Interfere with the operation of the platform or other users’ experience.
- Attempt unauthorized access to the platform or user accounts.
- Infringe upon intellectual property or data privacy rights.

---

## 🧑‍💼 User Accounts

Certain features require a Comend account. You're responsible for safeguarding your login credentials and for all activity under your account. Notify us immediately if you suspect unauthorized access.

---

## 🔒 Information Security

We protect your data using industry-standard practices, including:

- **Secure cloud hosting** with Google Cloud and signed **BAA** agreements.
- **Encryption in transit and at rest** for sensitive user data.
- **Role-based access controls**, regular audits, and incident response planning.

Despite our efforts, no method of transmission over the Internet is 100% secure. You acknowledge the inherent risks involved.

---

## 🚨 Data Breach Notification

In case of a breach:

- We’ll investigate promptly and report incidents where applicable.
- You’ll be notified if your data is impacted and disclosure is required by law.
- We’ll coordinate with authorities where necessary.

---

## 📥 Content Submissions

By submitting content (e.g. project details, reviews, requests), you grant Comend a **non-exclusive, royalty-free, worldwide license** to use, display, and distribute that content for service delivery and promotion purposes.

---

## 💡 Intellectual Property

All platform content—including toolkits, UI design, documentation, and branding—is protected by intellectual property law. Do not reproduce or distribute without written permission.

---

## ⚠️ Disclaimers

Comend is offered "as is" and "as available." We do not warrant the accuracy, reliability, or suitability of content for any purpose, nor guarantee uninterrupted service.

---

## 🧾 Limitation of Liability

To the maximum extent permitted by law, Comend shall not be liable for indirect or consequential damages, including lost revenue or data loss.

---

## 🔚 Termination

We reserve the right to suspend or terminate your access for any reason, including policy violations. Misuse of the platform may result in permanent account removal.

---

## 🔄 Changes to These Terms

We may update these Terms from time to time. You’ll be notified of significant changes, and continued use of the platform implies your acceptance of the updated terms.

---

## ⚖️ Governing Law

These Terms are governed by the laws of the **United States** and **Canada**, excluding conflicts of law provisions.

---

## 🧾 Legal Disclosures

We may disclose information as required by law, court orders, or in good faith to protect Comend, our users, or the public. If Comend undergoes a merger, acquisition, or asset sale, your data may be transferred under the same data protection standards.

---

## ✅ Acceptance of Terms

By using Comend, you confirm that you’ve read, understood, and agreed to these Terms. If you do not agree, please discontinue use of the platform.

---

## 📬 Contact Us

Questions? Email us at [**contact@comendcare.com**](mailto:contact@comendcare.com)
`;

type Blog = {
    title: string;
    summary?: string;
    date: string;
    author: string;
    authorImage: string;
    thumbnail: string;
    content: string;
};
const blog: Blog = {
    title: "📜 Comend Terms of Service",
    summary:
        "Artificial Intelligence (AI) has been rapidly evolving, transforming various aspects of our lives. From voice assistants to autonomous vehicles, AI is becoming increasingly integrated into our daily routines.",
    date: "2025-06-26",
    author: "Flawnson Tong",
    authorImage: Flawnson.src,
    thumbnail:
        "https://images.unsplash.com/photo-1713869782573-3a6eee95c834?q=80&w=3500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: tosMarkdown,
};

export default function BlogContentWithToc() {
    return (
        <div
            className="mt-24 overflow-hidden sm:mt-32 mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 md:flex-row md:px-8">
            <Toc/>
            <div className="flex max-w-2xl flex-1 flex-col space-y-8">
                <div className="flex items-center space-x-4">
                    <Image
                        src={blog.authorImage}
                        alt={blog.author}
                        className="h-16 w-16 rounded-full"
                        height={100}
                        width={100}
                    />
                    <div className="space-y-0">
                        <a
                            href="https://www.linkedin.com/in/flawnson/"
                            rel="author"
                            className="text-xl no-underline hover:underline text-gray-900"
                        >
                            {blog.author}
                        </a>
                        <p className="text-base font-light text-gray-500">Cofounder of Comend</p>
                        <p className="text-base font-light text-gray-500">
                            {format(new Date(blog.date), "LLLL d, yyyy")}
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
                    {blog.title}
                </h2>

                <div className="prose prose-sm dark:prose-invert text-base">
                    <ReactMarkdown rehypePlugins={[rehypeSlug]}>
                        {blog.content}
                    </ReactMarkdown>
                </div>

                <div className="max-w-2xl">
                    <div className="h-px w-full bg-neutral-200 dark:bg-neutral-900"/>
                    <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800"/>
                </div>
            </div>
        </div>
    );
}

const Toc = () => {
    const links = [
        { title: "User Conduct", href: "#-user-conduct" },
        { title: "User Accounts", href: "#-user-accounts" },
        { title: "Information Security", href: "#-information-security" },
        { title: "Data Breach Notification", href: "#-data-breach-notification" },
        { title: "Content Submissions", href: "#-content-submissions" },
        { title: "Intellectual Property", href: "#-intellectual-property" },
        { title: "Disclaimers", href: "#-disclaimers" },
        { title: "Limitation of Liability", href: "#-limitation-of-liability" },
        { title: "Termination", href: "#-termination" },
        { title: "Changes to These Terms", href: "#-changes-to-these-terms" },
        { title: "Governing Law", href: "#-governing-law" },
        { title: "Legal Disclosures", href: "#-legal-disclosures" },
        { title: "Acceptance of Terms", href: "#-acceptance-of-terms" },
        { title: "Contact Us", href: "#-contact-us" },
    ];
    const [hovered, setHovered] = useState<number | null>(null);
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="sticky left-0 top-24 hidden max-w-xs flex-col self-start pr-10 md:flex">
                {links.map((link, index) => (
                    <Link
                        className="group/toc-link relative rounded-lg px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200"
                        key={link.href}
                        href={link.href}
                        onMouseEnter={() => setHovered(index)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        {hovered === index && (
                            <motion.span
                                layoutId="toc-indicator"
                                className="absolute left-0 top-0 h-full w-1 rounded-br-full rounded-tr-full bg-neutral-200 dark:bg-neutral-700"
                            />
                        )}
                        <span className="inline-block transition duration-200 group-hover/toc-link:translate-x-1">
              {link.title}
            </span>
                    </Link>
                ))}
            </div>
            <div className="sticky right-2 top-20 flex w-full flex-col items-end justify-end self-start md:hidden">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-900"
                >
                    <IconMenu className="h-6 w-6 text-black dark:text-white"/>
                </button>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            transition={{duration: 0.2}}
                            className="mt-2 flex flex-col items-end rounded-3xl border border-neutral-100 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
                        >
                            {links.map((link, index) => (
                                <Link
                                    className="group/toc-link relative rounded-lg px-2 py-1 text-right text-sm text-neutral-700 dark:text-neutral-200"
                                    key={link.href}
                                    href={link.href}
                                    onMouseEnter={() => setHovered(index)}
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    {hovered === index && (
                                        <motion.span
                                            layoutId="toc-indicator"
                                            className="absolute left-0 top-0 h-full w-1 rounded-br-full rounded-tr-full bg-neutral-200 dark:bg-neutral-700"
                                        />
                                    )}
                                    <span
                                        className="inline-block transition duration-200 group-hover/toc-link:translate-x-1">
                    {link.title}
                  </span>
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};
