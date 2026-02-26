"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/uploadthing-client";
import toast from "react-hot-toast";

export default function CompleteAssignmentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const assignmentId = params.id;

  const [completionNote, setCompletionNote] = useState("");
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!completionPhotoUrl) {
      toast.error("Please upload a completion photo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completionNote,
          completionPhotoUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Unable to complete assignment");
      }

      toast.success("Assignment completed.");
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to complete assignment";
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Complete assignment</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add completion notes and upload proof.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Completion note</label>
                <textarea
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  className="min-h-[140px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Describe what was done to resolve the issue..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Completion photo</label>
                <UploadButton
                  endpoint="completionImages"
                  onClientUploadComplete={(res) => {
                    const url = res[0]?.url;
                    if (url) {
                      setCompletionPhotoUrl(url);
                      toast.success("Photo uploaded.");
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(error.message);
                  }}
                />
                {completionPhotoUrl && (
                  <p className="text-xs text-emerald-600">Photo uploaded</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200/80 transition disabled:cursor-not-allowed disabled:opacity-70 hover:shadow-emerald-300/80"
              >
                {isSubmitting ? "Submitting..." : "Submit completion"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
