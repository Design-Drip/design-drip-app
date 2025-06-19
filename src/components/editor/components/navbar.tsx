"use client";

import { CiFileOn } from "react-icons/ci";
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { useFilePicker } from "use-file-picker";
import {
  ChevronDown,
  Download,
  Loader,
  MousePointerClick,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Hint } from "@/components/hint";
import { UserButton } from "@clerk/nextjs";

interface NavbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveError: Error | null;
}

export const Navbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  onSave,
  isSaving,
  hasUnsavedChanges,
  saveError,
}: NavbarProps) => {
  return (
    <nav className="w-full flex items-center p-4 h-[68px] gap-x-8 border-b lg:pl-[34px]">
      {/* <Logo /> */}
      <div className="w-full flex items-center gap-x-1 h-full">
        <Hint label="Undo" side="bottom" sideOffset={10}>
          <Button
            disabled={!editor?.canUndo()}
            variant="ghost"
            size="icon"
            onClick={() => editor?.onUndo()}
          >
            <Undo2 className="size-4" />
          </Button>
        </Hint>
        <Hint label="Redo" side="bottom" sideOffset={10}>
          <Button
            disabled={!editor?.canRedo()}
            variant="ghost"
            size="icon"
            onClick={() => editor?.onRedo()}
          >
            <Redo2 className="size-4" />
          </Button>
        </Hint>
        <Separator orientation="vertical" className="mx-2" />

        <div className="flex items-center gap-x-2">
          {isSaving ? (
            <>
              <Loader className="size-4 animate-spin text-muted-foreground" />
              <div className="text-xs text-muted-foreground">Saving...</div>
            </>
          ) : saveError ? (
            <>
              <BsCloudSlash className="size-[20px] text-red-500" />
              <div className="text-xs text-red-500">Failed to save</div>
            </>
          ) : !hasUnsavedChanges ? (
            <>
              <BsCloudCheck className="size-[20px] text-green-500" />
              <div className="text-xs text-green-500">Saved</div>
            </>
          ) : (
            <>
              <BsCloudSlash className="size-[20px] text-amber-500" />
              <div className="text-xs text-amber-500">Unsaved changes</div>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-x-4">
          <Button
            size="sm"
            variant={hasUnsavedChanges ? "outline" : "ghost"}
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            Save
            <Save className="size-4 ml-2" />
          </Button>

          <UserButton />
        </div>
      </div>
    </nav>
  );
};
