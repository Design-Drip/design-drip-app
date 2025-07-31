"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Eye, Edit, Trash2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSetPrimaryDesign } from "@/features/request-quote/services/mutations";
import { toast } from "sonner";
import { DeleteDesignDialog } from "../../../components/saved-designs/DeleteDesignDialog";

interface Quote {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  status: string;
  type: string;
  quotedPrice: number;
  createdAt: string;
  design_id?: string; // Primary design ID
}

interface Design {
  id?: string;
  _id?: string;
  name: string;
  version: string;
  createdAt: string;
  design_images: Record<string, string>;
  quote_id?: Quote;
  shirt_color_id?: {
    _id?: string;
    id?: string;
    shirt_id?: {
      _id?: string;
      id?: string;
      name?: string;
    };
  };
}

interface SavedDesignsByQuoteProps {
  designs: Design[];
}

export const SavedDesignsByQuote = ({ designs }: SavedDesignsByQuoteProps) => {
  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);
  const router = useRouter();
  const setPrimaryDesignMutation = useSetPrimaryDesign();

  // Helper function to get design ID
  const getDesignId = (design: Design): string => {
    return design.id || (design as any)._id || '';
  };



  // Debug: Log designs data
//   console.log("SavedDesignsByQuote - Component rendered");
//   console.log("SavedDesignsByQuote - designs:", designs);
//   console.log("SavedDesignsByQuote - designs length:", designs.length);
//   console.log("SavedDesignsByQuote - designs type:", typeof designs);
//   console.log("SavedDesignsByQuote - designs is array:", Array.isArray(designs));
//   console.log("SavedDesignsByQuote - designs === undefined:", designs === undefined);
//   console.log("SavedDesignsByQuote - designs === null:", designs === null);
  
