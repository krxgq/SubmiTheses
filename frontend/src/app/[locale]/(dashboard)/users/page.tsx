import { usersApi } from "@/lib/api/users";
import { UsersTable } from "./UsersTable";
import type { UserWithYear } from "@sumbi/shared-types";

export default async function UsersPage() {
  let users: UserWithYear[] = [];
  try {
    users = await usersApi.getAll();
    console.log("[UsersPage] Fetched users:", users);
    console.log("[UsersPage] Users count:", users?.length || 0);
  } catch (error) {
    console.error("[UsersPage] Error fetching users:", error);
  }

  return <UsersTable users={users} />;
}
