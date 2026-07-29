import { Activity, Battery, CheckCircle2, RefreshCw, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DeviceOverview() {
  const overviewStats = [
    {
      title: "Connected Devices",
      value: "4",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Battery Average",
      value: "68%",
      icon: <Battery className="w-5 h-5 text-amber-500" />,
      color: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: "Last Sync",
      value: "2 min ago",
      icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      title: "Total Metrics",
      value: "142k",
      icon: <Activity className="w-5 h-5 text-purple-500" />,
      color: "bg-purple-500/10",
      border: "border-purple-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {overviewStats.map((stat, i) => (
        <Card key={i} className="glass-panel overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color} ${stat.border} border`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-display font-semibold mt-1 tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
            
            {/* Glow effect */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${stat.color.replace('/10', '')}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
