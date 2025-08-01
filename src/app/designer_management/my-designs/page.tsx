"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Palette } from "lucide-react";
import { SavedDesignsByQuote } from "./SavedDesignsByQuote";
import { useRouter } from "next/navigation";
import useGetDesign from "@/features/design/use-get-design";

export default function DesignerMyDesignsPage() {
  const router = useRouter();
  const { data: designsData, isLoading, error } = useGetDesign();
  
  // Debug logs chi tiết
  console.log("DesignerMyDesignsPage - designsData:", designsData);
  console.log("DesignerMyDesignsPage - designsData?.data:", designsData?.data);
  console.log("DesignerMyDesignsPage - designsData?.success:", designsData?.success);
  
  const designs = (designsData?.data || []) as any[];

  // Debug logs
  console.log("DesignerMyDesignsPage - designs:", designs);
  console.log("DesignerMyDesignsPage - designs length:", designs.length);
  console.log("DesignerMyDesignsPage - isLoading:", isLoading);
  console.log("DesignerMyDesignsPage - error:", error);

  if (isLoading) {
    return <div>Loading designs...</div>;
  }

  if (error) {
    return <div>Error loading designs: {error.message}</div>;
  }

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



      {/* Saved Designs by Quote */}
      <Card>
        <CardHeader>
          <CardTitle>Quote-Based Designs</CardTitle>
        </CardHeader>
        <CardContent>
          {designs.length === 0 ? (
            <div>
              <p>No designs found. Debug info:</p>
              <pre>{JSON.stringify({ designsData, designs }, null, 2)}</pre>
            </div>
          ) : (
            <SavedDesignsByQuote designs={designs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 