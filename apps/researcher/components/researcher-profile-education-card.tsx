import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card"
import {GraduationCap} from "lucide-react";

function formatYearRanges(years: number[] | string[] = []): string {
    const nums = years
        .map((y) => parseInt(y as string))
        .filter((y) => !isNaN(y))
        .sort((a, b) => a - b);

    if (nums.length === 0) return "";

    const ranges: string[] = [];
    let start = nums[0];
    let prev = nums[0];

    for (let i = 1; i <= nums.length; i++) {
        const year = nums[i];
        if (year === prev + 1) {
            prev = year;
            continue;
        }

        if (start === prev) {
            ranges.push(`${start}`);
        } else {
            ranges.push(`${start}-${prev}`);
        }

        start = year;
        prev = year;
    }

    return ranges.join(", ");
}

export default function ResearcherProfileEducationCard({openAlex}: {openAlex: any}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {openAlex.affiliations?.filter((aff: any) => aff.institution?.type === "education").length > 0 ? (
                    openAlex.affiliations
                        .filter((aff: any) => aff.institution?.type === "education")
                        .map((aff: any, index: number) => (
                            <div key={index}>
                                <div className="font-semibold">{aff.institution.display_name}</div>
                                {aff.years && (
                                    <div className="text-sm text-gray-600">
                                        {formatYearRanges(aff.years)}
                                    </div>
                                )}
                            </div>
                        ))
                ) : (
                    <div className="text-sm text-gray-600">No education data available.</div>
                )}
            </CardContent>
        </Card>
    )
}
