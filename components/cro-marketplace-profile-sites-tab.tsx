import {Site} from "@prisma/client";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";


export default function CROMarketplaceProfileSitesTab({croSites}: {croSites: Site[]}) {
    return (
        <div>
            <Table>
                <TableCaption>A list of sites.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Address</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {croSites.map((site, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{site.name}</TableCell>
                            <TableCell>{site.address}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
