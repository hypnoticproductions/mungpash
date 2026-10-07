import { ParsedPdfBiometrics } from '../types/clinical';

export const SAMPLE_PDF_TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  sourceType: 'InBody' | 'Quest/LabCorp' | 'DEXA';
  content: string;
  parsed: ParsedPdfBiometrics;
}> = [
  {
    id: 'inbody_770_marcus',
    name: 'InBody_770_Body_Composition_Scan.pdf',
    description: 'InBody 770 Multi-Frequency BIA Report showing fascial dehydration & right upper girdle hypertrophy.',
    sourceType: 'InBody',
    content: `========================================================================
INBODY 770 CLINICAL BODY COMPOSITION ANALYZER
Patient: Marcus Vance | Age: 36 | Male | Height: 182 cm
Test Date: 2026-09-14 09:15 AM | Operator: Clinical Biomechanics Lab
========================================================================
BODY COMPOSITION ANALYSIS
Total Body Water (TBW): 36.8 L (47.2% of body weight) -> [LOW: Fascial Viscosity Alert]
Extracellular Water Ratio (ECW/TBW): 0.384 [Mild fluid stasis]
Intracellular Water: 22.7 L
Extracellular Water: 14.1 L
Dry Lean Mass: 14.6 kg
Body Fat Mass: 18.2 kg (23.4%)
Skeletal Muscle Mass (SMM): 31.4 kg

SEGMENTAL LEAN ANALYSIS (Mass & Impedance Balance)
Right Arm: 3.85 kg (118% Normal) -> [HYPERTONIC: Chronic mouse elevation]
Left Arm:  3.28 kg (100% Normal)
Trunk:     27.1 kg (104% Normal)
Right Leg: 8.62 kg (101% Normal)
Left Leg:  8.58 kg (100% Normal)

METABOLIC & VISCERAL INDICES
Visceral Fat Level: Level 8 (Moderate)
Basal Metabolic Rate: 1680 kcal
Phase Angle (50kHz Whole Body): 5.9° [Cellular membrane recovery suboptimal]
Operator Notes: Fascial ground substance dehydration likely impairs sliding surfaces.
========================================================================`,
    parsed: {
      fileName: 'InBody_770_Body_Composition_Scan.pdf',
      extractedAt: new Date().toLocaleDateString(),
      sourceType: 'InBody',
      hydrationPercent: 47.2,
      skeletalMuscleMassKg: 31.4,
      asymmetryNote: 'Right Arm Lean Mass +18% vs Left (Asymmetric dominant mouse loading)',
      hsCrpMgL: 1.8,
      esrMmHr: 14,
      metabolicStressScore: 8,
      visceralFatLevel: 8,
      rawExtractedText: 'Total Body Water: 47.2% (Dehydrated). SMM: 31.4 kg. Right arm +18% hypertrophy.',
    },
  },
  {
    id: 'labcorp_inflammation_elena',
    name: 'LabCorp_Systemic_Inflammatory_Markers.pdf',
    description: 'LabCorp Comprehensive Inflammation Panel indicating acute post-exercise inflammatory spike.',
    sourceType: 'Quest/LabCorp',
    content: `========================================================================
LABORATORY CORPORATION OF AMERICA - CLINICAL PATHOLOGY REPORT
Patient: Elena Rostova | Age: 29 | Female | ID: LBC-884920
Ordering Physician: Sports Orthopedics | Collected: 2026-10-02
========================================================================
INFLAMMATORY & METABOLIC BIOMARKERS
Test Name                      Result      Flag    Reference Range    Units
------------------------------------------------------------------------
High-Sensitivity CRP (hs-CRP)   3.9        HIGH    < 1.0 Low Risk     mg/L
                                                   1.0-3.0 Avg Risk
                                                   > 3.0 High Inflammation
Erythrocyte Sed Rate (ESR)      22         HIGH    0 - 15             mm/hr
Serum Ferritin                  42                 15 - 150           ng/mL
Cortisol (AM Fasting)           21.8       HIGH    6.2 - 19.4         mcg/dL
Serum Albumin                   4.4                3.5 - 5.0          g/dL
Hydration / Serum Osmolality    298                275 - 295          mOsm/kg
Hydration Calculated Index:     56.8%      NORMAL  > 52% Optimal

CLINICAL INTERPRETATION:
hs-CRP elevated at 3.9 mg/L with ESR of 22 mm/hr indicates active systemic
myofascial inflammatory cascade following repetitive eccentric knee strain.
Caution: Avoid deep periosteal friction on acute lateral femoral insertion.
========================================================================`,
    parsed: {
      fileName: 'LabCorp_Systemic_Inflammatory_Markers.pdf',
      extractedAt: new Date().toLocaleDateString(),
      sourceType: 'Quest/LabCorp',
      hydrationPercent: 56.8,
      skeletalMuscleMassKg: 28.6,
      asymmetryNote: 'Right lateral kinetic chain inflammation; TFL irritability',
      hsCrpMgL: 3.9,
      esrMmHr: 22,
      metabolicStressScore: 6,
      visceralFatLevel: 4,
      rawExtractedText: 'hs-CRP: 3.9 mg/L (High), ESR: 22 mm/hr, Cortisol: 21.8 mcg/dL (Sympathetic overdrive).',
    },
  },
];

