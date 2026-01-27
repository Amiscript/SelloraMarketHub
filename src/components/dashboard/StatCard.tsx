import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "from-primary to-accent",
}: StatCardProps) => {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", iconColor)}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        {change && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              changeType === "positive" && "bg-success/10 text-success",
              changeType === "negative" && "bg-destructive/10 text-destructive",
              changeType === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold font-display">{value}</p>
    </div>
  );
};

export default StatCard;
