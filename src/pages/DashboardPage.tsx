import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid3X3, ChevronRight, Sparkles } from "lucide-react";
import { 
  GreetingHeader, 
  QuickStats, 
  TodayFocus, 
  QuickActions, 
  UpcomingTasks,
  BuildingsOverview 
} from "@/components/dashboard";
import { CrossSellBanner } from "@/components/apps/CrossSellBanner";
import { Card, CardContent } from "@/components/ui/card";
import { useCrossSellTriggers } from "@/hooks/useCrossSellTriggers";
import type { Task, Building } from "@/types";

// Mock data - später durch echte Daten ersetzen
const mockUser = {
  full_name: "Max Mustermann",
};

const mockTasks: Task[] = [
  {
    id: "1",
    company_id: "c1",
    building_id: "b1",
    title: "Heizung in Wohnung 3B prüfen",
    description: "Mieter meldet kalte Heizkörper",
    priority: "urgent",
    status: "open",
    created_by: "user1",
    reported_by_name: "Familie Schmidt",
    created_at: new Date().toISOString(),
    building: { id: "b1", company_id: "c1", name: "Parkstraße 15", address: "Parkstraße 15, 80331 München", units_count: 12, created_at: "" },
    unit: { id: "u1", building_id: "b1", unit_number: "3B", status: "occupied" },
  },
  {
    id: "2",
    company_id: "c1",
    building_id: "b2",
    title: "Treppenhausbeleuchtung defekt",
    description: "Lampe im 2. OG funktioniert nicht",
    priority: "high",
    status: "open",
    created_by: "user1",
    created_at: new Date().toISOString(),
    building: { id: "b2", company_id: "c1", name: "Hauptstraße 42", address: "Hauptstraße 42, 80331 München", units_count: 8, created_at: "" },
  },
  {
    id: "3",
    company_id: "c1",
    building_id: "b1",
    title: "Mülltonnen bereitstellen",
    description: "Abholung morgen früh",
    priority: "medium",
    status: "open",
    created_by: "user1",
    created_at: new Date().toISOString(),
    building: { id: "b1", company_id: "c1", name: "Parkstraße 15", address: "Parkstraße 15, 80331 München", units_count: 12, created_at: "" },
  },
  {
    id: "4",
    company_id: "c1",
    building_id: "b3",
    title: "Winterdienst durchführen",
    description: "Gehwege streuen",
    priority: "low",
    status: "open",
    created_by: "user1",
    created_at: new Date().toISOString(),
    building: { id: "b3", company_id: "c1", name: "Gartenweg 7", address: "Gartenweg 7, 80331 München", units_count: 6, created_at: "" },
  },
];

const mockBuildings: Building[] = [
  { id: "b1", company_id: "c1", name: "Parkstraße 15", address: "Parkstraße 15, 80331 München", units_count: 12, created_at: "" },
  { id: "b2", company_id: "c1", name: "Hauptstraße 42", address: "Hauptstraße 42, 80331 München", units_count: 8, created_at: "" },
  { id: "b3", company_id: "c1", name: "Gartenweg 7", address: "Gartenweg 7, 80331 München", units_count: 6, created_at: "" },
  { id: "b4", company_id: "c1", name: "Lindenallee 23", address: "Lindenallee 23, 80331 München", units_count: 16, created_at: "" },
];

const mockStats = {
  tasksToday: 4,
  tasksCompleted: 12,
  hoursWorked: 33.5,
  unreadMessages: 2,
};

export default function DashboardPage() {
  const { data: triggers = [], isLoading: triggersLoading } = useCrossSellTriggers("hausmeisterpro");
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // Get the most urgent task as focus
  const focusTask = mockTasks.find(t => t.priority === "urgent" || t.priority === "high") || mockTasks[0];
  
  // Get remaining tasks (excluding focus)
  const upcomingTasks = mockTasks.filter(t => t.id !== focusTask?.id);

  // Get first active trigger for cross-sell
  const activeTrigger = triggers.find(t => t.is_active);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 py-6 space-y-6">
        {/* Greeting Header */}
        <GreetingHeader userName={mockUser.full_name} />

        {/* Quick Stats */}
        <QuickStats 
          tasksToday={mockStats.tasksToday}
          tasksCompleted={mockStats.tasksCompleted}
          hoursWorked={mockStats.hoursWorked}
          unreadMessages={mockStats.unreadMessages}
        />

        {/* Today's Focus */}
        <TodayFocus task={focusTask} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Cross-Sell Banner */}
        {activeTrigger && !dismissedBanner && (
          <CrossSellBanner 
            trigger={activeTrigger} 
            onDismiss={() => setDismissedBanner(true)}
          />
        )}

        {/* Upcoming Tasks */}
        <UpcomingTasks tasks={upcomingTasks} />

        {/* Buildings Overview */}
        <BuildingsOverview buildings={mockBuildings} />

        {/* Fintutto Apps Teaser */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-all border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5"
          onClick={() => {}}
        >
          <Link to="/apps">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Fintutto Apps</h3>
                    <p className="text-sm text-muted-foreground">Entdecke das gesamte Ökosystem</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
