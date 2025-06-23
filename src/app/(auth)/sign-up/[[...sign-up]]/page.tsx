import { SignUp } from "@clerk/nextjs";

export default function Page({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  // Get the redirect URL from the search params
  const redirectUrl = searchParams.redirect_url || "/";
  console.log("Redirect URL:", redirectUrl);
  return (
    <SignUp
      fallbackRedirectUrl={redirectUrl}
      signInUrl={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`}
    />
  );
}
