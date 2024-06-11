import Link from 'next/link';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Smartify Logistics App</h1>
      <Link href="/dashboard">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default HomePage;
