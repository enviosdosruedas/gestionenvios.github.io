import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/drivers'); // Or any default page like /dashboard or /
}
