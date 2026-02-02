import { Link } from "react-router-dom";
import { Building as BuildingIcon, ChevronRight, MapPin, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Building } from "@/types";

interface BuildingCardProps {
  building: Building;
  openTasks: number;
}

export function BuildingCard({ building, openTasks }: BuildingCardProps) {
  return (
    <Link to={`/objekte/${building.id}`}>
      <Card className="hover:shadow-md transition-shadow active:scale-[0.98] touch-target">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BuildingIcon className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {building.name}
                </h3>
                {openTasks > 0 && (
                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                    {openTasks} offen
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{building.address}</span>
              </div>
              
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  {building.units_count} Einheiten
                </span>
                {building.year_built && (
                  <span>Baujahr {building.year_built}</span>
                )}
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
