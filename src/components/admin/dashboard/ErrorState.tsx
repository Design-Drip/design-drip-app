"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Dashboard
            </h3>
            <p className="text-gray-600">
              Unable to fetch dashboard data. Please check your connection and
              try again.
            </p>
          </div>
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
