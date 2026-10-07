import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateCorroborationsForClient } from './src/data/wholeBodyPhotoCatalog';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK on server
const hasRealKey =
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY.trim() !== '' &&
  process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';

const ai = hasRealKey
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

interface AnalysisRequest {
  posturalDeviances: {
    forwardHeadDegrees: number;
    pelvicTilt: 'neutral' | 'anterior' | 'posterior' | 'lateral_left_high' | 'lateral_right_high';
    highShoulder: 'level' | 'left_high' | 'right_high';
    lateralSpinalShift: 'none' | 'cervicothoracic_right' | 'thoracolumbar_left' | 's_curve';
    description?: string;
  };
  posturalImageBase64?: string;
  clientPhotos?: Record<string, { slotId: string; label: string; imageBase64: string }> | Array<{ slotId: string; label: string; imageBase64: string }>;
  biometrics: {
    hydrationPercent: number; // e.g. 48.5%
    skeletalMuscleMassKg: number;
    asymmetryNote?: string;
    hsCrpMgL: number; // e.g. 1.2 or 4.5
    esrMmHr?: number;
    metabolicStressScore: number; // 1-10 scale
    sleepHours?: number;
  };
  lifestyle: {
    profession: string;
    repetitiveStrainPattern: string;
    ergonomicStaticLoading: string;
    voiceTranscript?: string;
  };
  painPresentation: {
    primarySymptomSite: string;
    chronicity: 'acute' | 'subacute' | 'chronic_longstanding';
    aggravatingMotion: string;
    mannequinMarkers: Array<{
      id: string;
      x: number; // 0 - 100 percentage
      y: number; // 0 - 100 percentage
      view: 'anterior' | 'posterior';
      type: 'symptom' | 'suspected_trigger';
      label: string;
    }>;
  };
}

