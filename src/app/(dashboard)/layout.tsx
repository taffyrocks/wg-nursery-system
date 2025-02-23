'use client';

import Navigation from '../../components/Navigation';
import { useAuth } from '../../components/AuthProvider';  // Make sure this path is correct
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 bg-gray-50">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
