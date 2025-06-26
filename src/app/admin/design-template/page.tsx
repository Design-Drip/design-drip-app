"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { designTemplate } from "@/features/admin/design-template/services/mutations";
import { useDebounce } from "@/hooks/use-debounce";
import DesignTemplateForm, {
  TemplateFormData,
} from "@/features/admin/design-template/components/DesignTemplateForm";
import DesignTemplateFilters from "@/features/admin/design-template/components/DesignTemplateFilter";
import DesignTemplateList from "@/features/admin/design-template/components/DesignTemplateList";
import Pagination from "@/features/admin/design-template/components/Pagination";
import {
  DesignTemplateFiltersQuery,
  getDesignTemplatesQuery,
} from "@/features/admin/design-template/services/queries";
import { useQuery } from "@tanstack/react-query";
import { CATEGORY_TEMPLATE } from "@/constants/size";

export interface DesignTemplate {
  _id: string;
  name: string;
  imageUrl: string;
  category: (typeof CATEGORY_TEMPLATE)[number];
  isActive: boolean;
  createdAt: string;
}

export default function DesignTemplatePage() {
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DesignTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Prepare filters for API
  const filters: DesignTemplateFiltersQuery = useMemo(() => {
    const filterObj: DesignTemplateFiltersQuery = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (debouncedSearchTerm) {
      filterObj.search = debouncedSearchTerm;
    }

    if (selectedCategory !== "all") {
      filterObj.category = selectedCategory;
    }

    if (selectedStatus !== "all") {
      filterObj.isActive = selectedStatus === "true";
    }

    return filterObj;
  }, [
    debouncedSearchTerm,
    selectedCategory,
    selectedStatus,
    currentPage,
    itemsPerPage,
  ]);

  // Mutation hooks
  const createTemplateMutation = designTemplate.useCreateTemplate();
  const updateTemplateMutation = designTemplate.useUpdateTemplate();
  const deleteTemplateMutation = designTemplate.useDeleteTemplate();
  const updateActiveStatusTemplateMutation =
    designTemplate.useUpdateActiveStatus();

  // Fetch templates with filters
  const { data, isLoading, isError, refetch } = useQuery(
    getDesignTemplatesQuery(filters)
  );

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, selectedCategory, selectedStatus]);

  // Get templates and pagination info from API
  const templates: DesignTemplate[] = data?.items || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data ? Math.ceil(data.totalItems / data.pageSize) : 0;

  // Handlers
  const handleAddTemplate = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    try {
      await createTemplateMutation.mutateAsync({
        name: data.name,
        imageUrl: data.imageUrl,
        category: data.category,
      });

      toast.success("Template created successfully");
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTemplate = async (data: TemplateFormData) => {
    if (selectedTemplate === null) return;
    setIsSubmitting(true);
    try {
      await updateTemplateMutation.mutateAsync({
        designTemplateId: selectedTemplate._id,
        name: data.name,
        imageUrl: data.imageUrl,
        category: data.category,
      });

      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      toast.success("Template updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplateMutation.mutateAsync(id);
      toast.success("Template deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete template");
    }
  };

  const toggleTemplateStatus = async (id: string) => {
    try {
      await updateActiveStatusTemplateMutation.mutateAsync(id);
      toast.success("Template status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update template status");
    }
  };

  const openEditDialog = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page
  };

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-500">
            Error loading templates. Please try again.
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Design Templates Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your system design templates ({totalItems} templates)
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Design Template</DialogTitle>
              <DialogDescription>
                Create a new design template for the system
              </DialogDescription>
            </DialogHeader>
            <DesignTemplateForm
              onSubmit={handleAddTemplate}
              isSubmitting={isSubmitting}
              submitLabel="Add Template"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <DesignTemplateFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
      />

      {/* Templates List */}
      <DesignTemplateList
        templates={templates}
        onEdit={openEditDialog}
        onDelete={handleDeleteTemplate}
        onToggleStatus={toggleTemplateStatus}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update template information</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <DesignTemplateForm
              defaultValues={{
                name: selectedTemplate.name,
                imageUrl: selectedTemplate.imageUrl,
                category: selectedTemplate.category,
              }}
              onSubmit={handleEditTemplate}
              isSubmitting={isSubmitting}
              submitLabel="Update Template"
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
