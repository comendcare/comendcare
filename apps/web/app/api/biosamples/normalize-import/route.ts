// app/api/biosamples/normalize-import/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";

// Reuse the same "template columns" your importer expects.
// IMPORTANT: These are the exact spreadsheet keys your existing biosampleImportSchema uses.
const TEMPLATE_COLUMNS = [
    "Visibility",
    "Internal Donor ID",
    "Description",
    "Type",
    "Gene",
    "Genotype",
    "Sex",
    "Race",
    "Diagnoses",
    "Total Available Quantity",
    "Quantity Unit",
    "Storage Facility",
    "BSI ID",
    "Collection Date",
    "Donor Age at Collection",
] as const;

type TemplateColumn = (typeof TEMPLATE_COLUMNS)[number];

const NormalizeResponseSchema = z.object({
    // Map *input column name* -> *template column name*
    mapping: z.record(z.string(), z.enum(TEMPLATE_COLUMNS)),
    // Template columns we couldn't confidently fill from input
    missingTemplateColumns: z.array(z.enum(TEMPLATE_COLUMNS)).default([]),
    // Input columns we didn't use
    unusedInputColumns: z.array(z.string()).default([]),
    notes: z.array(z.string()).default([]),
});

function normalizeHeader(s: string) {
    return (s ?? "")
        .toLowerCase()
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

/**
 * Heuristic matching so we only invoke OpenAI when needed.
 * (Exact match, normalized match, and a small alias map.)
 */
function heuristicMap(inputHeaders: string[]) {
    const mapping: Record<string, TemplateColumn> = {};

    const templateByExact = new Map<string, TemplateColumn>(
        TEMPLATE_COLUMNS.map((c) => [c, c])
    );

    const templateByNorm = new Map<string, TemplateColumn>(
        TEMPLATE_COLUMNS.map((c) => [normalizeHeader(c), c])
    );

    const ALIASES: Array<[RegExp, TemplateColumn]> = [
        [/^(visibility|public|published|private|status)$/i, "Visibility"],
        [/^(internal donor id|donor internal id|donor id internal|donor_internal_id)$/i, "Internal Donor ID"],
        [/^(description|notes|details)$/i, "Description"],
        [/^(type|sample type|biosample type|specimen type)$/i, "Type"],
        [/^(gene|gene symbol|hgnc|gene_name)$/i, "Gene"],
        [/^(genotype|variant|mutation)$/i, "Genotype"],
        [/^(sex|biological sex)$/i, "Sex"],
        [/^(race)$/i, "Race"],
        [/^(diagnoses|diagnosis|dx|disease)$/i, "Diagnoses"],
        [/^(total available quantity|quantity|amount|volume|mass)$/i, "Total Available Quantity"],
        [/^(quantity unit|unit|units|uom)$/i, "Quantity Unit"],
        [/^(storage facility|storage|biobank|provider|institution|lab)$/i, "Storage Facility"],
        [/^(bsi id|bsi|bsi_id|product code)$/i, "BSI ID"],
        [/^(collection date|date collected|collected on|collection_date)$/i, "Collection Date"],
        [/^(donor age at collection|age at collection|age)$/i, "Donor Age at Collection"],
    ];

    for (const h of inputHeaders) {
        if (!h) continue;

        // Exact
        const exact = templateByExact.get(h);
        if (exact) {
            mapping[h] = exact;
            continue;
        }

        // Normalized exact
        const norm = templateByNorm.get(normalizeHeader(h));
        if (norm) {
            mapping[h] = norm;
            continue;
        }

        // Aliases
        const trimmed = h.trim();
        const alias = ALIASES.find(([re]) => re.test(trimmed));
        if (alias) mapping[h] = alias[1];
    }

    return mapping;
}

function buildTemplateRows(
    inputRows: Record<string, any>[],
    inputHeaders: string[],
    mapping: Record<string, TemplateColumn>
) {
    // Build row objects where keys are TEMPLATE_COLUMNS and values are copied verbatim from mapped input cols.
    const outRows = inputRows.map((row) => {
        const out: Record<string, any> = {};
        for (const t of TEMPLATE_COLUMNS) out[t] = ""; // missing -> blank

        for (const [inputCol, templateCol] of Object.entries(mapping)) {
            // Copy verbatim (no transformation)
            out[templateCol] = row?.[inputCol] ?? "";
        }

        return out;
    });

    // Also report unused input columns
    const usedInputs = new Set(Object.keys(mapping));
    const unusedInputColumns = inputHeaders.filter((h) => h && !usedInputs.has(h));

    // Missing template columns
    const usedTemplates = new Set(Object.values(mapping));
    const missingTemplateColumns = TEMPLATE_COLUMNS.filter((t) => !usedTemplates.has(t));

    return { outRows, unusedInputColumns, missingTemplateColumns };
}

export async function POST(req: Request) {
    try {
        // Expect multipart/form-data with a File field named "file"
        const form = await req.formData();
        const file = form.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "Expected multipart/form-data with a File field named 'file'." },
                { status: 400 }
            );
        }

        if (!file.name.toLowerCase().endsWith(".csv")) {
            return NextResponse.json({ error: "Please upload a .csv file." }, { status: 400 });
        }

        const csvText = await file.text();

        // Parse only a preview for column understanding (keeps this fast + cheaper to reason about)
        const parsed = Papa.parse<Record<string, any>>(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
            preview: 50,
        });

        const inputHeaders = (parsed.meta.fields ?? []).filter(Boolean);
        const previewRows = (parsed.data ?? []).slice(0, 25);

        if (!inputHeaders.length) {
            return NextResponse.json({ error: "No header row detected in CSV." }, { status: 400 });
        }

        // 1) Heuristic mapping first
        const heuristic = heuristicMap(inputHeaders);

        // 2) Ask OpenAI ONLY for headers not already mapped
        const unmappedHeaders = inputHeaders.filter((h) => h && !heuristic[h]);

        let llmMapping: Record<string, TemplateColumn> = {};
        let llmNotes: string[] = [];

        if (unmappedHeaders.length > 0) {
            const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

            // Provide compact evidence: header + a few example values per column.
            const examplesByColumn: Record<string, string[]> = {};
            for (const h of unmappedHeaders) {
                const vals: string[] = [];
                for (const r of previewRows) {
                    const v = r?.[h];
                    if (v === null || typeof v === "undefined") continue;
                    const s = String(v);
                    if (!s.trim()) continue;
                    vals.push(s.trim());
                    if (vals.length >= 5) break;
                }
                examplesByColumn[h] = vals;
            }

            const system = [
                "You map messy CSV column names to a fixed template for biosample imports.",
                "CRITICAL RULE: You must NEVER modify or transform cell data. Only map column headers.",
                "Return JSON only.",
                "If a column is ambiguous, do not guess—omit it from mapping.",
            ].join(" ");

            const user = {
                task: "Map input CSV columns to template columns for biosample import.",
                templateColumns: TEMPLATE_COLUMNS,
                inputColumnsNeedingMapping: unmappedHeaders,
                examplesByColumn,
                guidance: {
                    meaning: {
                        Visibility:
                            "Published/Private style visibility field (e.g. 'Published', 'Private', 'public', 'visibility').",
                        "Internal Donor ID": "An internal donor identifier.",
                        Description: "Free text description of the biosample.",
                        Type: "Biosample type (e.g. 'Plasma', 'PBMC', etc.).",
                        Gene: "Gene symbol(s) or a gene field.",
                        Genotype: "Genotype text (NOT the gene column).",
                        Sex: "Sex field (Male/Female/Unknown, etc.).",
                        Race: "Race field.",
                        Diagnoses: "Diagnoses / disease names.",
                        "Total Available Quantity": "Numeric-ish quantity amount as provided (string).",
                        "Quantity Unit": "Unit of quantity (e.g. ml, μL, mg).",
                        "Storage Facility": "Where sample is stored (institution/company/biobank).",
                        "BSI ID": "BSI identifier / code.",
                        "Collection Date": "Date of collection.",
                        "Donor Age at Collection": "Age of donor at collection.",
                    },
                },
                outputShape: {
                    mapping: { "<inputColumn>": "<one template column>" },
                    missingTemplateColumns: ["<template column>"],
                    unusedInputColumns: ["<input column>"],
                    notes: ["<string>"],
                },
            };

            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                temperature: 0,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: JSON.stringify(user) },
                ],
            });

            const raw = completion.choices[0]?.message?.content ?? "{}";
            const parsedLLM = NormalizeResponseSchema.safeParse(JSON.parse(raw));

            if (!parsedLLM.success) {
                return NextResponse.json(
                    { error: "Failed to parse OpenAI response.", details: parsedLLM.error.flatten() },
                    { status: 500 }
                );
            }

            // Only accept mappings for columns we asked about (defensive)
            llmMapping = Object.fromEntries(
                Object.entries(parsedLLM.data.mapping).filter(([k]) => unmappedHeaders.includes(k))
            ) as Record<string, TemplateColumn>;

            llmNotes = parsedLLM.data.notes ?? [];
        }

        // Combine (heuristics win if conflict)
        const finalMapping: Record<string, TemplateColumn> = { ...llmMapping, ...heuristic };

        // Parse the full CSV for output (still does not modify cell contents)
        const fullParsed = Papa.parse<Record<string, any>>(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
        });

        const fullRows = fullParsed.data ?? [];
        const { outRows, unusedInputColumns, missingTemplateColumns } = buildTemplateRows(
            fullRows,
            inputHeaders,
            finalMapping
        );

        // Output a normalized CSV that matches your existing importer template exactly
        // (template headers, same values copied verbatim from mapped source columns).
        const normalizedCsv = Papa.unparse(outRows, {
            columns: [...TEMPLATE_COLUMNS],
            quotes: false,
            skipEmptyLines: "greedy",
        });

        return NextResponse.json({
            success: true,
            normalizedCsv,
            mapping: finalMapping,
            missingTemplateColumns,
            unusedInputColumns,
            notes: llmNotes,
            stats: {
                inputHeaders: inputHeaders.length,
                mappedHeaders: Object.keys(finalMapping).length,
                rows: outRows.length,
            },
        });
    } catch (err: any) {
        console.error("normalize-import route error:", err);
        return NextResponse.json(
            { error: "Unexpected error normalizing CSV.", details: String(err?.message ?? err) },
            { status: 500 }
        );
    }
}
