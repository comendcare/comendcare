import { cn } from "@comend/lib/utils";
import {
    ShieldCheck,
    FileText,
    LayoutDashboard,
    FileInput,
    BellRing,
    BarChart3,
    Users2,
    Layers3,
} from "lucide-react";

export function ResearcherQuickFeaturesSection() {
    const features = [
        {
            title: "Secure Researcher Login",
            description:
                "Role-based access with multi-tenant support. Fine-grained organization-level permissions.",
            icon: <ShieldCheck className="w-6 h-6" />,
        },
        {
            title: "Data Request & Sample Approval Forms",
            description:
                "Researchers can request data using structured, intuitive forms with rich input types.",
            icon: <FileInput className="w-6 h-6" />,
        },
        {
            title: "MTA/DTA Uploads & Document Center",
            description:
                "Central hub for agreements and documentation, with file handling and metadata tagging.",
            icon: <FileText className="w-6 h-6" />,
        },
        {
            title: "Sample Quality Flags & Inventory Dashboard",
            description:
                "Track sample quality and status across cohorts with searchable inventory and filters.",
            icon: <LayoutDashboard className="w-6 h-6" />,
        },
        {
            title: "Automated Sample Return Reminders",
            description:
                "Built-in notification engine for return and destruction workflows via email or in-app alerts.",
            icon: <BellRing className="w-6 h-6" />,
        },
        {
            title: "Integrated Visualization Tools",
            description:
                "Create and share visualizations on-platform. Save figures to your workspace for reuse.",
            icon: <BarChart3 className="w-6 h-6" />,
        },
        {
            title: "Access Harmonized Cohort Metadata",
            description:
                "Explore omics and survey data through a unified, filterable metadata interface.",
            icon: <Users2 className="w-6 h-6" />,
        },
        {
            title: "Collaborative Workspaces & Versioning",
            description:
                "Researchers can co-create, share, and track versions of visualizations and submissions.",
            icon: <Layers3 className="w-6 h-6" />,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
            {features.map((feature, index) => (
                <Feature key={feature.title} {...feature} index={index} />
            ))}
        </div>
    );
}

const Feature = ({
                     title,
                     description,
                     icon,
                     index,
                 }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}) => {
    return (
        <div
            className={cn(
                "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
                (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
                index < 4 && "lg:border-b dark:border-neutral-800"
            )}
        >
            {index < 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
            )}
            {index >= 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
            )}
            <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
                {icon}
            </div>
            <div className="text-lg font-bold mb-2 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
                {description}
            </p>
        </div>
    );
};
