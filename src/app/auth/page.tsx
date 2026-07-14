'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <span className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Redirecting to login portal...</p>
      </div>
    </div>
  );
}
