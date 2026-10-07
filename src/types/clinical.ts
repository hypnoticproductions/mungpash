export type ViewPerspective = 'anterior' | 'posterior';

export type LayerType = 'kinetic' | 'meridian' | 'sen_line';

export interface MarkerCoordinate {
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  z?: number;
}

export interface ReferredPainVector {
  trigger_origin: string;
  referred_target: string;
  anatomical_coordinates: MarkerCoordinate;
}

export interface EnergeticPathways {
  meridians_involved: string[];
  sen_lines_involved: string[];
  key_acupressure_tsubo_points: string[];
}

export interface PhotoCorroborationItem {
  photo_slot_id: string;
  photo_name: string;
  observed_dysfunction: string;
  corroborated_body_marker: string;
  treatment_dynamic: string;
}

export interface DiagnosticSummary {
  primary_root_cause: string;
  referred_pain_vectors: ReferredPainVector[];
  energetic_pathways: EnergeticPathways;
  photographic_corroborations?: PhotoCorroborationItem[];
}

export interface VisualOverlayMarker {
  layer: 'kinetic' | 'meridian' | 'sen_line';
  name: string;
  model_path_coordinates: MarkerCoordinate[];
  color_hex: string;
  glow_intensity: number;
}

export type TechniqueType = 
  | 'Swedish_Petrissage' 
  | 'Deep_Tissue' 
  | 'Shiatsu_Acupressure' 
  | 'Thai_Sen_Mobilization' 
  | 'Myofascial_Release';

export type FloatingIconId = 
  | 'icon_knead' 
  | 'icon_thumb_press' 
  | 'icon_elbow_glide' 
  | 'icon_passive_stretch';

export interface TreatmentStep {
  step: number;
  phase_name: string;
  technique_type: TechniqueType;
  floating_icon_id: FloatingIconId;
  target_structure: string;
  duration_minutes: number;
  pressure_grade: string; // e.g. "1-5", "2-3", "4"
  operator_cue: string;
}

export interface AnimatedModelPayload {
  diagnostic_summary: DiagnosticSummary;
  visual_overlay_markers: VisualOverlayMarker[];
  treatment_sequence: TreatmentStep[];
}

export interface AnalysisResult {
  rawText: string;
  glanceCardMarkdown: string;
  payloadJson: AnimatedModelPayload;
  source: string;
}

export interface PosturalDeviances {
  forwardHeadDegrees: number; // 0 to 45
  pelvicTilt: 'neutral' | 'anterior' | 'posterior' | 'lateral_left_high' | 'lateral_right_high';
  highShoulder: 'level' | 'left_high' | 'right_high';
  lateralSpinalShift: 'none' | 'cervicothoracic_right' | 'thoracolumbar_left' | 's_curve';
  description?: string;
}

export interface BiometricsData {
  hydrationPercent: number; // e.g. 48.5%
  skeletalMuscleMassKg: number;
  asymmetryNote?: string;
  hsCrpMgL: number; // systemic inflammation mg/L
  esrMmHr?: number;
  metabolicStressScore: number; // 1 to 10
  sleepHours?: number;
}

export interface LifestyleData {
  profession: string;
  repetitiveStrainPattern: string;
  ergonomicStaticLoading: string;
  voiceTranscript?: string;
}

export interface PainPointMarker {
  id: string;
  x: number;
  y: number;
  view: ViewPerspective;
  type: 'symptom' | 'suspected_trigger';
  label: string;
}

export interface PainPresentation {
  primarySymptomSite: string;
  chronicity: 'acute' | 'subacute' | 'chronic_longstanding';
  aggravatingMotion: string;
  mannequinMarkers: PainPointMarker[];
}

export interface ClientPhotoSubmission {
  slotId: PosturePhotoSlotId;
  label: string;
  imageBase64: string;
  source: 'upload' | 'camera' | 'sample';
  timestamp: number;
  detectedLandmarks?: string[];
  clinicalObservations?: string;
}

export interface ClientDossier {
  id: string;
  name: string;
  caseTitle: string;
  summary: string;
  posturalDeviances: PosturalDeviances;
  posturalImageBase64?: string;
  clientPhotos?: Record<string, ClientPhotoSubmission>;
  biometrics: BiometricsData;
  lifestyle: LifestyleData;
  painPresentation: PainPresentation;
}

export interface TsuboPointInfo {
  code: string;
  pinyin: string;
  english: string;
  meridian: string;
  anatomicalLocation: string;
  clinicalIndication: string;
  palpationCue: string;
  coordinates: { anterior?: MarkerCoordinate; posterior?: MarkerCoordinate };
}

export interface SenLineInfo {
  name: string;
  thaiName: string;
  energyFlow: string;
  biomechanicalChain: string;
  tractionTechnique: string;
  pathCoordinatesAnterior: MarkerCoordinate[];
  pathCoordinatesPosterior: MarkerCoordinate[];
  color: string;
}

export interface TriggerPointInfo {
  muscle: string;
  locationName: string;
  referredPattern: string;
  antagonistInhibition: string;
  deactivationTechnique: string;
  view: ViewPerspective;
  coordinate: MarkerCoordinate;
  referredVector: MarkerCoordinate;
}

export type PosturePhotoSlotId =
  | 'anterior_full'
  | 'posterior_full'
  | 'lateral_sagittal'
  | 'lateral_right'
  | 'lateral_left'
  | 'craniocervical'
  | 'clavicular'
  | 'scapular_shoulder'
  | 'arm_elbow_wrist'
  | 'thoracic_ribs'
  | 'lumbar_spine'
  | 'lumbopelvic'
  | 'hip_trochanter'
  | 'thigh_knee'
  | 'calf_achilles'
  | 'podiatric';

export interface PosturePhotoSlot {
  id: PosturePhotoSlotId;
  label: string;
  subtitle: string;
  landmarks: string[];
  referenceSilhouetteId: string;
  userImageBase64?: string;
  anatomicalFocus: string;
}

export interface ParsedPdfBiometrics {
  fileName: string;
  extractedAt: string;
  sourceType: 'InBody' | 'Quest/LabCorp' | 'DEXA' | 'Custom';
  hydrationPercent?: number;
  skeletalMuscleMassKg?: number;
  asymmetryNote?: string;
  hsCrpMgL?: number;
  esrMmHr?: number;
  metabolicStressScore?: number;
  visceralFatLevel?: number;
  rawExtractedText?: string;
}

export interface TopDownWorkflowStep {
  id: string;
  regionName: string;
  anatomicalZone: string;
  keyStructures: string[];
  techniqueCue: string;
  pressureGrade: number;
  targetTsubo: string[];
  durationMinutes: number;
}

export interface VoiceCommandEvent {
  timestamp: number;
  transcript: string;
  recognizedAction: string;
}

