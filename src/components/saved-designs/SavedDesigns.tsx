import React, { use } from "react";
import { TableSavedDesign } from "./components/table-saved-design";
import useGetDesign from "@/features/design/use-get-design";

function SavedDesigns() {
  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV005",
      paymentStatus: "Paid",
      totalAmount: "$550.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV006",
      paymentStatus: "Pending",
      totalAmount: "$200.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV007",
      paymentStatus: "Unpaid",
      totalAmount: "$300.00",
      paymentMethod: "Credit Card",
    },
  ];
  const { data } = useGetDesign();
  console.log("Design Data:", data);
  const designsData = data?.data || [];
  const formatData = designsData.map((item: any) => ({
    productName: item.shirt_color_id.shirt_id.name,
    designName: item.name,
    // invoice: item.name,
    // paymentStatus: item.shirt_color_id,
    // totalAmount: JSON.stringify(item.element_design),
    // paymentMethod: "Credit Card", // Placeholder, replace with actual data if available
  }));
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Saved Designs</h1>
      <TableSavedDesign invoices={invoices} />
    </div>
  );
}

export default SavedDesigns;
