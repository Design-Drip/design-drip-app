import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { CATEGORY_TEMPLATE } from "@/constants/size";

const templateFormSchema = z.object({
  name: z.string().min(1, {
    message: "Template name is required and at least 2 characters",
  }),
  imageUrl: z.string().min(1, {
    message: "Template image is required and at least 2 characters",
  }),
  category: z.enum(CATEGORY_TEMPLATE),
});

export type TemplateFormData = z.infer<typeof templateFormSchema>;

interface DesignTemplateFormProps {
  defaultValues?: Partial<TemplateFormData>;
  onSubmit: (data: TemplateFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

export default function DesignTemplateForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  isEdit = false,
}: DesignTemplateFormProps) {
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      category: "logo",
      ...defaultValues,
    },
  });

  const { watch, setValue } = form;
  const watchedImageUrl = watch("imageUrl");

  const handleImageUpload = (url: string) => {
    setValue("imageUrl", url);
    toast.success("Image upload successfully");
  };

  const removeImage = () => {
    setValue("imageUrl", "");
  };

  const showListCateTemplate = (list: string[]) => {
    return list.map((item, index) => (
      <SelectItem key={index} value={item}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </SelectItem>
    ));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Template Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter template name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Image Upload Field */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Template Image <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {watchedImageUrl ? (
                    <div className="space-y-2">
                      <div dir="rtl" className="flex justify-end">
                        <div className="relative inline-block">
                          <Image
                            src={watchedImageUrl}
                            alt="Template preview"
                            width={200}
                            height={150}
                            className="rounded-lg border object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute start-0 top-0 h-6 w-6 rounded-full p-0"
                            onClick={removeImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click the X to remove and upload a new image
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]?.ufsUrl) {
                            handleImageUpload(res[0].ufsUrl);
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Upload error: ${error.message}`);
                        }}
                        appearance={{
                          button:
                            "ut-ready:bg-blue-500 ut-uploading:cursor-not-allowed bg-blue-500 bg-none after:bg-blue-400",
                          allowedContent: "text-sm text-gray-600",
                        }}
                        content={{
                          button: "Upload Image",
                          allowedContent: "PNG, JPG, JPEG (max 8MB)",
                        }}
                      />

                      {/* Alternative: Drag & Drop */}
                      {/* 
                      <UploadDropzone
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]?.ufsUrl) {
                            handleImageUpload(res[0].ufsUrl)
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Upload error: ${error.message}`)
                        }}
                        appearance={{
                          container: "border-none bg-transparent",
                          uploadIcon: "text-muted-foreground",
                          label: "text-sm text-muted-foreground",
                          allowedContent: "text-xs text-muted-foreground",
                        }}
                        content={{
                          label: "Drag & drop your image here",
                          allowedContent: "PNG, JPG, JPEG (max 8MB)"
                        }}
                      />
                      */}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Field */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {showListCateTemplate([...CATEGORY_TEMPLATE])}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
