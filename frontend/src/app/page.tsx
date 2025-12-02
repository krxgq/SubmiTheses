import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to default locale
  // The middleware will handle the locale prefix
  redirect('/en');
}