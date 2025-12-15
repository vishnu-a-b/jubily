'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthentication } from '@/lib/auth';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { authenticated, user } = await checkAuthentication();

      if (!authenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/register');
      } else {
        setUsername(user.username);
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <AdminPanel username={username} />;
}
