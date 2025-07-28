import { CommandIcon, FileSpreadsheetIcon, Filter } from "lucide-react";

export type FlagConfig = typeof flagConfig;

export const flagConfig: {featureFlags: any[]} = {
  featureFlags: [
    {
      label: "Standard filters",
      value: "standardFilters" as const,
      icon: Filter,
      tooltipTitle: "Standard filters",
      tooltipDescription: "Basic filters for the most common filtering cases.",
    },
    {
      label: "Advanced filters",
      value: "advancedFilters" as const,
      icon: FileSpreadsheetIcon,
      tooltipTitle: "Advanced filters",
      tooltipDescription: "Airtable like advanced filters for filtering rows.",
    },
  ],
};
