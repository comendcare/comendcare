import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import * as z from "zod";
import { flagConfig } from "@comend/lib/config/flag";
import { type Task, Status, Priority, Label, Tool } from "@prisma/client";
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@comend/lib/parsers";

// Manually define the enums to use in Zod
const statusEnum = z.enum(["todo", "in_progress", "done", "canceled"]);
const priorityEnum = z.enum(["low", "medium", "high"]);
const labelEnum = z.enum(["bug", "feature", "enhancement", "documentation"]);

export const searchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
      flagConfig.featureFlags.map((flag) => flag.value),
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Task>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  title: parseAsString.withDefault(""),
  status: parseAsArrayOf(statusEnum).withDefault([]),
  priority: parseAsArrayOf(priorityEnum).withDefault([]),
  estimatedHours: parseAsArrayOf(z.coerce.number()).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const biosampleRequestsSearchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
      flagConfig.featureFlags.map((flag) => flag.value),
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Tool>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  title: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.string()).withDefault([]),
  // types: parseAsArrayOf(z.string()).withDefault([]),
  // private: parseAsArrayOf(z.string().toLowerCase().transform((x) => x === 'true').pipe(z.boolean())).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const diseaseModelSearchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
      flagConfig.featureFlags.map((flag) => flag.value),
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Tool>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  title: parseAsString.withDefault(""),
  types: parseAsArrayOf(z.string()).withDefault([]),
  availability: parseAsArrayOf(z.string()).withDefault([]),
  currentCountry: parseAsString.withDefault(""),
  countryOfCollection: parseAsString.withDefault(""),
  quantity: parseAsArrayOf(z.coerce.number()).withDefault([]),
  private: parseAsArrayOf(z.string().toLowerCase().transform((x) => x === 'true').pipe(z.boolean())).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const biosampleSearchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
      flagConfig.featureFlags.map((flag) => flag.value),
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Tool>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  title: parseAsString.withDefault(""),
  types: parseAsArrayOf(z.string()).withDefault([]),
  availability: parseAsArrayOf(z.string()).withDefault([]),
  currentCountry: parseAsString.withDefault(""),
  countryOfCollection: parseAsString.withDefault(""),
  quantity: parseAsArrayOf(z.coerce.number()).withDefault([]),
  private: parseAsArrayOf(z.string().toLowerCase().transform((x) => x === 'true').pipe(z.boolean())).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createTaskSchema = z.object({
  title: z.string(),
  label: labelEnum,
  status: statusEnum,
  priority: priorityEnum,
  estimatedHours: z.coerce.number().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  label: labelEnum.optional(),
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  estimatedHours: z.coerce.number().optional(),
});

// Types
export type GetTasksSchema = Awaited<
    ReturnType<typeof searchParamsCache.parse>
>
export type GetDiseaseModelSchema = Awaited<
    ReturnType<typeof biosampleSearchParamsCache.parse>
>
export type GetBiosamplesSchema = Awaited<
    ReturnType<typeof biosampleSearchParamsCache.parse>
>
export type GetBiosampleRequestsSchema = Awaited<
    ReturnType<typeof biosampleRequestsSearchParamsCache.parse>
>
export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;
