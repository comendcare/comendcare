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
import { getMilestoneDetails } from "@/lib/fetchers";
import { toast } from "sonner";

export default function PAGPublicRoadmapBreadcrumb({ organization, roadmap }: {
    organization?: Organization,
    roadmap?: Roadmap,
}) {
    console.log(roadmap)

    const searchParams = useSearchParams();
    const urlMilestone = searchParams.get("milestone");
    const [milestone, setMilestone] = useState<any>();

    useEffect(() => {
        if (urlMilestone) {
            getMilestoneDetails(urlMilestone).then(response => {
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
        { label: "Home", href: "/" },
        organization && {
            label: organization.name,
            href: `http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
        },
        (roadmap && roadmap.title) && {
            label: roadmap.title,
            href: organization?.subdomain
                ? `http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`
                : ""
        },
        milestone && { label: milestone.title, isPage: true }
    ].filter(Boolean); // Remove undefined items

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <>
                        <BreadcrumbItem key={item.label}>
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
