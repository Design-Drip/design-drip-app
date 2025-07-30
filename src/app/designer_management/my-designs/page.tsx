"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Palette } from "lucide-react";
import SavedDesignsDesigner from "@/components/saved-designs/SavedDesignsDesigner";
import { useRouter } from "next/navigation";

export default function DesignerMyDesignsPage() {
  const router = useRouter();

  return (
    <div className="container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Saved Designs</h1>
          <p className="text-muted-foreground">
            Manage and view all your saved designs
          </p>
        </div>

      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              All your saved designs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Designs</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Created this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Design Versions</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Multiple versions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Saved Designs */}
      <Card>
        <CardHeader>
          <CardTitle>All Saved Designs</CardTitle>
        </CardHeader>
        <CardContent>
          <SavedDesignsDesigner displayActionMenu={true} />
        </CardContent>
      </Card>
    </div>
  );
} 