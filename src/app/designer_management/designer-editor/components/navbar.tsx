"use client";

import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { HomeIcon, Loader, Redo2, Save, Undo2, ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Hint } from "@/components/hint";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveError: Error | null;
  designName: string;
  onDesignNameChange: (name: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Navbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
  onSave,
  isSaving,
  hasUnsavedChanges,
  saveError,
  designName,
  onDesignNameChange,
  isSidebarOpen,
  onToggleSidebar,
}: NavbarProps) => {
  console.log("Navbar rendering with props:", { isSaving, hasUnsavedChanges, designName });
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };
  return (
    <nav className="w-full flex items-center p-4 h-[68px] gap-x-8 border-b lg:pl-[34px] bg-white z-50 relative">
      <Link href="/designer_management">
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-x-2">
            <HomeIcon className="size-6 text-muted-foreground hover:text-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent>
            <span className="text-sm">Designer Panel</span>
          </TooltipContent>
        </Tooltip>
      </Link>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-8 w-8"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <PanelLeftOpen className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-sm">{isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}</span>
        </TooltipContent>
      </Tooltip>
      
      <Link href="/designer_management/assigned-quotes">
        <Tooltip>
          <TooltipTrigger className="flex items-center gap-x-2">
            <ArrowLeft className="size-6 text-muted-foreground hover:text-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent>
            <span className="text-sm">Back to Assigned Quotes</span>
          </TooltipContent>
        </Tooltip>
      </Link>
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
        <div className="mx-4 min-w-[180px]">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={designName}
              onChange={(e) => onDesignNameChange(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="font-medium"
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 h-10 rounded-md border border-input hover:bg-accent cursor-text flex items-center font-medium text-sm"
            >
              {designName || "Shirt Design"}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-x-4">
          <Button
            size="sm"
            variant={hasUnsavedChanges ? "outline" : "default"}
            onClick={onSave}
            disabled={isSaving}
          >
            Save
            <Save className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
