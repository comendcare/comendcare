"use server";

import prisma from "@comend/lib/prisma"
import { unstable_cache } from "@comend/lib/unstable-cache";
import { filterColumns } from "@comend/lib/filter-columns";
import type { GetBiosamplesSchema, GetTasksSchema } from "./validations";
import { PRIORITIES, STATUSES } from "@comend/components/types/data-table";
import {Status, Priority, Task} from "@prisma/client";

export async function getBiosamples(input: GetBiosamplesSchema) {
    return unstable_cache(
        async () => {
            try {
                const offset = (input.page - 1) * input.perPage;
                // const advancedTable =
                //     input.filterFlag === "advancedFilters" ||
                //     input.filterFlag === "commandFilters";
                const advancedTable = false

                let where: any = {};

                console.log(`input value`, input)

                if (advancedTable) {
                    where = filterColumns({
                        // table: "biosample",
                        filters: input.filters,
                        joinOperator: input.joinOperator,
                    });
                } else {
                    if (input.title) {
                        where.title = { contains: input.title, mode: "insensitive" };
                    }

                    if (input.private.length == 1) {
                        console.log(`private`, input.private)
                        // private only has two options, we only filter if ONE of them
                        // is selected...
                        where.private = input.private[0]
                    }

                    // if (input.status.length > 0) {
                    //     where.status = { in: input.status };
                    // }

                    // if (input.priority.length > 0) {
                    //     where.priority = { in: input.priority };
                    // }

                    // if (input.estimatedHours.length === 2) {
                    //     const [min, max] = input.estimatedHours;
                    //     where.estimatedHours = {
                    //         ...(min !== undefined ? { gte: min } : {}),
                    //         ...(max !== undefined ? { lte: max } : {}),
                    //     };
                    // }

                    // if (input.createdAt.length === 2) {
                    //     const [from, to] = input.createdAt;
                    //     const fromDate = from ? new Date(from) : undefined;
                    //     const toDate = to ? new Date(to) : undefined;

                    //     if (fromDate) fromDate.setHours(0, 0, 0, 0);
                    //     if (toDate) toDate.setHours(23, 59, 59, 999);

                    //     where.createdAt = {
                    //         ...(fromDate ? { gte: fromDate } : {}),
                    //         ...(toDate ? { lte: toDate } : {}),
                    //     };
                    // }
                }

                const orderBy = input.sort.length
                    ? input.sort.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" }))
                    : [{ createdAt: "asc" }];

                console.log(`where object`, where)

                const [data, total] = await prisma.$transaction([
                    prisma.tool.findMany({
                        skip: offset,
                        take: input.perPage,
                        where,
                        orderBy,
                    }),
                    prisma.tool.count({ where }),
                ]);

                const pageCount = Math.ceil(total / input.perPage);
                return { data, pageCount };
            } catch {
                return { data: [], pageCount: 0 };
            }
        },
        [JSON.stringify(input)],
        { revalidate: 1, tags: ["biosamples"] },
    )();
}

export async function getTasks(input: GetTasksSchema) {
    return unstable_cache(
        async () => {
            try {
                const offset = (input.page - 1) * input.perPage;
                const advancedTable =
                    input.filterFlag === "advancedFilters" ||
                    input.filterFlag === "commandFilters";

                let where: any = {};

                if (advancedTable) {
                    where = filterColumns({
                        // table: "task",
                        filters: input.filters,
                        joinOperator: input.joinOperator,
                    });
                } else {
                    if (input.title) {
                        where.title = { contains: input.title, mode: "insensitive" };
                    }

                    if (input.status.length > 0) {
                        where.status = { in: input.status };
                    }

                    if (input.priority.length > 0) {
                        where.priority = { in: input.priority };
                    }

                    if (input.estimatedHours.length === 2) {
                        const [min, max] = input.estimatedHours;
                        where.estimatedHours = {
                            ...(min !== undefined ? { gte: min } : {}),
                            ...(max !== undefined ? { lte: max } : {}),
                        };
                    }

                    if (input.createdAt.length === 2) {
                        const [from, to] = input.createdAt;
                        const fromDate = from ? new Date(from) : undefined;
                        const toDate = to ? new Date(to) : undefined;

                        if (fromDate) fromDate.setHours(0, 0, 0, 0);
                        if (toDate) toDate.setHours(23, 59, 59, 999);

                        where.createdAt = {
                            ...(fromDate ? { gte: fromDate } : {}),
                            ...(toDate ? { lte: toDate } : {}),
                        };
                    }
                }

                const orderBy = input.sort.length
                    ? input.sort.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" }))
                    : [{ createdAt: "asc" }];

                const [data, total] = await prisma.$transaction([
                    prisma.task.findMany({
                        skip: offset,
                        take: input.perPage,
                        where,
                        orderBy,
                    }),
                    prisma.task.count({ where }),
                ]);

                const pageCount = Math.ceil(total / input.perPage);
                return { data, pageCount };
            } catch {
                return { data: [], pageCount: 0 };
            }
        },
        [JSON.stringify(input)],
        { revalidate: 1, tags: ["tasks"] },
    )();
}

export async function getTaskStatusCounts() {
    return unstable_cache(
        async () => {
            try {
                const result = await prisma.task.groupBy({
                    by: ["status"],
                    _count: true,
                });

                const counts: Record<Status, number> = {
                    todo: 0,
                    in_progress: 0,
                    done: 0,
                    canceled: 0,
                };

                for (const row of result) {
                    counts[row.status as Status] = row._count;
                }

                return counts;
            } catch {
                return {
                    todo: 0,
                    in_progress: 0,
                    done: 0,
                    canceled: 0,
                };
            }
        },
        ["task-status-counts"],
        { revalidate: 3600 },
    )();
}

export async function getTaskPriorityCounts() {
    return unstable_cache(
        async () => {
            try {
                const result = await prisma.task.groupBy({
                    by: ["priority"],
                    _count: true,
                });

                const counts: Record<Priority, number> = {
                    low: 0,
                    medium: 0,
                    high: 0,
                };

                for (const row of result) {
                    counts[row.priority as Priority] = row._count;
                }

                return counts;
            } catch {
                return {
                    low: 0,
                    medium: 0,
                    high: 0,
                };
            }
        },
        ["task-priority-counts"],
        { revalidate: 3600 },
    )();
}

export async function getEstimatedHoursRange() {
    return unstable_cache(
        async () => {
            try {
                const result = await prisma.task.aggregate({
                    _min: { estimatedHours: true },
                    _max: { estimatedHours: true },
                });

                return {
                    min: result._min.estimatedHours ?? 0,
                    max: result._max.estimatedHours ?? 0,
                };
            } catch {
                return { min: 0, max: 0 };
            }
        },
        ["estimated-hours-range"],
        { revalidate: 3600 },
    )();
}
