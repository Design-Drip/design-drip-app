"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Eye } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { DesignTemplate } from "@/app/admin/design-template/page";

interface DesignTemplateListProps {
  templates: DesignTemplate[];
  onEdit: (template: DesignTemplate) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  isLoading?: boolean;
}

export default function DesignTemplateList({
  templates,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
}: DesignTemplateListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: templates.length }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="p-0">
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="flex gap-2 w-full">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No templates found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {templates.map((template) => (
        <Card
          key={template._id}
          className="group hover:shadow-lg transition-shadow"
        >
          <CardHeader className="p-0">
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
              <Image
                src={template.imageUrl}
                alt={template.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-lg line-clamp-1" title={template.name}>
                {template.name}
              </CardTitle>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span className="capitalize text-blue-600 font-medium">
                {template.category.replace("-", " ")}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {formatDate(template.createdAt)}
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(template._id)}
              className="flex-1"
              title={template.isActive ? "Hide template" : "Show template"}
            >
              <Eye className="w-4 h-4 mr-1" />
              {template.isActive ? "Hide" : "Show"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(template)}
              title="Edit template"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(template._id)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
              title="Delete template"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
