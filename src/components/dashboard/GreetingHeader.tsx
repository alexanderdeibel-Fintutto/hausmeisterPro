import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Sun, Moon, Cloud } from "lucide-react";

interface GreetingHeaderProps {
  userName: string;
}

export function GreetingHeader({ userName }: GreetingHeaderProps) {
  const hour = new Date().getHours();
  
  let greeting = "Guten Morgen";
  let Icon = Sun;
  let gradientClass = "from-amber-400 to-orange-500";
  
  if (hour >= 12 && hour < 17) {
    greeting = "Guten Tag";
    Icon = Cloud;
    gradientClass = "from-sky-400 to-blue-500";
  } else if (hour >= 17 || hour < 5) {
    greeting = "Guten Abend";
    Icon = Moon;
    gradientClass = "from-indigo-400 to-purple-500";
  }

  const today = format(new Date(), "EEEE, d. MMMM", { locale: de });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent p-6 text-primary-foreground">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5 blur-xl" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-primary-foreground/80 capitalize">
            {today}
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            {greeting}, {userName.split(" ")[0]}! 👋
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Lass uns heute gemeinsam großartige Arbeit leisten.
          </p>
        </div>
        
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
    </div>
  );
}
