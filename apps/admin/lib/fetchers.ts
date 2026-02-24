"use server"

import prisma from "@comend/lib/prisma"
import {ApiResponse, BIOSAMPLE_TYPE_OPTIONS, DISEASE_MODEL_TYPE_OPTIONS, milestoneCategories, RESEARCH_PLAN_TYPES, TOOL_TYPE_OPTIONS} from "@comend/lib/types";
import {formatMoney, getProfileCompletionChecks, getStage, logError} from "@comend/lib/utils";
import { subMonths, startOfMonth, monthsToYears } from "date-fns";
import {Prisma} from "@prisma/client";
import { InternalArgs } from "@prisma/client/runtime/library"
import { withAdminAuth } from "./auth";

/* ADMIN PANEL FETCHERS - require admin priviledges to access these functions */
export const getOrganizationFromRoadmapId = withAdminAuth(
    async (
        roadmapId: string,
    ): Promise<ApiResponse<any>> => {
        try {
            const roadmap = await prisma.roadmap.findUnique({
                where: {
                    id: roadmapId
                },
            })

            if (!roadmap) {
                return {success: false, error: "roadmap not found"};
            }

            return {success: true, data: roadmap?.organizationId};
        } catch (error: any) {
            logError("Error fetching roadmap data", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getUserAnalytics = withAdminAuth(
    async () => {
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const startOfLastMonth = startOfMonth(subMonths(now, 1));

        // Total users
        const totalUsers = await prisma.user.count();

        // New users this month
        const newUsersThisMonth = await prisma.user.count({
            where: {
                createdAt: {
                    gte: startOfCurrentMonth,
                },
            },
        });

        // New users last month
        const newUsersLastMonth = await prisma.user.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,
                    lt: startOfCurrentMonth,
                },
            },
        });

        // Active accounts (users updated in last 30 days)
        const activeUsers = await prisma.user.count({
            where: {
                updatedAt: {
                    gte: subMonths(now, 1),
                },
            },
        });

        const growthRate =
            newUsersLastMonth === 0
                ? 100
                : ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;

        return {
            totalUsers,
            newUsersThisMonth,
            newUsersLastMonth,
            activeUsers,
            growthRate,
        };
    }
)

export const getOrganizationAnalytics = withAdminAuth(
    async (orgId?: string | undefined) => {
        const orgConditions = await prisma.condition.findMany({
            where: {
                organizations: {
                    some: {
                        organizationId: orgId
                    }
                }
            }
        })

        const patientsEngagedList = orgConditions.map(org => org.numberOfPatientsEngaged || 0)

        const numPatientsEngaged = patientsEngagedList && patientsEngagedList.length > 0
            ? patientsEngagedList.reduce((prev, curr) => prev + curr)
            : 0

        const organization = await prisma.organization.findUnique({
            select: {
                moneyDeployed: true,
                moneyRaised: true,
                researchBudget: true
            },
            where: {
                id: orgId
            }
        })

        return {
            numPatientsEngaged: numPatientsEngaged || 0,
            moneyDeployed: organization?.moneyDeployed || 0,
            moneyRaised: organization?.moneyRaised || 0,
            researchBudget: organization?.researchBudget || 0
        }
    }
)

