"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteSelector } from "@/components/site-selector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";

export default function LogVisitPage() {
  const router = useRouter();
  const [siteSelectorOpen, setSiteSelectorOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedSiteName, setSelectedSiteName] = useState<string | null>(null);
  const [kms, setKms] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill km from GPS
  const handleAutoFillKm = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        // In a real implementation, you'd calculate distance from last known position
        // For now, prompt is enough — the worker enters km manually
        setError(null);
      },
      () => {
        setError("Could not get your location. Please enter km manually.");
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) {
      setError("Please select a site.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/worker/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: selectedSiteId,
          kmsCovered: kms ? parseFloat(kms) : null,
          inspectionNotes: notes || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/worker/dashboard"), 1500);
      } else {
        setError(data.error || "Failed to log visit.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-0 shadow-lg">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Visit Logged!
            </h2>
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-lg">Log Visit</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Site selector */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Site
            </Label>
            <button
              type="button"
              onClick={() => setSiteSelectorOpen(true)}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="bg-blue-50 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                {selectedSiteName ? (
                  <>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedSiteName}
                    </p>
                    <p className="text-xs text-gray-500">Tap to change</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-500">
                      Select a site...
                    </p>
                    <p className="text-xs text-gray-400">Tap to open selector</p>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* KM input */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Kilometers Covered
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 24.5"
                  value={kms}
                  onChange={(e) => setKms(e.target.value)}
                  className="pl-9 bg-white border-0 shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAutoFillKm}
                className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
                title="Auto-fill from GPS"
              >
                GPS
              </button>
            </div>
          </div>

          {/* Inspection notes */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Inspection Notes
            </Label>
            <Textarea
              placeholder="What did you observe? Any issues or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="bg-white border-0 shadow-sm resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting || !selectedSiteId}
            className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-gray-900 to-blue-600 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Log Visit"
            )}
          </Button>
        </form>
      </main>

      <SiteSelector
        open={siteSelectorOpen}
        onOpenChange={setSiteSelectorOpen}
        onSelect={(id, name) => {
          setSelectedSiteId(id);
          setSelectedSiteName(name);
        }}
        onAddNew={() => {
          // For now, just show a prompt — admin would create the site
          alert("Please ask your admin to add new sites.");
        }}
      />
    </div>
  );
}