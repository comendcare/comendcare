"use client";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Organization, Roadmap } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Store } from "lucide-react";
import { getPublicMilestoneDetails } from "@/lib/fetchers";

export default function MarketplaceBreadcrumb({ organization, roadmap, marketplaceDomain }: {
    organization?: Partial<Organization>,
    roadmap?: Partial<Roadmap>,
    marketplaceDomain: string
}) {

    const searchParams = useSearchParams();
    const urlMilestone = searchParams.get("project");
    const [milestone, setMilestone] = useState<any>();

    useEffect(() => {
        if (urlMilestone) {
            getPublicMilestoneDetails(urlMilestone, {
                title: true,
            }).then(response => {
                if (response?.success && response?.data) {
                    setMilestone(response.data);
                } else {
                    console.error(response?.error);
                    toast.error(response?.error);
                }
            });
        }
    }, [urlMilestone]);

    const breadcrumbItems = [
        { label: "Marketplace", href: marketplaceDomain },
        organization && {
            label: organization.name,
            href: `/app/organization/${organization.subdomain}`
        },
        (roadmap && roadmap.title) && {
            label: roadmap.title,
            href: organization?.subdomain
                ? `/app/organization/${organization.subdomain}/research-plan`
                : ""
        },
        milestone && { label: milestone.title, isPage: true }
    ].filter(Boolean); // Remove undefined items

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <>
                        <BreadcrumbItem key={item.label} className="hover:text-foreground">
                            {item.label === "Marketplace" &&
                                <Store className="h-4 w-4"/>
                            }
                            {item.isPage ? (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                    </>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
