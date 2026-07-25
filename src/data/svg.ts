// Base64 SVGs to simulate static physical images in high visual fidelity
export const PRESENT_SIMPLE_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="100%" height="100%">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1cb0f6" />
      <stop offset="100%" stop-color="#0079b8" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g1)" rx="20"/>
  
  <!-- Title -->
  <text x="30" y="50" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="26" font-weight="900" fill="#ffffff">Grammar Guide: PRESENT SIMPLE</text>
  <text x="30" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="14" fill="#e0f2fe" font-weight="600">Habits, routines and permanent facts</text>
  
  <!-- Schema block -->
  <g transform="translate(30, 110)">
    <!-- Positive -->
    <rect x="0" y="0" width="150" height="150" rx="12" fill="rgba(255,255,255,0.15)"/>
    <text x="75" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">I / You / We / They</text>
    <text x="75" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="28" font-weight="900" fill="#58cc02" text-anchor="middle">PLAY</text>
    <text x="75" y="125" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#d1fae5" font-weight="600" text-anchor="middle">Every Saturday</text>
    
    <!-- He/She/It -->
    <rect x="170" y="0" width="150" height="150" rx="12" fill="rgba(255,255,255,0.15)"/>
    <text x="245" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">He / She / It</text>
    <text x="245" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="28" font-weight="900" fill="#ffc800" text-anchor="middle">PLAYS</text>
    <text x="245" y="110" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#fef3c7" font-weight="800" text-anchor="middle">Adds -s / -es</text>
    <text x="245" y="130" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="11" fill="#fef3c7" text-anchor="middle">e.g. works, studies</text>

    <!-- Formula hint badge -->
    <rect x="340" y="0" width="200" height="150" rx="12" fill="#0284c7" />
    <text x="440" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">FORMULA</text>
    <rect x="355" y="55" width="170" height="40" rx="6" fill="#0369a1" />
    <text x="440" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="13" font-weight="900" fill="#22c55e" text-anchor="middle">S + Verb(-s) + Complement</text>
    <text x="440" y="120" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="11" fill="#e0f2fe" text-anchor="middle" font-weight="600">e.g. She eats an apple.</text>
  </g>
</svg>
`);

export const PRESENT_CONTINUOUS_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="100%" height="100%">
  <defs>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#58cc02" />
      <stop offset="100%" stop-color="#46a302" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g2)" rx="20"/>
  
  <!-- Title -->
  <text x="30" y="50" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="26" font-weight="900" fill="#ffffff">Present Continuous</text>
  <text x="30" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="14" fill="#d1fae5" font-weight="600">Actions happening right now, at the moment</text>
  
  <!-- Schema block -->
  <g transform="translate(30, 110)">
    <!-- Subject + Auxiliary -->
    <rect x="0" y="0" width="160" height="150" rx="12" fill="rgba(255,255,255,0.15)"/>
    <text x="80" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">Sujeto + AM / IS / ARE</text>
    <text x="80" y="75" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#ffffff" font-weight="600" text-anchor="middle">I → am</text>
    <text x="80" y="95" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#ffffff" font-weight="600" text-anchor="middle">He / She / It → is</text>
    <text x="80" y="115" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#ffffff" font-weight="600" text-anchor="middle">You / We / They → are</text>
    
    <!-- Verb + ING -->
    <rect x="180" y="0" width="160" height="150" rx="12" fill="rgba(255,255,255,0.15)"/>
    <text x="260" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">Verb + -ING</text>
    <text x="260" y="85" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">STUDYING</text>
    <text x="260" y="125" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#d1fae5" font-weight="600" text-anchor="middle">learn → learning</text>

    <!-- Formula -->
    <rect x="360" y="0" width="180" height="150" rx="12" fill="#15803d"/>
    <text x="450" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">STRUCTURAL formula</text>
    <rect x="375" y="55" width="150" height="40" rx="6" fill="#166534" />
    <text x="450" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="13" font-weight="900" fill="#ffc800" text-anchor="middle">S + Be + V(-ing) + C</text>
    <text x="450" y="120" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="11" fill="#d1fae5" text-anchor="middle" font-weight="600">e.g. I am reading a book.</text>
  </g>
</svg>
`);
