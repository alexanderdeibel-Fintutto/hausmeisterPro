import { Link } from "react-router-dom";
import { 
  ClipboardList, 
  Building, 
  Calendar, 
  MessageSquare,
  Plus,
  QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  {
    label: "Aufgaben",
    icon: ClipboardList,
    href: "/aufgaben",
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20",
  },
  {
    label: "Objekte",
    icon: Building,
    href: "/objekte",
    color: "text-blue-600",
    bgColor: "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50",
  },
  {
    label: "Kalender",
    icon: Calendar,
    href: "/kalender",
    color: "text-purple-600",
    bgColor: "bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50",
  },
  {
    label: "Nachrichten",
    icon: MessageSquare,
    href: "/nachrichten",
    color: "text-orange-600",
    bgColor: "bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50",
  },
];

export function QuickActions() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Schnellzugriff
      </h2>
      
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl p-4 transition-all active:scale-95",
              action.bgColor
            )}
          >
            <action.icon className={cn("h-6 w-6", action.color)} />
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
