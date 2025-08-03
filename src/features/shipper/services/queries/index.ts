import { useQuery, useMutation } from "@tanstack/react-query";

export interface ShippingOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  status: string;
  assignedDate: string;
  priority: "high" | "medium" | "low";
  items: number;
  total: string;
  orderItems: any[];
  notes: string;
  trackingNumber: string;
  estimatedDelivery: string;
  shippingImage?: string | null;
}

export interface ShippingOrderDetail {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  status: string;
  pickupDate: string;
  estimatedDelivery: string;
  actualDelivery: string | null;
  priority: "high" | "medium" | "low";
  items: {
    id: string;
    name: string;
    quantity: number;
    price: string;
    total: string;
  }[];
  subtotal: string;
  shipping: string;
  total: string;
  notes: string;
  trackingNumber: string;
  shipperNotes: string;
}

export const useShippingOrders = () => {
  return useQuery<{ orders: ShippingOrder[] }>({
    queryKey: ["shipping-orders"],
    queryFn: async () => {
      const response = await fetch("/api/shipping-orders");
      if (!response.ok) {
        throw new Error("Failed to fetch shipping orders");
      }
      return response.json();
    },
  });
};

export const useShippingOrderDetail = (orderId: string) => {
  return useQuery<{ order: ShippingOrderDetail }>({
    queryKey: ["shipping-order", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/shipping-orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch shipping order detail");
      }
      return response.json();
    },
    enabled: !!orderId,
  });
};

export const useUpdateShippingOrderStatus = () => {
  return useMutation({
    mutationFn: async ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) => {
      const response = await fetch(`/api/shipping-orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) {
        throw new Error("Failed to update order status");
      }
      return response.json();
    },
  });
};

export const useAssignOrder = () => {
  return useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const response = await fetch(`/api/shipping-orders/${orderId}/assign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to assign order");
      }
      return response.json();
    },
  });
};

export const useMyOrders = () => {
  return useQuery<{ orders: ShippingOrder[] }>({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const response = await fetch("/api/shipping-orders/my-orders");
      if (!response.ok) {
        throw new Error("Failed to fetch my orders");
      }
      return response.json();
    },
  });
};

export const useUploadShippingImage = () => {
  return useMutation({
    mutationFn: async ({ orderId, shippingImage }: { orderId: string; shippingImage: string }) => {
      const response = await fetch(`/api/shipping-orders/${orderId}/upload-shipping-image`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shippingImage }),
      });
      if (!response.ok) {
        throw new Error("Failed to upload shipping image");
      }
      return response.json();
    },
  });
}; 