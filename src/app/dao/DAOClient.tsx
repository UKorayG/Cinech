'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to avoid hydration issues with Web3 components
const NewDAO = dynamic(() => import('@/components/DAO'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading DAO interface...</div>
});

export default function DAOClient() {
  return <NewDAO />;
}
