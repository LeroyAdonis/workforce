"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle, Clock, MapPin, Loader2 } from "lucide-react";

interface KPIMetrics {
  tasksCompleted: number;
  hoursWorked: number;
  visitsCount: number;
  efficiency: number;
}

export function KPIOverview() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestKPI();
  }, []);

  const fetchLatestKPI = async () => {
    try {
      setLoading(true);
      // Fetch latest KPI record for current user
      const res = await fetch("/api/kpi-records?limit=1&sortBy=date&sortOrder=desc");
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setMetrics(data.data[0].metrics as unknown as KPIMetrics);
      } else {
        // Fallback or empty state
        setMetrics({
          tasksCompleted: 0,
          hoursWorked: 0,
          visitsCount: 0,
          efficiency: 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch KPI records", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2 space-y-0 pt-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Tasks Done",
      value: metrics?.tasksCompleted || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Hours",
      value: metrics?.hoursWorked.toFixed(1) || "0.0",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Visits",
      value: metrics?.visitsCount || 0,
      icon: MapPin,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Efficiency",
      value: `${metrics?.efficiency || 0}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((item) => (
        <Card key={item.label} className="border-none shadow-sm overflow-hidden">
          <div className={`h-1 w-full ${item.bg.replace("bg-", "bg-opacity-100 ")} bg-current`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {item.label}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
