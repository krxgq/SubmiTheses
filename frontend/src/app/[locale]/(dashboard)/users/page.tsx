import { usersApiServer } from "@/lib/api/users";
import { UsersTable } from "./UsersTable";
import type { UserWithYear } from "@sumbi/shared-types";

// Server Component - only admin can view users list (enforced by middleware)
export default async function UsersPage() {
  let users: UserWithYear[] = [];
  try {
    users = await usersApiServer.getAll();
  } catch (error) {
    console.error("[UsersPage] Error fetching users:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <UsersTable users={users} />
    </div>
  );
}
