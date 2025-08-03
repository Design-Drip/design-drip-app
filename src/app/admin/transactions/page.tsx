import { Metadata } from "next";
import TransactionsList from "@/components/admin/TransactionsList";

export const metadata: Metadata = {
  title: "Transactions - Admin Dashboard",
  description: "Manage and view all transactions",
};

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage all platform transactions
        </p>
      </div>

      <TransactionsList />
    </div>
  );
}
