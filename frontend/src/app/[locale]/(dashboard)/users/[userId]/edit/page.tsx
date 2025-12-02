import { getTranslations } from "next-intl/server";
import { usersApi } from "@/lib/api/users";
import { redirect } from "@/lib/navigation";
import { revalidatePath } from "next/cache";
import { UserEditForm } from "./UserEditForm";
import type { UserRole } from "@sumbi/shared-types";

interface UserEditPageProps {
  params: Promise<{ userId: string; locale: string }>;
}

// Page component - access protected by middleware (admin only)
export default async function UserEditPage({ params }: UserEditPageProps) {
  const { userId, locale } = await params;
  const t = await getTranslations();

  let user: Awaited<ReturnType<typeof usersApi.getById>>;
  try {
    user = await usersApi.getById(userId);
  } catch (error) {
    console.error("[UserEditPage] Error:", error);
    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          User Not Found
        </h1>
        <p className="text-text-secondary">
          The user you're trying to edit doesn't exist.
        </p>
      </div>
    );
  }

  async function updateUser(formData: {
    full_name: string;
    email: string;
    role: UserRole;
    year_id: number | null;
  }) {
    'use server';

    try {
      await usersApi.updateProfile(userId, {
        full_name: formData.full_name,
        email: formData.email,
        year_id: formData.year_id,
      });

      if (formData.role !== user.role) {
        await usersApi.updateRole(userId, formData.role);
      }

      revalidatePath(`/users/${userId}`);
      revalidatePath(`/users/${userId}/edit`);
      redirect({ href: `/users/${userId}`, locale });
    } catch (error) {
      console.error("[updateUser] Error:", error);
      throw new Error("Failed to update user");
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Edit User
      </h1>

      <div className="max-w-2xl">
        <div className="bg-background-elevated rounded-xl shadow-sm border border-border p-6">
          <UserEditForm
            user={user}
            updateUser={updateUser}
            translations={{
              fullName: t("users.form.fullName"),
              email: t("users.form.email"),
              role: t("users.form.role"),
              year: t("users.form.year"),
              save: t("users.form.save"),
              cancel: t("users.form.cancel"),
              roles: {
                admin: t("users.roles.admin"),
                teacher: t("users.roles.teacher"),
                student: t("users.roles.student"),
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
