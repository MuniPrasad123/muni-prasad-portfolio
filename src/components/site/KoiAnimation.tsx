'use client'

import { useReducedMotion } from 'framer-motion'

type FishProps = { className: string; path: string; duration: string; delay: string; initial: string; width: number; reduced: boolean }

function Fish({ className, path, duration, delay, initial, width, reduced }: FishProps) {
  return <g className={`banner-fish ${className}`} transform={reduced ? initial : undefined}>
    {!reduced && <animateMotion path={path} dur={duration} begin={delay} rotate="auto" repeatCount="indefinite" />}
    <image className="banner-fish-image" href="/assets/koi-real.png" x={-width / 2} y={-width / 4.2} width={width} height={width / 2.1} preserveAspectRatio="xMidYMid meet" />
  </g>
}

type LeafProps = { startX: number; landingX: number; landingY: number; driftX: number; driftY: number; duration: string; delay: string; scale?: number }

function Leaf({ startX, landingX, landingY, driftX, driftY, duration, delay, scale = 1 }: LeafProps) {
  return <g className="banner-leaf">
    <animateTransform attributeName="transform" type="translate" values={`${startX} -55;${startX + 24} ${landingY - 100};${landingX} ${landingY};${landingX + 18} ${landingY + 3};${driftX} ${driftY}`} keyTimes="0;.25;.62;.82;1" dur={duration} begin={delay} repeatCount="indefinite" />
    <g transform={`scale(${scale})`}><path className="banner-leaf-shape" d="M0 0C-9-18-4-35 15-44C20-25 15-9 0 0ZM1-2C5-15 10-27 15-40" /></g>
  </g>
}

function LeafImpact({ x, y, duration, delay }: { x: number; y: number; duration: string; delay: string }) {
  return <g className="banner-leaf-impact" transform={`translate(${x} ${y})`}>
    <circle className="leaf-ring leaf-ring-wide" r="1"><animate attributeName="r" values="1;1;17;42;64" keyTimes="0;.62;.72;.86;1" dur={duration} begin={delay} repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.42;.18;0" keyTimes="0;.62;.72;.86;1" dur={duration} begin={delay} repeatCount="indefinite"/></circle>
    <circle className="leaf-ring leaf-ring-inner" r="1"><animate attributeName="r" values="1;1;9;20;32" keyTimes="0;.62;.72;.86;1" dur={duration} begin={delay} repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;.72;.26;0" keyTimes="0;.62;.72;.86;1" dur={duration} begin={delay} repeatCount="indefinite"/></circle>
  </g>
}

