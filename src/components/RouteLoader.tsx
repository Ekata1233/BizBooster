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
    <div className="fixed inset-0 z-50 bg-black/100 dark:bg-gray-900/80">
      <div className="absolute top-[60%] left-[62%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="dot-loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

  );
};

export default RouteLoader;
