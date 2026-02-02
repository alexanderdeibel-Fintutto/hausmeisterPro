import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus } from "@/types";

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: "1",
    company_id: "c1",
    building_id: "b1",
    unit_id: "u1",
    title: "Wasserhahn tropft",
    description: "Der Wasserhahn in der Küche tropft seit 2 Tagen",
    priority: "high",
    status: "open",
    created_by: "user1",
    reported_by_name: "Herr Müller",
    created_at: "2024-01-15T10:00:00Z",
    building: { id: "b1", company_id: "c1", name: "Parkstraße 12", address: "Parkstraße 12, 10115 Berlin", units_count: 8, created_at: "" },
    unit: { id: "u1", building_id: "b1", unit_number: "3A", status: "occupied" },
  },
  {
    id: "2",
    company_id: "c1",
    building_id: "b1",
    title: "Treppenhausbeleuchtung defekt",
    description: "Die Lampe im 2. OG ist ausgefallen",
    priority: "medium",
    status: "in_progress",
    created_by: "user1",
    assigned_to: "user2",
    reported_by_name: "Frau Schmidt",
    created_at: "2024-01-14T14:30:00Z",
    building: { id: "b1", company_id: "c1", name: "Parkstraße 12", address: "Parkstraße 12, 10115 Berlin", units_count: 8, created_at: "" },
  },
  {
    id: "3",
    company_id: "c1",
    building_id: "b2",
    unit_id: "u2",
    title: "Heizung entlüften",
    description: "Heizung in Wohnzimmer wird nicht richtig warm",
    priority: "low",
    status: "completed",
    created_by: "user1",
    assigned_to: "user2",
    reported_by_name: "Herr Weber",
    created_at: "2024-01-10T09:00:00Z",
    completed_at: "2024-01-12T16:00:00Z",
    building: { id: "b2", company_id: "c1", name: "Lindenallee 5", address: "Lindenallee 5, 10115 Berlin", units_count: 12, created_at: "" },
    unit: { id: "u2", building_id: "b2", unit_number: "1B", status: "occupied" },
  },
  {
    id: "4",
    company_id: "c1",
    building_id: "b2",
    title: "Notfall: Rohrbruch",
    description: "Wasser tritt aus der Decke im Keller",
    priority: "urgent",
    status: "open",
    created_by: "user1",
    reported_by_name: "Hausmeister Schulz",
    created_at: "2024-01-16T08:00:00Z",
    building: { id: "b2", company_id: "c1", name: "Lindenallee 5", address: "Lindenallee 5, 10115 Berlin", units_count: 12, created_at: "" },
  },
];

export default function TasksPage() {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [tasks] = useState<Task[]>(mockTasks);

  const filteredTasks = filter === "all" 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const counts = {
    all: tasks.length,
    open: tasks.filter(t => t.status === "open").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Aufgaben" 
        subtitle={`${counts.open} offen`}
        action={
          <Button variant="ghost" size="icon" className="touch-target">
            <Filter className="h-5 w-5" />
          </Button>
        }
      />

      <TaskFilters 
        activeFilter={filter} 
        onFilterChange={setFilter}
        counts={counts}
      />

      <div className="px-4 py-4 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Keine Aufgaben gefunden</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-40"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
