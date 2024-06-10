// app/page.js
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to the Smartify Logistics App</h1>
      <Link href="/dashboard">
        <a>Go to Dashboard</a>
      </Link>
    </div>
  );
}
