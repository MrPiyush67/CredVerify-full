import React from 'react';

const LiquidSideBackground = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden bg-gradient-to-b from-[#2e3192] to-[#1e90ff]">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="viewBox">
            <rect x="0" y="0" width="1000" height="600" />
          </clipPath>
        </defs>

        <g clipPath="url(#viewBox)">
          {/* Main dark curve that moves down */}
          <path
            fill="var(--background)"
            stroke="var(--background)"
            strokeWidth="2"
            d="M 0 0 
                   L 500 0
                   C 400 200, 600 400, 500 600
                   L 0 600
                   Z"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="0 600"
              dur="10s"
              repeatCount="indefinite"
            />
          </path>

          {/* Duplicate dark curve that starts from -600 to create seamless loop */}
          <path
            fill="var(--background)"
            stroke="var(--background)"
            strokeWidth="2"
            d="M 0 0 
                   L 500 0
                   C 400 200, 600 400, 500 600
                   L 0 600
                   Z"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 -600"
              to="0 0"
              dur="10s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </svg>
    </div>
  );
};

export default LiquidSideBackground;
