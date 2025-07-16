import { addDays, endOfDay, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";
import type { ExtendedColumnFilter, JoinOperator } from "@comend/components/types/data-table";

/**
 * Construct Prisma conditions based on the provided filters for a specific table.
 *
 * This function takes a table and an array of filters, and returns a Prisma
 * query object that represents the logical combination of these conditions. The conditions
 * are combined using the specified join operator (either 'AND' or 'OR'), which is determined
 * by the first filter's joinOperator property.
 *
 * Each filter can specify various operators (e.g., equality, inequality,
 * comparison for numbers and dates, etc.) and the function will generate the appropriate
 * Prisma query objects based on the filter's type and value.
 *
 * @param filters - An array of filters to be applied to the table.
 * @param joinOperator - The join operator to use for combining the filters.
 * @returns A Prisma query object representing the combined filters, or undefined if no valid
 * filters are found.
 */
export function filterColumns({
                                filters,
                                joinOperator,
                              }: {
  filters: ExtendedColumnFilter<any>[];
  joinOperator: JoinOperator;
}): Prisma.PrismaClientKnownRequestError | undefined {
  const joinFn = joinOperator === "and" ? "AND" : "OR";

  const getColumn = (keys: string[], finalVal: Object): Object => {
    if (keys.length === 0) return finalVal
    else return { [keys[0]]: getColumn(keys.slice(1), finalVal)}
  }

  const conditions = filters.map((filter) => {
    const column = filter.id;
    const columns = filter.id.split(".")

    console.log(`COLUMNS`, columns)

    switch (filter.operator) {
      case "eq":
        if (Array.isArray(filter.value)) {
          // return { [column]: { in: filter.value } };
          return getColumn(columns, { in: filter.value })
        } else if (filter.variant === "boolean" && typeof filter.value === "string") {
          // return { [column]: filter.value === "true" };
          return getColumn(columns, filter.value === "true")
        } else if (filter.variant === "date") {
          const date = new Date(filter.value);
          const start = startOfDay(date);
          const end = endOfDay(date);
          // return { [column]: { gte: start, lte: end } };
          return getColumn(columns, { gte: start, lte: end })
        } else {
          // return { [column]: filter.value };
          return getColumn(columns, filter.value)
        }
      case "ne":
        if (Array.isArray(filter.value)) {
          // return { [column]: { notIn: filter.value } };
          return getColumn(columns, { notIn: filter.value })
        } else if (filter.variant === "boolean") {
          // return { [column]: { not: filter.value === "true" } };
          return getColumn(columns, { not: filter.value === "true" })
        } else if (filter.variant === "date") {
          const date = new Date(filter.value);
          const start = startOfDay(date);
          const end = endOfDay(date);
          // return { OR: [{ [column]: { lt: start } }, { [column]: { gt: end } }] };
          return { OR: [getColumn(columns, { lt: start }), getColumn(columns, { gt: end })] }
        } else {
          // return { [column]: { not: filter.value } };
          return getColumn(columns, { not: filter.value })
        }
      case "iLike":
        return filter.variant === "text" && typeof filter.value === "string"
            // ? { [column]: { contains: filter.value, mode: "insensitive" } }
            ? getColumn(columns, { contains: filter.value, mode: "insensitive" })
            : undefined;
      case "notILike":
        return filter.variant === "text" && typeof filter.value === "string"
            // ? { NOT: { [column]: { contains: filter.value, mode: "insensitive" } } }
            ? getColumn(columns, { contains: filter.value, mode: "insensitive" })
            : undefined;

      case "inArray":
        if (Array.isArray(filter.value)) {
          // return {[column]: { hasSome: filter.value }}
          return getColumn(columns, { hasSome: filter.value })
        }
        return undefined;

      case "notInArray":
        if (Array.isArray(filter.value)) {
          // return { NOT: { [column]: { hasSome: filter.value } }}
          return getColumn(columns, { hasSome: filter.value } )
        }
        return undefined;

      case "lt":
        return filter.variant === "number"
            // ? { [column]: { lt: filter.value } }
            ? getColumn(columns, { lt: filter.value })
            : filter.variant === "date" && typeof filter.value === "string"
                // ? { [column]: { lt: endOfDay(new Date(filter.value)) } }
                ? getColumn(columns, { lt: endOfDay(new Date(filter.value)) })
                : undefined;
      case "lte":
        return filter.variant === "number"
            // ? { [column]: { lte: filter.value } }
            ? getColumn(columns, { lte: filter.value })
            : filter.variant === "date" && typeof filter.value === "string"
                // ? { [column]: { lte: endOfDay(new Date(filter.value)) } }
                ? getColumn(columns, { lte: endOfDay(new Date(filter.value)) })
                : undefined;
      case "gt":
        return filter.variant === "number"
            // ? { [column]: { gt: filter.value } }
            ? getColumn(columns, { gt: filter.value })
            : filter.variant === "date" && typeof filter.value === "string"
                // ? { [column]: { gt: startOfDay(new Date(filter.value)) } }
                ? getColumn(columns, { gt: startOfDay(new Date(filter.value)) })
                : undefined;
      case "gte":
        return filter.variant === "number"
            // ? { [column]: { gte: filter.value } }
            ? getColumn(columns, { gte: filter.value })
            : filter.variant === "date" && typeof filter.value === "string"
                // ? { [column]: { gte: startOfDay(new Date(filter.value)) } }
                ? getColumn(columns, { gte: startOfDay(new Date(filter.value)) })
                : undefined;
      case "isBetween":
        return filter.variant === "date" &&
        Array.isArray(filter.value) &&
        filter.value.length === 2
            // ? {
            //   AND: [
            //     filter.value[0] ? { [column]: { gte: startOfDay(new Date(filter.value[0])) } } : undefined,
            //     filter.value[1] ? { [column]: { lte: endOfDay(new Date(filter.value[1])) } } : undefined,
            //   ].filter(Boolean),
            // }
            ? {
              AND: [
                filter.value[0] ? getColumn(columns, { gte: startOfDay(new Date(filter.value[0])) }) : undefined,
                filter.value[1] ? getColumn(columns, { lte: endOfDay(new Date(filter.value[1])) }) : undefined,
              ].filter(Boolean),
            }
            : undefined;
      case "isRelativeToToday":
        if (filter.variant === "date" && typeof filter.value === "string") {
          const today = new Date();
          const [amount, unit] = filter.value.split(" ") ?? [];
          let startDate: Date;
          let endDate: Date;

          if (!amount || !unit) return undefined;

          switch (unit) {
            case "days":
              startDate = startOfDay(addDays(today, parseInt(amount)));
              endDate = endOfDay(startDate);
              break;
            case "weeks":
              startDate = startOfDay(addDays(today, parseInt(amount) * 7));
              endDate = endOfDay(addDays(startDate, 6));
              break;
            case "months":
              startDate = startOfDay(addDays(today, parseInt(amount) * 30));
              endDate = endOfDay(addDays(startDate, 29));
              break;
            default:
              return undefined;
          }

          // return { AND: [{ [column]: { gte: startDate } }, { [column]: { lte: endDate } }] };
          return { AND: [getColumn(columns, { gte: startDate }), getColumn(columns, { lte: endDate })] };
        }
        return undefined;
      case "isEmpty":
        // return { [column]: {isEmpty: true} };
        return getColumn(columns, {isEmpty: true})
      case "isNotEmpty":
        // return { NOT: { [column]: {isEmpty: true} } };
        return { NOT: getColumn(columns, {isEmpty: true}) };
      default:
        throw new Error(`Unsupported operator: ${filter.operator}`);
    }
  });

  const validConditions = conditions.filter((condition) => condition !== undefined);

  //@ts-ignore
  return validConditions.length > 0 ? { [joinFn]: validConditions } : undefined;
}
