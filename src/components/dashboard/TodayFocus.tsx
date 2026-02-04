import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TodayFocusProps {
  task: Task | null;
}

const priorityConfig = {
  low: { label: "Niedrig", className: "bg-primary/10 text-primary" },
  medium: { label: "Mittel", className: "bg-warning/20 text-warning-foreground" },
  high: { label: "Hoch", className: "bg-destructive/10 text-destructive" },
  urgent: { label: "Dringend", className: "bg-destructive/20 text-destructive" },
};

export function TodayFocus({ task }: TodayFocusProps) {
  if (!task) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 font-semibold text-foreground">Keine dringenden Aufgaben</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Super! Du hast alle wichtigen Aufgaben erledigt.
        </p>
      </div>
    );
  }

  const priority = priorityConfig[task.priority];
  const isUrgent = task.priority === "urgent" || task.priority === "high";

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-5 transition-all",
      isUrgent 
        ? "border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10" 
        : "border-border bg-card"
    )}>
      {isUrgent && (
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-destructive/10 blur-2xl" />
      )}
      
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
            {isUrgent && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fokus des Tages
              </span>
            </div>
            
            <h3 className="mt-2 text-lg font-semibold text-foreground line-clamp-2">
              {task.title}
            </h3>
            
            {task.building && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{task.building.name}</span>
                {task.unit && <span>• {task.unit.unit_number}</span>}
              </div>
            )}
          </div>
          
          <Badge className={cn("shrink-0", priority.className)}>
            {priority.label}
          </Badge>
        </div>
        
        <Link to={`/aufgaben/${task.id}`} className="mt-4 block">
          <Button className="w-full gap-2 touch-target">
            Jetzt starten
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
