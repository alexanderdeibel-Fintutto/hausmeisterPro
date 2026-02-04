import { Link } from "react-router-dom";
import { Building, ChevronRight, Home, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Building as BuildingType } from "@/types";

interface BuildingsOverviewProps {
  buildings: BuildingType[];
}

export function BuildingsOverview({ buildings }: BuildingsOverviewProps) {
  if (buildings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Deine Objekte
        </h2>
        <Link 
          to="/objekte" 
          className="text-xs font-medium text-primary hover:underline"
        >
          Alle anzeigen
        </Link>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {buildings.slice(0, 5).map((building) => (
          <Link
            key={building.id}
            to={`/objekte/${building.id}`}
            className="group flex flex-col min-w-[140px] rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50 active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building className="h-5 w-5 text-primary" />
            </div>
            
            <h3 className="mt-3 font-medium text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {building.name}
            </h3>
            
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Home className="h-3 w-3" />
              <span>{building.units_count} Einheiten</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
