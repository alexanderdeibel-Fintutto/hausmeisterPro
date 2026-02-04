import { Link } from "react-router-dom";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface UpcomingTasksProps {
  tasks: Task[];
}

const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">Keine anstehenden Aufgaben</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Anstehende Aufgaben
        </h2>
        <Link 
          to="/aufgaben" 
          className="text-xs font-medium text-primary hover:underline"
        >
          Alle anzeigen
        </Link>
      </div>
      
      <div className="space-y-2">
        {tasks.slice(0, 4).map((task, index) => (
          <Link
            key={task.id}
            to={`/aufgaben/${task.id}`}
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:shadow-md active:scale-[0.98]"
          >
            {/* Priority indicator */}
            <div className={cn(
              "h-10 w-1 rounded-full shrink-0",
              priorityColors[task.priority]
            )} />
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {task.title}
              </h3>
              {task.building && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{task.building.name}</span>
                </div>
              )}
            </div>
            
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
