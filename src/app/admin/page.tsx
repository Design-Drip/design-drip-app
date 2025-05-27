import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";

import { SearchUsers } from "@/features/admin/components/SearchUsers";
import { removeRole, setRole } from "./_actions";
import { checkRole } from "@/lib/roles";

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  if (!checkRole("admin")) {
    redirect("/");
  }

  const query = (await params.searchParams).search;

  const client = await clerkClient();

  const users = query ? (await client.users.getUserList({ query })).data : [];

  return (
    <>
      <SignOutButton>Sign out</SignOutButton>
      <p>
        This is the protected admin dashboard restricted to users with the
        `admin` role.
      </p>

      <SearchUsers />

      {users.map((user) => {
        return (
          <div key={user.id}>
            <div>
              {user.firstName} {user.lastName}
            </div>

            <div>
              {
                user.emailAddresses.find(
                  (email) => email.id === user.primaryEmailAddressId
                )?.emailAddress
              }
            </div>

            <div>{user.publicMetadata.role as string}</div>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="admin" name="role" />
              <button type="submit">Make Admin</button>
            </form>

            <form action={setRole}>
              <input type="hidden" value={user.id} name="id" />
              <input type="hidden" value="staff" name="role" />
              <button type="submit">Make Staff</button>
            </form>

            <form action={removeRole}>
              <input type="hidden" value={user.id} name="id" />
              <button type="submit">Remove Role</button>
            </form>
          </div>
        );
      })}
    </>
  );
}
