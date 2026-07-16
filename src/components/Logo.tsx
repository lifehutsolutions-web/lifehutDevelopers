import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-20", light = false }) => {
  const [useFallback, setUseFallback] = useState(false);
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);

  const priColor = "#1A6DB5"; // Premium Blue
  const darkColor = light ? "#FFFFFF" : "#1A2332"; // Charcoal/White
  const redColor = "#F47B20"; // Vibrant Orange/Red
  const greyColor = light ? "rgba(255,255,255,0.7)" : "#718096"; // Lighter steel grey for "Developers"

  // Paths where the user can save/upload their logo file
  const logoPaths = [
    "/src/assets/images/logo.png",
    "/logo.png",
    "/src/assets/images/logo.svg"
  ];

  const handleImageError = () => {
    if (currentSrcIndex < logoPaths.length - 1) {
      setCurrentSrcIndex(prev => prev + 1);
    } else {
      setUseFallback(true);
    }
  };

  if (!useFallback) {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <img
          src={logoPaths[currentSrcIndex]}
          alt="Lifehut Developers Logo"
          className="h-full w-auto object-cover max-h-[85px] scale-150"
          
          onError={handleImageError}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon (Swoosh/Arc + Home abstraction) */}
      <svg
        viewBox="0 0 500 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* Left Side Swoosh Arc (Crescent Moon shape representing L) */}
        <path
          d="M100,105 C60,105 15,85 15,45 C15,15 45,5 45,5 C45,5 25,25 25,48 C25,72 58,95 100,95 C115,95 130,92 130,92 C130,92 115,105 100,105 Z"
          fill={priColor}
        />

        {/* Wordmark "lifehut" */}
        <g transform="translate(-25, 0)">
          {/* 'i' */}
          <rect x="168" y="47" width="10" height="45" rx="3" fill={darkColor} />
          <circle cx="173" cy="35" r="5" fill={darkColor} />

          {/* 'f' */}
          <path d="M198,35 C190,35 186,40 186,48 L186,92 L196,92 L196,48 L204,48 L204,38 L196,38" fill={darkColor} />
          
          {/* 'e' */}
          <path d="M226,62 C226,52 218,45 208,45 C198,45 190,53 190,68 C190,83 198,92 208,92 C218,92 225,85 227,78 L217,76 C216,80 213,83 208,83 C203,83 200,80 200,72 L227,72 L227,62 Z M200,64 C201,58 204,54 208,54 C212,54 215,58 216,64 L200,64 Z" fill={darkColor} />

          {/* Roof over 'hut' */}
          <path
            d="M280,24 L340,3 M340,3 L400,24"
            stroke={priColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Red Chimneys / Windows under roof */}
          <rect x="330" y="16" width="12" height="12" rx="2" fill={redColor} />
          <rect x="348" y="16" width="12" height="12" rx="2" fill={redColor} />

          {/* 'h' */}
          <path d="M232,32 L232,92 L242,92 L242,58 C242,50 248,46 254,46 C260,46 264,50 264,58 L264,92 L274,92 L274,54 C274,42 266,35 254,35 C244,35 236,41 234,48 L232,48 L232,32 Z" fill={darkColor} />

          {/* 'u' */}
          <path d="M280,47 L280,82 C280,88 285,92 291,92 C297,92 301,88 301,82 L301,47 L311,47 L311,84 C311,94 303,101 291,101 C279,101 270,94 270,84 L270,47 L280,47 Z" fill={darkColor} />

          {/* 't' */}
          <path d="M326,38 L326,47 L318,47 L318,56 L326,56 L326,82 C326,88 330,92 336,92 L342,92 L342,83 L337,83 C336,83 335,82 335,80 L335,56 L344,56 L344,47 L335,47 L335,38 L326,38 Z" fill={darkColor} />
        </g>

        {/* Wordmark "Developers" */}
        <text
          x="148"
          y="120"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto"
          fontWeight="700"
          fontSize="24"
          letterSpacing="4"
          fill={greyColor}
        >
          Developers
        </text>
      </svg>
    </div>
  );
};