export const getResearchPlansAnalytics = withAdminAuth(
    async () => {
        const allResearchPlans = await prisma.roadmap.findMany({
            include: {milestones: {include: {types: true}}}
        })

        // Total research plans
        const totalResearchPlans = allResearchPlans.length

        // Total research plans, by type
        let totalResearchPlansOfType: {type: string, num: number}[] = await Promise.all(RESEARCH_PLAN_TYPES.map(async (type) => ({
            type: type.label,
            num: await prisma.roadmap.count({
                where: {
                    modalities: {has: type.value}
                }
            })
        })))

        // Total projects, by type
        const milestoneTypes = await prisma.milestoneType.findMany()
        const allProjects = await prisma.milestone.findMany({
            include: {
                types: true
            }
        })
        let totalProjects = allProjects.length
        let totalProjectsOfType: {type: string, num: number}[] = milestoneTypes.map((type) => (
            {
                type: type.label,
                num: allProjects.filter(project => project.types.map(type => type.milestoneTypeId).includes(type.id)).length
            }
        ))

        let totalResearchPlansByStatus = Object.values(milestoneCategories).map(({option}) => ({
            type: option.label,
            num: allResearchPlans.filter(researchPlan => getStage(researchPlan.milestones as any).value === option.value).length
        }))

        let projectsBudgets = allProjects.map(({budget}) => budget || 0)
        let sumProjectBudgets = projectsBudgets && projectsBudgets.length > 0
            ? projectsBudgets.reduce((prev, curr) => prev + curr)
            : 0

        const statuses = ['PLANNED', 'INPROGRESS', 'COMPLETED']

        let projectsByStatus: {type: string, num: number}[] = statuses.map(status => ({
            type: status,
            num: allProjects.filter(project => project.status === status).length
        }))

        let projectBudgetsByProgress: {type: string, num: number}[] = statuses.map(status => ({
            type: status, 
            num: allProjects
                    .filter(project => project.status === status)
                    .map(project => project.budget || 0)
                    .concat([0]) // concat with 0 to avoid reduce error if there are no projects of this status
                    .reduce((prev, next) => prev + next)
        }))

        return {
            totalResearchPlans,
            totalResearchPlansOfType,
            totalResearchPlansByStatus,
            totalProjects,
            totalProjectsOfType,
            sumProjectBudgets,
            projectsByStatus,
            projectBudgetsByProgress
        };
    }
)

export const getOrganizationResearchPlansAnalytics = withAdminAuth(
    async (orgId?: string) => {
        const allResearchPlans = await prisma.roadmap.findMany({
            where: {
                organizationId: orgId
            },
            include: {milestones: {include: {types: true}}}
        })

        // Total research plans
        const totalResearchPlans = allResearchPlans.length

        // Total research plans, by type
        let totalResearchPlansOfType: {type: string, num: number}[] = await Promise.all(RESEARCH_PLAN_TYPES.map(async (type) => ({
            type: type.label,
            num: await prisma.roadmap.count({
                where: {
                    organizationId: orgId,
                    modalities: {has: type.value}
                }
            })
        })))

        // Total projects, by type
        const milestoneTypes = await prisma.milestoneType.findMany()
        const allProjects = await prisma.milestone.findMany({
            where: {
                organizationId: orgId
            },
            include: {
                types: true
            }
        })
        let totalProjects = allProjects.length
        let totalProjectsOfType: {type: string, num: number}[] = milestoneTypes.map((type) => (
            {
                type: type.label,
                num: allProjects.filter(project => project.types.map(type => type.milestoneTypeId).includes(type.id)).length
            }
        ))

        let totalResearchPlansByStatus = Object.values(milestoneCategories).map(({option}) => ({
            type: option.label,
            num: allResearchPlans.filter(researchPlan => getStage(researchPlan.milestones as any).value === option.value).length
        }))

        let projectsBudgets = allProjects.map(({budget}) => budget || 0)
        let sumProjectBudgets = projectsBudgets && projectsBudgets.length > 0
            ? projectsBudgets.reduce((prev, curr) => prev + curr)
            : 0

        const statuses = ['TODO', 'INPROGRESS', 'COMPLETED']
        let projectBudgetsByProgress: {type: string, num: number}[] = statuses.map(status => ({
            type: status, 
            num: allProjects
                    .filter(project => project.status === status)
                    .map(project => project.budget || 0)
                    .concat([0]) // concat with 0 to avoid reduce error if there are no projects of this status
                    .reduce((prev, next) => prev + next)
        }))

        return {
            totalResearchPlans,
            totalResearchPlansOfType,
            totalResearchPlansByStatus,
            totalProjects,
            totalProjectsOfType,
            sumProjectBudgets,
            projectBudgetsByProgress
        };
    }
)

