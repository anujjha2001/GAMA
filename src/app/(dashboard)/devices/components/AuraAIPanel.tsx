'use client';

import { Sparkles, BatteryWarning, ArrowRight, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AuraAIPanel() {
  const insights = [
    {
      type: "battery",
      title: "Battery Optimization",
      message: "Your Apple Watch is syncing every minute. A 5-minute interval is recommended to preserve battery.",
      action: "Optimize",
      icon: <BatteryWarning className="w-4 h-4 text-amber-400" />,
      color: "amber"
    },
    {
      type: "permission",
      title: "Missing Data",
      message: "GAMA is missing permission to read HRV data from Google Health Connect.",
      action: "Fix Permissions",
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      color: "rose"
    }
  ];

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-display font-medium text-white">Aura AI Insights</h3>
        <span className="text-xs text-muted-foreground ml-2">Device Intelligence</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-panel overflow-hidden border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent h-full relative group">
              <div className={`absolute inset-0 bg-${insight.color}-500/0 group-hover:bg-${insight.color}-500/5 transition-colors duration-500`} />
              <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center relative z-10 h-full">
                <div className={`w-10 h-10 rounded-full bg-${insight.color}-500/10 flex items-center justify-center shrink-0`}>
                  {insight.icon}
                </div>
                <div className="flex flex-col flex-1">
                  <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0 bg-white/5 border-white/10 hover:bg-white/10 text-xs h-8 shrink-0 rounded-lg">
                  {insight.action}
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