export function KoiAnimation() {
  const reduced = useReducedMotion() === true
  return <div className="banner-fish-scene" aria-hidden="true">
    <svg className="banner-fish-art" viewBox="0 0 1400 780" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <radialGradient id="banner-water-glow"><stop offset="0" stopColor="#173b29" stopOpacity=".36"/><stop offset="1" stopColor="#030604" stopOpacity="0"/></radialGradient>
        <linearGradient id="banner-pond-shine" x1="0" y1="0" x2="1" y2=".8"><stop stopColor="#c6e1bd" stopOpacity="0"/><stop offset=".48" stopColor="#c6e1bd" stopOpacity=".42"/><stop offset="1" stopColor="#d8bd75" stopOpacity="0"/></linearGradient>
      </defs>
      <ellipse cx="700" cy="390" rx="790" ry="490" fill="url(#banner-water-glow)" />
      <g className="banner-water-ripples" fill="none" stroke="url(#banner-pond-shine)">
        <ellipse cx="330" cy="185" rx="170" ry="45"/><ellipse cx="330" cy="185" rx="220" ry="64"/>
        <ellipse cx="1090" cy="580" rx="210" ry="54"/><ellipse cx="1090" cy="580" rx="270" ry="78"/>
        <ellipse cx="690" cy="115" rx="145" ry="36"/>
      </g>
      <g className="banner-water-glints">
        <circle cx="235" cy="284" r="2.2"/><circle cx="404" cy="101" r="1.8"/><circle cx="624" cy="212" r="2.4"/><circle cx="840" cy="120" r="1.7"/><circle cx="1038" cy="297" r="2"/><circle cx="1216" cy="178" r="2.6"/><circle cx="1132" cy="468" r="1.7"/><circle cx="927" cy="692" r="2.4"/><circle cx="702" cy="600" r="1.7"/><circle cx="342" cy="650" r="2.2"/><circle cx="161" cy="485" r="1.6"/>
      </g>
      <g className="banner-leaves">
        {!reduced && <>
          <Leaf startX={280} landingX={470} landingY={320} driftX={630} driftY={285} duration="18s" delay="-10s" scale={1.05}/>
          <Leaf startX={990} landingX={970} landingY={340} driftX={1150} driftY={335} duration="23s" delay="-14s" scale={.82}/>
          <Leaf startX={1180} landingX={900} landingY={430} driftX={760} driftY={425} duration="25s" delay="-16s" scale={.7}/>
          <Leaf startX={520} landingX={690} landingY={300} driftX={835} driftY={300} duration="20s" delay="-7s" scale={.64}/>
        </>}
      </g>
      {!reduced && <g className="banner-leaf-impacts">
        <LeafImpact x={470} y={320} duration="18s" delay="-10s"/>
        <LeafImpact x={970} y={340} duration="23s" delay="-14s"/>
        <LeafImpact x={900} y={430} duration="25s" delay="-16s"/>
        <LeafImpact x={690} y={300} duration="20s" delay="-7s"/>
      </g>}
      {!reduced && <>
        <Fish className="banner-koi-orange" path="M-260 100 C-125 35 10 35 95 95 C185 158 170 225 75 245 C-25 262 -135 214 -230 165" duration="39s" delay="-26s" initial="translate(65 115)" width={290} reduced={false}/>
        <Fish className="banner-koi-gold" path="M1510 115 C1345 62 1225 75 1125 155 C1010 247 995 305 1125 310 C1235 315 1360 266 1490 220" duration="45s" delay="-7s" initial="translate(1270 120)" width={330} reduced={false}/>
        <Fish className="banner-koi-white" path="M1510 655 C1360 720 1200 728 1090 660 C980 590 960 525 1080 505 C1205 485 1360 555 1495 600" duration="48s" delay="-32s" initial="translate(1270 650)" width={385} reduced={false}/>
        <Fish className="banner-koi-gold" path="M-180 650 C-70 710 65 704 170 650 C270 600 335 585 390 615 C445 645 460 660 500 645" duration="52s" delay="-16s" initial="translate(80 650)" width={265} reduced={false}/>
        <Fish className="banner-koi-orange banner-koi-small" path="M550 -100 C640 -5 760 22 850 8 C960 -8 1020 34 1080 95" duration="58s" delay="-42s" initial="translate(780 70)" width={225} reduced={false}/>
      </>}
      {reduced && <>
        <Fish className="banner-koi-orange" path="" duration="" delay="" initial="translate(140 125) rotate(-12)" width={350} reduced/>
        <Fish className="banner-koi-gold" path="" duration="" delay="" initial="translate(1270 120) rotate(12)" width={330} reduced/>
        <Fish className="banner-koi-white" path="" duration="" delay="" initial="translate(1270 650) rotate(180)" width={385} reduced/>
        <Fish className="banner-koi-gold" path="" duration="" delay="" initial="translate(140 650) rotate(-160)" width={300} reduced/>
      </>}
      <g className="banner-mobile-fish">
        <Fish className="banner-koi-gold" path="M500 120 C600 58 760 64 900 140 C820 195 655 196 500 120" duration="28s" delay="-13s" initial="translate(610 122) rotate(8)" width={210} reduced={reduced}/>
        <Fish className="banner-koi-white" path="M900 682 C790 740 630 738 500 665 C590 610 755 610 900 682" duration="32s" delay="-21s" initial="translate(790 680) rotate(180)" width={190} reduced={reduced}/>
      </g>
    </svg>
  </div>
}
