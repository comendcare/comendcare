import prisma from '@comend/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { ids } = await req.json();
        if (!ids || ids.length === 0) return NextResponse.json([], { status: 200 });

        const results = await prisma.milestone.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                organization: {include: {members: true}},
                node: true,
                contacts: true,
                attachments: true,
                companies: {include: {company: true}},
                institutions: {include: {institution: true}},
                createFacilityRequests: true,
                types: ({include: {milestoneType: true}}),
                biosamples: ({
                    include: {
                        biosample: {
                            include: {
                                milestones: {
                                    include: {milestone: true},
                                    where: {milestone: {private: {equals: false}}}
                                }
                            }
                        },
                    },
                    where: {biosample: {private: {equals: false}}}
                }),
                diseaseModels: ({
                    include: {
                        diseaseModel: {
                            include: {
                                milestones: {
                                    include: {milestone: true},
                                    where: {milestone: {private: {equals: false}}}
                                }
                            }
                        },
                    },
                    where: {diseaseModel: {private: {equals: false}}}
                }),
                tools: ({
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
                }),
                rfps: ({
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
                })
            }
        });

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Prisma fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
