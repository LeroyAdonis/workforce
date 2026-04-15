"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Search, Loader2 } from "lucide-react";

interface Site {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

interface SiteSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (siteId: string, siteName: string) => void;
  onAddNew?: () => void;
}

export function SiteSelector({
  open,
  onOpenChange,
  onSelect,
  onAddNew,
}: SiteSelectorProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      fetchSites();
    }
  }, [open]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sites?isActive=true");
      const data = await res.json();
      if (data.success) {
        setSites(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sites", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (site: Site) => {
    onSelect(site.id, site.name);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Select Site</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-50 border-0"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No sites found
                </p>
              ) : (
                filtered.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => handleSelect(site)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {site.name}
                      </p>
                      {site.address && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {site.address}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {onAddNew && (
            <Button
              variant="outline"
              className="w-full border-0 bg-gray-50 hover:bg-gray-100 text-gray-700"
              onClick={() => {
                onOpenChange(false);
                onAddNew();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Site
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}