export const getToolsAnalytics = withAdminAuth(
    async () => {
        const totalBiosamples: number = (await prisma.biosample.count({}))
        const totalDiseaseModels: number = (await prisma.diseaseModel.count({}))
        const totalClinicalDatasets: number = (await prisma.tool.count({}))

        // Total Biosamples, by type
        let totalBiosamplesOfType: {type: string, num: number}[] = await Promise.all(BIOSAMPLE_TYPE_OPTIONS.map(async (type) => ({
            type: type.label,
            num: await prisma.biosample.count({
                where: {
                    types: {has: type.value}
                }
            })
        })))

        // Total Disease Models, by type
        let totalDiseaseModelsOfType: {type: string, num: number}[] = await Promise.all(DISEASE_MODEL_TYPE_OPTIONS.map(async (type) => ({
            type: type.label,
            num: await prisma.diseaseModel.count({
                where: {
                    types: {has: type.value}
                }
            })
        })))

        // Total Clinical Datasets, by type
        let totalClinicalDatasetsOfType: {type: string, num: number}[] = await Promise.all(TOOL_TYPE_OPTIONS.map(async (type) => ({
            type: type.label,
            num: await prisma.tool.count({
                where: {
                    types: {has: type.value}
                }
            })
        })))

        return {
            totalBiosamples,
            totalDiseaseModels,
            totalClinicalDatasets,
            totalBiosamplesOfType,
            totalDiseaseModelsOfType,
            totalClinicalDatasetsOfType
        };
    }
)

export const getOrganizationToolsAnalytics = withAdminAuth(
    async (orgId?: string) => {
        const totalBiosamples: number = (await prisma.biosample.count({
            where: {
                organizationId: orgId
            }
        }))

        const totalDiseaseModels: number = (await prisma.diseaseModel.count({
            where: {
                organizationId: orgId
            }
        }))

        const totalClinicalDatasets: number = (await prisma.tool.count({
            where: {
                organizationId: orgId
            }
        }))

        // Total Biosamples, by type
        let totalBiosamplesOfType: {type: string, num: number}[] = await Promise.all(BIOSAMPLE_TYPE_OPTIONS.map(async (type) => ({
            type: type.label,
            num: await prisma.biosample.count({
                where: {
                    organizationId: orgId,
                    types: {has: type.value}
                }
            })
        })))

        // Total Disease Models, by type
        let totalDiseaseModelsOfType: {type: string, num: number}[] = await Promise.all(DISEASE_MODEL_TYPE_OPTIONS.map(async (type) => ({
            type: type.label,
            num: await prisma.diseaseModel.count({
                where: {
                    organizationId: orgId,
                    types: {has: type.value}
                }
            })
        })))

        // Total Clinical Datasets, by type
        let totalClinicalDatasetsOfType: {type: string, num: number}[] = await Promise.all(TOOL_TYPE_OPTIONS.map(async (type) => ({
            type: type.label,
            num: await prisma.tool.count({
                where: {
                    organizationId: orgId,
                    types: {has: type.value}
                }
            })
        })))

        return {
            totalBiosamples,
            totalDiseaseModels,
            totalClinicalDatasets,
            totalBiosamplesOfType,
            totalDiseaseModelsOfType,
            totalClinicalDatasetsOfType
        };
    }
)

export const getRFPsAnalytics = withAdminAuth(
    async () => {
        const allRFPs = await prisma.rFP.findMany({})
        const totalRFPs: number = allRFPs.length

        const totalPublishedRFPs: number = await prisma.rFP.count({
            where: {
                private: false
            }
        })

        const totalPrivateRFPs = totalRFPs - totalPublishedRFPs

        const RFPsByOpenTo = await Promise.all(["CRO", "ACADEMIC"].map(async (openToKey) => ({
            type: openToKey,
            num: (await prisma.rFP.findMany({
                where: {
                    openTo: {has: openToKey}
                }
            })).length
        })))

        const createMoneyFormatter = (cents?: boolean) => Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: cents ? 2 : 0,
            maximumFractionDigits: cents ? 2 : 0,
        });
        const moneyFormatter = createMoneyFormatter(undefined)

        const budgetBuckets = [50000, 100000, 500000, 1000000, 5000000]
        let RFPsByBudget: {type: string, num: number}[] = []

        for (let i = 0; i < budgetBuckets.length; i++) {
            const min = i <= 0 ? 0 : budgetBuckets[i-1]
            const max = budgetBuckets[i]

            RFPsByBudget.push({
                type: `${moneyFormatter.format(min)} - ${moneyFormatter.format(max - 1)}`,
                num: allRFPs.filter(rfp => typeof rfp.budget === 'number' && rfp.budget >= min && rfp.budget < max).length
            })
        }

        RFPsByBudget.push({
            type: `${formatMoney(budgetBuckets[budgetBuckets.length - 1])} +`,
            num: allRFPs.filter(rfp => typeof rfp.budget === 'number' && rfp.budget >= budgetBuckets[budgetBuckets.length - 1]).length
        })

        RFPsByBudget.push({
            type: 'No Budget',
            num: allRFPs.filter(rfp => rfp.budget === undefined || rfp.budget === null).length
        })

        return {
            totalRFPs,
            totalPublishedRFPs,
            totalPrivateRFPs,
            RFPsByOpenTo,
            RFPsByBudget
        };
    }
)

