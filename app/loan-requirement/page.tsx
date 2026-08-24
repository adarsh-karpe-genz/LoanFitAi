import { redirect } from 'next/navigation';

export default function LoanRequirementRedirect() {
  redirect('/profile?step=0');
}
