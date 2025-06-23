import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const SignInPage = async ({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) => {
  // Get the redirect URL from the search params
  const redirectUrl = searchParams.redirect_url || "/";
  console.log("Redirect URL:", redirectUrl);

  return (
    <SignIn
      fallbackRedirectUrl={redirectUrl}
      signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
    />
  );
};

export default SignInPage;
