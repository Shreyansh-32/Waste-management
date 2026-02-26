import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { UploadRouter } from "@/lib/uploadthing"; 

// 1. Generate the UI Components separately
export const UploadButton = generateUploadButton<UploadRouter>();
export const UploadDropzone = generateUploadDropzone<UploadRouter>();

// 2. Generate the Hooks separately
export const { useUploadThing } = generateReactHelpers<UploadRouter>();