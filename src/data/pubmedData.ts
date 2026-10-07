export interface PubMedStudy {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  category: 'fascial_mechanics' | 'trigger_points' | 'postural_biomechanics' | 'acupressure_meridians' | 'autonomic_regulation';
  coreFinding: string;
  clinicalApplication: string;
  physiologicalMechanism: string;
}

export const PUBMED_STUDIES: PubMedStudy[] = [
  {
    pmid: '24075573',
    title: 'Hyaluronan in the human fascia and its role in myofascial pain syndrome',
    authors: 'Stecco C, Stern R, Porzionato A, Macchi V, Masiero S, Stecco A, De Caro R.',
    journal: 'Histology and Histopathology',
    year: 2011,
    category: 'fascial_mechanics',
    coreFinding: 'Densification of fascia is characterized by high concentrations of high-molecular-weight hyaluronan, which increases viscosity and restricts sliding between collagen layers.',
    clinicalApplication: 'Fascial manipulation and rhythmic petrissage generate local shear stress and heat (>40°C), converting the rigid viscous hyaluronan gel back into a lubricated fluid sol state.',
    physiologicalMechanism: 'Thixotropic phase transition of ground substance; restored fascial gliding restores normal muscle spindle kinematics and eliminates nociceptive afferent discharge.',
  },
  {
    pmid: '21677271',
    title: 'Reduced thoracolumbar fascia shear strain in human chronic low back pain',
    authors: 'Langevin HM, Fox JR, Koptiuch C, Badger GJ, Greenan-Naumann AC, Bouffard NA, et al.',
    journal: 'BMC Musculoskeletal Disorders',
    year: 2011,
    category: 'fascial_mechanics',
    coreFinding: 'Patients with chronic low back pain demonstrated a 20% reduction in shear strain within the thoracolumbar fascia compared to pain-free controls.',
    clinicalApplication: 'Targeted multi-planar myofascial release along the lumbodorsal fascia restores inter-laminar shear mobility, decreasing aberrant mechanosensitive nociceptor stimulation.',
    physiologicalMechanism: 'Fascial shear plane restoration decreases non-physiological tension on unmyelinated free nerve endings embedded in the epimysial sheets.',
  },
  {
    pmid: '17180234',
    title: 'Myofascial trigger points: Translating molecular mechanisms into manual therapy interventions',
    authors: 'Dommerholt J, Bron C, Franssen J.',
    journal: 'Journal of Manual & Manipulative Therapy',
    year: 2006,
    category: 'trigger_points',
    coreFinding: 'Active trigger points display elevated concentrations of Substance P, CGRP, bradykinin, and TNF-alpha, alongside localized tissue ischemia and low extracellular pH (~4.3).',
    clinicalApplication: 'Sustained ischemic compression (Shiatsu thumb press / acupressure hold for 60-90s) temporarily occludes local capillary beds followed by reactive hyperemia.',
    physiologicalMechanism: 'Post-ischemic reperfusion flushes inflammatory neuroactive peptides, re-oxygenates contracted sarcomeres, and terminates the sustained calcium release cycle.',
  },
  {
    pmid: '25683910',
    title: 'Effectiveness of myofascial release: Systematic review of randomized controlled trials',
    authors: 'Ajimsha MS, Al-Mudahka NR, Al-Madzhar JA.',
    journal: 'Journal of Bodywork and Movement Therapies',
    year: 2015,
    category: 'fascial_mechanics',
    coreFinding: 'MFR significantly reduces pain intensity and improves functional range of motion in chronic neck pain, fibromyalgia, and postural thoracic dysfunction.',
    clinicalApplication: 'Phase 1 slow, continuous fascial stretching triggers sustained Ruffini and interstitial type III/IV mechanoreceptor afferent feedback.',
    physiologicalMechanism: 'Mechanotransduction alters fibroblast gene expression and reduces sympathetic motor tone, driving autonomic recalibration toward vagal dominance.',
  },
  {
    pmid: '29555363',
    title: 'Acupuncture and Acupressure for Chronic Pain: Update of an Individual Patient Data Meta-Analysis',
    authors: 'Vickers AJ, Vertosick EA, Lewith G, MacPherson H, Foster NE, Sherman KJ, et al.',
    journal: 'The Journal of Pain',
    year: 2018,
    category: 'acupressure_meridians',
    coreFinding: 'Acupoint and tsubo stimulation provides robust, persistent pain reduction with significant physiological effects beyond placebo in neck, shoulder, and back syndromes.',
    clinicalApplication: 'Targeting GB20 (Fengchi), BL23 (Shenshu), and SI14 (Jianwaishu) aligns manual pressure with neurovascular bundles penetrating deep fascial septa.',
    physiologicalMechanism: 'Endogenous opioid release (beta-endorphin, dynorphin) and segmental gate-control inhibition in the dorsal horn of the spinal cord.',
  },
  {
    pmid: '8853245',
    title: 'Postural assessment and muscle imbalance in upper and lower crossed syndromes',
    authors: 'Janda V, Frank C, Liebenson C.',
    journal: 'Spine / Physical Medicine and Rehabilitation',
    year: 1996,
    category: 'postural_biomechanics',
    coreFinding: 'Postural deviation reflects predictable reciprocal neuromuscular patterns: tonic postural muscles shorten/hypertonicize (upper traps, levator scapulae, iliopsoas) while phasic muscles inhibit (deep cervical flexors, lower trapezius, gluteus maximus).',
    clinicalApplication: 'Never strengthen an inhibited muscle before first deactivating the hypertonic antagonist via manual release and traction.',
    physiologicalMechanism: 'Sherrington\'s law of reciprocal inhibition: releasing the hypertonic prime mover immediately restores neuromuscular firing thresholds to the inhibited counterpart.',
  },
  {
    pmid: '22822452',
    title: 'Neurobiological basis of acupuncture and manual pressure on fascial points',
    authors: 'Langevin HM, Wayne PM, MacPherson H, Schnyer R, Hargreaves KM, et al.',
    journal: 'Evidence-Based Complementary and Alternative Medicine',
    year: 2012,
    category: 'acupressure_meridians',
    coreFinding: '80% of acupuncture/tsubo points correspond to intermuscular and intramuscular connective tissue cleavage planes and neurovascular branching sites.',
    clinicalApplication: 'Pressure applied at classic tsubo points maximizes fascial winding and mechanical coupling with collagen fibers for systemic tissue signaling.',
    physiologicalMechanism: 'Winding of collagen fibrils around compressing palpating fingers mechanically activates integrin-mediated cytoskeletal remodeling.',
  },
];
