"use server"

import {unstable_cache} from "next/cache"
import prisma from "@comend/lib/prisma"
import {ApiResponse, milestoneCategories, RESEARCH_PLAN_TYPES} from "@comend/lib/types";
import {formatMoney, getProfileCompletionChecks, getStage, logError} from "@comend/lib/utils";
import {getSession, withOrganizationAuth, withUserAuth} from "@comend/lib/auth";
import {Condition, MaterialAndDataAccessRequest, Organization, Prisma, Researcher, User} from "@prisma/client";
import {promises as fs} from "fs";
import path from "path";
import {z} from "zod";
import {
    IPSchema,
    biosampleSchema,
    clinicalStudySchema,
    preclinicalStudySchema,
    taskSchema
} from "@comend/data/pharma-data/schema";
import {InternalArgs} from "@prisma/client/runtime/library"
import {omit} from "lodash";
import {getPubMedSearchResultIds, getPubMedSearchResultData} from "./pubmed";

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

    const sanitizedTools = tools.map(tool => omit(tool, []))

    return sanitizedTools
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
        select: {
            ...select,
            // filter out any private milestones if the user has requested to access milestones
            milestones: select.milestones ? ({
                include: {milestone: true},
                where: {milestone: {private: {equals: false}}}
            }) : undefined
        },
        orderBy: [{createdAt: "desc"}]
    })

    const sanitizedRFPs = rfps.map(rfp => omit(rfp, []))

    return sanitizedRFPs
}

