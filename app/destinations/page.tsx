import { redirect } from 'next/navigation';

// Redirect old destinations page to gallery
export default function DestinationsPage() {
    redirect('/gallery');
}
