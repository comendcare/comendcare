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
export function filterColumns<TWhere extends object>({
                                                       filters,
                                                       joinOperator,
                                                     }: {
  filters: ExtendedColumnFilter<any>[];
  joinOperator: JoinOperator;
}): TWhere | undefined {
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
          return getColumn(columns, { in: filter.value })
        } else if (filter.variant === "boolean" && typeof filter.value === "string") {
          return getColumn(columns, filter.value === "true")
        } else if (filter.variant === "date") {
          const date = new Date(filter.value);
          const start = startOfDay(date);
          const end = endOfDay(date);
          return getColumn(columns, { gte: start, lte: end })
        } else if (filter.variant === "range" && typeof filter.value === "string") {
          return getColumn(columns, JSON.parse(filter.value))
        } else {
          return getColumn(columns, filter.value)
        }
      case "ne":
        if (Array.isArray(filter.value)) {
          return getColumn(columns, { notIn: filter.value })
        } else if (filter.variant === "boolean") {
          return getColumn(columns, { not: filter.value === "true" })
        } else if (filter.variant === "date") {
          const date = new Date(filter.value);
          const start = startOfDay(date);
          const end = endOfDay(date);
          return { OR: [getColumn(columns, { lt: start }), getColumn(columns, { gt: end })] }
        } else if (filter.variant === "range" && typeof filter.value === "string") {
          return getColumn(columns,{ not:  JSON.parse(filter.value) })
        } else {
          return getColumn(columns, { not: filter.value })
        }
      case "iLike":
        return filter.variant === "text" && typeof filter.value === "string"
            ? getColumn(columns, { contains: filter.value, mode: "insensitive" })
            : undefined;
      case "notILike":
        return filter.variant === "text" && typeof filter.value === "string"
            ? { NOT: getColumn(columns, { contains: filter.value, mode: "insensitive" }) }
            : undefined;

      case "inArray":
        if (Array.isArray(filter.value)) {
          return getColumn(
              columns,
              (() => {
                if (filter.id === "status") {
                  return {in: filter.value}
                } else if (typeof filter.value[0] === "string") {
                  return {hasSome: filter.value}
                } else if (typeof filter.value[0] === "object") {
                  return {some: {OR: filter.value}}
                }
                return {}
                // return filter.id === "status"
                //   ? { in: filter.value }         // use `in` just for "status"
                //   : { some: {OR: filter.value} }   // use `hasSome` for everything else
              })()
          );
        }
        return undefined

      case "notInArray":
        if (Array.isArray(filter.value)) {
          return getColumn(columns, { hasSome: filter.value } )
        }
        return undefined;

      case "lt":
        return (filter.variant === "number" || filter.variant === "range") && typeof filter.value === "string"
            ? getColumn(columns, { lt: JSON.parse(filter.value) })
            : filter.variant === "date" && typeof filter.value === "string"
                ? getColumn(columns, { lt: endOfDay(new Date(filter.value)) })
                : undefined;
      case "lte":
        return (filter.variant === "number" || filter.variant === "range") && typeof filter.value === "string"
            ? getColumn(columns, { lte: JSON.parse(filter.value) })
            : filter.variant === "date" && typeof filter.value === "string"
                ? getColumn(columns, { lte: endOfDay(new Date(filter.value)) })
                : undefined;
      case "gt":
        return (filter.variant === "number" || filter.variant === "range") && typeof filter.value === "string"
            ? getColumn(columns, { gt: JSON.parse(filter.value) })
            : filter.variant === "date" && typeof filter.value === "string"
                ? getColumn(columns, { gt: startOfDay(new Date(filter.value)) })
                : undefined;
      case "gte":
        return (filter.variant === "number" || filter.variant === "range") && typeof filter.value === "string"
            ? getColumn(columns, { gte: JSON.parse(filter.value) })
            : filter.variant === "date" && typeof filter.value === "string"
                ? getColumn(columns, { gte: startOfDay(new Date(filter.value)) })
                : undefined;
      case "isBetween":
        if (filter.variant === "date") {
          return (
            Array.isArray(filter.value) &&
            filter.value.length === 2
                ? {
                  AND: [
                    filter.value[0] ? getColumn(columns, { gte: startOfDay(new Date(filter.value[0])) }) : undefined,
                    filter.value[1] ? getColumn(columns, { lte: endOfDay(new Date(filter.value[1])) }) : undefined,
                  ].filter(Boolean),
                }
                : undefined
          )
        }

        if (filter.variant === 'range') {
          return (
            Array.isArray(filter.value) &&
            filter.value.length === 2
              ? {
                AND: [
                  filter.value[0] !== undefined && filter.value[0] !== null ? getColumn(columns, { gte: JSON.parse(filter.value[0]) }) : undefined,
                  filter.value[1] !== undefined && filter.value[1] !== null ? getColumn(columns, { lte: JSON.parse(filter.value[1]) }) : undefined
                ]
              }
              : undefined
          )
        }

        return undefined
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

          return { AND: [getColumn(columns, { gte: startDate }), getColumn(columns, { lte: endDate })] };
        }
        return undefined;
      case "isEmpty":
        return getColumn(columns, {isEmpty: true})
      case "isNotEmpty":
        return { NOT: getColumn(columns, {isEmpty: true}) };
      default:
        throw new Error(`Unsupported operator: ${filter.operator}`);
    }
  });

  const validConditions = conditions.filter((condition) => condition !== undefined);

  //@ts-ignore
  return validConditions.length > 0 ? { [joinFn]: validConditions } : undefined;
}
