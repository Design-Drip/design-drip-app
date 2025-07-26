"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { useRouter } from "next/navigation";

export default function TestDesignerPage() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Designer Role Test</h1>
      
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

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>
    </div>
  );
} 