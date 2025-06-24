"use client"

import { PlaceholdersAndVanishInput } from "@/components/placeholders-and-vanish-input"
import { PlaceholdersAndVanishTextarea } from "@/components/placeholders-and-vanish-text-area"
import { LinkPreview } from "@/components/link-preview"
import React from "react"
import scimanticLogo from "@/public/logos/scimantic-logo.png"
import Image from "next/image"

export function ScimanticSection() {
    const placeholders = [
        "In-depth exploration of the molecular mechanisms underlying Spinal Muscular Atrophy (SMA) has revealed that homozygous deletions or mutations in the Survival Motor Neuron 1 (SMN1) gene lead to deficient production of the SMN protein, which is crucial for the assembly of spliceosomal small nuclear ribonucleoproteins (snRNPs) and the maintenance of motor neuron integrity; this deficiency results in the progressive degeneration of alpha motor neurons in the anterior horn of the spinal cord, culminating in muscle atrophy and paralysis. Recent therapeutic advancements, such as antisense oligonucleotides like nusinersen that modify SMN2 splicing to increase functional SMN protein levels, gene replacement therapies using adeno-associated virus vectors to deliver functional SMN1 copies, and small molecule splicing modifiers, have shown promise in altering the disease trajectory, highlighting the critical interplay between genetic modifiers, epigenetic regulation, and therapeutic timing in managing SMA.",

        "The pathophysiological complexities of Amyotrophic Lateral Sclerosis (ALS) encompass not only genetic mutations in genes such as SOD1, C9orf72, TARDBP, and FUS that contribute to protein misfolding and aggregation, but also involve aberrations in RNA metabolism, impaired axonal transport, mitochondrial dysfunction, excitotoxicity mediated by glutamate accumulation, neuroinflammation, and dysregulated autophagy; these multifactorial processes collectively lead to the selective degeneration of upper and lower motor neurons. Current research is delving into the potential of gene silencing techniques, including RNA interference and antisense oligonucleotides to reduce toxic protein levels, the modulation of neuroinflammatory pathways using immunotherapies, and the application of stem cell therapies to replace lost neurons, with an emphasis on personalized medicine approaches that consider the heterogeneity of ALS presentations and underlying genetic factors.",

        "Comprehensive analysis of the genomic and epigenomic alterations in Diffuse Intrinsic Pontine Gliomas (DIPG) has identified recurrent somatic mutations in histone-encoding genes, particularly the lysine-to-methionine substitution at position 27 of histone H3 (H3K27M), which disrupts the function of the polycomb repressive complex 2 (PRC2) and leads to global hypomethylation of H3K27, thereby altering chromatin architecture and gene expression profiles critical for cellular differentiation and proliferation; this epigenetic reprogramming collaborates with additional mutations in genes like TP53 and ACVR1, promoting oncogenesis in the pons region of the brainstem. Therapeutic strategies are increasingly focusing on the development of targeted epigenetic modulators, such as EZH2 inhibitors to restore proper methylation patterns, and the utilization of advanced drug delivery systems like convection-enhanced delivery and focused ultrasound to bypass the blood-brain barrier, aiming to improve the dismal prognosis associated with DIPG through a combination of molecularly informed therapies and innovative clinical trial designs.",

        "Investigations into the genetic and molecular basis of Niemann-Pick Disease Type C (NPC) have revealed that mutations in the NPC1 or NPC2 genes impair intracellular lipid transport, leading to the accumulation of unesterified cholesterol and glycosphingolipids within late endosomes and lysosomes; this lipid storage disrupts cellular homeostasis and manifests in a broad spectrum of clinical symptoms including neurodegeneration, hepatic dysfunction, and pulmonary complications. Advanced research is exploring the intricate mechanisms by which cholesterol trafficking defects contribute to neuroinflammation, oxidative stress, and apoptosis, as well as the cross-talk between lipid metabolism and autophagy pathways. Therapeutic interventions under investigation encompass substrate reduction therapy using miglustat to inhibit glycosphingolipid synthesis, cyclodextrins to enhance cholesterol clearance, gene therapy approaches aiming to correct the underlying genetic defect, and the identification of pharmacological chaperones to stabilize mutant NPC proteins, all of which underscore the necessity for a multifaceted approach to tackle the complexity of NPC.",

        "The intricate pathogenesis of Mitochondrial Encephalomyopathy, Lactic Acidosis, and Stroke-like episodes (MELAS) syndrome involves mutations in mitochondrial DNA (mtDNA), particularly in the MT-TL1 gene encoding the mitochondrial tRNA for leucine (UUR), which compromise mitochondrial protein synthesis and oxidative phosphorylation efficiency; this leads to impaired ATP production, increased generation of reactive oxygen species, and subsequent energy failure in high-demand tissues such as the brain and muscles. The heteroplasmic nature of mtDNA mutations results in variable clinical presentations and complicates disease prognosis. Recent studies are delving into mitochondrial dynamics, including fission and fusion processes, mitophagy, and the role of nuclear-mitochondrial interactions in disease progression. Experimental treatments focus on enhancing mitochondrial function through agents like arginine and citrulline to ameliorate stroke-like episodes, antioxidants to reduce oxidative damage, and the exploration of allotopic expression to deliver functional mitochondrial genes from the nucleus, highlighting the challenges and potential of targeting mitochondrial disorders at their genetic and bioenergetic roots."
    ]

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        console.log(e.target.value)
    }
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("submitted")
    }
    return (
        <div className="mx-auto max-w-7xl flex flex-col justify-center items-center px-4 py-24">
            <div className="md:w-1/2 mx-auto text-center">
                <div>
                    <h2 className="text-lg text-primary mb-2 tracking-wider">
                        Products
                    </h2>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {`Simplify with `}
                        <LinkPreview
                            url={"https://scimantic.com/"}
                            className="hover:underline inline-flex items-baseline"
                            target="_blank"
                        >
                            <Image
                                src={scimanticLogo}
                                alt=""
                                className="self-center w-8 h-8 mx-2"
                            />
                            Scimantic
                        </LinkPreview>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        {`Turn medical and academic content into plain language with Scimantic, the scientific translator.`}
                    </p>
                </div>
            </div>
            {/*<PlaceholdersAndVanishInput*/}
            {/*    placeholders={placeholders}*/}
            {/*    onChange={handleChange}*/}
            {/*    onSubmit={onSubmit}*/}
            {/*/>*/}
            <PlaceholdersAndVanishTextarea
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
            />
        </div>
    )
}