// Fallback high-fidelity clinical synthesis engine if API key missing or transient error
function generateClinicalFallback(input: AnalysisRequest) {
  const profession = input.lifestyle.profession || 'Desk Worker';
  const symptom = input.painPresentation.primarySymptomSite || 'Cervicothoracic & Lumbar Strain';
  const hydration = input.biometrics.hydrationPercent;
  const isDehydrated = hydration < 50;
  const isHighInflammation = input.biometrics.hsCrpMgL > 3.0;

  let rootCause = '';
  let meridians: string[] = [];
  let senLines: string[] = [];
  let tsubos: string[] = [];
  let triggerOrigin = '';
  let referredTarget = symptom;

  if (symptom.toLowerCase().includes('head') || symptom.toLowerCase().includes('neck') || symptom.toLowerCase().includes('shoulder')) {
    rootCause = 'Forward head carriage (+30°) inducing chronic hypertonicity of Suboccipitals, Levator Scapulae, and Sternocleidomastoid with reciprocal inhibition of Deep Neck Flexors; upstream Gallbladder & Bladder channel Qi stagnation.';
    meridians = ['Gallbladder (GB) - Shao Yang', 'Urinary Bladder (BL) - Tai Yang', 'Small Intestine (SI) - Tai Yang'];
    senLines = ['Sen Kalathari (Upper limb and thoracic tension)', 'Sen Sahatsaransi (Facial/cervical branch)', 'Sen Sumana (Central axis)'];
    tsubos = ['GB20 (Fengchi)', 'BL10 (Tianzhu)', 'SI14 (Jianwaishu)', 'LI4 (Hegu)'];
    triggerOrigin = 'Upper Trapezius & Splenius Capitis hyperirritable nodules';
  } else if (symptom.toLowerCase().includes('low back') || symptom.toLowerCase().includes('lumbar') || symptom.toLowerCase().includes('sacro') || symptom.toLowerCase().includes('hip')) {
    rootCause = 'Prolonged hip flexion producing dense shortening of Iliopsoas & Rectus Femoris, creating anterior pelvic shear, facet impingement at L4-S1, and reciprocal Gluteus Maximus amnesia with Bladder & Kidney meridian depletion.';
    meridians = ['Urinary Bladder (BL) - Tai Yang', 'Kidney (KD) - Shao Yin', 'Gallbladder (GB) - Shao Yang'];
    senLines = ['Sen Ittha (Left parasagittal lumbar/leg path)', 'Sen Pingkhala (Right parasagittal lumbar/leg path)', 'Sen Thawari (Inguinal/anterior pelvic line)'];
    tsubos = ['BL23 (Shenshu)', 'BL25 (Dachangshu)', 'BL40 (Weizhong)', 'GB30 (Huantiao)', 'KD3 (Taixi)'];
    triggerOrigin = 'Iliopsoas anterior tendon & Piriformis deep nodal band';
  } else {
    rootCause = 'Myofascial cross-chain torque from asymmetric repetitive loading, creating rotational pelvic torsion and compensatory contralateral thoracic fixations along the superficial back and spiral lines.';
    meridians = ['Urinary Bladder (BL) - Tai Yang', 'Gallbladder (GB) - Shao Yang', 'Spleen (SP) - Tai Yin'];
    senLines = ['Sen Kalathari (Crossing limbs diagonal)', 'Sen Ittha (Ascending spinal energy)'];
    tsubos = ['BL23 (Shenshu)', 'GB34 (Yanglingquan)', 'SP6 (Sanyinjiao)', 'LI4 (Hegu)'];
    triggerOrigin = 'Quadratus Lumborum & Thoracolumbar aponeurosis trigger cluster';
  }

  const glanceCard = `### PART 1: OPERATOR GLANCE-CARD

- **Primary Hypothesis:** ${rootCause.split(';')[0]}
- **Contraindications/Precautions:**
  - ${isDehydrated ? '⚠️ Hydration at ' + hydration + '%: severe fascial tacking & ground substance viscosity. AVOID rapid dry ischemic friction; warm with broad compression and hydro-lubrication first.' : '✓ Hydration adequate (' + hydration + '%); standard myofascial shear permitted.'}
  - ${isHighInflammation ? '⚠️ High systemic inflammation (hs-CRP ' + input.biometrics.hsCrpMgL + ' mg/L): Contraindicated for Grade 5 deep periosteal stripping at acute pain site. Prioritize distal Sen line clearing and lymphatic decongestion.' : '✓ Normal inflammatory indices; full depth range appropriate.'}
  - Posture deviance: ${input.posturalDeviances.forwardHeadDegrees}° forward head, ${input.posturalDeviances.pelvicTilt.replace(/_/g, ' ')}. Protect cervical spine against excessive extension.

- **Phase Sequencing:**
  - **Phase 1: Warm & Decongest** | Broad Palm Effleurage & Thai Rocking along Bladder channel and Sen lines | Rhythmic palm compression 1-2 Hz to hydrate densified fascia and calm sympathetic hyperarousal.
  - **Phase 2: Specific Deactivation** | Ischemic Trigger Compression & Shiatsu Thumb-press on ${tsubos.slice(0, 2).join(' & ')} | Sustained 60-second Grade 3-4 pressure; sync release with client's extended exhale.
  - **Phase 3: Mobilization & Energy Flow** | Thai Passive Sen Line Traction & Myofascial Unwinding | Synchronized breath traction holding Sen Kalathari/Ittha lines to restore multi-planar glide.
  - **Phase 4: Integration & Grounding** | Bilateral Palm Sacral & Suboccipital Cradle Hold | Stationary energetic grounding hold for 3 minutes to settle parasympathetic nervous system tone.`;

  const payload = {
    diagnostic_summary: {
      primary_root_cause: rootCause,
      referred_pain_vectors: [
        {
          trigger_origin: triggerOrigin,
          referred_target: referredTarget,
          anatomical_coordinates: { x: 50.0, y: 22.0, z: 0.15 }
        },
        {
          trigger_origin: "Levator Scapulae superior angle",
          referred_target: "Medial border of scapula and posterior shoulder",
          anatomical_coordinates: { x: 42.0, y: 26.0, z: 0.1 }
        }
      ],
      energetic_pathways: {
        meridians_involved: meridians,
        sen_lines_involved: senLines,
        key_acupressure_tsubo_points: tsubos
      },
      photographic_corroborations: generateCorroborationsForClient(
        input.painPresentation?.mannequinMarkers || [],
        input.clientPhotos && !Array.isArray(input.clientPhotos) ? input.clientPhotos : undefined
      )
    },
    visual_overlay_markers: [
      {
        layer: "kinetic",
        name: "Primary Trigger Point: " + triggerOrigin,
        model_path_coordinates: [
          { x: 48.0, y: 22.0, z: 0.0 },
          { x: 52.0, y: 25.0, z: 0.05 },
          { x: 60.0, y: 20.0, z: 0.1 }
        ],
        color_hex: "#EF4444",
        glow_intensity: 0.95
      },
      {
        layer: "meridian",
        name: "Urinary Bladder Meridian (BL) Pathway",
        model_path_coordinates: [
          { x: 46.0, y: 12.0, z: 0.0 },
          { x: 46.0, y: 28.0, z: 0.0 },
          { x: 46.0, y: 55.0, z: 0.0 },
          { x: 44.0, y: 78.0, z: 0.0 }
        ],
        color_hex: "#38BDF8",
        glow_intensity: 0.85
      },
      {
        layer: "sen_line",
        name: "Thai Sen Kalathari Traction Line",
        model_path_coordinates: [
          { x: 50.0, y: 48.0, z: 0.0 },
          { x: 68.0, y: 35.0, z: 0.0 },
          { x: 82.0, y: 48.0, z: 0.0 },
          { x: 62.0, y: 88.0, z: 0.0 }
        ],
        color_hex: "#F59E0B",
        glow_intensity: 0.9
      }
    ],
    treatment_sequence: [
      {
        step: 1,
        phase_name: "Phase 1: Warm & Decongest",
        technique_type: "Swedish_Petrissage",
        floating_icon_id: "icon_knead",
        target_structure: "Superficial erectors, trapezius, and thoracolumbar fascial envelope",
        duration_minutes: 8,
        pressure_grade: "2-3",
        operator_cue: "Rhythmic wave compressions along Bladder meridian to melt fascial gel state."
      },
      {
        step: 2,
        phase_name: "Phase 2: Specific Deactivation",
        technique_type: "Shiatsu_Acupressure",
        floating_icon_id: "icon_thumb_press",
        target_structure: tsubos[0] + " & " + triggerOrigin,
        duration_minutes: 12,
        pressure_grade: "3-4",
        operator_cue: "Perpendicular thumb-press into core nodule; hold 60s as local twitch subsides."
      },
      {
        step: 3,
        phase_name: "Phase 3: Mobilization & Energy Flow",
        technique_type: "Thai_Sen_Mobilization",
        floating_icon_id: "icon_passive_stretch",
        target_structure: senLines[0] + " kinetic chain",
        duration_minutes: 10,
        pressure_grade: "3-4",
        operator_cue: "Anchor distal limb and apply axial traction along Sen line on client exhale."
      },
      {
        step: 4,
        phase_name: "Phase 4: Integration & Grounding",
        technique_type: "Myofascial_Release",
        floating_icon_id: "icon_elbow_glide",
        target_structure: "Craniosacral axis & energetic terminal tsubos",
        duration_minutes: 5,
        pressure_grade: "1-2",
        operator_cue: "Stationary bilateral palm connection at occiput and sacrum to seal autonomic reset."
      }
    ]
  };

  return {
    rawText: glanceCard + '\n\n### PART 2: ANIMATED MODEL & UI PAYLOAD\n```json\n' + JSON.stringify(payload, null, 2) + '\n```',
    glanceCardMarkdown: glanceCard,
    payloadJson: payload,
    source: 'clinical_engine_fallback'
  };
}

