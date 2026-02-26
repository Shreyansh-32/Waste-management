import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const uploadRouter = {
  issueImages: f({ image: { maxFileSize: "8MB", maxFileCount: 5 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => ({
      url: file.url,
      key: file.key,
    })),

  completionImages: f({ image: { maxFileSize: "8MB", maxFileCount: 3 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => ({
      url: file.url,
      key: file.key,
    })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
