import { PropsWithChildren } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeWrapperProps extends PropsWithChildren {
  client_secret?: string;
}

export default function StripeWrapper({
  client_secret,
  children,
}: StripeWrapperProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: client_secret,
      }}
    >
      {children}
    </Elements>
  );
}
