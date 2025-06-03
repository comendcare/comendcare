"use server"

import {unstable_cache} from "next/cache"
import prisma from "@/lib/prisma"
import {serialize} from "next-mdx-remote/serialize"
import {replaceExamples, replaceTweets} from "@/lib/remark-plugins"
import {ApiResponse, Asset, CustomOrganization, milestoneCategories, RESEARCH_PLAN_TYPES} from "@/lib/types";
import {formatMoney, getProfileCompletionChecks, getStage, logError} from "@/lib/utils";
import {getSession, withAdminAuth, withOrganizationAuth, withUserAuth} from "@/lib/auth";
import { subMonths, startOfMonth } from "date-fns";
import {Condition, Organization, Prisma, User} from "@prisma/client";
import {promises as fs} from "fs";
import path from "path";
import {z} from "zod";
import {IPSchema, biosampleSchema, clinicalStudySchema, preclinicalStudySchema, taskSchema} from "@/data/pharma-data/schema";
import { InternalArgs } from "@prisma/client/runtime/library"
import { organizations } from "@/data/sample-pags"

/* PUBLIC FUNCTION - these functions are accessible to anyone on the platform, no auth needed */
export async function getPublicAssetsForOrganization(
    domain: string,
    select: Prisma.ToolSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : domain

    const tools = await prisma.tool.findMany({
        where: {
            organization: {
                subdomain: subdomain
            },
            private: {equals: false}
        },
        select: {
            ...select,
            // filter out any private milestones if the user has requested to access milestones
            milestones: select.milestones ? ({
                // include: {milestone: {include: {types: {include: {milestoneType: true}}}}},
                include: {milestone: true},
                where: {milestone: {private: {equals: false}}}
            }) : undefined
        },
        orderBy: [{createdAt: "desc"}]
    })

    return tools
}

export async function getPublicRFPsForOrganization(
    domain: string, 
    select: Prisma.RFPSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : domain

    const rfps = await prisma.rFP.findMany({
        where: {
            organization: {
                subdomain: subdomain
            },
            private: {equals: false}
        },
        select:{
            ...select,
            // filter out any private milestones if the user has requested to access milestones
            milestones: select.milestones ? ({
                include: {milestone: true},
                where: {milestone: {private: {equals: false}}}
            }) : undefined
        },
        orderBy: [{createdAt: "desc"}]
    })

    return rfps
}

