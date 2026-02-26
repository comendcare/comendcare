// app/api/clinical-datasets/normalize-import/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";

// EXACT spreadsheet keys your existing clinicalDatasetImportSchema expects.
const TEMPLATE_COLUMNS = [
    "Visibility",
    "Title",
    "Type",
    "Gene",
    "Storage Facility",
    "Point of Contact Name",
    "Point of Contact Email",
    "Link Name",
    "Link URL",
    "Notes",
] as const;

type TemplateColumn = (typeof TEMPLATE_COLUMNS)[number];

const NormalizeResponseSchema = z.object({
    mapping: z.record(z.string(), z.enum(TEMPLATE_COLUMNS)),
    missingTemplateColumns: z.array(z.enum(TEMPLATE_COLUMNS)).default([]),
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

function heuristicMap(inputHeaders: string[]) {
    const mapping: Record<string, TemplateColumn> = {};

    const templateByExact = new Map<string, TemplateColumn>(
        TEMPLATE_COLUMNS.map((c) => [c, c])
    );

    const templateByNorm = new Map<string, TemplateColumn>(
        TEMPLATE_COLUMNS.map((c) => [normalizeHeader(c), c])
    );

    const ALIASES: Array<[RegExp, TemplateColumn]> = [
        [/^(visibility|private|published|public|status)$/i, "Visibility"],

        [/^(title|name|dataset name|resource name|asset title)$/i, "Title"],

        [/^(type|dataset type|tool type|category)$/i, "Type"],

        [/^(gene|gene symbol|hgnc|target gene)$/i, "Gene"],

        [/^(storage facility|storage|biobank|provider|institution|lab|source)$/i, "Storage Facility"],

        [/^(point of contact name|poc name|contact name|contact)$/i, "Point of Contact Name"],
        [/^(point of contact email|poc email|contact email|email)$/i, "Point of Contact Email"],

        [/^(link name|url name|resource name|attachment name)$/i, "Link Name"],
        [/^(link url|url|link|resource url|attachment url|website)$/i, "Link URL"],

        [/^(notes|note|description|details|comments)$/i, "Notes"],
    ];

    for (const h of inputHeaders) {
        if (!h) continue;

        const exact = templateByExact.get(h);
        if (exact) {
            mapping[h] = exact;
            continue;
        }

        const norm = templateByNorm.get(normalizeHeader(h));
        if (norm) {
            mapping[h] = norm;
            continue;
        }

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
    const outRows = inputRows.map((row) => {
        const out: Record<string, any> = {};
        for (const t of TEMPLATE_COLUMNS) out[t] = ""; // missing -> blank

        // Copy verbatim only (no transformations)
        for (const [inputCol, templateCol] of Object.entries(mapping)) {
            out[templateCol] = row?.[inputCol] ?? "";
        }

        return out;
    });

    const usedInputs = new Set(Object.keys(mapping));
    const unusedInputColumns = inputHeaders.filter((h) => h && !usedInputs.has(h));

    const usedTemplates = new Set(Object.values(mapping));
    const missingTemplateColumns = TEMPLATE_COLUMNS.filter((t) => !usedTemplates.has(t));

    return { outRows, unusedInputColumns, missingTemplateColumns };
}

export async function POST(req: Request) {
    try {
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

        // Preview parse (cheap signal for mapping)
        const parsedPreview = Papa.parse<Record<string, any>>(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
            preview: 50,
        });

        const inputHeaders = (parsedPreview.meta.fields ?? []).filter(Boolean);
        const previewRows = (parsedPreview.data ?? []).slice(0, 25);

        if (!inputHeaders.length) {
            return NextResponse.json({ error: "No header row detected in CSV." }, { status: 400 });
        }

        // 1) conservative heuristics first
        const heuristic = heuristicMap(inputHeaders);
        const unmappedHeaders = inputHeaders.filter((h) => h && !heuristic[h]);

        let llmMapping: Record<string, TemplateColumn> = {};
        let llmNotes: string[] = [];

        // 2) OpenAI mapping only for remaining headers
        if (unmappedHeaders.length > 0) {
            const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
                "You map messy CSV column names to a fixed template for clinical dataset imports.",
                "CRITICAL RULE: You must NEVER modify or transform any cell data. Only map column headers.",
                "Return JSON only.",
                "If a column is ambiguous or low-confidence, OMIT it from mapping (do not guess).",
            ].join(" ");

            const user = {
                task: "Map input CSV columns to template columns for clinical dataset import.",
                templateColumns: TEMPLATE_COLUMNS,
                inputColumnsNeedingMapping: unmappedHeaders,
                examplesByColumn,
                guidance: {
                    meaning: {
                        Visibility:
                            "Published/Private style visibility field (e.g. 'Published', 'Private', 'public', 'visibility').",
                        Title: "Dataset title/name.",
                        Type: "Tool/dataset type (must match TOOL_TYPE_OPTIONS label in the CSV).",
                        Gene: "Gene symbol(s) field.",
                        "Storage Facility": "Where dataset is hosted/stored (institution/company).",
                        "Point of Contact Name": "Comma-separated contact names.",
                        "Point of Contact Email": "Comma-separated contact emails.",
                        "Link Name": "Comma-separated link/attachment names.",
                        "Link URL": "Comma-separated URLs.",
                        Notes: "Free text notes/description (will map to description in your importer).",
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

            llmMapping = Object.fromEntries(
                Object.entries(parsedLLM.data.mapping).filter(([k]) => unmappedHeaders.includes(k))
            ) as Record<string, TemplateColumn>;

            llmNotes = parsedLLM.data.notes ?? [];
        }

        // Combine (heuristics win)
        const finalMapping: Record<string, TemplateColumn> = { ...llmMapping, ...heuristic };

        // Full parse -> normalized CSV
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
        console.error("clinical-datasets normalize-import route error:", err);
        return NextResponse.json(
            { error: "Unexpected error normalizing CSV.", details: String(err?.message ?? err) },
            { status: 500 }
        );
    }
}
