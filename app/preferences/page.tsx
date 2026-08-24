import { redirect } from 'next/navigation';

export default function PreferencesRedirect() {
  redirect('/profile?step=3');
}
