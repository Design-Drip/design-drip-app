"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Grid, List, Edit, Eye, Trash2, Palette } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DesignTemplatesPage() {
  const router = useRouter();
  
  // Mock data for design templates
  const templates = [
    {
      id: 1,
      name: "Summer Collection",
      category: "Seasonal",
      status: "Published",
      views: 1250,
      likes: 89,
      image: "/placeholder.svg",
      createdAt: "2024-01-15",
      description: "Bright and colorful summer designs",
    },
    {
      id: 2,
      name: "Corporate Branding",
      category: "Business",
      status: "Draft",
      views: 450,
      likes: 23,
      image: "/placeholder.svg",
      createdAt: "2024-01-10",
      description: "Professional business templates",
    },
    {
      id: 3,
      name: "Holiday Special",
      category: "Event",
      status: "Published",
      views: 890,
      likes: 67,
      image: "/placeholder.svg",
      createdAt: "2024-01-05",
      description: "Festive holiday designs",
    },
  ];

  const handleEditTemplate = (templateId: number) => {
    router.push(`/designer_management/editor?template=${templateId}`);
  };

  const handleViewTemplate = (templateId: number) => {
    router.push(`/designer_management/editor?template=${templateId}&view=true`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Templates</h1>
          <p className="text-muted-foreground">
            Manage your design templates and track their performance.
          </p>
        </div>
        <Button onClick={() => router.push("/designer_management/editor")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
              />
            </div>
            <select className="flex h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors">
              <option value="all">All Categories</option>
              <option value="seasonal">Seasonal</option>
              <option value="business">Business</option>
              <option value="event">Event</option>
            </select>
            <select className="flex h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors">
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge
                  variant={template.status === "Published" ? "default" : "secondary"}
                >
                  {template.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{template.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Views:</span>
                  <span>{template.views}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Likes:</span>
                  <span>{template.likes}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{template.createdAt}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewTemplate(template.id)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditTemplate(template.id)}
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first design template to get started.
              </p>
              <Button onClick={() => router.push("/designer_management/editor")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 