"use client";

import { useQueryState } from "nuqs";
import * as React from "react";

import { ToggleGroup, ToggleGroupItem } from "./../../../ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./../../../ui/tooltip";
import { type FlagConfig, flagConfig } from "./../../../../../packages/lib/config/flag";
import { Tabs, TabsList, TabsTrigger } from "./../../../ui/tabs";

type FilterFlag = FlagConfig["featureFlags"][number]["value"];

interface FeatureFlagsContextValue {
  filterFlag: FilterFlag;
  enableAdvancedFilter: boolean;
}

const FeatureFlagsContext =
  React.createContext<FeatureFlagsContextValue | null>(null);

export function useFeatureFlags() {
  const context = React.useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagsProvider",
    );
  }
  return context;
}

interface FeatureFlagsProviderProps {
  additionalButtons?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureFlagsProvider({ additionalButtons, children }: FeatureFlagsProviderProps) {
  const [filterFlag, setFilterFlag] = useQueryState<FilterFlag | null>(
    "filterFlag",
    {
      parse: (value) => {
        if (!value) return null;
        const validValues = flagConfig.featureFlags.map((flag: any) => flag.value);
        return validValues.includes(value as FilterFlag)
          ? (value as FilterFlag)
          : null;
      },
      serialize: (value) => value ?? "",
      defaultValue: null,
      clearOnDefault: true,
      shallow: false,
      eq: (a, b) => (!a && !b) || a === b,
    },
  );

  const onFilterFlagChange = React.useCallback(
    (value: FilterFlag) => {
      setFilterFlag(value);
    },
    [setFilterFlag],
  );

  const contextValue = React.useMemo<FeatureFlagsContextValue>(
    () => ({
      filterFlag,
      enableAdvancedFilter:
        filterFlag === "advancedFilters" || filterFlag === "commandFilters",
    }),
    [filterFlag],
  );

  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      <div className="w-full overflow-x-auto p-1">
        <div className="flex gap-2 w-full">
          <Tabs 
            value={filterFlag || flagConfig.featureFlags[0].value }
            onValueChange={onFilterFlagChange}
            className="mr-auto"
          >
            <TabsList>
              {flagConfig.featureFlags.map((flag) => (
                <Tooltip key={flag.value}>
                    <TooltipTrigger>
                      <TabsTrigger value={flag.value} className="flex gap-2">
                          <flag.icon className="size-3.5 shrink-0" />
                          {flag.label}
                      </TabsTrigger>
                    </TooltipTrigger>
                  <TooltipContent
                    align="start"
                    side="top"
                    sideOffset={6}
                    className="flex flex-col gap-1.5 border bg-background py-2 font-semibold text-foreground [&>span]:hidden"
                  >
                    <div>{flag.tooltipTitle}</div>
                    <p className="text-balance text-muted-foreground text-xs">
                      {flag.tooltipDescription}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TabsList>
          </Tabs>

          {additionalButtons}
        </div>
      </div>
      {children}
    </FeatureFlagsContext.Provider>
  );
}
