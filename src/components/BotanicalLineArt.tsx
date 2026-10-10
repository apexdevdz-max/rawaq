import React from 'react';

/**
 * Delicate architectural double-arch and olive/botanical line-art SVG illustrations
 * matching the uploaded design reference (image.png).
 */
export const HeroBotanicalBackground: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover opacity-80"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Subtle Architectural Double Arch Outline behind the center-right column */}
        <path
          d="M 540 900 L 540 390 A 210 210 0 0 1 960 390 L 960 900"
          stroke="#D7CCB8"
          strokeWidth="1.15"
        />
        <path
          d="M 556 900 L 556 390 A 194 194 0 0 1 944 390 L 944 900"
          stroke="#D7CCB8"
          strokeWidth="0.9"
        />

        {/* Left-of-Arch Flowing Botanical Stem & Leaves (matching reference center-bottom foliage) */}
        <g stroke="#CFC2AC" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
          {/* Main stem curving up from bottom center */}
          <path d="M 650 900 C 620 790, 625 660, 695 540" />
          <path d="M 885 900 C 855 830, 815 785, 765 760" />

          {/* Delicate elongated olive/laurel leaves along the left stem */}
          <path d="M 635 760 C 595 725, 580 680, 602 655 C 625 680, 638 720, 635 760 Z" />
          <path d="M 642 700 C 600 660, 585 605, 605 572 C 632 605, 646 655, 642 700 Z" />
          <path d="M 660 635 C 635 585, 632 530, 656 495 C 675 535, 675 585, 660 635 Z" />
          <path d="M 652 745 C 692 720, 725 715, 750 732 C 722 752, 685 755, 652 745 Z" />
          <path d="M 645 815 C 592 800, 550 812, 528 835 C 562 846, 608 838, 645 815 Z" />
          <path d="M 665 845 C 715 820, 765 822, 795 845 C 760 865, 710 862, 665 845 Z" />
        </g>

        {/* Top-Right Botanical Foliage emerging behind the two arches (matching reference top-right leaves) */}
        <g stroke="#CFC2AC" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
          {/* Branch 1 rising above the arch */}
          <path d="M 1110 385 C 1135 305, 1165 225, 1185 155" />
          {/* Leaves on Branch 1 */}
          <path d="M 1185 155 C 1175 185, 1175 215, 1185 235 C 1198 210, 1198 180, 1185 155 Z" />
          <path d="M 1165 215 C 1142 190, 1135 162, 1145 142 C 1162 162, 1168 190, 1165 215 Z" />
          <path d="M 1172 205 C 1195 190, 1215 170, 1222 148 C 1200 160, 1182 182, 1172 205 Z" />
          <path d="M 1148 265 C 1122 242, 1112 212, 1120 190 C 1138 210, 1148 238, 1148 265 Z" />
          <path d="M 1155 258 C 1182 242, 1205 222, 1215 198 C 1190 210, 1168 232, 1155 258 Z" />
          <path d="M 1130 318 C 1102 292, 1090 262, 1098 238 C 1118 260, 1128 288, 1130 318 Z" />
          <path d="M 1138 310 C 1168 292, 1192 272, 1202 248 C 1176 262, 1152 285, 1138 310 Z" />

          {/* Branch 2 sweeping right behind the smaller arch */}
          <path d="M 1245 480 C 1285 390, 1320 275, 1345 145" />
          <path d="M 1345 145 C 1322 195, 1315 245, 1325 288 C 1348 245, 1355 195, 1345 145 Z" />
          <path d="M 1308 310 C 1285 265, 1278 218, 1290 185 C 1308 220, 1314 265, 1308 310 Z" />
          <path d="M 1295 365 C 1335 335, 1375 295, 1395 255 C 1355 280, 1318 320, 1295 365 Z" />
          <path d="M 1270 430 C 1325 405, 1378 372, 1412 338 C 1365 360, 1315 395, 1270 430 Z" />
          <path d="M 1310 495 C 1352 478, 1388 455, 1410 432 C 1372 448, 1338 472, 1310 495 Z" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Official RAWAQ Logo ("رواق RAWAQ") with 100% transparent background
 */
export const RawaqBrandLogo: React.FC<{ className?: string; size?: 'header' | 'footer' }> = ({
  className = '',
  size = 'header',
}) => {
  const dimensions =
    size === 'footer' ? 'h-20 w-auto' : 'h-12 sm:h-14 w-auto';

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${className}`}
    >
      <img
        src="/rawaq-logo-transparent.png"
        alt="رواق RAWAQ"
        referrerPolicy="no-referrer"
        className={`${dimensions} object-contain pointer-events-none block`}
      />
    </span>
  );
};
