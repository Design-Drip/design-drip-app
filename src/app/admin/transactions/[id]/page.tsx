import { Metadata } from "next";
import { notFound } from "next/navigation";
import TransactionDetails from "@/components/admin/TransactionDetails";

interface TransactionDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: TransactionDetailPageProps): Promise<Metadata> {
  return {
    title: `Transaction ${params.id} - Admin Dashboard`,
    description: `View details for transaction ${params.id}`,
  };
}

export default function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <TransactionDetails transactionId={params.id} />
    </div>
  );
}