export const getOrganizationRFPsAnalytics = withAdminAuth(
    async (orgId?: string) => {
        const allRFPs = await prisma.rFP.findMany({
            where: {
                organizationId: orgId
            }
        })
        const totalRFPs: number = allRFPs.length

        const totalPublishedRFPs: number = await prisma.rFP.count({
            where: {
                organizationId: orgId,
                private: false
            }
        })

        const totalPrivateRFPs = totalRFPs - totalPublishedRFPs

        const RFPsByOpenTo = await Promise.all(["CRO", "ACADEMIC"].map(async (openToKey) => ({
            type: openToKey,
            num: (await prisma.rFP.findMany({
                where: {
                    organizationId: orgId,
                    openTo: {has: openToKey}
                }
            })).length
        })))

        const createMoneyFormatter = (cents?: boolean) => Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: cents ? 2 : 0,
            maximumFractionDigits: cents ? 2 : 0,
        });
        const moneyFormatter = createMoneyFormatter(undefined)

        const budgetBuckets = [50000, 100000, 500000, 1000000, 5000000]
        let RFPsByBudget: {type: string, num: number}[] = []

        for (let i = 0; i < budgetBuckets.length; i++) {
            const min = i <= 0 ? 0 : budgetBuckets[i-1]
            const max = budgetBuckets[i]

            RFPsByBudget.push({
                type: `${moneyFormatter.format(min)} - ${moneyFormatter.format(max - 1)}`,
                num: allRFPs.filter(rfp => typeof rfp.budget === 'number' && rfp.budget >= min && rfp.budget < max).length
            })
        }

        RFPsByBudget.push({
            type: `${formatMoney(budgetBuckets[budgetBuckets.length - 1])} +`,
            num: allRFPs.filter(rfp => typeof rfp.budget === 'number' && rfp.budget >= budgetBuckets[budgetBuckets.length - 1]).length
        })

        RFPsByBudget.push({
            type: 'No Budget',
            num: allRFPs.filter(rfp => rfp.budget === undefined || rfp.budget === null).length
        })

        return {
            totalRFPs,
            totalPublishedRFPs,
            totalPrivateRFPs,
            RFPsByOpenTo,
            RFPsByBudget
        };
    }
)

export const getClaimedOrganizationsAnalytics = withAdminAuth(
    async () => {
        const totalOrganizations = await prisma.organization.count({})
        const unclaimedOrganizations = await prisma.organization.count({
            where: {
                members: {
                    some: {
                        email: {
                            not: {
                                contains: "@comendcare.com",
                                // case: "insensitive",
                            },
                        },
                    },
                },
            }
        })
        const claimedOrganizations = totalOrganizations - unclaimedOrganizations

        return {
            totalOrganizations,
            claimedOrganizations
        }
    }
)

export const getClaimedGenesAnalytics = withAdminAuth(
    async () => {
        const totalGenes = await prisma.gene.count({})
        const conditions = await prisma.condition.findMany({
            select: {
                causalGenes: true,
                // associatedGenes: true,
            },
        })

        // Flatten everything into one list
        const allGenes = conditions.flatMap(c =>
            [
                ...c.causalGenes, 
                // ...c.associatedGenes
            ]
        );

        // Deduplicate
        const uniqueGenes = new Set(allGenes);

        return {
            totalGenes,
            claimedGenes: uniqueGenes.size
        }
    }
)

