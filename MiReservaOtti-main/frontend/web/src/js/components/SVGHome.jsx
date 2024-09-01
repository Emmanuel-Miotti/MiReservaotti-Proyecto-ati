import React from 'react';

const SBGHome = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlnsSvgjs="http://svgjs.dev/svgjs"
      viewBox="0 0 800 800"
    >
      <defs>
        <filter
          id="bbblurry-filter"
          x="-100%"
          y="-100%"
          width="400%"
          height="400%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="40" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" edgeMode="none" result="blur"></feGaussianBlur>
        </filter>
      </defs>
      <g filter="url(#bbblurry-filter)">
        <ellipse rx="150" ry="150" cx="428.44954145727337" cy="480.7665750819909" fill="hsla(143, 85%, 58%, 1.00)"></ellipse>
        <ellipse rx="150" ry="150" cx="463.96185302734375" cy="240.03401643871894" fill="hsla(175, 80%, 33%, 1.00)"></ellipse>
        <ellipse rx="150" ry="150" cx="599.6376627619643" cy="593.0195090363292" fill="hsla(206, 96%, 72%, 1.00)"></ellipse>
      </g>
    </svg>
  );
};

export default SBGHome;