export async function getPublicRFP(
    id: string,
    select: Prisma.RFPSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>
) {
    const rfp = await prisma.rFP.findUnique({
        where: {id, private: {equals: false}},
        select: {
            ...select,
            milestones: select.milestones ? ({
                where: {milestone: {private: {equals: false}}}
            }) : undefined
        }
    })

    const sanitizedRFP = omit(rfp, [])

    return rfp
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

    const roadmaps = await prisma.roadmap.findMany({
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
                            types: {include: {milestoneType: true}},
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
                orderBy: [{createdAt: "desc"}]
            }) : undefined,
            milestones: select.milestones ? ({
                where: {
                    private: false
                },
                include: {
                    node: true,
                    contacts: true,
                    attachments: true,
                    types: {include: {milestoneType: true}},
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
                orderBy: [{createdAt: "desc"}]
            }) : undefined
        },
        orderBy: [{createdAt: "desc"}]
    })

    const sanitizedRoadmaps = roadmaps.map(roadmap => omit(roadmap, [
        'metadata'
    ]))

    return sanitizedRoadmaps
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

        const sanitizedConditionData = omit(condition, ['metadata'])

        return {success: true, data: sanitizedConditionData};
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

        const sanitizedConditions = conditions.map(condition => omit(condition, ['metadata']))

        return {success: true, data: sanitizedConditions};
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
) {
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

            const sanitizedOrganization = omit(organization, [
                'contactEmailHash'
            ])

            return sanitizedOrganization
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

    const sanitizedOrganization = omit(organization, [
        'contactEmailHash',
    ])

    return {success: true, data: sanitizedOrganization}
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
    const company = prisma.company.findUnique({
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

    const sanitizedCompany = omit(company, [])
    return sanitizedCompany
}

export async function getMembers(
    organizationId: string | null | undefined,
    select: Prisma.MemberSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedMembers = await prisma?.member.findMany({
            where: {organizationId},
            select
        })


        if (!fetchedMembers) {
            return {success: false, error: "members not found"};
        }

        const sanitizedMembers = fetchedMembers.map(member => omit(member, [
            'emailHash'
        ]))

        return {
            success: true,
            data: sanitizedMembers
        };
    } catch (error: any) {
        logError("Error fetching members", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getPublicUser(
    userId: string,
    select: Prisma.UserSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    try {
        const user = await prisma.user.findUnique({
            where: {id: userId},
            select
        })

        if (!user) {
            return {success: false, error: "User not found"};
        }

        const sanitizedUser = omit(user, [
            'address1',
            'address1Hash',
            'address2',
            'address2Hash',
            'city',
            'cityHash',
            'country',
            'countryHash',
            'formattedAddress',
            'formattedAddressHash',
            'postalCode',
            'postalCodeHash',
            'region',
            'regionHash',
            'lat',
            'latHash',
            'lng',
            'lngHash',
            'notificationSettings',
            'consentSettings',
            'sessions',
        ])

        return {
            success: true,
            data: sanitizedUser
        };
    } catch (error: any) {
        logError("Error fetching user", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getToolTypes(
    select: Prisma.ToolTypeSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    try {
        const types = await prisma.toolType.findMany({select})
        return {success: true, data: types}
    } catch (error: any) {
        console.error("Database error finding tool types:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function getMilestoneTypes(
    select: Prisma.MilestoneTypeSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    try {
        const types = await prisma.milestoneType.findMany({select})
        return {success: true, data: types}
    } catch (error: any) {
        console.error("Database error finding milestone types:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function getPublicMilestoneDetails(
    id: string,
    select: Prisma.MilestoneSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    try {
        const milestone = await prisma.milestone.findUnique({
            where: {id},
            select: {
                ...select,
                types: select.types ? ({include: {milestoneType: true}}) : undefined,
                tools: select.tools ? ({
                    include: {
                        tool: {
                            include: {
                                milestones: {
                                    include: {milestone: true},
                                    where: {milestone: {private: {equals: false}}}
                                }
                            }
                        },
                    },
                    where: {tool: {private: {equals: false}}}
                }) : undefined,
                rfps: select.rfps ? ({
                    include: {
                        rfp: {
                            include: {
                                milestones: {
                                    include: {milestone: true},
                                    where: {milestone: {private: {equals: false}}}
                                }
                            }
                        },
                    },
                    where: {
                        rfp: {private: {equals: false}}
                    }
                }) : undefined
            }
        })

        const sanitizedMilestone = omit(milestone, ['notes'])

        return {success: true, data: sanitizedMilestone}
    } catch (error: any) {
        console.error("Database error finding milestone details:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function checkSubdomainAvailability(
    nickname: string,
): Promise<Boolean | { error: string }> {
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

export async function getPostComments(
    postId: string,
    select: Prisma.CommentSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    try {
        // const comments = await prisma.comment.findMany({
        //     where: {
        //         postId: postId
        //     },
        //     select,
        //     orderBy: {
        //         createdAt: "desc"
        //     }
        // })

        // const sanitizedComments = comments.map(comment => omit(comment, []))

        return {success: true, data: null}
    } catch (error: any) {
        console.error("Database error finding comments:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function getPosts(
    select: Prisma.PostSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>
) {
    try {
        const posts = await prisma.post.findMany({
            select,
            orderBy: {
                createdAt: "desc"
            }
        })

        const sanitizedPosts = posts.map(post => omit(post, []))

        return {success: true, data: sanitizedPosts}
    } catch (error: any) {
        console.error("Database error finding posts details:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

type SanitizeSelect<T extends Prisma.MilestoneSelect, K> = K extends keyof T ? never : T;

export async function getProjectRecommendations(
    projectId: string,
    select: Prisma.MilestoneSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>
) {
    try {
        const currentProject = await prisma.milestone.findUnique({
            where: {id: projectId},
            include: {
                types: {
                    select: {
                        milestoneTypeId: true
                    }
                }
            }
        })

        if (!currentProject) {
            logError(`Error fetching milestone`, new Error(`Could not find milestone with id ${projectId}`))
            return {success: false, error: "Internal server error"}
        }

        const typeIds = currentProject.types.map(t => t.milestoneTypeId)
        if (typeIds.length === 0) {
            return {success: true, data: []} // no types to match on
        }

        // Find all other milestones that share at least one of the same milestone types
        const sharedTypeProjects = await prisma.milestone.findMany({
            where: {
                id: {
                    not: projectId // Exclude the current project
                },
                private: false, // Only include public projects
                types: {
                    some: {
                        milestoneTypeId: {
                            in: typeIds
                        }
                    }
                }
            },
            select
        })

        return {success: true, data: sharedTypeProjects}
    } catch (e) {
        logError("Error fetching organizations", e)
        return {success: false, error: "Internal server error"}
    }
}

/* PRIVATE FUNCTION - these functions are only accessible to those that are part of the provided organization */
export const getAssets = withOrganizationAuth(
    async (
        organization: Organization,
        select: Prisma.ToolSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const fetchedAssets = await prisma?.tool.findMany({
                where: {organizationId: organization.id},
                select: {
                    ...select,
                    milestones: select.milestones ? ({
                        include: {milestone: true}
                    }) : undefined
                },
                orderBy: [{createdAt: "desc"}]
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
    async (
        organization: Organization,
        select: Prisma.RFPSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const fetchedRFPs = await prisma?.rFP.findMany({
                where: {organizationId: organization.id},
                select: {
                    ...select,
                    milestones: {include: {milestone: true}}
                },
                orderBy: [{createdAt: "desc"}]
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
    async (
        organization: Organization,
        select: Prisma.MilestoneSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const fetchedMilestones = await prisma?.milestone.findMany({
                where: {organizationId: organization.id},
                // include: {roadmap: true}
                select
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

export const getInvitations = async (
    select: Prisma.InvitationSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>
) => {
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
            select
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
    async (
        organization: Organization,
        select: Prisma.InvitationSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const fetchedInvitees = await prisma?.invitation.findMany({
                where: {organizationId: organization.id, accepted: false},
                select
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

export const getUserMemberRequests = withUserAuth(
    async (
        user: User,
        select: Prisma.MemberRequestSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        const session = await getSession()

        try {
            if (!session) {
                return {success: false, error: "Session not found."};
            }

            const fetchedMemberRequests = await prisma?.memberRequest.findMany({
                // include: {organization: true},
                where: {
                    userId: session.user.id,
                },
                select
            })

            if (!fetchedMemberRequests) {
                return {success: false, error: "User not found"};
            }

            return {
                success: true,
                data: fetchedMemberRequests
            };
        } catch (error: any) {
            logError("Error fetching member requests", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getMemberRequestsWithUsers = withOrganizationAuth(
    async (
        organization: Organization,
        select: Prisma.MemberRequestSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const fetchedMemberRequests = await prisma?.memberRequest.findMany({
                // include: {user: true},
                where: {
                    organizationId: organization.id,
                },
                select
            })

            // return {fetchedMemberRequests}

            if (!fetchedMemberRequests) {
                return {success: false, error: "User not found"};
            }

            return {
                success: true,
                data: fetchedMemberRequests
            };
        } catch (error: any) {
            logError("Error fetching member requests", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getRoadmaps = withOrganizationAuth(
    async (
        organization: Organization,
        select: Prisma.RoadmapSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const roadmaps = await prisma.roadmap.findMany({
                // include: {roadmaps: {include: {milestones: true}}},
                where: {
                    organizationId: decodeURIComponent(organization.id)
                },
                select
            })

            return {
                success: true,
                data: roadmaps
            };
        } catch (error: any) {
            logError("Error fetching roadmap id", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getRoadmap = withOrganizationAuth(
    async (
        authOrg: Organization,
        roadmapId: string | null | undefined,
        select: Prisma.RoadmapSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
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
                // include: {
                //     nodes: {
                //         include: {data: true},
                //         orderBy: [{ createdAt: "desc" }]
                //     },
                //     milestones: {
                //         include: {
                //             node: true,
                //             contacts: true,
                //             attachments: true,
                //             types: {include: { milestoneType: true }},
                //             tools: {include: {tool: true}},
                //             rfps: {include: {rfp: true}}
                //         },
                //         orderBy: [{ createdAt: "desc" }]
                //     },
                //     edges: true,
                //     organization: true
                // }
                select: {
                    ...select,
                    nodes: {
                        include: {data: true},
                        orderBy: [{createdAt: "desc"}]
                    },
                    milestones: {
                        include: {
                            node: true,
                            contacts: true,
                            attachments: true,
                            types: {include: {milestoneType: true}},
                            tools: {include: {tool: true}},
                            rfps: {include: {rfp: true}}
                        },
                        orderBy: [{createdAt: "desc"}]
                    }
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
    async (
        authOrganization: Organization,
        select: Prisma.OrganizationSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            let organization = await prisma.organization.findUnique({
                where: {
                    id: authOrganization.id,
                },
                // include: {
                //     roadmaps: true,
                //     members: {
                //         orderBy: {
                //             createdAt: 'asc'
                //         },
                //         include: {
                //             user: true
                //         }
                //     },
                //     conditions: {
                //         include: {
                //             condition: true
                //         }
                //     }
                // }
                select: {
                    ...select,
                    members: select.members ? ({
                        orderBy: {createdAt: 'asc'},
                        include: {user: true}
                    }) : undefined,
                    conditions: select.conditions ? ({
                        include: {condition: true}
                    }) : undefined
                }
            });

            if (!organization) {
                return {success: false, error: "organization not found"};
            }

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

            return {success: true, data: organization};
        } catch (e: any) {
            logError("Error fetching organization data", e);
            return {success: false, error: `Internal server error`};
        }
    }
)

export const getConditionsFromOrganizationId = withOrganizationAuth(
    async (
        organization: Organization,
        select: Prisma.ConditionSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const conditions = await prisma.condition.findMany({
                where: {
                    organizations: {
                        some: {
                            organizationId: organization.id, // Filter by organizationId
                        },
                    },
                },
                // include: {
                //     organizations: true, // Include related ConditionToOrganization data if needed
                // },
                select
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

export const getAllNonMemberOrganizations = async (
    select: Prisma.OrganizationSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>
) => {
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
            select,
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
    async (
        user: User,
        select: Prisma.MemberSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const memberships = await prisma.member.findMany({
                where: {
                    userId: user.id
                },
                // include: {
                //     organization: true,
                //     user: true
                // },
                select
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
    async (
        organization: Organization,
        select: Prisma.KanbanSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const kanban = await prisma.kanban.findUnique({
                where: {organizationId: organization.id},
                select
            })

            return {success: true, data: kanban}
        } catch (error: any) {
            console.error("Database error finding task board details:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }
)

export const getColumns = withOrganizationAuth(
    async (
        organization: Organization,
        select: Prisma.ColumnSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
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
                // include: {
                //     tasks: {
                //         orderBy: [{kanbanPosition: 'asc'}],
                //         include: {
                //             checklist: true,
                //             stakeholders: {include: {user: true}},
                //             milestone: true
                //         }
                //     }
                // }
                select: {
                    ...select,
                    tasks: select.tasks ? ({
                        orderBy: [{kanbanPosition: 'asc'}],
                        include: {
                            checklist: true,
                            stakeholders: {include: {user: true}},
                            milestone: true
                        }
                    }) : undefined
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
    async (
        organization: Organization,
        select: Prisma.SavedCompanySelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const savedCompanies = await prisma?.savedCompany.findMany({
                where: {organizationId: organization.id},
                // include: {
                //     company: true,
                //     milestone: true
                // }
                select
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

export const getSavedOrganizationsFromOrganizationId = withOrganizationAuth(
    async (
        organization: Organization,
        select: Prisma.SavedOrganizationSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const savedOrganizations = await prisma?.savedOrganization.findMany({
                where: {organizationId: organization.id},
                select
            })

            if (!savedOrganizations) {
                return {success: false, error: "Saved organizations not found"};
            }

            return {
                success: true,
                data: savedOrganizations
            };
        } catch (error: any) {
            logError("Error fetching saved organizations", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

/* USER FETCHERS - only the active user has access to these functions, usually fetching their own user data in some capacity */
export const getUser = withUserAuth(
    async (
        user: User,
        select: Prisma.UserSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const fetchedUser = await prisma.user.findUnique({
                where: {id: user.id},
                // include: {organizations: true},
                select
            })

            if (!fetchedUser) {
                return {success: false, error: "User not found"};
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

export const getAllNotifications = async (
    select: Prisma.PlatformNotificationSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>
) => {
    try {
        const session = await getSession()
        if (!session?.user.id) throw new Error("User ID or Organization ID not in session")

        const notifications = await prisma.platformNotification.findMany({
            where: {
                userId: session.user.id,
                organizationId: session.user.organizationId
            },
            select
        })

        return {success: true, data: notifications}
    } catch (error: any) {
        logError("Error fetching notifications data", error);
        return {success: false, error: "Internal server error"};
    }
}

/* PHARMA PROTOTYPE FETCHERS - tbd how we want to use auth on these */
export async function getPharmaProjects(
    select: Prisma.PharmaProjectSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>
) {
    try {
        const projects = await prisma.pharmaProject.findMany({
            orderBy: {createdAt: "desc"},
            select
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

export async function getPharmaProjectData<
    TSelect extends Prisma.PharmaProjectSelect
>(
    id: string,
    select: TSelect
): Promise<
    Prisma.PharmaProjectGetPayload<{ select: TSelect }> | null
> {
    return await prisma.pharmaProject.findUnique({
        where: {
            id: id
        },
        select
    })
}

export async function getAllOrganizations<
    TSelect extends Prisma.OrganizationSelect
>(
    select: Prisma.OrganizationSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>
): Promise<
    {
        success: boolean; data?: Array<Prisma.OrganizationGetPayload<{
            select: Prisma.OrganizationSelect<InternalArgs & {
                result: {};
                model: {};
                query: {};
                client: {};
            }>
        }>>; error?: string
    }
> {
    try {
        const organizations = await prisma.organization.findMany({
            orderBy: {createdAt: "desc"},
            select
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

export async function getTopPubMedPublications(keyword?: string) {
    try {
        const session = await getSession()
        const response = await getConditionsFromOrganizationId(session?.user.organizationId);

        if (response.success) {
            const conditions = response.data;

            if (conditions && conditions.length > 0) {
                // Default to first condition
                const cleanedKeyword = keyword?.trim();
                const query = cleanedKeyword
                    ? `${conditions[0].name} AND (${cleanedKeyword})`
                    : conditions[0].name;

                // Get only 5 for now
                const ids = await getPubMedSearchResultIds(query, 0, 5);
                const articles = await getPubMedSearchResultData(ids)

                return {
                    success: true,
                    data: articles.map(article => ({
                        title: article.title,
                        abstract: article.abstract,
                        authors: article.authors.map((a: { name: any }) => a.name),
                        keywords: article.keywords,
                        date: article.formattedPublishedDate,
                        url: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}`,
                        meta: {
                            publishedDate: article.publishedDate
                        }
                    }))
                }
            }
        } else {
            return {success: false, error: "Failed to find relevant conditions."}
        }
    } catch (error: any) {
        logError?.("Error fetching PubMed publications", error)
        return {success: false, error: "Failed to fetch publications"}
    }
}

export const getResearcher = withUserAuth(
    async (
        researcher: Researcher,
        select: Prisma.ResearcherSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const fetchedResearcher = await prisma.researcher.findUnique({
                where: {id: researcher.id},
                // include: {organizations: true},
                select
            })

            if (!fetchedResearcher) {
                return {success: false, error: "Researcher not found"};
            }

            return {
                success: true,
                data: fetchedResearcher
            };
        } catch (error: any) {
            logError("Error fetching researcher", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getResearcherFromUserId = withUserAuth(
    async (
        userId: string,
        select: Prisma.ResearcherSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        const session = await getSession();

        console.log("shit")
        try {
            if (!session) {
                return { success: false, error: "Session not found." };
            }

            console.log("Fuck")
            const fetchedResearcher = await prisma.researcher.findUnique({
                where: {userId: session.user.id},
                select
            })
            console.log(fetchedResearcher);

            if (!fetchedResearcher) {
                return {success: false, error: "Researcher not found"};
            }

            return {
                success: true,
                data: fetchedResearcher
            };
        } catch (error: any) {
            logError("Error fetching researcher", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getResearcherRequest = withUserAuth(
    async (
        request: MaterialAndDataAccessRequest,
        select: Prisma.MaterialAndDataAccessRequestSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        try {
            const fetchedRequest = await prisma.materialAndDataAccessRequest.findUnique({
                where: {id: request.id},
                // include: {organizations: true},
                select
            })

            if (!fetchedRequest) {
                return {success: false, error: "Request not found"};
            }

            return {
                success: true,
                data: fetchedRequest
            };
        } catch (error: any) {
            logError("Error fetching request", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getAllResearcherRequests = withUserAuth(
    async (
        request: MaterialAndDataAccessRequest,
        select: Prisma.MaterialAndDataAccessRequestSelect<InternalArgs & {
            result: {};
            model: {};
            query: {};
            client: {};
        }>
    ) => {
        const session = await getSession();

        try {
            if (!session) {
                return { success: false, error: "Session not found." };
            }

            const fetchedResearcher = await prisma.researcher.findUnique({
                where: { userId: session.user.id },
            });

            if (!fetchedResearcher) {
                return { success: false, error: "Researcher not found" };
            }

            const fetchedRequests = await prisma.materialAndDataAccessRequest.findMany({
                where: {researcherId: fetchedResearcher.id},
                select
            })

            if (!fetchedRequests) {
                return {success: false, error: "Requests not found"};
            }

            return {
                success: true,
                data: fetchedRequests
            };
        } catch (error: any) {
            logError("Error fetching requests", error);
            return {success: false, error: "Internal server error"};
        }
    }
)

export const getResearcherFromOrcidApi = withUserAuth(
    async () => {
        const session = await getSession();

        try {
            if (!session) {
                return { success: false, error: "Session not found." };
            }

            const fetchedResearcher = await prisma.researcher.findUnique({
                where: { userId: session.user.id },
            });

            if (!fetchedResearcher) {
                return { success: false, error: "Researcher not found" };
            }

            if (!fetchedResearcher.orcid) {
                return { success: false, error: "Researcher ORCID not available" };
            }

            const openAlexResponse = await fetch(
                `https://api.openalex.org/authors?filter=orcid:${fetchedResearcher.orcid}`
            );

            if (!openAlexResponse.ok) {
                throw new Error(`OpenAlex API error: ${openAlexResponse.statusText}`);
            }

            const openAlexData = await openAlexResponse.json();
            const authorData = openAlexData.results?.[0] || null;

            if (!authorData) {
                return { success: false, error: "OpenAlex author data not found." };
            }

            // Fetch publications (works)
            const worksUrl = authorData.works_api_url;
            const worksResponse = await fetch(`${worksUrl}&per-page=25`); // adjust per-page if needed

            if (!worksResponse.ok) {
                throw new Error(`OpenAlex works API error: ${worksResponse.statusText}`);
            }

            const worksData = await worksResponse.json();

            return {
                success: true,
                data: {
                    researcher: fetchedResearcher,
                    openAlex: authorData,
                    publications: worksData.results || [],
                },
            };
        } catch (error: any) {
            logError("Error fetching researcher", error);
            return { success: false, error: "Internal server error" };
        }
    }
);
