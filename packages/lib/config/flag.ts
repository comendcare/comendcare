import { CommandIcon, FileSpreadsheetIcon } from "lucide-react";

export type FlagConfig = typeof flagConfig;

export const flagConfig: {featureFlags: any[]} = {
  featureFlags: [
    {
      label: "Advanced filters",
      value: "advancedFilters" as const,
      icon: FileSpreadsheetIcon,
      tooltipTitle: "Advanced filters",
      tooltipDescription: "Airtable like advanced filters for filtering rows.",
    },
  ],
};
