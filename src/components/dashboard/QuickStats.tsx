import { ClipboardCheck, Clock, MessageSquare, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  color: string;
}

interface QuickStatsProps {
  tasksToday: number;
  tasksCompleted: number;
  hoursWorked: number;
  unreadMessages: number;
}

export function QuickStats({ tasksToday, tasksCompleted, hoursWorked, unreadMessages }: QuickStatsProps) {
  const stats: StatItem[] = [
    {
      label: "Heute",
      value: tasksToday,
      icon: ClipboardCheck,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Erledigt",
      value: tasksCompleted,
      icon: TrendingUp,
      trend: 12,
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: "Stunden",
      value: hoursWorked,
      icon: Clock,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Nachrichten",
      value: unreadMessages,
      icon: MessageSquare,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center rounded-xl bg-card p-3 shadow-sm border"
        >
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.color)}>
            <stat.icon className="h-5 w-5" />
          </div>
          <span className="mt-2 text-lg font-bold text-foreground">{stat.value}</span>
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
