"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Image, TrendingUp, Users, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import SavedDesigns from "@/components/saved-designs/SavedDesigns";

export default function DesignerManagementPage() {
  const router = useRouter();
  
  // Mock data for designer dashboard
  const stats = {
    totalDesigns: 24,
    publishedDesigns: 18,
    totalViews: 1250,
    totalLikes: 89,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Designer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your designs and track your performance.
          </p>
        </div>
        <Button onClick={() => router.push("/designer_management/editor")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Design
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDesigns}</div>
            <p className="text-xs text-muted-foreground">
              Your created designs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Image className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedDesigns}</div>
            <p className="text-xs text-muted-foreground">
              Public designs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Design views
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
            <p className="text-xs text-muted-foreground">
              Received likes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New design published</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Design template updated</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New design started</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
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
              <Palette className="h-8 w-8 mb-2 text-purple-600" />
              <h3 className="font-medium">Create New Design</h3>
              <p className="text-sm text-muted-foreground">Start a new design project</p>
            </div>
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push("/designer_management/design-templates")}
            >
              <Image className="h-8 w-8 mb-2 text-blue-600" />
              <h3 className="font-medium">Manage Templates</h3>
              <p className="text-sm text-muted-foreground">Create and edit design templates</p>
            </div>
            <div 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push("/designer_management/my-designs")}
            >
              <Eye className="h-8 w-8 mb-2 text-green-600" />
              <h3 className="font-medium">View My Designs</h3>
              <p className="text-sm text-muted-foreground">Browse your design portfolio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Saved Designs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Saved Designs</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/designer_management/editor?saved=true")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SavedDesigns displayActionMenu={false} />
        </CardContent>
      </Card>
    </div>
  );
} 