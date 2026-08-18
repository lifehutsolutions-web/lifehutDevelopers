import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export const TrustindexWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean container before injecting
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://cdn.trustindex.io/loader.js?9d53353797193663d0065261bcc';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setLoaded(true);
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full my-4 flex flex-col items-center justify-center min-h-[120px] transition-all">
      <div ref={containerRef} className="w-full flex justify-center" />
      {!loaded && (
        <div className="flex items-center gap-2 text-sm text-grey-500 py-6 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading verified Google reviews...</span>
        </div>
      )}
    </div>
  );
};
