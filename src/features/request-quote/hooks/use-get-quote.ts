import { useQuery } from "@tanstack/react-query";
import { RequestQuote } from "@/models/request-quote";

interface UseGetQuoteProps {
  quoteId: string;
  enabled?: boolean;
}

export const useGetQuote = ({ quoteId, enabled = true }: UseGetQuoteProps) => {
  return useQuery({
    queryKey: ["quote", quoteId],
    queryFn: async () => {
      const response = await fetch(`/api/request-quotes/${quoteId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch quote");
      }
      return response.json();
    },
    enabled: enabled && !!quoteId,
  });
};

export const useGetQuotes = () => {
  return useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const response = await fetch("/api/request-quotes");
      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }
      return response.json();
    },
  });
};

export const useGetMyAssignedQuotes = () => {
  return useQuery({
    queryKey: ["my-assigned-quotes"],
    queryFn: async () => {
      const response = await fetch("/api/request-quotes/my-assigned");
      if (!response.ok) {
        throw new Error("Failed to fetch assigned quotes");
      }
      return response.json();
    },
  });
}; 