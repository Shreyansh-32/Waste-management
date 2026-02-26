import { generateReactHelpers } from "uploadthing/react";
import type { UploadRouter } from "@/lib/uploadthing";

export const { useUploadThing, UploadButton, UploadDropzone } =
  generateReactHelpers<UploadRouter>();