export async function getPublicRoadmapsForOrganization(
    domain: string,
    select: Prisma.RoadmapSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : domain

    const roadmaps = prisma.roadmap.findMany({
        where: {
            organization: {
                subdomain: subdomain,
            },
        },
        select: {
            ...select,
            nodes: select.nodes ? ({
                include: {
                    data: {
                        include: {
                            node: true,
                            contacts: true,
                            attachments: true,
                            types: { include: { milestoneType: true } },
                            tools: { 
                                include: { 
                                    tool: {
                                        include: { 
                                            milestones: {
                                                include: {
                                                    milestone: true
                                                },
                                                where: {
                                                    milestone: {
                                                        private: {
                                                            equals: false
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }, 
                                }, 
                                where: { 
                                    tool: {
                                        private: {
                                            equals: false
                                        }
                                    }
                                } 
                            },
                            rfps: { 
                                include: { 
                                    rfp: {
                                        include: {
                                            milestones: {
                                                include: {
                                                    milestone: true
                                                },
                                                where: {
                                                    milestone: {
                                                        private: {
                                                            equals: false
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }, 
                                }, 
                                where: { 
                                    rfp: {
                                        private: {
                                            equals: false
                                        }
                                    }
                                } 
                            }
                        }
                    }
                },
                where: {
                    data: {private: false}
                },
                orderBy: [{ createdAt: "desc" }]
            }): undefined,
            milestones: select.milestones ? ({
                where: {
                    private: false
                },
                include: {
                    node: true,
                    contacts: true,
                    attachments: true,
                    types: { include: { milestoneType: true } },
                    tools: { 
                        include: { 
                            tool: {
                                include: { 
                                    milestones: {
                                        include: {
                                            milestone: true
                                        },
                                        where: {
                                            milestone: {
                                                private: {
                                                    equals: false
                                                }
                                            }
                                        }
                                    }
                                }
                            }, 
                        }, 
                        where: { 
                            tool: {
                                private: {
                                    equals: false
                                }
                            }
                        } 
                    },
                    rfps: { 
                        include: { 
                            rfp: {
                                include: {
                                    milestones: {
                                        include: {
                                            milestone: true
                                        },
                                        where: {
                                            milestone: {
                                                private: {
                                                    equals: false
                                                }
                                            }
                                        }
                                    }
                                }
                            }, 
                        }, 
                        where: { 
                            rfp: {
                                private: {
                                    equals: false
                                }
                            }
                        } 
                    }
                },
                orderBy: [{ createdAt: "desc" }]
            }) : undefined
        },
        orderBy: [{ createdAt: "desc" }]
    })
    return roadmaps
}

export async function getPublicConditionData(
    slug: string,
    select: Prisma.ConditionSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
): Promise<ApiResponse<any>> {
    try {
        const condition = await prisma.condition.findUnique({
            where: {slug},
            select: {
                ...select,
                organizations: select.organizations ? ({
                    select: {organization: true}
                }) : undefined
            }
        });

        if (!condition) {
            return {success: false, error: "Condition not found"};
        }

        return {success: true, data: condition};
    } catch (error: any) {
        logError("Error fetching condition data", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getConditionsDataFromOrgId(
    organizationId: string,
    select: Prisma.ConditionSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
): Promise<ApiResponse<Partial<Condition>[]>> {
    try {
        const conditions = await prisma.condition.findMany({
            where: {
                organizations: {some: {organizationId}},
            },
            select
        });

        return {success: true, data: conditions};
    } catch (error: any) {
        logError("Error fetching conditions data from organization ID", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getOrganizationData(
    domain: string,
    select: Prisma.OrganizationSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
)  {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : domain

    return await unstable_cache(
        async () => {
            let organization = await prisma.organization.findUnique({
                where: subdomain ? {subdomain} : {customDomain: domain},
                select: {
                    ...select,
                    members: select.members ? ({
                        include: {user: true},
                        orderBy: {createdAt: 'asc'},
                    }) : undefined
                }
            })

            if (!organization) return organization

            if (organization.members) {
                // sort members list - move org owners to the beginning of the list
                organization.members = organization.members.sort((a, b) => {
                    if (a.role === 'owner' && b.role !== 'owner') return -1
                    if (b.role === 'owner' && a.role !== 'owner') return 1
                    return 0
                })

                // sort members list - move comend users to the end of the list
                organization.members = organization.members.sort((a, b) => {
                    if (a.email.includes(`@comendcare.com`) && !b.email.includes(`@comendcare.com`)) return 1
                    if (b.email.includes(`@comendcare.com`) && !a.email.includes(`@comendcare.com`)) return -1
                    return 0
                })
            }

            return organization
        },
        [`${domain}-metadata`],
        {
            revalidate: 900,
            tags: [`${domain}-metadata`]
        }
    )()
}

export const getPublicOrganizationData = async (
    orgId: string,
    select: Prisma.OrganizationSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) => {
    let organization = await prisma.organization.findUnique({
        where: {id: orgId},
        select: {
            ...select,
            members: select.members ? ({
                include: {user: true},
                orderBy: {createdAt: 'asc'},
            }) : undefined
        }
    })

    if (!organization) return {success: false, error: "Could not find organization"}

    if (organization.members) {
        // sort members list - move org owners to the beginning of the list
        organization.members = organization.members.sort((a, b) => {
            if (a.role === 'owner' && b.role !== 'owner') return -1
            if (b.role === 'owner' && a.role !== 'owner') return 1
            return 0
        })

        // sort members list - move comend users to the end of the list
        organization.members = organization.members.sort((a, b) => {
            if (a.email.includes(`@comendcare.com`) && !b.email.includes(`@comendcare.com`)) return 1
            if (b.email.includes(`@comendcare.com`) && !a.email.includes(`@comendcare.com`)) return -1
            return 0
        })
    }

    return {success: true, data: organization}
}

export async function getCROData(
    id: string,
    select: Prisma.CompanySelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    return prisma.company.findUnique({
        where: {
            id: id
        },
        select: {
            ...select,
            certifications: select.certifications ? ({
                include: {files: true}
            }) : undefined,
            reviews: select.reviews ? ({
                include: {
                    author: true,
                    organization: true,
                    feedbacks: true
                }
            }) : undefined
        }
    })
}

export async function getMembers(organizationId: string | null | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedMembers = await prisma?.member.findMany({
            include: {user: true},
            where: {organizationId},
        })


        if (!fetchedMembers) {
            return {success: false, error: "members not found"};
        }

        return {
            success: true,
            data: fetchedMembers
        };
    } catch (error: any) {
        logError("Error fetching members", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getPublicUser(
    userId: string,
    select: Prisma.ConditionSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    try {
        const user = await prisma.user.findUnique({
            // include: {organizations: true},
            where: {id: userId},
            select: {
                
            }
        })

        if (!user) {
            return {success: false, error: "user not found"};
        }

        return {
            success: true,
            data: user
        };
    } catch (error: any) {
        logError("Error fetching user", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getMilestoneTypes() {
    try {
        const types = await prisma.milestoneType.findMany({})

        return {success: true, data: types}
    } catch (error: any) {
        console.error("Database error finding milestone types:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function getPublicMilestoneDetails(id: string) {
    try {
        const milestone = await prisma.milestone.findUnique({
            where: {id},
            include: {
                node: true,
                contacts: true,
                attachments: true,
                types: { include: { milestoneType: true } },
                tools: { 
                    include: { 
                        tool: {
                            include: { 
                                milestones: {
                                    include: {
                                        milestone: true
                                    },
                                    where: {
                                        milestone: {
                                            private: {
                                                equals: false
                                            }
                                        }
                                    }
                                }
                            }
                        }, 
                    }, 
                    where: { 
                        tool: {
                            private: {
                                equals: false
                            }
                        }
                    } 
                },
                rfps: { 
                    include: { 
                        rfp: {
                            include: {
                                milestones: {
                                    include: {
                                        milestone: true
                                    },
                                    where: {
                                        milestone: {
                                            private: {
                                                equals: false
                                            }
                                        }
                                    }
                                }
                            }
                        }, 
                    }, 
                    where: { 
                        rfp: {
                            private: {
                                equals: false
                            }
                        }
                    } 
                }
            }
        })

        return {success: true, data: milestone}
    } catch (error: any) {
        console.error("Database error finding milestone details:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function checkSubdomainAvailability(nickname: string) {
    try {
        const existingOrg = await prisma.organization.findUnique({
            where: {subdomain: nickname},
        });

        return !existingOrg
    } catch (error: any) {
        console.error("Database error checking subdomain availability:", error);
        return {error: "Database error. Please try again later."};
    }
}

export async function getCompanies(ids: string[]) {
    const results = await prisma.company.findMany({
        where: {
            id: { in: ids },
        },
        include: {
            services: true,
            sites: true,
            certifications: {
                include: {
                    files: true,
                },
            },
            rfis: true,
            reviews: true,
        },
    });
    return results
}

export async function getPostComments(postId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                postId: postId
            },
            include: {
                author: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return {success: true, data: comments}
    } catch (error: any) {
        console.error("Database error finding comments:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function getPosts() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: true,
                comments: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return {success: true, data: posts}
    } catch (error: any) {
        console.error("Database error finding posts details:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

/* PRIVATE FUNCTION - these functions are only accessible to those that are part of the provided organization */
export const getAssets = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const fetchedAssets = await prisma?.tool.findMany({
                where: {organizationId: organization.id},
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: true
                        }
                    }
                },
                orderBy: [{ createdAt: "desc" }]
            })

            if (!fetchedAssets) {
                return {success: false, error: "tools not found"}
            }

            return {
                success: true,
                data: fetchedAssets
            }
        } catch (error: any) {
            logError("Error fetching tools", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getRFPs = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const fetchedRFPs = await prisma?.rFP.findMany({
                where: {organizationId: organization.id},
                include: {
                    contacts: true,
                    attachments: true,
                    milestones: {
                        include: {
                            milestone: true
                        }
                    }
                },
                orderBy: [{ createdAt: "desc" }]
            })

            if (!fetchedRFPs) {
                return {success: false, error: "RFPs not found"}
            }

            return {
                success: true,
                data: fetchedRFPs
            }
        } catch (error: any) {
            logError("Error fetching RFPs", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getMilestones = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const fetchedMilestones = await prisma?.milestone.findMany({
                where: {organizationId: organization.id},
                include: {roadmap: true}
            })

            if (!fetchedMilestones) {
                return {success: false, error: "milestones not found"};
            }

            return {
                success: true,
                data: fetchedMilestones
            };
        } catch (error: any) {
            logError("Error fetching members", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getInvitations = async () => {
    const session = await getSession()

    try {
        if (!session) {
            return {success: false, error: "Session not found."};
        }

        const invitations = await prisma?.invitation.findMany({
            where: {
                email: session.user.email,
                accepted: false
            },
        })

        if (!invitations) {
            return {success: false, error: "invitations not found"};
        }

        return {
            success: true,
            data: invitations
        };
    } catch (error: any) {
        logError("Error fetching invitations", error);
        return {success: false, error: "Internal server error"};
    }
}

export const getInvitees = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const fetchedInvitees = await prisma?.invitation.findMany({
                where: {organizationId: organization.id, accepted: false},
            })

            if (!fetchedInvitees) {
                return {success: false, error: "invitees not found"};
            }

            return {
                success: true,
                data: fetchedInvitees
            };
        } catch (error: any) {
            logError("Error fetching invitees", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getMemberRequestsWithUsers = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const fetchedMemberRequests = await prisma?.memberRequest.findMany({
                include: {user: true},
                where: {
                    organizationId: organization.id,
                },
            })

            // return {fetchedMemberRequests}

            if (!fetchedMemberRequests) {
                return {success: false, error: "user not found"};
            }

            return {
                success: true,
                data: {fetchedMemberRequests}
            };
        } catch (error: any) {
            logError("Error fetching member requests", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getRoadmaps = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const fetchedOrganization = await prisma.organization.findUnique({
                include: {roadmaps: {include: {milestones: true}}},
                where: {
                    id: decodeURIComponent(organization.id)
                }
            })

            if (!fetchedOrganization) {
                return {success: false, error: "organization not found"};
            }

            return {
                success: true,
                data: fetchedOrganization?.roadmaps
            };
        } catch (error: any) {
            logError("Error fetching roadmap id", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getRoadmap = withOrganizationAuth(
    async (authOrg: Organization, roadmapId: string | null | undefined) => {
        if (!roadmapId) return {success: false, error: "No roadmap id provided."}

        try {
            const organization = await prisma.organization.findUnique({
                where: {id: decodeURIComponent(authOrg.id)},
                include: {roadmaps: true},
            })

            if (!organization) return {success: false, error: "Organization not found."}

            const roadmap = await prisma.roadmap.findFirst({
                where: {
                    organizationId: organization.id,
                    id: roadmapId
                },
                include: {
                    nodes: {
                        include: {data: true},
                        orderBy: [{ createdAt: "desc" }]
                    },
                    milestones: {
                        include: {
                            node: true,
                            contacts: true,
                            attachments: true,
                            types: {include: { milestoneType: true }},
                            tools: {include: {tool: true}},
                            rfps: {include: {rfp: true}}
                        },
                        orderBy: [{ createdAt: "desc" }]
                    },
                    edges: true,
                    organization: true
                }
            })

            return {success: true, data: roadmap}
        } catch (error: any) {
            logError("Error fetching roadmap", error);
            return {success: false, error: "Internal server error."};
        }
    }
)

export const getOrganizationFromOrganizationId = withOrganizationAuth(
    async (authOrganization: Organization) => {
        try {
            let organization = await prisma.organization.findUnique({
                where: {
                    id: authOrganization.id,
                },
                include: {
                    roadmaps: true,
                    members: {
                        orderBy: {
                            createdAt: 'asc'
                        },
                        include: {
                            user: true
                        }
                    },
                    conditions: {
                        include: {
                            condition: true
                        }
                    }
                }
            });

            if (!organization) {
                return {success: false, error: "organization not found"};
            }

            // sort members list - move org owners to the beginning of the list
            organization.members = organization.members.sort((a, b) => {
                if (a.role === 'owner' && b.role !== 'owner') return -1
                if (b.role === 'owner' && a.role !== 'owner') return 1
                return 0
            })

            // sort members list - move comend users to the end of the list
            organization.members = organization.members.sort((a, b) => {
                if (a.email.includes(`@comendcare.com`) && !b.email.includes(`@comendcare.com`)) return 1
                if (b.email.includes(`@comendcare.com`) && !a.email.includes(`@comendcare.com`)) return -1
                return 0
            })

            return {success: true, data: organization};
        } catch (error: any) {
            logError("Error fetching organization data", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getConditionsFromOrganizationId = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const conditions = await prisma.condition.findMany({
                where: {
                    organizations: {
                        some: {
                            organizationId: organization.id, // Filter by organizationId
                        },
                    },
                },
                include: {
                    organizations: true, // Include related ConditionToOrganization data if needed
                },
            });

            if (!conditions || conditions.length === 0) {
                return {success: false, error: "No conditions found for the organization"};
            }

            return {success: true, data: conditions};
        } catch (error: any) {
            logError("Error fetching conditions for organization", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getAllNonMemberOrganizations = async () => {
    const session = await getSession()
    try {
        if (!session) {
            return {success: false, error: "Session not found."};
        }

        const organizations = await prisma.organization.findMany({
            where: {
                members: {
                    none: {
                        userId: session.user.id,
                    },
                },
            },
            orderBy: {
                createdAt: "asc"
            },
        })

        if (!organizations) {
            return {success: false, error: "organizations not found"};
        }

        return {success: true, data: organizations};
    } catch (error: any) {
        logError("Error fetching membership data", error);
        return {success: false, error: "Internal server error"};
    }
}

export const getAllMembershipsFromUserId = withUserAuth(
    async (user: User) => {
        try {
            const memberships = await prisma.member.findMany({
                where: {
                    userId: user.id
                },
                include: {
                    organization: true
                }
            });

            if (!memberships) {
                return {success: false, error: "memberships not found"};
            }

            return {success: true, data: memberships};
        } catch (error: any) {
            logError("Error fetching membership data", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getKanbanFromOrganizationId = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const kanban = await prisma.kanban.findUnique({
                where: {organizationId: organization.id}
            })

            return {success: true, data: kanban}
        } catch (error: any) {
            console.error("Database error finding task board details:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const getColumns = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const dbColumns = await prisma.column.findMany({
                where: {
                    kanban: {
                        organization: {
                            id: organization.id
                        }
                    }
                },
                orderBy: [
                    {kanbanPosition: 'asc'},
                ],
                include: {
                    tasks: {
                        orderBy: [{kanbanPosition: 'asc'}],
                        include: {
                            checklist: true,
                            stakeholders: {include: {user: true}},
                            milestone: true
                        }
                    }
                }
            })

            return {success: true, data: {columns: dbColumns}}
        } catch (error: any) {
            console.error("Database error finding column details:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const getSavedCompaniesFromOrganizationId = withOrganizationAuth(
    async (organization: Organization) => {
        try {
            const savedCompanies = await prisma?.savedCompany.findMany({
                where: {organizationId: organization.id},
                include: {
                    company: true,
                    milestone: true
                }
            })

            if (!savedCompanies) {
                return {success: false, error: "Saved companies not found"};
            }

            return {
                success: true,
                data: savedCompanies
            };
        } catch (error: any) {
            logError("Error fetching saved companies", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

/* USER FETCHERS - only the active user has access to these functions, usually fetching their own user data in some capacity */
export const getUser = withUserAuth(
    async (user: User) => {
        try {
            const fetchedUser = await prisma.user.findUnique({
                where: {id: user.id},
                include: {organizations: true},
            })

            if (!fetchedUser) {
                return {success: false, error: "user not found"};
            }

            return {
                success: true,
                data: fetchedUser
            };
        } catch (error: any) {
            logError("Error fetching user", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export async function isUserFollowing(id: string) {
    const session = await getSession()

    try {
        if (!session) {
            return {success: false, error: "Session not found."};
        }

        const follow = await prisma.follow.findUnique({
            where: {
                userId_followedType_followedId: {
                    userId: session.user.id,
                    followedType: "ORGANIZATION", // right now we only allow following organizations
                    followedId: id,
                },
            },
        })

        return {success: true, data: follow !== null}
    } catch (error: any) {
        console.error("Database error finding comments:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export const getAllNotifications = async () => {
    try {
        const session = await getSession()
        if (!session?.user.id) throw new Error("User ID or Organization ID not in session")
        
        const notifications = await prisma.platformNotification.findMany({
            where: {
                userId: session.user.id,
                organizationId: session.user.organizationId
            }
        })

        return {success: true, data: notifications}
    } catch (error: any) {
        logError("Error fetching notifications data", error);
        return {success: false, error: "Internal server error"};
    }
}

/* ADMIN PANEL FETCHERS - require admin priviledges to access these functions */
export const getOrganizationFromRoadmapId = withAdminAuth(
    async (roadmapId: string): Promise<ApiResponse<any>> => {
        try {
            const roadmap = await prisma.roadmap.findUnique({
                where: {
                    id: roadmapId
                },
                select: {
                    organizationId: true
                }
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

export const getResearchPlansAnalytics = withAdminAuth(
    async (orgId?: string | undefined) => {
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

        return {
            totalResearchPlans,
            totalResearchPlansOfType,
            totalResearchPlansByStatus,
            totalProjects,
            totalProjectsOfType
        };
    }
)

export const getToolsAnalytics = withAdminAuth(
    async (orgId?: string | undefined) => {
        const totalTools: number = (await prisma.tool.findMany({
            where: {
                organizationId: orgId
            }
        })).length
        const totalPinnedTools: number = (await prisma.tool.findMany({
            where: {
                organizationId: orgId,
                pinned: true
            }
        })).length

        return {
            totalTools,
            totalPinnedTools,
        };
    }
)

export const getRFPsAnalytics = withAdminAuth(
    async (orgId?: string | undefined) => {
        const allRFPs = await prisma.rFP.findMany({
            where: {
                organizationId: orgId
            }
        })
        const totalRFPs: number = allRFPs.length
        const totalPinnedRFPs: number = (await prisma.rFP.findMany({
            where: {
                organizationId: orgId,
                pinned: true
            }
        })).length

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
            totalPinnedRFPs,
            RFPsByOpenTo,
            RFPsByBudget
        };
    }
)

export const getOrganizationAnalytics = withAdminAuth(
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
            let conditions: Condition[] = [];
            const condResponse = await getConditionsFromOrganizationId(org.id);
            if (condResponse.success) conditions = (condResponse.data ?? []) as Condition[];
            const checks = getProfileCompletionChecks(org as any, conditions as any);
            const isComplete = Object.values(checks).every(Boolean);
            if (isComplete) completedProfiles++;
        }

        return {
            totalOrganizations,
            newOrganizationsThisMonth,
            newOrganizationsLastMonth,
            activeOrganizations,
            growthRate,
            completedProfiles
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

export const getUserWhitelist = withAdminAuth(
    async () => {
        try {
            const whitelist = await prisma.whitelist.findMany({
                orderBy: { createdAt: "desc" },
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
    async () =>  {
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

/* PHARMA PROTOTYPE FETCHERS - tbd how we want to use auth on these */

export async function getPharmaProjects() {
    try {
        const projects = await prisma.pharmaProject.findMany({
            orderBy: { createdAt: "desc" },
        })

        return {
            success: true,
            data: projects
        };
    } catch (error: any) {
        logError("Error fetching pharma projects", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getBiosampleData() {
    try {
        const data = await fs.readFile(
            path.join(process.cwd(), "data/pharma-data/biosamples.json")
        )

        const tasks = JSON.parse(data.toString())

        return {
            success: true,
            data: z.array(biosampleSchema).parse(tasks)
        };
    } catch (error: any) {
        logError("Error fetching biosamples", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getClinicalData() {
    try {
        const data = await fs.readFile(
            path.join(process.cwd(), "data/pharma-data/clinical.json")
        )

        const tasks = JSON.parse(data.toString())

        return {
            success: true,
            data: z.array(clinicalStudySchema).parse(tasks)
        };
    } catch (error: any) {
        logError("Error fetching clinical data", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getPreclinicalData() {
    try {
        const data = await fs.readFile(
            path.join(process.cwd(), "data/pharma-data/pre-clinical.json")
        )

        const tasks = JSON.parse(data.toString())

        return {
            success: true,
            data: z.array(preclinicalStudySchema).parse(tasks)
        };
    } catch (error: any) {
        logError("Error fetching pre-clinical data", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getIPData() {
    try {
        const data = await fs.readFile(
            path.join(process.cwd(), "data/pharma-data/ip.json")
        )

        const tasks = JSON.parse(data.toString())

        return {
            success: true,
            data: z.array(IPSchema).parse(tasks)
        };
    } catch (error: any) {
        logError("Error fetching ip data", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getPharmaProjectData(id: string) {
    return prisma.pharmaProject.findUnique({
        where: {
            id: id
        },
    })
}

export async function getAllOrganizationsWithConditions() {
    try {
        const organizations = await prisma.organization.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                conditions: {
                    include: {
                        condition: true
                    }
                },
            },
        })

        return {
            success: true,
            data: organizations
        };
    } catch (error: any) {
        logError("Error fetching organizations", error);
        return {success: false, error: "Internal server error"};
    }
}
