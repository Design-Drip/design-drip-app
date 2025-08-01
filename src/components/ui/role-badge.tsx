import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const getRoleVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "default";
      case "designer":
        return "destructive";
      case "staff":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-blue-500 text-white";
      case "designer":
        return "bg-purple-500 text-white";
      case "staff":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <Badge
      variant={getRoleVariant(role)}
      className={cn(getRoleColor(role), className)}
    >
      {role || "User"}
    </Badge>
  );
} 