import { setRequestLocale } from "next-intl/server";
import ProfileSettingsPage from "./ProfileSettingsPage";

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

// User settings page - access protected by middleware (all authenticated users)
export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProfileSettingsPage />;
}
