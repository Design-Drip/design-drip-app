"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Palette, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import SavedDesigns from "@/components/saved-designs/SavedDesigns";

export default function MyDesignsPage() {
  const router = useRouter();

  const handleEditDesign = (designId: string) => {
    router.push(`/designer_management/editor?design=${designId}`);
  };

  const handleViewDesign = (designId: string) => {
    router.push(`/designer_management/editor?design=${designId}&view=true`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Designs</h1>
          <p className="text-muted-foreground">
            View and manage all your created designs.
          </p>
        </div>
        <Button onClick={() => router.push("/designer_management/editor")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Design
        </Button>
      </div>

      {/* Design Management */}
      <Card>
        <CardHeader>
          <CardTitle>All My Designs</CardTitle>
        </CardHeader>
        <CardContent>
          <SavedDesigns displayActionMenu={true} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push("/designer_management/editor")}
            >
              <Plus className="h-8 w-8 mb-2 text-purple-600" />
              <h3 className="font-medium">Create New Design</h3>
              <p className="text-sm text-muted-foreground">Start a new design project</p>
            </div>
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push("/designer_management/design-templates")}
            >
              <Palette className="h-8 w-8 mb-2 text-blue-600" />
              <h3 className="font-medium">Use Template</h3>
              <p className="text-sm text-muted-foreground">Start from a template</p>
            </div>
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push("/designer_management/editor?saved=true")}
            >
              <Eye className="h-8 w-8 mb-2 text-green-600" />
              <h3 className="font-medium">Browse Saved</h3>
              <p className="text-sm text-muted-foreground">View all saved designs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 