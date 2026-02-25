"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#0f172a",
          color: "#f8fafc",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#0f172a",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#0f172a",
          },
        },
      }}
    />
  );
}
