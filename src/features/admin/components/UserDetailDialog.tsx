"use client";
import { User, Mail, Calendar, Clock, ShieldCheck, Shield } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Import ClerkUser from page.tsx
import type { ClerkUser } from "@/app/admin/users/page";
import { setRole, removeRole } from "@/app/admin/users/_actions";

interface UserDetailsDialogProps {
  staff: ClerkUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({
  staff,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!staff) return null;

  const formatDate = (timestamp: number | undefined | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString("en-US");
  };

  const handleSetRole = (role: string) => {
    if (!staff) return;

    const formData = new FormData();
    formData.append("id", staff.id);
    formData.append("role", role);

    startTransition(async () => {
      await setRole(formData);
      router.refresh();
    });
  };

  const handleRemoveRole = () => {
    if (!staff) return;

    const formData = new FormData();
    formData.append("id", staff.id);

    startTransition(async () => {
      await removeRole(formData);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Detailed information of the user account. Admin can only view, not
            edit personal information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={staff.imageUrl || "/placeholder.svg"}
                    alt={staff.fullName}
                  />
                  <AvatarFallback className="text-lg">
                    {staff.firstName?.[0] || ""}
                    {staff.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold">{staff.fullName}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={staff.isActive ? "default" : "secondary"}>
                      {staff.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {staff.role && (
                      <Badge
                        variant={staff.role === "admin" ? "default" : "outline"}
                      >
                        {staff.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{staff.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Created on: <strong>{formatDate(staff.createdAt)}</strong>
                </span>
              </div>
              {staff.lastSignInAt && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Last sign in:{" "}
                    <strong>{formatDate(staff.lastSignInAt)}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Role management buttons */}
        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 text-left mt-1 text-sm text-muted-foreground">
            {isPending && "Updating..."}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isPending || staff.role === "admin"}
              onClick={() => handleSetRole("admin")}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Make Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending || staff.role === "staff"}
              onClick={() => handleSetRole("staff")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Make Staff
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending || !staff.role}
              onClick={handleRemoveRole}
            >
              <User className="mr-2 h-4 w-4" />
              Remove Role
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
