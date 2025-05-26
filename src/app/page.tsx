import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  console.log(userId);
  return (
    <div>
      Home page dsadsa <SignOutButton />
    </div>
  );
}
