import { PosturePhotoSlotId } from '../types/clinical';

// Generates high-fidelity SVG data URLs representing clinical posture photos for testing across the whole body
export function getClinicalSampleDataUrl(slotId: PosturePhotoSlotId): string {
  let title = '';
  let subtitle = '';
  let svgContent = '';

  switch (slotId) {
    case 'anterior_full':
      title = 'ANTERIOR CORONAL FULL BODY';
      subtitle = 'Coronal Symmetry Plane · Head to Feet';
      svgContent = `
        <line x1="200" y1="20" x2="200" y2="480" stroke="#c48943" stroke-width="1.5" stroke-dasharray="4,4" />
        <circle cx="200" cy="65" r="26" fill="#222b24" stroke="#7ea18b" stroke-width="2" />
        <line x1="170" y1="108" x2="230" y2="104" stroke="#e9c46a" stroke-width="3" />
        <path d="M 170 108 C 150 120 155 160 160 210 L 240 210 C 245 160 250 120 230 104 Z" fill="#1e2520" stroke="#7ea18b" stroke-width="2" />
        <path d="M 160 210 L 155 330 L 150 450 L 175 450 L 180 330 L 185 210 Z" fill="#1e2520" stroke="#7ea18b" stroke-width="1.8" />
        <path d="M 240 210 L 245 330 L 250 450 L 225 450 L 220 330 L 215 210 Z" fill="#1e2520" stroke="#7ea18b" stroke-width="1.8" />
        <text x="210" y="102" fill="#e9c46a" font-size="10" font-weight="bold">+14mm R Acromion High</text>
        <circle cx="178" cy="330" r="8" fill="none" stroke="#ef4444" stroke-width="2" />
        <text x="70" y="334" fill="#fca5a5" font-size="9">R Genu Valgum Medial Tilt</text>
      `;
      break;

    case 'posterior_full':
      title = 'POSTERIOR CORONAL FULL BODY';
      subtitle = 'Dorsal Gravity Plumb · C7 to Calcaneus';
      svgContent = `
        <line x1="200" y1="20" x2="200" y2="480" stroke="#c48943" stroke-width="1.5" stroke-dasharray="4,4" />
        <circle cx="200" cy="65" r="26" fill="#222b24" stroke="#7ea18b" stroke-width="2" />
        <polygon points="160,118 185,124 172,160" fill="#161d18" stroke="#7ea18b" stroke-width="1.5" />
        <polygon points="240,114 215,120 228,156" fill="#161d18" stroke="#e9c46a" stroke-width="2" />
        <path d="M 200 95 Q 208 170 200 230" fill="none" stroke="#e9c46a" stroke-width="2.5" />
        <line x1="172" y1="230" x2="228" y2="224" stroke="#ef4444" stroke-width="2.5" />
        <text x="232" y="222" fill="#ef4444" font-size="10" font-weight="bold">R PSIS Elevated +11mm</text>
        <text x="235" y="145" fill="#e9c46a" font-size="9">R Scapular Winging</text>
      `;
      break;

    case 'lateral_sagittal':
    case 'lateral_right':
      title = 'RIGHT LATERAL SAGITTAL PLUMB';
      subtitle = 'Kendall Plumb Line · Forward Head & Lordosis';
      svgContent = `
        <line x1="180" y1="20" x2="180" y2="480" stroke="#c48943" stroke-width="1.5" stroke-dasharray="4,4" />
        <circle cx="225" cy="70" r="24" fill="#222b24" stroke="#7ea18b" stroke-width="2" />
        <circle cx="218" cy="70" r="4" fill="#ef4444" />
        <line x1="180" y1="70" x2="218" y2="70" stroke="#ef4444" stroke-width="2" />
        <text x="228" y="74" fill="#ef4444" font-size="10" font-weight="bold">+32° Head Shear (52mm)</text>
        <circle cx="180" cy="120" r="5" fill="#cbe0d1" />
        <text x="110" y="124" fill="#a8a39b" font-size="9">Acromion Plumb</text>
        <path d="M 195 130 C 220 170 220 200 190 230 C 175 250 180 280 185 300" fill="none" stroke="#7ea18b" stroke-width="3" />
        <line x1="150" y1="260" x2="220" y2="278" stroke="#e9c46a" stroke-width="2" />
        <text x="140" y="295" fill="#e9c46a" font-size="10">Anterior Pelvic Tilt (18°)</text>
      `;
      break;

    case 'lateral_left':
      title = 'LEFT LATERAL SAGITTAL PLUMB';
      subtitle = 'Contralateral Sagittal Vector Profile';
      svgContent = `
        <line x1="220" y1="20" x2="220" y2="480" stroke="#c48943" stroke-width="1.5" stroke-dasharray="4,4" />
        <circle cx="175" cy="70" r="24" fill="#222b24" stroke="#7ea18b" stroke-width="2" />
        <circle cx="182" cy="70" r="4" fill="#ef4444" />
        <line x1="220" y1="70" x2="182" y2="70" stroke="#ef4444" stroke-width="2" />
        <text x="60" y="74" fill="#ef4444" font-size="10" font-weight="bold">+28° Contralateral Shear</text>
        <circle cx="220" cy="120" r="5" fill="#cbe0d1" />
        <path d="M 205 130 C 180 170 180 200 210 230 C 225 250 220 280 215 300" fill="none" stroke="#7ea18b" stroke-width="3" />
      `;
      break;

    case 'craniocervical':
      title = 'CRANIO-CERVICAL & SUBOCCIPITALS';
      subtitle = 'Posterior Skull Base · C1-C2 Compression';
      svgContent = `
        <ellipse cx="200" cy="130" rx="90" ry="70" fill="#222b24" stroke="#7ea18b" stroke-width="2" />
        <path d="M 140 180 Q 200 210 260 180" stroke="#c48943" stroke-width="3" fill="none" />
        <circle cx="160" cy="190" r="7" fill="#ef4444" />
        <circle cx="240" cy="190" r="7" fill="#ef4444" />
        <text x="90" y="215" fill="#ef4444" font-size="10" font-weight="bold">GB20 Left</text>
        <text x="245" y="215" fill="#ef4444" font-size="10" font-weight="bold">GB20 Right (Hypertonic)</text>
        <rect x="185" y="220" width="30" height="24" rx="4" fill="#18231c" stroke="#e9c46a" stroke-width="2" />
        <text x="188" y="236" fill="#e9c46a" font-size="10" font-weight="bold">C2 Axis</text>
        <line x1="160" y1="190" x2="195" y2="230" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3" />
        <line x1="240" y1="190" x2="205" y2="230" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3" />
        <text x="120" y="280" fill="#fca5a5" font-size="11">Suboccipital Triangle Facet Jam</text>
      `;
      break;

    case 'clavicular':
      title = 'CLAVICULAR & PECTORAL GIRDLE';
      subtitle = 'Frontal AC Joint & Subclavius Groove';
      svgContent = `
        <circle cx="200" cy="80" r="14" fill="#1e2520" stroke="#7ea18b" />
        <path d="M 195 105 L 195 140 L 205 140 L 205 105 Z" fill="#18231c" />
        <circle cx="200" cy="142" r="6" fill="#c48943" />
        <text x="165" y="160" fill="#c48943" font-size="9">Jugular Notch</text>
        <path d="M 200 142 Q 140 135 80 140" stroke="#7ea18b" stroke-width="4" fill="none" />
        <path d="M 200 142 Q 260 125 320 120" stroke="#ef4444" stroke-width="4" fill="none" />
        <circle cx="320" cy="120" r="8" fill="#ef4444" />
        <text x="260" y="105" fill="#ef4444" font-size="11" font-weight="bold">+18mm Elevated AC Joint</text>
        <rect x="230" y="138" width="60" height="16" rx="4" fill="#ef4444" opacity="0.4" />
        <text x="235" y="150" fill="#ffffff" font-size="9" font-weight="bold">Subclavius Spasm</text>
      `;
      break;

    case 'scapular_shoulder':
      title = 'SCAPULAR BORDER & SHOULDER GIRDLE';
      subtitle = 'Posterior Scapular Winging & Levator Trigger';
      svgContent = `
        <line x1="200" y1="60" x2="200" y2="340" stroke="#7ea18b" stroke-width="1.5" stroke-dasharray="4,4" />
        <polygon points="100,100 150,110 130,220" fill="#1e2520" stroke="#7ea18b" stroke-width="2" />
        <polygon points="300,90 250,105 270,210" fill="#18231c" stroke="#ef4444" stroke-width="2.5" />
        <circle cx="255" cy="105" r="7" fill="#ef4444" />
        <text x="240" y="80" fill="#ef4444" font-size="10" font-weight="bold">Levator Superior Trigger</text>
        <text x="275" y="235" fill="#e9c46a" font-size="10">Inferior Angle Eversion (+12mm)</text>
        <line x1="200" y1="150" x2="265" y2="155" stroke="#e9c46a" stroke-width="2" stroke-dasharray="3,3" />
        <text x="205" y="170" fill="#e9c46a" font-size="9">Rhomboid Taut Band</text>
      `;
      break;

    case 'arm_elbow_wrist':
      title = 'UPPER EXTREMITY & FOREARM / WRIST';
      subtitle = 'Pronator Teres, Epicondyle & LI4 Hegu';
      svgContent = `
        <path d="M 150 60 L 150 200 L 140 320 L 170 320 L 180 200 L 180 60 Z" fill="#1e2520" stroke="#7ea18b" stroke-width="2" />
        <circle cx="145" cy="180" r="6" fill="#ef4444" />
        <text x="50" y="185" fill="#ef4444" font-size="10" font-weight="bold">Medial Epicondyle (Tender)</text>
        <ellipse cx="160" cy="220" rx="14" ry="24" fill="#ef4444" opacity="0.3" />
        <text x="180" y="225" fill="#fca5a5" font-size="10">Pronator Teres Strain</text>
        <circle cx="155" cy="350" r="7" fill="#e9c46a" />
        <text x="170" y="355" fill="#e9c46a" font-size="10" font-weight="bold">LI4 Hegu Webspace</text>
      `;
      break;

    case 'thoracic_ribs':
      title = 'THORACIC SPINE & COSTAL MARGIN';
      subtitle = 'Kyphotic Apex & Intercostal Restrictions';
      svgContent = `
        <line x1="200" y1="40" x2="200" y2="360" stroke="#7ea18b" stroke-width="2" />
        <path d="M 120 120 Q 200 100 280 120" stroke="#7ea18b" stroke-width="2" fill="none" />
        <path d="M 110 160 Q 200 140 290 160" stroke="#e9c46a" stroke-width="2.5" fill="none" />
        <path d="M 100 200 Q 200 180 300 200" stroke="#ef4444" stroke-width="2.5" fill="none" />
        <circle cx="200" cy="160" r="8" fill="#ef4444" />
        <text x="215" y="165" fill="#ef4444" font-size="10" font-weight="bold">T4-T6 Flatback Fixation</text>
        <text x="80" y="225" fill="#e9c46a" font-size="10">Right 10th Rib Flare Restricted</text>
      `;
      break;

    case 'lumbar_spine':
      title = 'LUMBAR SPINE & THORACOLUMBAR FASCIA';
      subtitle = 'L1-L5 Segmental Arc & QL Spasm';
      svgContent = `
        <line x1="200" y1="60" x2="200" y2="340" stroke="#7ea18b" stroke-width="1.5" stroke-dasharray="4,4" />
        <rect x="185" y="100" width="30" height="20" rx="3" fill="#18231c" stroke="#7ea18b" />
        <rect x="185" y="130" width="30" height="20" rx="3" fill="#18231c" stroke="#7ea18b" />
        <rect x="185" y="160" width="30" height="20" rx="3" fill="#18231c" stroke="#e9c46a" />
        <rect x="185" y="190" width="30" height="20" rx="3" fill="#18231c" stroke="#ef4444" stroke-width="2" />
        <text x="225" y="205" fill="#ef4444" font-size="10" font-weight="bold">L4-L5 Compression Shear</text>
        <path d="M 230 140 L 270 200 L 240 220 Z" fill="#ef4444" opacity="0.3" stroke="#ef4444" />
        <text x="275" y="180" fill="#fca5a5" font-size="10">Right QL Spasm</text>
      `;
      break;

    case 'lumbopelvic':
      title = 'LUMBOPELVIC & SACRAL BASE';
      subtitle = 'PSIS Level & Sacroiliac Joint Torque';
      svgContent = `
        <path d="M 120 120 Q 200 90 280 120 C 285 160 270 210 200 240 C 130 210 115 160 120 120 Z" fill="#1e2520" stroke="#7ea18b" stroke-width="2" />
        <circle cx="160" cy="150" r="7" fill="#7ea18b" />
        <circle cx="240" cy="140" r="8" fill="#ef4444" />
        <line x1="160" y1="150" x2="240" y2="140" stroke="#ef4444" stroke-width="2.5" />
        <text x="245" y="135" fill="#ef4444" font-size="11" font-weight="bold">R PSIS High (+10mm)</text>
        <polygon points="185,160 215,160 200,210" fill="#2d3d32" stroke="#e9c46a" stroke-width="2" />
        <text x="175" y="230" fill="#e9c46a" font-size="10">Sacral Base Torsion</text>
        <circle cx="255" cy="210" r="6" fill="#ef4444" />
        <text x="265" y="215" fill="#fca5a5" font-size="9">GB30 Piriformis</text>
      `;
      break;

    case 'hip_trochanter':
      title = 'HIPS & GREATER TROCHANTERS';
      subtitle = 'TFL Tension & Acetabulofemoral Rotation';
      svgContent = `
        <path d="M 140 100 L 260 100 L 250 160 L 150 160 Z" fill="#1e2520" stroke="#7ea18b" />
        <circle cx="110" cy="180" r="12" fill="#2d3d32" stroke="#7ea18b" stroke-width="2" />
        <circle cx="290" cy="170" r="14" fill="#2d3d32" stroke="#ef4444" stroke-width="2.5" />
        <text x="270" y="150" fill="#ef4444" font-size="10" font-weight="bold">R Trochanter Lateral Shift</text>
        <line x1="280" y1="184" x2="270" y2="290" stroke="#ef4444" stroke-width="3" />
        <text x="280" y="240" fill="#fca5a5" font-size="9">TFL / ITB Insertion Tension</text>
      `;
      break;

    case 'thigh_knee':
      title = 'THIGHS & KNEES PATISSAR TRACKING';
      subtitle = 'Q-Angle, Patellar Glide & Medial Joint Line';
      svgContent = `
        <path d="M 120 60 L 170 60 L 165 240 L 130 240 Z" fill="#1e2520" stroke="#7ea18b" />
        <path d="M 230 60 L 280 60 L 270 240 L 235 240 Z" fill="#1e2520" stroke="#7ea18b" />
        <circle cx="147" cy="250" r="12" fill="#2d3d32" stroke="#7ea18b" />
        <circle cx="257" cy="250" r="14" fill="#2d3d32" stroke="#ef4444" stroke-width="2.5" />
        <circle cx="264" cy="248" r="4" fill="#ef4444" />
        <text x="275" y="252" fill="#ef4444" font-size="10" font-weight="bold">Lateral Patella Drift (+8mm)</text>
        <line x1="250" y1="60" x2="257" y2="250" stroke="#e9c46a" stroke-width="1.5" stroke-dasharray="3,3" />
        <text x="210" y="160" fill="#e9c46a" font-size="9">Elevated Q-Angle (19°)</text>
      `;
      break;

    case 'calf_achilles':
      title = 'POSTERIOR CALVES & ACHILLES';
      subtitle = 'Gastrocnemius Bellies & Achilles Verticality';
      svgContent = `
        <path d="M 130 60 Q 110 160 140 280 L 160 280 Q 155 160 165 60 Z" fill="#1e2520" stroke="#7ea18b" />
        <path d="M 270 60 Q 290 160 260 280 L 240 280 Q 245 160 235 60 Z" fill="#1e2520" stroke="#ef4444" stroke-width="2" />
        <circle cx="250" cy="70" r="7" fill="#c48943" />
        <text x="260" y="75" fill="#c48943" font-size="9">BL40 Weizhong</text>
        <path d="M 250 280 L 245 350 L 265 350 L 260 280 Z" fill="#222b24" stroke="#ef4444" stroke-width="2" />
        <text x="180" y="320" fill="#ef4444" font-size="10" font-weight="bold">Achilles Pronation Bow (5°)</text>
      `;
      break;

    case 'podiatric':
      title = 'PODIATRIC KINETIC BASE & ANKLES';
      subtitle = 'Weight-Bearing Feet, Calcaneus & Plantar Arch';
      svgContent = `
        <ellipse cx="140" cy="220" rx="40" ry="70" fill="#1e2520" stroke="#7ea18b" stroke-width="2" />
        <ellipse cx="260" cy="220" rx="42" ry="70" fill="#1e2520" stroke="#ef4444" stroke-width="2.5" />
        <path d="M 230 190 Q 220 220 235 250" stroke="#ef4444" stroke-width="3" fill="none" />
        <text x="170" y="225" fill="#ef4444" font-size="10" font-weight="bold">Navicular Drop (-7mm)</text>
        <text x="210" y="310" fill="#fca5a5" font-size="10">Right Severe Plantar Collapse</text>
        <circle cx="230" cy="180" r="5" fill="#e9c46a" />
        <text x="175" y="175" fill="#e9c46a" font-size="9">KD3 Taixi</text>
      `;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <rect width="400" height="500" fill="#121413" />
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1c201d" stroke-width="0.8" />
      </pattern>
    </defs>
    <rect width="400" height="500" fill="url(#grid)" />
    <!-- Header banner -->
    <rect x="0" y="0" width="400" height="42" fill="#181a19" stroke="#2a2f2b" />
    <text x="15" y="22" fill="#f5f2ea" font-size="12" font-weight="bold" letter-spacing="0.5">${title}</text>
    <text x="15" y="34" fill="#a8a39b" font-size="9">${subtitle}</text>
    <!-- Visual Content -->
    ${svgContent}
    <!-- Status footer -->
    <rect x="0" y="470" width="400" height="30" fill="#181a19" stroke="#2a2f2b" />
    <circle cx="20" cy="485" r="4" fill="#10b981" />
    <text x="32" y="489" fill="#a8c5b0" font-size="9" font-weight="600">PRE-RENDERED CLINICAL CALIBRATION ACTIVE</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
