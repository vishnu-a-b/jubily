'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthentication } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

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
        setChecking(false);
      }
    }

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}