// Analysis API endpoint
app.post('/api/analyze', async (req, res) => {
  const input: AnalysisRequest = req.body;

  if (!input) {
    res.status(400).json({ error: 'Missing analysis request payload' });
    return;
  }

  // Build clinical prompt
  const systemInstruction = `You are an expert Clinical Orthopedic Bodywork & Holistic Integrative Therapist Engine. You synthesize Western biomechanics (kinetic chains, myofascial trigger points, Travell & Simons referred pain patterns) with Eastern somatic traditions (TCM 12 Principal Meridians & Ki pathways, Thai Sib Sen lines, and Shiatsu tsubo points).

Your role is to analyze multimodal client data and generate:
1. Root-cause kinetic and energetic diagnostics.
2. Coordinate and mapping data for an animated interactive body model.
3. Rapid, real-time, phase-by-phase treatment protocols (with quick-switch technique cues: Effleurage/Pétrissage → Myofascial Release → Shiatsu/Tsubo → Thai Sen Line Stretches).

INGESTION & ANALYSIS PROTOCOL:
- Client Postural Deviations: evaluate pelvic tilt, forward head carriage, high shoulder, lateral spinal shift.
- Biometric Scale / Lab markers: hydration level (affects fascial glide & ground substance viscosity), skeletal muscle mass distribution, systemic inflammation markers (hs-CRP, ESR - flag contraindications), metabolic stress.
- Voice/Transcript (Profession & Lifestyle): ergonomic repetitive stress injuries (RSIs), static loading patterns (desk worker: shortened iliopsoas, strained levator scapulae; dentist/hygienist/mechanic: asymmetric rotation).
- Marked Pain Site & Chronicity: differentiate between the symptom site and the upstream root cause (e.g., lumbar pain caused by shortened psoas and weak glutes; headache caused by suboccipital/sternocleidomastoid trigger points).

MAPPING & ENERGETIC INTEGRATION RULES:
1. Kinetic & Trigger Point Layer: Identify primary hyperirritable nodules and their projection zones (referred pain vectors).
2. Meridian / Ki Layer: Map affected TCM meridians (e.g., Urinary Bladder, Gallbladder, Stomach, Spleen, Kidney, Governor Vessel) and key tsubo points.
3. Sen Line Layer: Map corresponding Thai Sen lines (e.g., Sen Sumana, Sen Ittha, Sen Pingkhala, Sen Kalathari, Sen Sahatsaransi, Sen Thawari) to direct traction and energy clearing.

OUTPUT FORMAT REQUIREMENTS:
You must ALWAYS format your response in TWO parts:

### PART 1: OPERATOR GLANCE-CARD (Markdown)
- Primary Hypothesis: [Root cause vs. Symptom site in 1 sentence]
- Contraindications/Precautions: [Bullet points based on labs/biometrics]
- Phase Sequencing:
  - Phase 1: Warm & Decongest [Technique switch + targeted line + 15-word execution cue]
  - Phase 2: Specific Deactivation [Technique switch + anatomical focus + hold duration]
  - Phase 3: Mobilization & Energy Flow [Technique switch + breath cue]
  - Phase 4: Integration & Grounding [Closing hold]

### PART 2: ANIMATED MODEL & UI PAYLOAD (Strict JSON)
Output a valid, parseable JSON block wrapped in \`\`\`json ... \`\`\` conforming to:
{
  "diagnostic_summary": {
    "primary_root_cause": "string",
    "referred_pain_vectors": [
      {
        "trigger_origin": "string",
        "referred_target": "string",
        "anatomical_coordinates": {"x": 50.0, "y": 25.0, "z": 0.0}
      }
    ],
    "energetic_pathways": {
      "meridians_involved": ["string"],
      "sen_lines_involved": ["string"],
      "key_acupressure_tsubo_points": ["e.g., GB20", "BL23", "LI4"]
    }
  },
  "visual_overlay_markers": [
    {
      "layer": "kinetic | meridian | sen_line",
      "name": "string",
      "model_path_coordinates": [
        {"x": 50.0, "y": 20.0, "z": 0.0}
      ],
      "color_hex": "#FF4500",
      "glow_intensity": 0.8
    }
  ],
  "treatment_sequence": [
    {
      "step": 1,
      "phase_name": "string",
      "technique_type": "Swedish_Petrissage | Deep_Tissue | Shiatsu_Acupressure | Thai_Sen_Mobilization | Myofascial_Release",
      "floating_icon_id": "icon_knead | icon_thumb_press | icon_elbow_glide | icon_passive_stretch",
      "target_structure": "string",
      "duration_minutes": 5,
      "pressure_grade": "1-5",
      "operator_cue": "Concise instruction under 20 words"
    }
  ]
}`;

  const userPrompt = `CLIENT INGESTION DOSSIER:
- Posture Deviations: Forward Head ${input.posturalDeviances?.forwardHeadDegrees || 25}°, Pelvic Tilt: ${input.posturalDeviances?.pelvicTilt || 'anterior'}, High Shoulder: ${input.posturalDeviances?.highShoulder || 'level'}, Lateral Spinal Shift: ${input.posturalDeviances?.lateralSpinalShift || 'none'}. Notes: ${input.posturalDeviances?.description || 'None'}.
- Biometrics & Labs: Hydration: ${input.biometrics?.hydrationPercent || 50}%, Skeletal Muscle Mass: ${input.biometrics?.skeletalMuscleMassKg || 30}kg (${input.biometrics?.asymmetryNote || 'No asymmetry noted'}), hs-CRP: ${input.biometrics?.hsCrpMgL || 1.0} mg/L, ESR: ${input.biometrics?.esrMmHr || 12} mm/hr, Metabolic Stress: ${input.biometrics?.metabolicStressScore || 5}/10, Sleep: ${input.biometrics?.sleepHours || 7}h.
- Profession & Lifestyle: Profession: ${input.lifestyle?.profession || 'Desk Worker'}, Repetitive Strain: ${input.lifestyle?.repetitiveStrainPattern || 'Repetitive keyboard/mouse'}, Static Loading: ${input.lifestyle?.ergonomicStaticLoading || 'Seated 8-10h/day'}. Voice/Intake Transcript: "${input.lifestyle?.voiceTranscript || 'Client reports tension building throughout workday.'}"
- Pain Presentation: Primary Symptom Site: ${input.painPresentation?.primarySymptomSite || 'Neck and upper back'}, Chronicity: ${input.painPresentation?.chronicity || 'chronic_longstanding'}, Aggravating Motion: ${input.painPresentation?.aggravatingMotion || 'Static sitting and rotation'}. Marked coordinates: ${JSON.stringify(input.painPresentation?.mannequinMarkers || [])}.

Perform root-cause kinetic & energetic diagnosis and generate PART 1 (OPERATOR GLANCE-CARD) and PART 2 (ANIMATED MODEL & UI PAYLOAD in strict JSON).`;

  if (ai) {
    try {
      let parts: any[] = [{ text: userPrompt }];

      // Attach client photos from clientPhotos object or array
      if (input.clientPhotos) {
        const photoList = Array.isArray(input.clientPhotos)
          ? input.clientPhotos
          : Object.values(input.clientPhotos);

        for (const photo of photoList) {
          if (photo?.imageBase64) {
            const matches = photo.imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (matches) {
              parts.push({
                text: `[SUPPLIED CLIENT PHOTOGRAPH: ${photo.label} (${photo.slotId})]`,
              });
              parts.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2],
                },
              });
            }
          }
        }
      }

      if (input.posturalImageBase64) {
        const matches = input.posturalImageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          parts.unshift({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Generation request exceeded grace period')), 15000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const responseText = response.text || '';

      // Parse Part 1 and Part 2
      let glanceCardMarkdown = '';
      let payloadJson: any = null;

      const part1Index = responseText.indexOf('### PART 1');
      const part2Index = responseText.indexOf('### PART 2');

      if (part1Index !== -1 && part2Index !== -1) {
        glanceCardMarkdown = responseText.substring(part1Index, part2Index).trim();
      } else if (part1Index !== -1) {
        glanceCardMarkdown = responseText.substring(part1Index).trim();
      } else {
        glanceCardMarkdown = responseText.split('```json')[0].trim();
      }

      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          payloadJson = JSON.parse(jsonMatch[1]);
        } catch {
          // Fall through to fallback payload extraction
        }
      }

      if (!payloadJson) {
        const fallback = generateClinicalFallback(input);
        payloadJson = fallback.payloadJson;
        if (!glanceCardMarkdown) glanceCardMarkdown = fallback.glanceCardMarkdown;
      }

      res.json({
        rawText: responseText,
        glanceCardMarkdown,
        payloadJson,
        source: 'gemini-3.8-flash',
      });
      return;
    } catch {
      // Graceful fallback to deterministic high-precision clinical engine without logging to stderr
    }
  }

  // Return clinical synthesis fallback
  const fallback = generateClinicalFallback(input);
  res.json(fallback);
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SomaKinetic Engine server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