export const getOrganizationsAnalytics = withAdminAuth(
    async () => {
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const startOfLastMonth = startOfMonth(subMonths(now, 1));

        // Total organizations
        const totalOrganizations = await prisma.organization.count();

        // New organizations this month
        const newOrganizationsThisMonth = await prisma.organization.count({
            where: {
                createdAt: {
                    gte: startOfCurrentMonth,
                },
            },
        });

        // New organizations last month
        const newOrganizationsLastMonth = await prisma.organization.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,
                    lt: startOfCurrentMonth,
                },
            },
        });

        // Active organizations (updated in last 30 days)
        const activeOrganizations = await prisma.organization.count({
            where: {
                updatedAt: {
                    gte: subMonths(now, 1),
                },
            },
        });

        const growthRate =
            newOrganizationsLastMonth === 0
                ? 100
                : ((newOrganizationsThisMonth - newOrganizationsLastMonth) / newOrganizationsLastMonth) * 100;

        const allOrganizations = await prisma.organization.findMany({
            include: {
                conditions: true,
                roadmaps: true,
            },
        });

        let completedProfiles = 0;

        for (const org of allOrganizations) {
            const conditions = await prisma.condition.findMany({
                where: {
                    organizations: {
                        some: {
                            organizationId: org.id, // Filter by organizationId
                        },
                    },
                },
            });
            const checks = getProfileCompletionChecks(org as any, (conditions || []) as any);
            const isComplete = Object.values(checks).every(Boolean);
            if (isComplete) completedProfiles++;
        }

        // Sum of all patients engaged
        const conditionsWithPatientsEngaged = await prisma.condition.findMany({
            select: {
                numberOfPatientsEngaged: true
            },
            where: {
                numberOfPatientsEngaged: {
                    not: null
                }
            }
        })

        const patientsEngagedList = conditionsWithPatientsEngaged.map(({numberOfPatientsEngaged}) => numberOfPatientsEngaged || 0)
        const sumPatientsEngaged = patientsEngagedList && patientsEngagedList.length > 0
            ? patientsEngagedList.reduce((prev, curr) => prev + curr)
            : 0

        const orgBudgets = allOrganizations.map(({moneyRaised, moneyDeployed, researchBudget}) => ({
            moneyRaised: moneyRaised || 0, 
            moneyDeployed: moneyDeployed || 0, 
            researchBudget: researchBudget || 0
        }))
        const sumOrgBudgets = orgBudgets && orgBudgets.length > 0
            ? orgBudgets.reduce((prev, curr) => ({
                moneyRaised: prev.moneyRaised + curr.moneyRaised, 
                moneyDeployed: prev.moneyDeployed + curr.moneyDeployed, 
                researchBudget: prev.researchBudget + curr.researchBudget
            }))
            : {moneyRaised: 0, moneyDeployed: 0, researchBudget: 0}

        return {
            totalOrganizations,
            newOrganizationsThisMonth,
            newOrganizationsLastMonth,
            activeOrganizations,
            growthRate,
            completedProfiles,
            sumPatientsEngaged,
            sumMoneyRaised: sumOrgBudgets.moneyRaised,
            sumMoneyDeployed: sumOrgBudgets.moneyDeployed,
            sumResearchBudget: sumOrgBudgets.researchBudget
        };
    }
)

export const getOrganizationChartAnalytics = withAdminAuth(
    async () => {
        const organizations = await prisma.organization.findMany({
            where: {
                createdAt: {
                    lte: new Date(),
                },
            },
            select: {
                createdAt: true,
            },
        });

        const countsByDate: Record<string, number> = {};

        for (const org of organizations) {
            const dateStr = org.createdAt.toISOString().split("T")[0]; // "YYYY-MM-DD"
            countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
        }

        const chartData = Object.entries(countsByDate)
            .map(([date, count]) => ({
                date,
                organizations: count,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return chartData;
    }
)

export const getCompanyAndReviewAnalytics = withAdminAuth(
    async () => {
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const startOfLastMonth = startOfMonth(subMonths(now, 1));

        // Companies
        const totalCompanies = await prisma.company.count();
        const newCompaniesThisMonth = await prisma.company.count({
            where: { createdAt: { gte: startOfCurrentMonth } },
        });
        const newCompaniesLastMonth = await prisma.company.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,
                    lt: startOfCurrentMonth,
                },
            },
        });

        const companyGrowthRate =
            newCompaniesLastMonth === 0
                ? 100
                : ((newCompaniesThisMonth - newCompaniesLastMonth) / newCompaniesLastMonth) * 100;

        // Reviews
        const totalReviews = await prisma.review.count();
        const newReviewsThisMonth = await prisma.review.count({
            where: { createdAt: { gte: startOfCurrentMonth } },
        });

        return {
            totalCompanies,
            newCompaniesThisMonth,
            newCompaniesLastMonth,
            companyGrowthRate,
            totalReviews,
            newReviewsThisMonth,
        };
    }
)

