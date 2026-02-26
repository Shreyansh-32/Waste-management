"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/ui/Button";
import { UploadButton } from "@/lib/uploadthing-client";
import toast from "react-hot-toast";

const categories = [
  "WASHROOM",
  "CLASSROOM",
  "HOSTEL",
  "CANTEEN",
  "CORRIDOR",
  "LAB",
  "OUTDOOR",
  "OTHER",
] as const;

type IssueCategory = (typeof categories)[number];

export default function ReportIssuePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("WASHROOM");
  const [locationId, setLocationId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!photoUrls.length) {
      toast.error("Please upload at least one photo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          description,
          category,
          locationId,
          isAnonymous,
          photoUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Unable to create issue");
      }

      toast.success("Issue reported successfully.");
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create issue";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-6 py-20">
          <form
            onSubmit={onSubmit}
            className="w-full rounded-3xl border border-emerald-100/60 dark:border-emerald-900/40 bg-white/90 dark:bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur"
          >
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Report an issue</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload photos and describe the cleanliness issue.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Title (optional)</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Overflow in Block A washroom"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[140px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Describe the issue in detail..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {categories.map((value) => (
                    <option key={value} value={value}>
                      {value.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Location ID</label>
                <input
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Paste the location ID or scan QR"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You can use the QR lookup endpoint to fetch the location ID.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="anonymous"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="anonymous" className="text-sm text-slate-600 dark:text-slate-300">
                  Report anonymously
                </label>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Photos</label>
                <UploadButton
                  endpoint="issueImages"
                  appearance={{
                    container: "w-full",
                    button:
                      "w-full rounded-2xl border border-emerald-200 bg-emerald-50 !text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-slate-900 dark:!text-emerald-100 dark:hover:bg-slate-800",
                    label: "!text-emerald-900 dark:!text-emerald-100",
                    allowedContent: "text-xs text-slate-500 dark:text-slate-400",
                  }}
                  onClientUploadComplete={(res) => {
                    const urls = res.map((file) => file.url);
                    setPhotoUrls(urls);
                    toast.success("Photos uploaded.");
                  }}
                  onUploadError={(error) => {
                    toast.error(error.message);
                  }}
                />
                {photoUrls.length > 0 && (
                  <p className="text-xs text-emerald-600">{photoUrls.length} photo(s) uploaded</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200/80 transition disabled:cursor-not-allowed disabled:opacity-70 hover:shadow-emerald-300/80"
              >
                {isSubmitting ? "Submitting..." : "Submit issue"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
