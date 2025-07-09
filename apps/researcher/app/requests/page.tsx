"use client"

import RequestCard from "~provider/components/request-card";
import RequestStats from "~provider/components/request-stats";
import * as React from "react"
import RequestToolbar from "~provider/components/request-toolbar";

const requests = [
    {
        id: "REQ-2024-001",
        title: "Cardiovascular Disease Genomics Study",
        submittedDate: "2024-01-15",
        status: "approved",
        sampleTypes: ["Blood", "DNA"],
        sampleCount: 250,
        dataTypes: ["Genomic", "Clinical"],
        pi: "Dr. Sarah Chen",
        institution: "Stanford University",
        approvalDate: "2024-01-22",
        expiryDate: "2025-01-22",
    },
    {
        id: "REQ-2024-002",
        title: "Alzheimer's Biomarker Discovery",
        submittedDate: "2024-02-03",
        status: "in-progress",
        sampleTypes: ["Plasma", "CSF"],
        sampleCount: 150,
        dataTypes: ["Proteomic", "Clinical"],
        pi: "Dr. Michael Rodriguez",
        institution: "Mayo Clinic",
        approvalDate: "2024-02-10",
        expiryDate: "2025-02-10",
    },
    {
        id: "REQ-2024-003",
        title: "Cancer Immunotherapy Response",
        submittedDate: "2024-02-20",
        status: "pending",
        sampleTypes: ["Tissue", "Blood"],
        sampleCount: 100,
        dataTypes: ["RNA-seq", "Clinical"],
        pi: "Dr. Emily Watson",
        institution: "Johns Hopkins",
        approvalDate: null,
        expiryDate: null,
    },
    {
        id: "REQ-2024-004",
        title: "Pediatric Rare Disease Cohort",
        submittedDate: "2024-03-01",
        status: "rejected",
        sampleTypes: ["DNA", "Tissue"],
        sampleCount: 75,
        dataTypes: ["Genomic", "Phenotypic"],
        pi: "Dr. James Liu",
        institution: "Children's Hospital Boston",
        approvalDate: null,
        expiryDate: null,
    },
    {
        id: "REQ-2024-005",
        title: "Metabolic Syndrome Analysis",
        submittedDate: "2024-03-10",
        status: "completed",
        sampleTypes: ["Serum", "Urine"],
        sampleCount: 300,
        dataTypes: ["Metabolomic", "Clinical"],
        pi: "Dr. Anna Kowalski",
        institution: "University of Michigan",
        approvalDate: "2024-03-15",
        expiryDate: "2025-03-15",
    },
]

const stats = [
    {name: 'Number of deploys', value: '405'},
    {name: 'Average deploy time', value: '3.65', unit: 'mins'},
    {name: 'Number of servers', value: '3'},
    {name: 'Success rate', value: '98.5%'},
]


export default function ResearcherAccessRequestsPage() {
    return (
        <div className="flex max-w-screen-xl flex-col mx-auto space-y-8 p-8">
            <RequestStats stats={stats}/>

            <RequestToolbar/>

            <div className="space-y-4">
                {requests.map((request) => (
                    <RequestCard request={request} key={request.id}/>
                ))}
            </div>
        </div>
    )
}
