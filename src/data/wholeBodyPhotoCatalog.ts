import { PosturePhotoSlotId, PainPointMarker, PhotoCorroborationItem } from '../types/clinical';

export interface WholeBodyPhotoSlotDef {
  id: PosturePhotoSlotId;
  label: string;
  shortLabel: string;
  category: 'full_body' | 'head_neck' | 'torso_spine' | 'pelvis_hip' | 'lower_extremity';
  categoryLabel: string;
  viewPerspective: 'anterior' | 'posterior' | 'lateral';
  viewAngle: string;
  targetStructures: string;
  framingCue: string;
  clinicalRationale: string;
  landmarks: string[];
  bodyDoubleHotspot: { x: number; y: number; view: 'anterior' | 'posterior' };
  sampleDysfunction: string;
  treatmentDynamic: string;
  corroboratedMarkerName: string;
}

export const WHOLE_BODY_PHOTO_SLOTS: WholeBodyPhotoSlotDef[] = [
  // 1. FULL BODY PROJECTIONS
  {
    id: 'anterior_full',
    label: 'Anterior Coronal Full Body Plumb View',
    shortLabel: 'Full Body Front',
    category: 'full_body',
    categoryLabel: 'Full Length Projections',
    viewPerspective: 'anterior',
    viewAngle: 'Full Frontal Symmetry Plane (Head to Feet)',
    targetStructures: 'Facial midline axis, sternal notch, bilateral acromion level, ASIS pelvic level, patellar tracking, malleoli',
    framingCue: 'Frame entire client upright facing camera. Calibrate against vertical gravity plumb line down midline.',
    clinicalRationale: 'Captures global coronal compensation: head tilt, shoulder height discrepancy, thoracic rib cage list, and bilateral genu valgum/varum.',
    landmarks: ['Nasion / Chin Midline', 'Sternal Notch', 'Bilateral ASIS', 'Patellar Midpoint', 'Intermalleolar Midpoint'],
    bodyDoubleHotspot: { x: 50, y: 50, view: 'anterior' },
    sampleDysfunction: 'Right acromion elevated +14mm with left thoracic translation; right genu valgum (+6° inward medial collapse).',
    treatmentDynamic: 'Balance coronal kinetic chain; address dominant-side shoulder girdle elevation and foot pronation torque.',
    corroboratedMarkerName: 'Full frontal coronal asymmetry axis',
  },
  {
    id: 'posterior_full',
    label: 'Posterior Coronal Full Body Plumb View',
    shortLabel: 'Full Body Back',
    category: 'full_body',
    categoryLabel: 'Full Length Projections',
    viewPerspective: 'posterior',
    viewAngle: 'Full Dorsal Vertical Gravity Plane',
    targetStructures: 'Inion occiput, C7 vertebra prominence, scapular medial borders, bilateral PSIS dimples, gluteal crease, Achilles verticality',
    framingCue: 'Frame client from back, head to heels. Plumb line aligned through C7 spinous process and gluteal cleft.',
    clinicalRationale: 'Assesses scoliosis/functional spinal curve, latissimus dorsi asymmetry, scapular winging, and unilateral pelvic upslip.',
    landmarks: ['Inion / C7 Prominence', 'Scapular Inferior Angles', 'Bilateral PSIS Dimples', 'Gluteal Crease', 'Achilles Tendon Verticality'],
    bodyDoubleHotspot: { x: 50, y: 50, view: 'posterior' },
    sampleDysfunction: 'Functional right high shoulder list with right Thoracolumbar C-curve; right PSIS elevated +11mm.',
    treatmentDynamic: 'Decompress right Quadratus Lumborum & Levator Scapulae spasm before releasing superficial back line.',
    corroboratedMarkerName: 'Posterior coronal list & scapular asymmetry',
  },
  {
    id: 'lateral_sagittal',
    label: 'Right Lateral Sagittal Plumb View',
    shortLabel: 'Right Side Profile',
    category: 'full_body',
    categoryLabel: 'Full Length Projections',
    viewPerspective: 'lateral',
    viewAngle: 'Right Sagittal Gravity Vector Profile',
    targetStructures: 'Auditory meatus, acromion process, lumbar lordosis apex, greater trochanter, lateral knee joint line, lateral malleolus',
    framingCue: 'Align right side of client with Kendall plumb line (anterior to lateral malleolus, through greater trochanter and auditory meatus).',
    clinicalRationale: 'Measures forward head carriage (+degrees), thoracic hyper-kyphosis, anterior pelvic tilt, and knee hyperextension.',
    landmarks: ['External Auditory Meatus', 'Acromion Center', 'Greater Trochanter', 'Fibular Head', 'Lateral Malleolus'],
    bodyDoubleHotspot: { x: 50, y: 30, view: 'anterior' },
    sampleDysfunction: '+32° forward head shear (auditory meatus 52mm anterior to acromion); 18° anterior pelvic tilt.',
    treatmentDynamic: 'Perform suboccipital decompression and release shortened rectus femoris/iliopsoas to restore sagittal plumb.',
    corroboratedMarkerName: 'Sagittal forward head shear & pelvic tilt',
  },
  {
    id: 'lateral_left',
    label: 'Left Lateral Sagittal Plumb View',
    shortLabel: 'Left Side Profile',
    category: 'full_body',
    categoryLabel: 'Full Length Projections',
    viewPerspective: 'lateral',
    viewAngle: 'Left Sagittal Gravity Vector Profile',
    targetStructures: 'Contralateral auditory meatus, left acromion, thoracic arc, left greater trochanter, lateral malleolus',
    framingCue: 'Position left profile against plumb grid to corroborate bilateral sagittal rotation and spinal shearing asymmetries.',
    clinicalRationale: 'Enables bilateral sagittal comparison to diagnose transverse rotational torsion superimposed on sagittal curves.',
    landmarks: ['Left Auditory Meatus', 'Left Acromion', 'Left Trochanter', 'Left Knee Joint', 'Left Malleolus'],
    bodyDoubleHotspot: { x: 50, y: 30, view: 'posterior' },
    sampleDysfunction: 'Asymmetric left thoracic hypomobility with reduced cervical extension; left hip anterior glide.',
    treatmentDynamic: 'Compare left vs right pelvic tilt angle; prioritize bilateral pelvic de-rotation.',
    corroboratedMarkerName: 'Left sagittal rotational compensation',
  },

  // 2. CRANIO-CERVICAL & UPPER BODY
  {
    id: 'craniocervical',
    label: 'Cranio-Cervical & Upper Cervical Base',
    shortLabel: 'Head & Suboccipitals',
    category: 'head_neck',
    categoryLabel: 'Cervical & Upper Body',
    viewPerspective: 'posterior',
    viewAngle: 'Posterior Occipital Close-Up',
    targetStructures: 'Inion ridge, C1 Atlas transverse processes, C2 Axis spinous process, Suboccipital triangle, GB20 / BL10 points',
    framingCue: 'Frame base of skull down to C7 vertebra. Observe head tilt, lateral rotation, and suboccipital tissue thickening.',
    clinicalRationale: 'Directly evaluates upper cervical facet jamming, tension cephalea triggers, and suboccipital dural bridge strain.',
    landmarks: ['Inion Crest', 'Mastoid Processes', 'C2 Spinous Process', 'Occipital Shelf'],
    bodyDoubleHotspot: { x: 50, y: 12, view: 'posterior' },
    sampleDysfunction: 'Dense hypertonicity of right Rectus Capitis Posterior Major & Obliquus Capitis Superior; GB20 tender nodule.',
    treatmentDynamic: 'Perform 90s gentle suboccipital cradle traction and Shiatsu thumb pressure on GB20/BL10 before manual cervical mobilization.',
    corroboratedMarkerName: 'Occipital base & upper cervical compression',
  },
  {
    id: 'clavicular',
    label: 'Clavicular & Pectoral Girdle',
    shortLabel: 'Clavicle & Chest',
    category: 'head_neck',
    categoryLabel: 'Cervical & Upper Body',
    viewPerspective: 'anterior',
    viewAngle: 'Frontal Coronal Close-Up (Neck to Sternum)',
    targetStructures: 'Sternoclavicular joint, clavicle shafts, acromioclavicular (AC) joints, subclavius groove, pectoralis minor attachment',
    framingCue: 'Frame neck base to mid-sternum with client arms relaxed at sides. Observe clavicle elevation angle and asymmetry.',
    clinicalRationale: 'Essential for thoracic outlet space, costoclavicular neurovascular compression, and anterior shoulder rounding.',
    landmarks: ['Jugular Notch', 'Sternoclavicular Joint', 'Clavicle Mid-Shaft', 'Coracoid Process', 'AC Joint'],
    bodyDoubleHotspot: { x: 62, y: 22, view: 'anterior' },
    sampleDysfunction: 'Right clavicular steepening (+18mm elevation), shortened Subclavius, and dense tension along Pectoralis Minor insertion.',
    treatmentDynamic: 'Apply myofascial release along inferior clavicular groove (Subclavius) and Sen Kalathari chest branch before glenohumeral traction.',
    corroboratedMarkerName: 'Clavicular girdle & subclavius tension',
  },
  {
    id: 'scapular_shoulder',
    label: 'Posterior Scapular Border & Shoulder Girdle',
    shortLabel: 'Scapulae & Shoulders',
    category: 'head_neck',
    categoryLabel: 'Cervical & Upper Body',
    viewPerspective: 'posterior',
    viewAngle: 'Posterior Upper Thoracic & Scapular Close-Up',
    targetStructures: 'Spine of scapula, medial scapular border, inferior scapular angle, Levator Scapulae insertion, Rhomboids, Trapezius',
    framingCue: 'Frame upper back from C6 to T8 with client standing relaxed. Check for scapular winging, tipping, or upward rotation.',
    clinicalRationale: 'Identifies scapulothoracic rhythm dysfunction, dorsal scapular nerve tension, and interscapular trigger point clusters.',
    landmarks: ['Superior Scapular Angle', 'Root of Spine of Scapula', 'Inferior Scapular Angle', 'T3 Spinous Level'],
    bodyDoubleHotspot: { x: 60, y: 25, view: 'posterior' },
    sampleDysfunction: 'Right scapular winging (medial border lift +12mm) and hyperirritable Levator Scapulae trigger at superior angle.',
    treatmentDynamic: 'Target ischemic compression at Levator insertion (SI14) and release Rhomboid fascial planes with thumb glides.',
    corroboratedMarkerName: 'Right scapular border & levator trigger',
  },
  {
    id: 'arm_elbow_wrist',
    label: 'Upper Extremity: Elbow, Forearm & Wrist/Hand',
    shortLabel: 'Arm, Elbow & Hand',
    category: 'head_neck',
    categoryLabel: 'Cervical & Upper Body',
    viewPerspective: 'anterior',
    viewAngle: 'Upper Extremity Close-Up (Bilateral Forearms & Hands)',
    targetStructures: 'Medial/lateral humeral epicondyles, pronator teres, carpal tunnel flexor retinaculum, thenar eminence, LI4 tsubo',
    framingCue: 'Frame elbows to fingertips with palms forward then supinated. Observe forearm carrying angle and wrist deviation.',
    clinicalRationale: 'Detects repetitive strain injury (RSI), mouse/keyboard pronator strain, lateral epicondylitis, and carpal fascia crowding.',
    landmarks: ['Medial Epicondyle', 'Radial Styloid', 'Ulnar Styloid', 'Thenar Eminence', 'LI4 Tsubo (Hegu)'],
    bodyDoubleHotspot: { x: 80, y: 45, view: 'anterior' },
    sampleDysfunction: 'Dense fascial tacking in right Pronator Teres & Flexor Carpi Radialis; elevated tone at LI4 Hegu webspace.',
    treatmentDynamic: 'Strip forearm flexor compartment with elbow glides and apply acupressure to LI4 and PC6 to relieve upstream cervical draw.',
    corroboratedMarkerName: 'Forearm flexor strain & LI4 trigger',
  },

  // 3. TORSO, SPINE & LUMBOPELVIC
  {
    id: 'thoracic_ribs',
    label: 'Thoracic Spine & Rib Cage / Intercostals',
    shortLabel: 'Thoracic & Ribs',
    category: 'torso_spine',
    categoryLabel: 'Torso, Spine & Lumbopelvic',
    viewPerspective: 'posterior',
    viewAngle: 'Mid-Thoracic Posterior & Lateral Arc',
    targetStructures: 'T1-T12 spinous processes, paravertebral gutters, costovertebral joints, intercostal fascial spaces, Bladder meridian',
    framingCue: 'Frame middle back during normal resting breathing and deep inhalation. Observe rib flare and thoracic arc stiffness.',
    clinicalRationale: 'Evaluates thoracic hypomobility, kyphotic apex rigidity, respiratory breathing restriction, and sympathovagal stress.',
    landmarks: ['T4 Mid-Thoracic Apex', 'T7 Inferior Angle Line', 'Paravertebral Erector Gutters', '10th Rib Costal Margin'],
    bodyDoubleHotspot: { x: 50, y: 35, view: 'posterior' },
    sampleDysfunction: 'Mid-thoracic flatback fixation at T4-T7 with restricted bilateral rib expansion and sympathetic arousal.',
    treatmentDynamic: 'Utilize Thai rocking compressions along Bladder meridian paravertebrals to restore segmental thoracic extension.',
    corroboratedMarkerName: 'Mid-thoracic fixation & rib cage stiffness',
  },
  {
    id: 'lumbar_spine',
    label: 'Lumbar Spine & Thoracolumbar Aponeurosis',
    shortLabel: 'Lumbar Spine',
    category: 'torso_spine',
    categoryLabel: 'Torso, Spine & Lumbopelvic',
    viewPerspective: 'posterior',
    viewAngle: 'Lower Back Coronal & Sagittal Close-Up',
    targetStructures: 'L1-L5 lumbar spinous processes, Quadratus Lumborum, Thoracolumbar fascia diamond, Erector spinae bulk',
    framingCue: 'Frame lower ribcage to iliac crests. Check for unilateral lumbar fullness, creasing, and lateral tilt.',
    clinicalRationale: 'Directly uncovers lumbar shear, facet joint imbrication, Quadratus Lumborum spasm, and thoracolumbar fascial tacking.',
    landmarks: ['L1 Level', 'L4-L5 Interspace (Jacoby line)', 'Quadratus Lumborum Lateral Border', 'Thoracolumbar Fascia Apex'],
    bodyDoubleHotspot: { x: 50, y: 44, view: 'posterior' },
    sampleDysfunction: 'Unilateral right Quadratus Lumborum spasm creating right lateral lumbar creasing and shear strain on L4-L5 disc.',
    treatmentDynamic: 'Side-lying deep tissue elbow glide along lateral border of QL, followed by Sen Ittha lumbar mobilization.',
    corroboratedMarkerName: 'Lumbar Quadratus Lumborum spasm',
  },
  {
    id: 'lumbopelvic',
    label: 'Lumbopelvic & Sacral Base / Sacroiliac',
    shortLabel: 'Pelvis & Sacrum',
    category: 'torso_spine',
    categoryLabel: 'Torso, Spine & Lumbopelvic',
    viewPerspective: 'posterior',
    viewAngle: 'Lumbopelvic & Gluteal Plane',
    targetStructures: 'Posterior Superior Iliac Spines (PSIS), sacral triangle, sacrotuberous ligament, iliac crests, piriformis path',
    framingCue: 'Camera level with L4/PSIS. Observe bilateral PSIS level, sacral torsion, and asymmetric gluteal fold height.',
    clinicalRationale: 'Critical for diagnosing sacroiliac joint torque, pelvic upslip, and deep piriformis sciatic entrapment.',
    landmarks: ['Bilateral PSIS Dimples', 'Sacral Base Angle', 'Iliac Crest Horizontal', 'Greater Trochanter Level'],
    bodyDoubleHotspot: { x: 50, y: 52, view: 'posterior' },
    sampleDysfunction: 'Right PSIS upslip (+10mm), left sacral anterior torsion, and deep hypertonicity in right Piriformis (GB30).',
    treatmentDynamic: 'Perform sustained thumb-press into GB30 (Piriformis nodule) and gentle MET muscle energy pelvic de-rotation.',
    corroboratedMarkerName: 'Sacroiliac joint torque & piriformis tension',
  },
  {
    id: 'hip_trochanter',
    label: 'Hip Joint & Greater Trochanters / Gluteals',
    shortLabel: 'Hips & Trochanters',
    category: 'pelvis_hip',
    categoryLabel: 'Torso, Spine & Lumbopelvic',
    viewPerspective: 'anterior',
    viewAngle: 'Bilateral Hips & Inguinal Groin View',
    targetStructures: 'Greater trochanters, Tensor Fasciae Latae (TFL), Iliopsoas tendon at lesser trochanter, Gluteus Medius, ASIS',
    framingCue: 'Frame pelvic girdle and upper thighs. Observe hip internal/external rotation asymmetry and lateral pelvic shift.',
    clinicalRationale: 'Assesses hip impingement, iliopsoas shortening, gluteus medius inhibition, and lateral hip friction syndromes.',
    landmarks: ['Bilateral ASIS', 'Pubic Symphysis Level', 'Greater Trochanters', 'TFL Muscle Belly'],
    bodyDoubleHotspot: { x: 65, y: 55, view: 'anterior' },
    sampleDysfunction: 'Right hip internal rotation restriction (+15° deficit) with shortened Tensor Fasciae Latae and active GB29/30 tsubos.',
    treatmentDynamic: 'Deep transverse friction on TFL/Gluteus Medius junction; Thai hip external rotation passive stretch.',
    corroboratedMarkerName: 'Hip internal rotation restriction & TFL tension',
  },

  // 4. LOWER EXTREMITIES & KINETIC BASE
  {
    id: 'thigh_knee',
    label: 'Thighs, Knees & Patellofemoral Track',
    shortLabel: 'Knees & Thighs',
    category: 'lower_extremity',
    categoryLabel: 'Extremities, Hips & Feet',
    viewPerspective: 'anterior',
    viewAngle: 'Bilateral Anterior Knees & Lower Extremities',
    targetStructures: 'Quadriceps angle (Q-angle), patellar tracking axis, tibial tuberosities, IT band lateral expansion, medial joint line',
    framingCue: 'Frame mid-thighs to mid-shins with client weight distributed evenly. Observe patellar squinting or lateral subluxation.',
    clinicalRationale: 'Directly informs knee valgus/varus, IT band friction syndrome, vastus medialis oblique (VMO) inhibition, and knee pain.',
    landmarks: ['ASIS to Patellar Centerline', 'Patellar Apex', 'Tibial Tuberosity', 'Medial Joint Line (SP9)'],
    bodyDoubleHotspot: { x: 62, y: 72, view: 'anterior' },
    sampleDysfunction: 'Excessive lateral patellar tracking on right knee (+8mm lateral pull) driven by tight Vastus Lateralis and ITB.',
    treatmentDynamic: 'Release IT band lateral retinaculum with forearm glides; activate SP10 & ST36 to normalize kinetic tracking.',
    corroboratedMarkerName: 'Patellofemoral tracking & IT band tension',
  },
  {
    id: 'calf_achilles',
    label: 'Posterior Calves & Achilles Tendons',
    shortLabel: 'Calves & Achilles',
    category: 'lower_extremity',
    categoryLabel: 'Extremities, Hips & Feet',
    viewPerspective: 'posterior',
    viewAngle: 'Posterior Lower Leg & Popliteal Fossa',
    targetStructures: 'Gastrocnemius medial/lateral heads, Soleus, Popliteal space (BL40 Weizhong), Achilles tendon verticality, Calcaneus',
    framingCue: 'Frame back of knees to floor heels. Observe medial gastrocnemius tone and inward/outward Achilles bowing.',
    clinicalRationale: 'Uncovers deep posterior compartment tightness, Bladder meridian stasis, plantar fasciitis drivers, and calf cramps.',
    landmarks: ['Popliteal Crease (BL40)', 'Gastrocnemius Bellies', 'Musculotendinous Junction', 'Achilles Insertion (BL60 / KD3)'],
    bodyDoubleHotspot: { x: 62, y: 82, view: 'posterior' },
    sampleDysfunction: 'Dense nodular shortening in right medial Gastrocnemius; Achilles tendon bowed inward (+5° pronation torque).',
    treatmentDynamic: 'Petrissage and slow thumb-stripping down medial Gastrocnemius; hold BL40 and BL60 to clear meridian flow.',
    corroboratedMarkerName: 'Posterior calf tension & Achilles pronation torque',
  },
  {
    id: 'podiatric',
    label: 'Podiatric Kinetic Base, Ankles & Plantar Arches',
    shortLabel: 'Feet & Ankles',
    category: 'lower_extremity',
    categoryLabel: 'Extremities, Hips & Feet',
    viewPerspective: 'anterior',
    viewAngle: 'Weight-Bearing Feet, Ankles & Calcaneal Base',
    targetStructures: 'Medial longitudinal arch, navicular drop, lateral malleolus, medial malleolus, calcaneal angle, hallux valgus',
    framingCue: 'Frame ankles and feet on floor surface from front and oblique angles. Verify arches under natural weight bearing.',
    clinicalRationale: 'The kinetic foundation: overpronation creates upstream internal tibial rotation, knee valgus, and pelvic tilt.',
    landmarks: ['Medial Malleolus (KD3)', 'Lateral Malleolus (BL60)', 'Navicular Tuberosity', 'Calcaneal Grounding Axis', '1st Metatarsal (SP4)'],
    bodyDoubleHotspot: { x: 62, y: 92, view: 'anterior' },
    sampleDysfunction: 'Bilateral navicular drop (-7mm) with right severe overpronation collapsing medial longitudinal arch.',
    treatmentDynamic: 'Apply deep thumb friction along plantar aponeurosis and mobilize subtalar joint to re-establish kinetic arch support.',
    corroboratedMarkerName: 'Plantar arch collapse & kinetic ground torque',
  },
];

