// src/components/RouteLoader.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const RouteLoader = () => {
const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // simulate loading delay

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
      <div className="dot-loader">
  <span></span>
  <span></span>
  <span></span>
</div>
    </div>
  );
};

export default RouteLoader;
