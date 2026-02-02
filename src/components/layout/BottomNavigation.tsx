import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Building, Calendar, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

const navItems: NavItem[] = [
  { path: "/aufgaben", label: "Aufgaben", icon: ClipboardList },
  { path: "/objekte", label: "Objekte", icon: Building },
  { path: "/kalender", label: "Kalender", icon: Calendar },
  { path: "/nachrichten", label: "Nachrichten", icon: MessageSquare },
  { path: "/profil", label: "Profil", icon: User },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-nav safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] touch-target transition-colors",
                isActive 
                  ? "text-nav-active" 
                  : "text-nav-foreground hover:text-nav-active"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5]")} />
              <span className={cn(
                "text-xs",
                isActive ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
