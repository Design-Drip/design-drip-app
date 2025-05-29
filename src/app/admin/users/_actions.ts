"use server";

import { checkRole } from "@/lib/roles";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function setRole(formData: FormData) {
  const client = await clerkClient();
  const userId = formData.get("id") as string;
  const role = formData.get("role") as string;

  if (!await checkRole("admin")) {
    return;
  }

  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    // Revalidate the users page to show updated data
    revalidatePath("/admin/users");
  } catch (err) {
    console.error("Error setting role:", err);
  }
}

export async function removeRole(formData: FormData) {
  const client = await clerkClient();
  const userId = formData.get("id") as string;

  try {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: null },
    });

    // Revalidate the users page to show updated data
    revalidatePath("/admin/users");
  } catch (err) {
    console.error("Error removing role:", err);
  }
}
