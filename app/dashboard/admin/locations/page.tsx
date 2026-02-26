"use client";

import useSWR from "swr";
import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const locationTypes = ["CAMPUS", "BUILDING", "BLOCK", "FLOOR", "ROOM", "AREA"] as const;

interface LocationItem {
  id: string;
  name: string;
  type: string;
  qrCode: string | null;
  parent: { id: string; name: string } | null;
  _count: { issues: number };
}

export default function AdminLocationsPage() {
  const { data, isLoading, mutate } = useSWR("/api/locations", fetcher);
  const locations: LocationItem[] = data?.locations ?? [];

  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof locationTypes)[number]>("CAMPUS");
  const [parentId, setParentId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [creating, setCreating] = useState(false);

  const [qrLookup, setQrLookup] = useState("");
  const [qrResult, setQrResult] = useState<LocationItem | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const createLocation = async () => {
    if (!name.trim()) {
      toast.error("Location name is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          parentId: parentId || null,
          qrCode: qrCode.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Location created");
      setName("");
      setParentId("");
      setQrCode("");
      mutate();
    } catch {
      toast.error("Failed to create location");
    } finally {
      setCreating(false);
    }
  };

  const lookupQr = async () => {
    if (!qrLookup.trim()) return;
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/locations/qr/${encodeURIComponent(qrLookup.trim())}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQrResult(data.location);
    } catch {
      toast.error("QR lookup failed");
      setQrResult(null);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Create Location</h2>
          <div className="grid gap-3 mt-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Location name"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as (typeof locationTypes)[number])}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
            >
              {locationTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <option value="">No parent</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
              ))}
            </select>
            <input
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="QR code (optional)"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
            />
            <button
              onClick={createLocation}
              disabled={creating}
              className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create location"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">QR Lookup</h3>
          <div className="flex gap-2 mt-3">
            <input
              value={qrLookup}
              onChange={(e) => setQrLookup(e.target.value)}
              placeholder="Enter QR code"
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
            />
            <button
              onClick={lookupQr}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300"
            >
              {lookupLoading ? "Searching..." : "Lookup"}
            </button>
          </div>
          {qrResult && (
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm text-slate-600 dark:text-slate-300">
              <p className="font-semibold">{qrResult.name}</p>
              <p className="text-xs text-slate-400">{qrResult.type}</p>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">No locations created yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Locations</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {locations.map((loc) => (
              <div key={loc.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{loc.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {loc.type} {loc.parent ? `· Parent: ${loc.parent.name}` : ""}
                  </p>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">{loc._count.issues} issues</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
