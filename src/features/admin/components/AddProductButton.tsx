"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProductForm } from "@/features/admin/components/CreateProductForm";

export function AddProductButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {" "}
      <Button className="flex items-center gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        <span>Add Product</span>
      </Button>
      <CreateProductForm open={open} onOpenChange={setOpen} />
    </>
  );
}