// Helper: Given client's marked pain points on the body double, determine recommended photo slots
export function getRecommendedPhotoSlots(markers: PainPointMarker[]): PosturePhotoSlotId[] {
  const recommended = new Set<PosturePhotoSlotId>();

  if (!markers || markers.length === 0) {
    // Default baseline if no points marked yet
    return ['anterior_full', 'posterior_full', 'lateral_sagittal', 'clavicular', 'craniocervical', 'lumbopelvic'];
  }

  markers.forEach((marker) => {
    const y = marker.y;
    const view = marker.view;

    // Head and neck (y < 20)
    if (y < 20) {
      recommended.add('craniocervical');
      recommended.add('lateral_sagittal');
      if (view === 'anterior') recommended.add('clavicular');
      else recommended.add('scapular_shoulder');
    }
    // Clavicle, chest, shoulder, upper back (20 <= y < 35)
    else if (y < 35) {
      if (view === 'anterior') {
        recommended.add('clavicular');
        recommended.add('anterior_full');
      } else {
        recommended.add('scapular_shoulder');
        recommended.add('posterior_full');
      }
      recommended.add('lateral_sagittal');
    }
    // Mid torso, arms, thoracic (35 <= y < 48)
    else if (y < 48) {
      if (marker.x < 30 || marker.x > 70) {
        recommended.add('arm_elbow_wrist');
      }
      recommended.add('thoracic_ribs');
      recommended.add('lumbar_spine');
    }
    // Lumbar, pelvis, hips, sacrum (48 <= y < 65)
    else if (y < 65) {
      recommended.add('lumbopelvic');
      recommended.add('lumbar_spine');
      if (marker.x < 35 || marker.x > 65) {
        recommended.add('hip_trochanter');
      }
      recommended.add('posterior_full');
    }
    // Thighs, knees (65 <= y < 80)
    else if (y < 80) {
      recommended.add('thigh_knee');
      recommended.add('anterior_full');
      recommended.add('lateral_sagittal');
    }
    // Calves, ankles, feet (y >= 80)
    else {
      recommended.add('calf_achilles');
      recommended.add('podiatric');
      if (view === 'anterior') recommended.add('anterior_full');
      else recommended.add('posterior_full');
    }
  });

  // Always include at least one global full body projection
  recommended.add('anterior_full');
  recommended.add('posterior_full');

  return Array.from(recommended);
}

