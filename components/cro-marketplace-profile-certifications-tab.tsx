import { RFI } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Certification {
    name: string;
    files?: { fileName: string; fileUrl: string }[];
}

export default function CROMarketplaceProfileCertificationsTab({ croCertifications }: { croCertifications: Certification[] }) {
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
                        <TableRow key={index}>
                            <TableCell className="w-full font-medium">{certification.name}</TableCell>
                            <TableCell className="whitespace-nowrap">
                                {certification.files && certification.files.length > 0 ? (
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value={`cert-${index}`}>
                                            <AccordionTrigger>View Files</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2">
                                                    {certification.files.map((file, fileIndex) => (
                                                        <Button
                                                            key={fileIndex}
                                                            variant="outline"
                                                            className="w-full flex justify-between items-center"
                                                            asChild
                                                        >
                                                            <a href={file.fileUrl} download>
                                                                {file.fileName} <Download className="ml-2 h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                ) : (
                                    <span className="text-gray-500">No files</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
