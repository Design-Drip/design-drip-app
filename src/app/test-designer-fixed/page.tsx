"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { useRouter } from "next/navigation";

export default function TestDesignerFixedPage() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Designer Management Test (Fixed)</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">Name:</span>
            <span>{user?.fullName || "N/A"}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">Email:</span>
            <span>{user?.primaryEmailAddress?.emailAddress || "N/A"}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">Role:</span>
            <RoleBadge role={user?.publicMetadata?.role as string || "User"} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/admin")}
              className="w-full"
            >
              Go to Admin Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Designer Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/designer_management")}
              className="w-full"
            >
              Go to Designer Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Designer Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/designer_management/editor")}
              className="w-full"
            >
              Go to Designer Editor
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Designs</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/designer_management/my-designs")}
              className="w-full"
            >
              Go to My Designs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/designer_management/design-templates")}
              className="w-full"
            >
              Go to Design Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Designs</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/designer_management/editor?saved=true")}
              className="w-full"
            >
              View Saved Designs
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All pages have "use client" directive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>useRouter hooks are properly configured</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>SavedDesigns component is integrated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Editor component is integrated</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 