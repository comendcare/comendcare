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

export default function CROMarketplaceProfileRFIsTab({ croRFIs }: { croRFIs: RFI[] }) {
    return (
        <div>
            <Table>
                <TableCaption>A list of RFIs.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-full">Name</TableHead>
                        <TableHead className="whitespace-nowrap">Submitted On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {croRFIs.map((rfi, index) => (
                        <TableRow key={index}>
                            <TableCell className="w-full font-medium">{rfi.name}</TableCell>
                            <TableCell className="whitespace-nowrap">
                                {new Date(rfi.submittedOn || "").toDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
