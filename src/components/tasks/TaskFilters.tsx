import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TaskStatus } from "@/types";

interface TaskFiltersProps {
  activeFilter: TaskStatus | "all";
  onFilterChange: (filter: TaskStatus | "all") => void;
  counts: {
    all: number;
    open: number;
    in_progress: number;
    completed: number;
  };
}

export function TaskFilters({ activeFilter, onFilterChange, counts }: TaskFiltersProps) {
  return (
    <div className="px-4 py-3 border-b bg-background sticky top-[73px] z-30">
      <Tabs value={activeFilter} onValueChange={(v) => onFilterChange(v as TaskStatus | "all")}>
        <TabsList className="w-full grid grid-cols-4 h-11">
          <TabsTrigger value="all" className="text-xs">
            Alle ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="open" className="text-xs">
            Offen ({counts.open})
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="text-xs">
            In Arbeit ({counts.in_progress})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Erledigt ({counts.completed})
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