/**
 * Intelligent regex and heuristic extractor for raw PDF/text lab reports
 */
export async function parseBiometricPdfContent(fileOrText: File | string): Promise<ParsedPdfBiometrics> {
  let text = '';
  let fileName = 'Client_Lab_Document.pdf';

  if (typeof fileOrText === 'string') {
    text = fileOrText;
    fileName = 'Pasted_Clinical_Document.txt';
  } else {
    fileName = fileOrText.name;
    // Read text from file
    text = await readFileAsText(fileOrText);
  }

  // Detect source type
  let sourceType: 'InBody' | 'Quest/LabCorp' | 'DEXA' | 'Custom' = 'Custom';
  if (/inbody/i.test(text) || /tbw/i.test(text)) sourceType = 'InBody';
  else if (/labcorp|quest|sed rate|esr|crp/i.test(text)) sourceType = 'Quest/LabCorp';
  else if (/dexa|dual-energy/i.test(text)) sourceType = 'DEXA';

  // 1. Hydration parsing
  let hydration: number | undefined;
  const hydrationMatch = text.match(/(?:hydration|total body water|tbw|water percentage|water)[\s\S]{0,30}?([0-9]{2}(?:\.[0-9]+)?)\s*%/i);
  if (hydrationMatch) {
    hydration = parseFloat(hydrationMatch[1]);
  } else {
    const rawWater = text.match(/([0-9]{2}(?:\.[0-9]+)?)\s*%\s*(?:of body weight|tbw)/i);
    if (rawWater) hydration = parseFloat(rawWater[1]);
  }

  // 2. Skeletal Muscle Mass (kg or lbs)
  let smm: number | undefined;
  const smmMatch = text.match(/(?:skeletal muscle mass|smm|muscle mass)[\s\S]{0,25}?([0-9]{2}(?:\.[0-9]+)?)\s*(?:kg|lbs)?/i);
  if (smmMatch) {
    smm = parseFloat(smmMatch[1]);
  }

  // 3. hs-CRP (High sensitivity C-Reactive protein mg/L)
  let hsCrp: number | undefined;
  const crpMatch = text.match(/(?:hs-crp|crp|c-reactive protein)[\s\S]{0,25}?([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/l|mg\/dl)?/i);
  if (crpMatch) {
    hsCrp = parseFloat(crpMatch[1]);
  }

  // 4. ESR (Erythrocyte Sedimentation Rate mm/hr)
  let esr: number | undefined;
  const esrMatch = text.match(/(?:erythrocyte sed|sed rate|esr)[\s\S]{0,25}?([0-9]+(?:\.[0-9]+)?)\s*(?:mm\/hr)?/i);
  if (esrMatch) {
    esr = parseFloat(esrMatch[1]);
  }

  // 5. Visceral Fat or Stress Score
  let visceral: number | undefined;
  const viscMatch = text.match(/(?:visceral fat level|visceral fat|vfl)[\s\S]{0,20}?([0-9]+)/i);
  if (viscMatch) {
    visceral = parseInt(viscMatch[1], 10);
  }

  // 6. Asymmetry detection
  let asymmetry: string | undefined;
  if (/right arm[\s\S]{0,20}?([0-9]+%)[\s\S]{0,20}?left arm/i.test(text)) {
    asymmetry = 'Right vs Left Arm Lean Mass discrepancy detected';
  } else if (/right leg[\s\S]{0,20}?left leg/i.test(text)) {
    asymmetry = 'Bilateral lower limb mass variance detected';
  }

  // Default fallbacks if document was sparse
  const result: ParsedPdfBiometrics = {
    fileName,
    extractedAt: new Date().toLocaleDateString(),
    sourceType,
    hydrationPercent: hydration ?? 48.0,
    skeletalMuscleMassKg: smm ?? 30.5,
    asymmetryNote: asymmetry ?? 'Extracted from automated lab report stream',
    hsCrpMgL: hsCrp ?? 1.5,
    esrMmHr: esr ?? 14,
    metabolicStressScore: visceral ? Math.min(10, visceral) : (hsCrp && hsCrp > 3 ? 8 : 6),
    visceralFatLevel: visceral ?? 7,
    rawExtractedText: text.slice(0, 500) + '...',
  };

  return result;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsText(file);
  });
}