export const getCompanyChartAnalytics = withAdminAuth(
    async () => {
        const companies = await prisma.company.findMany({
            where: {
                createdAt: {
                    lte: new Date(),
                },
            },
            select: {
                createdAt: true,
            },
        });

        // Aggregate by date
        const countsByDate: Record<string, number> = {};

        for (const company of companies) {
            const dateStr = company.createdAt.toISOString().split("T")[0]; // "YYYY-MM-DD"
            countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
        }

        // Convert to array sorted by date
        const chartData = Object.entries(countsByDate)
            .map(([date, count]) => ({
                date,
                companies: count,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return chartData;
    }
)

export const getUserChartAnalytics = withAdminAuth(
    async () => {
        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    lte: new Date(),
                },
            },
            select: {
                createdAt: true,
            },
        });

        // Aggregate by date
        const countsByDate: Record<string, number> = {};

        for (const user of users) {
            const dateStr = user.createdAt.toISOString().split("T")[0]; // "2024-06-28"
            countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
        }

        // Convert to array sorted by date
        const chartData = Object.entries(countsByDate)
            .map(([date, count]) => ({
                date,
                users: count,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return chartData;
    }
)

export const getUserEmailCapture = withAdminAuth(
    async (
        select: Prisma.WhitelistSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const emailCaptureList = await prisma.emailCapture.findMany({
                orderBy: { createdAt: "desc" },
                select
            })


            if (!emailCaptureList) {
                return {success: false, error: "Email Capture list not found"};
            }

            return {
                success: true,
                data: emailCaptureList
            };
        } catch (error: any) {
            logError("Error fetching captured user emails", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getUserWhitelist = withAdminAuth(
    async (
        select: Prisma.WhitelistSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const whitelist = await prisma.whitelist.findMany({
                orderBy: { createdAt: "desc" },
                select
            })


            if (!whitelist) {
                return {success: false, error: "User whitelist not found"};
            }

            return {
                success: true,
                data: whitelist
            };
        } catch (error: any) {
            logError("Error fetching whitelisted users", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getUserBlacklist = withAdminAuth(
    async (
        select: Prisma.PlatformNotificationSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) =>  {
        try {
            const blacklist = await prisma.blacklist.findMany({
                orderBy: { createdAt: "desc" },
            })


            if (!blacklist) {
                return {success: false, error: "User blacklist not found"};
            }

            return {
                success: true,
                data: blacklist
            };
        } catch (error: any) {
            logError("Error fetching blacklisted users", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getOverviewAnalytics = withAdminAuth(
    async () => {
        const totalUsers = await prisma.user.count();
        const totalOrganizations = await prisma.organization.count();
        const totalCompanies = await prisma.company.count();
        const totalProjects = await prisma.milestone.count();

        return {
            totalUsers,
            totalOrganizations,
            totalCompanies,
            totalProjects,
        };
    }
)

export const getFacilityCreationRequests = withAdminAuth(
    async (
        select: Prisma.CreateFacilityRequestSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const facilityCreationRequests = await prisma.createFacilityRequest.findMany({
                orderBy: { createdAt: "desc" },
                select
            })

            if (!facilityCreationRequests) {
                return {success: false, error: "Facility creation requests not found"};
            }

            return {
                success: true,
                data: facilityCreationRequests
            };
        } catch (error: any) {
            logError("Error fetching facility creation requests", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getCompanyContactRequests = withAdminAuth(
    async (
        select: Prisma.CompanyContactRequestSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const companyContactRequests = await prisma.companyContactRequest.findMany({
                orderBy: { createdAt: "desc" },
                select
            })

            if (!companyContactRequests) {
                return {success: false, error: "Company contact requests not found"};
            }

            return {
                success: true,
                data: companyContactRequests
            };
        } catch (error: any) {
            logError("Error fetching company contact requests", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getIsOrganizationClaimed = withAdminAuth(
    async (organizationId: string): Promise<boolean> => {
        const hasNonComendMember = await prisma.organization.findFirst({
            where: {
                id: organizationId,
                members: {
                    some: {
                        email: {
                            not: {
                                contains: "@comendcare.com",
                            },
                        },
                    },
                },
            },
            select: { id: true },
        })

        return Boolean(hasNonComendMember)
    }
)
