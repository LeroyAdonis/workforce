"use client";

import { useState, useEffect } from "react";
import { KPIRing } from "@/components/kpi-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/worker/BottomNav";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { MapPin, Loader2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface KPIData {
  todaySites: number;
  todayKm: number;
  todayTarget: number;
  todayStatus: "green" | "amber" | "red";
  weeklySites: number;
  weeklyKm: number;
  weeklyTarget: number;
  weeklyStatus: "green" | "amber" | "red";
  monthlySites: number;
  monthlyKm: number;
  monthlyTarget: number;
  monthlyStatus: "green" | "amber" | "red";
}

export default function WorkerDashboardPage() {
  const router = useRouter();
  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [workerName, setWorkerName] = useState("Worker");

  useEffect(() => {
    fetchKPI();
  }, []);

  const fetchKPI = async () => {
    try {
      const res = await fetch("/api/worker/kpi");
      const data = await res.json();
      if (data.success) {
        setKpi(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch KPI", err);
    } finally {
      setLoading(false);
    }
  };

  const todayDate = new Date().toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-gray-900 to-blue-600 p-2 rounded-xl">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">
                Kinetic<span className="text-blue-600">Work</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Date + greeting */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">
            {todayDate}
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            Good progress, {workerName}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : kpi ? (
          <>
            {/* KPI Rings — Today */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-400">
                  Today&apos;s Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around items-center">
                  <KPIRing
                    value={kpi.todaySites}
                    max={kpi.todayTarget}
                    label="Sites"
                    sublabel={`${kpi.todaySites} / ${kpi.todayTarget}`}
                    status={kpi.todayStatus}
                    size="lg"
                  />
                  <KPIRing
                    value={Math.round(kpi.todayKm)}
                    max={150}
                    label="KM"
                    sublabel={`${kpi.todayKm} km`}
                    status={kpi.todayKm > 100 ? "green" : kpi.todayKm > 60 ? "amber" : "red"}
                    size="lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Weekly + Monthly */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-400">
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around">
                    <KPIRing
                      value={kpi.weeklySites}
                      max={kpi.weeklyTarget}
                      label="Sites"
                      sublabel={`${kpi.weeklySites} / ${kpi.weeklyTarget}`}
                      status={kpi.weeklyStatus}
                      size="sm"
                    />
                    <KPIRing
                      value={Math.round(kpi.weeklyKm)}
                      max={1000}
                      label="KM"
                      sublabel={`${kpi.weeklyKm} km`}
                      status="green"
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-400">
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around">
                    <KPIRing
                      value={kpi.monthlySites}
                      max={kpi.monthlyTarget}
                      label="Sites"
                      sublabel={`${kpi.monthlySites} / ${kpi.monthlyTarget}`}
                      status={kpi.monthlyStatus}
                      size="sm"
                    />
                    <KPIRing
                      value={Math.round(kpi.monthlyKm)}
                      max={4500}
                      label="KM"
                      sublabel={`${kpi.monthlyKm} km`}
                      status="green"
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Log CTA */}
            <Button
              onClick={() => router.push("/worker/log-visit")}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-gray-900 to-blue-600 hover:opacity-90 shadow-lg"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Log Site Visit
            </Button>
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>Could not load KPI data.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}