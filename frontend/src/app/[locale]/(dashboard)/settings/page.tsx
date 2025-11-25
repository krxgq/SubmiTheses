import { setRequestLocale } from "next-intl/server";
import ProfileSettingsPage from "./ProfileSettingsPage";

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

// Server component that fetches initial data
export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProfileSettingsPage />;
}
