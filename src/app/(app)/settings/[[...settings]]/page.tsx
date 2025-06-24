"use client";

import { UserProfile } from "@clerk/nextjs";
import { WalletCards, Shirt } from "lucide-react";
import PaymentMethods from "@/features/payments/components/PaymentMethods";
import SavedDesigns from "@/components/saved-designs/SavedDesigns";

const UserProfilePage = () => (
  <UserProfile
    appearance={{
      elements: {
        rootBox: "w-full",
        cardBox: "w-full",
      },
    }}
  >
    <UserProfile.Page label="account" />
    <UserProfile.Page label="security" />
    <UserProfile.Page
      label="Payment Methods"
      url="payment-methods"
      labelIcon={<WalletCards size={16} />}
    >
      <PaymentMethods />
    </UserProfile.Page>
    <UserProfile.Page
      label="Saved Designs"
      url="saved-designs"
      labelIcon={<Shirt size={16} />}
    >
      <SavedDesigns />
    </UserProfile.Page>
  </UserProfile>
);

export default UserProfilePage;
