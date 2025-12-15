'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthentication } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { authenticated, user } = await checkAuthentication();

      if (authenticated) {
        if (user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/register');
        }
      } else {
        router.push('/login');
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