//   if (Array.isArray(designs)) {
//     designs.forEach((design, index) => {
//       console.log(`Design ${index} - Full object:`, design);
//       console.log(`Design ${index} - Keys:`, Object.keys(design));
//       console.log(`Design ${index} - ID fields:`, {
//         id: design.id,
//         _id: (design as any)._id,
//         designId: (design as any).designId,
//         design_id: (design as any).design_id
//       });
//       console.log(`Design ${index}:`, {
//         id: design.id || (design as any)._id,
//         name: design.name,
//         hasQuoteId: !!design.quote_id,
//         quoteId: design.quote_id?._id,
//         quoteDesignId: design.quote_id?.design_id,
//         isPrimary: design.quote_id?.design_id === (design.id || (design as any)._id)
//       });
//     });
//   }

  // Group designs by quote_id
  const designsByQuote = designs.reduce((acc, design) => {
    // Only include designs that have a quote_id
    if (design.quote_id && design.quote_id._id) {
      const quoteId = design.quote_id._id;
      
      if (!acc[quoteId]) {
        acc[quoteId] = {
          quote: design.quote_id,
          designs: []
        };
      }
      
      acc[quoteId].designs.push(design);
    }
    return acc;
  }, {} as Record<string, { quote: Quote; designs: Design[] }>);

  const toggleQuote = (quoteId: string) => {
    const newExpanded = new Set(expandedQuotes);
    if (newExpanded.has(quoteId)) {
      newExpanded.delete(quoteId);
    } else {
      newExpanded.add(quoteId);
    }
    setExpandedQuotes(newExpanded);
  };

  const handleEditDesign = (design: Design) => {
    // Navigate to designer editor with proper parameters
    const designId = getDesignId(design);
    const productId = design.shirt_color_id?.shirt_id?._id || design.shirt_color_id?.shirt_id?.id;
    const colorId = design.shirt_color_id?._id || design.shirt_color_id?.id;
    const quoteId = design.quote_id?._id;
    
    console.log("SavedDesignsByQuote - handleEditDesign:", {
      designId,
      productId,
      colorId,
      quoteId,
      designQuoteId: design.quote_id?._id,
      designQuoteData: design.quote_id
    });
    
    if (productId && colorId) {
      // Navigate with all required parameters including quoteId if available
      const params = new URLSearchParams({
        colorId: colorId,
        designId: designId,
      });
      
      if (quoteId) {
        params.set('quoteId', quoteId);
      }
      
      const url = `/designer_management/designer-editor/${productId}?${params.toString()}`;
      console.log("SavedDesignsByQuote - navigating to:", url);
      router.push(url);
    } else {
      // Fallback to design editor with just designId
      router.push(`/designer_management/designer-editor/${designId}`);
    }
  };

  const handleDeleteDesign = (design: Design) => {
    setDesignToDelete(design);
    setDeleteDialogOpen(true);
  };

  const handleSetPrimaryDesign = async (design: Design) => {
    const designId = getDesignId(design);
    
    if (!design.quote_id) {
      toast.error("This design is not associated with a quote");
      return;
    }

    try {
      await setPrimaryDesignMutation.mutateAsync({
        quoteId: design.quote_id._id,
        designId: designId,
      });
      toast.success("Design set as primary successfully");
    } catch (error) {
      console.error("handleSetPrimaryDesign error:", error);
      toast.error("Failed to set design as primary");
    }
  };

  const getQuoteTitle = (quote: Quote | null) => {
    if (!quote) return "Personal Designs";
    return `${quote.firstName} ${quote.lastName} - ${quote.company}`;
  };

  const getQuoteSubtitle = (quote: Quote | null) => {
    if (!quote) return "Your personal designs";
    return `${quote.type} • $${quote.quotedPrice} • ${quote.status}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(designsByQuote).map(([quoteId, { quote, designs }]) => (
        <Card key={quoteId} className="border-l-4 ">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleQuote(quoteId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {expandedQuotes.has(quoteId) ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {getQuoteTitle(quote)}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {getQuoteSubtitle(quote)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {quote && (
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status}
                  </Badge>
                )}
                <Badge variant="secondary">
                  {designs.length} design{designs.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          {expandedQuotes.has(quoteId) && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 {designs.map((design) => (
                   <Card key={getDesignId(design)} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        {design.design_images && Object.values(design.design_images)[0] && (
                          <img
                            src={Object.values(design.design_images)[0]}
                            alt={design.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                                             <div className="space-y-2">
                         <div>
                           <div className="flex items-center gap-2">
                             <h4 className="font-medium text-sm">{design.name}</h4>
                                                           {design.quote_id && design.quote_id.design_id && design.quote_id.design_id === getDesignId(design) && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Primary
                                </Badge>
                              )}
                           </div>
                           <p className="text-xs text-gray-500">
                             Version: {design.version}
                           </p>
                         </div>
                        
                                                 <div className="flex items-center justify-between">
                           <p className="text-xs text-gray-500">
                             {new Date(design.createdAt).toLocaleDateString()}
                           </p>
                           
                           <div className="flex space-x-1">
                             {design.quote_id && (
                               <Button
                                 size="sm"
                                 variant="ghost"
                                 onClick={() => handleSetPrimaryDesign(design)}
                                                                                                      className={`h-8 w-8 p-0 ${
                                     design.quote_id.design_id && design.quote_id.design_id === getDesignId(design)
                                       ? "text-yellow-600 hover:text-yellow-700"
                                       : "text-gray-600 hover:text-gray-700"
                                   }`}
                                   title={
                                     design.quote_id.design_id && design.quote_id.design_id === getDesignId(design)
                                       ? "Primary design"
                                       : "Set as primary design"
                                   }
                               >
                                                                                                                                       <Star className={`h-4 w-4 ${
                                     design.quote_id.design_id && design.quote_id.design_id === getDesignId(design) ? "fill-current" : ""
                                   }`} />
                               </Button>
                             )}
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={() => handleEditDesign(design)}
                               className="h-8 w-8 p-0"
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={() => handleDeleteDesign(design)}
                               className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {Object.keys(designsByQuote).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No designs found</p>
          </CardContent>
        </Card>
      )}

      <DeleteDesignDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        design={designToDelete}
      />
    </div>
  );
}; 