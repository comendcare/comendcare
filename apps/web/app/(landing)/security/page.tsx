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

const articleMarkdown = `

At Comend, the security and privacy of your data is our highest priority. We take a proactive, multi-layered approach to ensure your information remains safe, your experience is smooth, and our systems remain resilient. Here's how we protect your data:

---

## 🔄 Data Protection & Encryption

- **Encryption in Transit & at Rest**  
  Sensitive and identifying data such as emails, names, and location information is encrypted using industry-standard protocols both when it’s stored and while it's being transmitted.

- **Cloud Infrastructure**  
  We host on **Google Cloud**, and maintain a signed **Business Associate Agreement (BAA)** to support compliance with applicable data protection regulations. This includes HIPAA, although we currently do not hold any PHI. It's just another way we're trying to be prepared!

---

## 🛡️ Access Control & Authentication

- **OAuth Sign-In Options**  
  Secure login via **Google, Facebook**, and **LinkedIn** using OAuth 2.0.

- **Role-Based Access Permissions**  
  Users are granted only the access required for their role, following the principle of **least privilege**.

- **App Isolation**  
  Each of our applications enforces **separate logins** to maintain contextual access boundaries and minimize attack surfaces.

---

## ⚙️ API & Infrastructure Security

- **Protected API Endpoints**  
  All backend services are guarded by authentication and strict access policies.

- **Rate Limiting & Bot Detection**  
  Automated systems prevent abuse and ensure fair usage through **rate limiting** and **advanced bot detection**.

- **Cookie Management**  
  Our cookies are secure, and we provide **user-friendly controls** so you can manage your privacy preferences easily. We use CookieYes as our cookie consent management solution.

---

## 🔍 Compliance & Monitoring

- **Auditing & Logging**  
  Regular **scheduled audits** ensure that our systems remain compliant and secure.

- **Key Management**  
  We implement **secret key rotation** policies to prevent long-term exposure of credentials.

- **Security Incident Response**  
  In the unlikely event of a breach, we have a formal **reporting process** and **incident response plan** in place to act swiftly and transparently.

---

## 👨‍💻 Developer Security Practices

- **Least Privilege Development**  
  Developer access is tightly scoped to what’s needed for each task.

- **Breach Monitoring & Reporting**  
  All activity is monitored and logged, and our team is trained to handle **breach identification and escalation** effectively.

- **Secure Deployment Pipelines**  
  Our CI/CD processes are designed with security gates and regular reviews.

---

## ✅ Our Ongoing Commitment

Security is not a one-time effort — it’s a continuous process. We’re committed to ongoing improvements, transparent communication, and aligning with best practices in cybersecurity.

Have questions? Contact us at **hello@comendcare.com**
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
    title: " 🔐 Security & Compliance Commitment",
    summary:
        "Artificial Intelligence (AI) has been rapidly evolving, transforming various aspects of our lives. From voice assistants to autonomous vehicles, AI is becoming increasingly integrated into our daily routines.",
    date: "2025-06-26",
    author: "Flawnson Tong",
    authorImage: Flawnson.src,
    thumbnail:
        "https://images.unsplash.com/photo-1713869782573-3a6eee95c834?q=80&w=3500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    content: articleMarkdown,
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

                {/*<Image*/}
                {/*    src={blog.thumbnail}*/}
                {/*    alt={blog.title}*/}
                {/*    className="h-60 w-full rounded-3xl object-cover md:h-[30rem]"*/}
                {/*    height={720}*/}
                {/*    width={1024}*/}
                {/*/>*/}

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
        { title: "Data Protection & Encryption", href: "#-data-protection--encryption" },
        { title: "Access Control & Authentication", href: "#-access-control--authentication" },
        { title: "API & Infrastructure Security", href: "#-api--infrastructure-security" },
        { title: "Compliance & Monitoring", href: "#-compliance--monitoring" },
        { title: "Developer Security Practices", href: "#-developer-security-practices" },
        { title: "Our Ongoing Commitment", href: "#-our-ongoing-commitment" },
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
