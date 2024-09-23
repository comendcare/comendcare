"use client"

import {PlaceholdersAndVanishInput} from "@/components/placeholders-and-vanish-input";
import {LinkPreview} from "@/components/link-preview";
import React from "react";
import scimanticLogo from "@/public/logos/scimantic-logo.png"
import Image from "next/image"

export function ScimanticSection() {
    const placeholders = [
        "Genomic instability in trinucleotide repeat disorders",
        "Epigenetic dysregulation in mitochondrial disorders",
        "Aberrant splicing of mRNA in neurodegenerative diseases",
        "Phenotypic heterogeneity in lysosomal storage disorders",
        "Dysregulated neuroinflammation in autoimmune encephalitis",
    ]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    };
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("submitted");
    };
    return (
        <div className="mx-auto max-w-7xl flex flex-col justify-center items-center px-4 py-24">
            <div className="w-1/2 text-center">
                <div>
                    <h2 className="text-lg text-primary mb-2 tracking-wider">Products</h2>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {`Simplify with `}
                        <LinkPreview
                            url={"https://scimantic.com/"}
                            className="hover:underline inline-flex items-baseline"
                            target="_blank"
                        >
                            <Image src={scimanticLogo} alt="" className="self-center w-8 h-8 mx-2"/>
                            Scimantic
                        </LinkPreview>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        {`Turn medical and academic content into plain language with Scimantic, the scientific translator.`}
                    </p>
                </div>
            </div>
            <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
            />
        </div>
    );
}
