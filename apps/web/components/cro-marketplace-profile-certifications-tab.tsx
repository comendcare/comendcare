"use client"

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Certification {
    name: string;
    files?: { fileName: string; fileUrl: string }[];
}

export default function CROMarketplaceProfileCertificationsTab({ croCertifications }: { croCertifications: Certification[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div>
            <Table>
                <TableCaption>A list of certifications.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-full">Name</TableHead>
                        <TableHead className="whitespace-nowrap">Files</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {croCertifications.map((certification, index) => (
                        <>
                            <TableRow key={index} onClick={() => setOpenIndex(openIndex === index ? null : index)} className="cursor-pointer">
                                <TableCell className="w-full font-medium">{certification.name}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {certification.files && certification.files.length > 0 ? (
                                        <div>View Files</div>
                                    ) : (
                                        <span className="text-gray-500">No files</span>
                                    )}
                                </TableCell>
                            </TableRow>
                            {certification.files && certification.files.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="p-0">
                                        <Collapsible open={openIndex === index} onOpenChange={() => setOpenIndex(openIndex === index ? null : index)}>
                                            <CollapsibleContent>
                                                <div className="p-4 space-y-2 border-t">
                                                    {certification.files.map((file, fileIndex) => (
                                                        <Button
                                                            key={fileIndex}
                                                            variant="outline"
                                                            className="w-full flex justify-between items-center"
                                                            asChild
                                                        >
                                                            <a href={file.fileUrl} download>
                                                                {file.fileName} <Download className="ml-2" />
                                                            </a>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </TableCell>
                                </TableRow>
                            )}
                        </>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
