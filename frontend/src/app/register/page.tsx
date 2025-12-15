'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuthentication } from '@/lib/auth';
import RegistrationForm from '@/components/RegistrationForm';

export default function RegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: 'user' | 'admin' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { authenticated, user: authUser } = await checkAuthentication();

      if (!authenticated) {
        router.push('/login');
      } else {
        setUser(authUser!);
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

  if (!user) {
    return null;
  }

  return <RegistrationForm username={user.username} role={user.role} />;
}
