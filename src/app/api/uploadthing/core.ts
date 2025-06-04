import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(() => {
      // Đơn giản hóa middleware cho môi trường phát triển
      // Không cần kiểm tra xác thực trong quá trình phát triển

      return { userId: "demo-user" };
    })
    .onUploadComplete(({ file }) => {
      console.log("Upload complete:", file.name);

      // Return the file URL
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
