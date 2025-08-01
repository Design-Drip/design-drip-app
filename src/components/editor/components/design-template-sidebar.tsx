import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader, Search } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { client } from "@/lib/hono";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

interface DesignTemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  selectedTemplateId?: string | null;
  onSelectTemplate?: (templateId: string | null) => void;
}

interface DesignTemplate {
  id: string;
  name: string;
  imageUrl: string;
  category: boolean;
}

export const DesignTemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  selectedTemplateId,
  onSelectTemplate,
}: DesignTemplateSidebarProps) => {
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchTemplates = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare query params
      const params: Record<string, string | number | boolean> = {
        page: 1,
        limit: 20,
        isActive: true,
      };

      // Add search term if provided
      if (search) {
        params.search = search;
      }

      const response = await client.api["design-templates"].$get({
        query: params,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch design templates");
      }

      const data = await response.json();
      setTemplates(
        data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          category: item.category,
        }))
      );
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTool === "design-templates") {
      fetchTemplates(debouncedSearchTerm);
    }
  }, [activeTool, debouncedSearchTerm]);

  const applyTemplate = (imageUrl: string, templateId: string) => {
    if (!editor) return;

    // Load the template image into the canvas
    editor.addImage(imageUrl);

    // Save the template ID if callback is provided
    if (onSelectTemplate) {
      console.log("Selected template ID:", templateId);
      onSelectTemplate(templateId);
      toast.success(
        "Template applied! Click Save to store your design with this template.",
        {
          duration: 5000,
        }
      );
    }
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "design-templates" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Design Templates"
        description="Apply templates to your design"
      />

      {selectedTemplateId && (
        <div className="mx-4 mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-700 flex items-center justify-between">
            <span>
              Selected template: <strong>{selectedTemplateId}</strong>
            </span>
            <Button
              variant="link"
              size="sm"
              className="p-1 h-auto text-xs text-blue-500"
              onClick={() => {
                if (onSelectTemplate) {
                  onSelectTemplate(null);
                  toast.success("Template removed");
                }
              }}
            >
              Remove
            </Button>
          </p>
        </div>
      )}

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-8"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => fetchTemplates(debouncedSearchTerm)}
            >
              Try Again
            </Button>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No templates found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "group cursor-pointer border rounded-md overflow-hidden transition-all",
                  selectedTemplateId === template.id
                    ? ""
                    : "hover:border-gray-300"
                )}
                onClick={() => applyTemplate(template.imageUrl, template.id)}
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src={template.imageUrl}
                    alt={template.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-2 bg-white border-t group-hover:bg-gray-50">
                  <p className="text-xs font-medium truncate">
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {template.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
