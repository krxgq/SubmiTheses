import { getTranslations } from "next-intl/server";
import { usersApiServer } from "@/lib/api/users";
import { redirect } from "@/lib/navigation";
import { revalidatePath } from "next/cache";
import { UserEditForm } from "./UserEditForm";
import type { UserRole } from "@sumbi/shared-types";

interface UserEditPageProps {
  params: Promise<{ userId: string; locale: string }>;
}

// Server Component - access protected by middleware (admin only)
export default async function UserEditPage({ params }: UserEditPageProps) {
  const { userId, locale } = await params;
  const t = await getTranslations();

  let user: Awaited<ReturnType<typeof usersApiServer.getById>>;
  try {
    user = await usersApiServer.getById(userId);
  } catch (error) {
    console.error("[UserEditPage] Error:", error);
    return (
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8">
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
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
    year_id: number | null;
    class?: string;
  }) {
    'use server';

    try {
      await usersApiServer.updateProfile(userId, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        year_id: formData.year_id,
        class: formData.class,
      });

      if (formData.role !== user.role) {
        await usersApiServer.updateRole(userId, formData.role);
      }
    } catch (error: any) {
      // Log full error details including API status and response
      console.error("[updateUser] Error:", error?.message, "Status:", error?.statusCode, "Details:", JSON.stringify(error?.details));
      throw new Error("Failed to update user");
    }

    // redirect() throws internally — must be outside try/catch
    revalidatePath(`/users/${userId}`);
    revalidatePath(`/users/${userId}/edit`);
    redirect({ href: `/users/${userId}`, locale });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Edit User
      </h1>

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
  );
}