// Find slot definition by ID
export function getPhotoSlotById(id: PosturePhotoSlotId): WholeBodyPhotoSlotDef | undefined {
  return WHOLE_BODY_PHOTO_SLOTS.find((slot) => slot.id === id);
}

// Generate dynamic corroborations for THIS client based on their marked markers and supplied photos
export function generateCorroborationsForClient(
  markers: PainPointMarker[],
  clientPhotos?: Record<string, any>
): PhotoCorroborationItem[] {
  const photoKeys = clientPhotos ? Object.keys(clientPhotos) : [];
  const items: PhotoCorroborationItem[] = [];

  // Prioritize slots where client actually supplied photos
  const activeSlotIds: PosturePhotoSlotId[] = photoKeys.length > 0
    ? (photoKeys as PosturePhotoSlotId[])
    : getRecommendedPhotoSlots(markers).slice(0, 3);

  activeSlotIds.forEach((slotId) => {
    const slotDef = getPhotoSlotById(slotId);
    if (!slotDef) return;

    // Find closest marked marker to this slot
    const matchingMarker = markers.find((m) => {
      const dy = Math.abs(m.y - slotDef.bodyDoubleHotspot.y);
      return dy < 25 && m.view === slotDef.bodyDoubleHotspot.view;
    }) || markers[0];

    const markerText = matchingMarker
      ? matchingMarker.label
      : slotDef.corroboratedMarkerName;

    items.push({
      photo_slot_id: slotDef.id,
      photo_name: slotDef.label,
      observed_dysfunction: slotDef.sampleDysfunction,
      corroborated_body_marker: markerText,
      treatment_dynamic: slotDef.treatmentDynamic,
    });
  });

  return items;
}
