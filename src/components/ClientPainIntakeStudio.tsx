import React, { useState, useRef, useMemo } from 'react';
import {
  ClientDossier,
  PainPointMarker,
  PosturePhotoSlotId,
  ClientPhotoSubmission,
  ViewPerspective,
} from '../types/clinical';
import {
  WHOLE_BODY_PHOTO_SLOTS,
  WholeBodyPhotoSlotDef,
  getRecommendedPhotoSlots,
  getPhotoSlotById,
} from '../data/wholeBodyPhotoCatalog';
import { getClinicalSampleDataUrl } from '../utils/clinicalSampleGenerator';
import {
  Camera,
  Upload,
  Crosshair,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Eye,
  Info,
  ChevronRight,
  Maximize2,
  Sliders,
  Flame,
  Activity,
  Compass,
  ArrowRight,
  User,
  PlusCircle,
  Trash2,
  Video,
  Layers,
  HelpCircle,
  Star,
  Check,
  Grid,
} from 'lucide-react';

interface ClientPainIntakeStudioProps {
  dossier: ClientDossier;
  onChangeDossier: (updated: ClientDossier) => void;
  onProcessClient: () => void;
  isProcessing: boolean;
  onOpenCorroboration?: () => void;
  hasAnalysisResult: boolean;
}

type CategoryFilter = 'all' | 'recommended' | 'full_body' | 'head_neck' | 'torso_spine' | 'lower_extremity';

export const ClientPainIntakeStudio: React.FC<ClientPainIntakeStudioProps> = ({
  dossier,
  onChangeDossier,
  onProcessClient,
  isProcessing,
  onOpenCorroboration,
  hasAnalysisResult,
}) => {
  const [activeSilhouetteView, setActiveSilhouetteView] = useState<'anterior' | 'posterior' | 'lateral'>('anterior');
  const [selectedPhotoSlotId, setSelectedPhotoSlotId] = useState<PosturePhotoSlotId>('clavicular');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showPlumbGrid, setShowPlumbGrid] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [observationNote, setObservationNote] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clientPhotos = dossier.clientPhotos || {};
  const markers = dossier.painPresentation?.mannequinMarkers || [];

  // Compute recommended slots based on client's expressed pain points
  const recommendedSlotIds = useMemo(() => {
    return getRecommendedPhotoSlots(markers);
  }, [markers]);

  // Filter slots based on category
  const visibleSlots = useMemo(() => {
    if (categoryFilter === 'recommended') {
      return WHOLE_BODY_PHOTO_SLOTS.filter((s) => recommendedSlotIds.includes(s.id));
    }
    if (categoryFilter === 'all') {
      return WHOLE_BODY_PHOTO_SLOTS;
    }
    return WHOLE_BODY_PHOTO_SLOTS.filter((s) => s.category === categoryFilter);
  }, [categoryFilter, recommendedSlotIds]);

  const activeSlotDef: WholeBodyPhotoSlotDef =
    getPhotoSlotById(selectedPhotoSlotId) || WHOLE_BODY_PHOTO_SLOTS[0];

  // Handle marking client's pain point on the human form
  const handleMarkPainOnBody = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Approximate body part name from Y level
    let partName = 'Region';
    if (clickY < 18) partName = 'Head / Cranio-Cervical';
    else if (clickY < 28) partName = activeSilhouetteView === 'anterior' ? 'Clavicle & Pectoral Girdle' : 'Upper Trapezius / Scapula';
    else if (clickY < 45) partName = activeSilhouetteView === 'anterior' ? 'Chest / Anterior Ribs' : 'Thoracic Spine & Ribs';
    else if (clickY < 60) partName = activeSilhouetteView === 'anterior' ? 'Abdomen / Hip Girdle' : 'Lumbar & Sacroiliac Base';
    else if (clickY < 78) partName = 'Thigh & Knee Track';
    else partName = 'Lower Leg, Calf & Foot Base';

    const newMarker: PainPointMarker = {
      id: `client_pain_${Date.now()}`,
      x: Math.round(clickX),
      y: Math.round(clickY),
      view: activeSilhouetteView === 'lateral' ? 'anterior' : activeSilhouetteView,
      type: 'symptom',
      label: `Client Pain: ${partName}`,
    };

    const updatedMarkers = [...markers, newMarker];
    onChangeDossier({
      ...dossier,
      painPresentation: {
        ...dossier.painPresentation,
        primarySymptomSite: partName,
        mannequinMarkers: updatedMarkers,
      },
    });

    // Auto-select corresponding photo slot for seamless flow
    const recs = getRecommendedPhotoSlots(updatedMarkers);
    if (recs.length > 0 && !clientPhotos[recs[0]]) {
      setSelectedPhotoSlotId(recs[0]);
    }
  };

  const handleRemoveMarker = (markerId: string) => {
    const updated = markers.filter((m) => m.id !== markerId);
    onChangeDossier({
      ...dossier,
      painPresentation: {
        ...dossier.painPresentation,
        mannequinMarkers: updated,
      },
    });
  };

  // 1-Tap quick load of clinical reference sample
  const handleInjectSamplePhoto = (slotId: PosturePhotoSlotId) => {
    const sampleUrl = getClinicalSampleDataUrl(slotId);
    const slotDef = getPhotoSlotById(slotId);
    const newSubmission: ClientPhotoSubmission = {
      slotId,
      label: slotDef?.label || slotId,
      imageBase64: sampleUrl,
      source: 'sample',
      timestamp: Date.now(),
      detectedLandmarks: slotDef?.landmarks || [],
      clinicalObservations: slotDef?.sampleDysfunction || 'Calibrated reference landmarks active.',
    };

    onChangeDossier({
      ...dossier,
      clientPhotos: {
        ...clientPhotos,
        [slotId]: newSubmission,
      },
    });
  };

  // Handle uploading file
  const handlePhotoUpload = (slotId: PosturePhotoSlotId, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const slotDef = getPhotoSlotById(slotId);
      const newSubmission: ClientPhotoSubmission = {
        slotId,
        label: slotDef?.label || slotId,
        imageBase64: base64,
        source: 'upload',
        timestamp: Date.now(),
        detectedLandmarks: slotDef?.landmarks || [],
        clinicalObservations: observationNote || 'Uploaded client posture photograph.',
      };

      onChangeDossier({
        ...dossier,
        clientPhotos: {
          ...clientPhotos,
          [slotId]: newSubmission,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  // Camera capture handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Gracefully fall back if device camera is unavailable in browser or iframe
      setIsCameraActive(false);
    }
  };

  const snapPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const slotDef = getPhotoSlotById(selectedPhotoSlotId);
    const newSubmission: ClientPhotoSubmission = {
      slotId: selectedPhotoSlotId,
      label: slotDef?.label || selectedPhotoSlotId,
      imageBase64: dataUrl,
      source: 'camera',
      timestamp: Date.now(),
      detectedLandmarks: slotDef?.landmarks || [],
      clinicalObservations: observationNote || 'Live webcam capture from intake session.',
    };

    onChangeDossier({
      ...dossier,
      clientPhotos: {
        ...clientPhotos,
        [selectedPhotoSlotId]: newSubmission,
      },
    });

    cancelCamera();
  };

  const cancelCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleClearPhoto = (slotId: PosturePhotoSlotId) => {
    const updated = { ...clientPhotos };
    delete updated[slotId];
    onChangeDossier({
      ...dossier,
      clientPhotos: updated,
    });
  };

  const photosSuppliedCount = Object.keys(clientPhotos).length;

  return (
    <div className="flex flex-col h-full bg-[#181a19] rounded-2xl border border-[#2a2f2b] shadow-2xl backdrop-blur-md overflow-hidden text-[#eae6df]">
      {/* Header Banner */}
      <div className="p-4 border-b border-[#2a2f2b] bg-[#141615]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2d3d32] border border-[#3b5242] flex items-center justify-center text-[#7ea18b]">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#f5f2ea] tracking-wide">
                  CLIENT PAIN INTAKE &amp; WHOLE-BODY PHOTOMETRICS
                </h2>
                <span className="text-[10px] font-mono text-[#c48943] bg-[#221c15] px-2 py-0.5 rounded border border-[#3d2e1c]">
                  Live Client Processing
                </span>
              </div>
              <p className="text-xs text-[#a8a39b]">
                Client expresses pain on human form → Operator selects from all 15 whole-body photographic angles to formulate the custom treatment plan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121413] border border-[#222623]">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Pain Sites: <strong className="text-[#f5f2ea]">{markers.length}</strong></span>
              <span className="text-[#434b45]">|</span>
              <Camera className="w-3.5 h-3.5 text-[#7ea18b]" />
              <span>Photos: <strong className="text-emerald-400">{photosSuppliedCount} / 15</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Stage */}
      <div className="flex-1 p-4 lg:p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Human Form (Body Double) Where Client Points to Pain (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#c48943]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#f5f2ea]">
                1. Human Form: Where Client Expresses Pain
              </h3>
            </div>

            {/* Silhouette Perspective Selector */}
            <div className="flex items-center p-0.5 bg-[#121413] border border-[#222623] rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveSilhouetteView('anterior')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeSilhouetteView === 'anterior'
                    ? 'bg-[#2d3d32] text-[#cbe0d1] shadow-sm'
                    : 'text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setActiveSilhouetteView('posterior')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeSilhouetteView === 'posterior'
                    ? 'bg-[#2d3d32] text-[#cbe0d1] shadow-sm'
                    : 'text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                Posterior
              </button>
              <button
                type="button"
                onClick={() => setActiveSilhouetteView('lateral')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  activeSilhouetteView === 'lateral'
                    ? 'bg-[#2d3d32] text-[#cbe0d1] shadow-sm'
                    : 'text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                Sagittal
              </button>
            </div>
          </div>

          {/* Interactive Tap-to-Mark Body Form Silhouette with Anatomical Zones */}
          <div className="relative w-full aspect-[4/3] rounded-xl bg-[#121413] border border-[#222623] flex items-center justify-center p-2 select-none overflow-hidden">
            <p className="absolute top-2 left-3 text-[10px] text-[#8a857d] z-10 flex items-center gap-1.5 bg-[#121413]/80 px-2 py-0.5 rounded border border-[#222623]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Tap body to record client pain · Click tags to focus camera</span>
            </p>

            <svg
              viewBox="0 0 300 400"
              onClick={handleMarkPainOnBody}
              className="w-full h-full cursor-crosshair drop-shadow"
            >
              <defs>
                <pattern id="bodyDoubleGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1c201d" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="bodySkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#252e27" />
                  <stop offset="100%" stopColor="#181e1a" />
                </linearGradient>
              </defs>

              <rect width="300" height="400" fill="url(#bodyDoubleGrid)" />
              <line x1="150" y1="10" x2="150" y2="390" stroke="#2e3831" strokeWidth="1" strokeDasharray="3,3" />

              {/* RENDER SILHOUETTE BASED ON VIEW */}
              {activeSilhouetteView === 'anterior' ? (
                // ANTERIOR CONTOUR
                <g fill="url(#bodySkinGrad)" stroke="#435347" strokeWidth="1.8">
                  <circle cx="150" cy="50" r="24" />
                  <path d="M 142 74 L 142 88 L 158 88 L 158 74 Z" />
                  <line x1="120" y1="92" x2="150" y2="94" stroke="#c48943" strokeWidth="2.5" />
                  <line x1="150" y1="94" x2="180" y2="92" stroke="#c48943" strokeWidth="2.5" />
                  <path d="M 120 92 C 105 105 108 140 115 170 C 120 190 125 210 135 220 L 165 220 C 175 210 180 190 185 170 C 192 140 195 105 180 92 Z" />
                  <path d="M 115 100 C 100 120 92 150 90 180 C 88 200 85 220 82 240 L 92 242 C 95 220 98 200 100 180 C 103 155 110 130 120 115 Z" />
                  <path d="M 185 100 C 200 120 208 150 210 180 C 212 200 215 220 218 240 L 208 242 C 205 220 202 200 200 180 C 197 155 190 130 180 115 Z" />
                  <path d="M 135 220 L 132 300 L 128 375 L 142 375 L 146 300 L 148 225 Z" />
                  <path d="M 165 220 L 168 300 L 172 375 L 158 375 L 154 300 L 152 225 Z" />
                </g>
              ) : activeSilhouetteView === 'posterior' ? (
                // POSTERIOR CONTOUR
                <g fill="url(#bodySkinGrad)" stroke="#435347" strokeWidth="1.8">
                  <circle cx="150" cy="50" r="24" />
                  <path d="M 135 55 Q 150 62 165 55" stroke="#c48943" strokeWidth="2.5" fill="none" />
                  <path d="M 142 74 L 142 88 L 158 88 L 158 74 Z" />
                  <polygon points="122,105 140,110 130,140" fill="#202722" stroke="#7ea18b" strokeWidth="1.2" />
                  <polygon points="178,105 160,110 170,140" fill="#202722" stroke="#7ea18b" strokeWidth="1.2" />
                  <line x1="150" y1="88" x2="150" y2="220" stroke="#7ea18b" strokeWidth="1.5" strokeDasharray="4,2" />
                  <path d="M 120 92 C 105 105 108 140 115 170 C 120 190 125 210 135 220 C 135 235 140 245 150 248 C 160 245 165 235 165 220 C 175 210 180 190 185 170 C 192 140 195 105 180 92 Z" />
                  <path d="M 115 100 C 100 120 92 150 90 180 C 88 200 85 220 82 240 L 92 242 C 95 220 98 200 100 180 C 103 155 110 130 120 115 Z" />
                  <path d="M 185 100 C 200 120 208 150 210 180 C 212 200 215 220 218 240 L 208 242 C 205 220 202 200 200 180 C 197 155 190 130 180 115 Z" />
                  <path d="M 135 240 L 132 300 L 128 375 L 142 375 L 146 300 L 149 248 Z" />
                  <path d="M 165 240 L 168 300 L 172 375 L 158 375 L 154 300 L 151 248 Z" />
                </g>
              ) : (
                // LATERAL SAGITTAL CONTOUR
                <g fill="url(#bodySkinGrad)" stroke="#435347" strokeWidth="1.8">
                  <circle cx="165" cy="50" r="23" />
                  <circle cx="160" cy="50" r="4" fill="#c48943" />
                  <path d="M 160 74 L 155 100 L 145 150 L 142 200 L 152 240 L 150 310 L 148 375 L 170 375 L 165 310 L 162 240 L 160 190 L 165 140 L 165 100 Z" />
                  <line x1="145" y1="10" x2="145" y2="390" stroke="#c48943" strokeWidth="1.5" strokeDasharray="4,4" />
                </g>
              )}

              {/* Render User's Marked Expressed Pain Points */}
              {markers
                .filter((m) => activeSilhouetteView === 'lateral' || m.view === activeSilhouetteView)
                .map((marker) => {
                  const svgX = (marker.x / 100) * 300;
                  const svgY = (marker.y / 100) * 400;

                  return (
                    <g key={marker.id}>
                      <circle cx={svgX} cy={svgY} r="12" fill="#ef4444" opacity="0.3" className="animate-ping" />
                      <circle cx={svgX} cy={svgY} r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <text
                        x={svgX + 10}
                        y={svgY + 4}
                        fill="#fca5a5"
                        fontSize="9"
                        fontWeight="bold"
                        className="drop-shadow select-none pointer-events-none"
                      >
                        {marker.label}
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>

          {/* Whole-Body Anatomical Quick-Pick Targets for Hand-Eye Camera Alignment */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#8a857d] uppercase tracking-wider block">
              1-Tap Body Region Camera Target:
            </span>
            <div className="flex flex-wrap gap-1">
              {[
                { slotId: 'craniocervical', name: 'Head/Neck', view: 'posterior' },
                { slotId: 'clavicular', name: 'Clavicle/Chest', view: 'anterior' },
                { slotId: 'scapular_shoulder', name: 'Scapulae', view: 'posterior' },
                { slotId: 'arm_elbow_wrist', name: 'Arms/Wrists', view: 'anterior' },
                { slotId: 'thoracic_ribs', name: 'Thoracic Ribs', view: 'posterior' },
                { slotId: 'lumbar_spine', name: 'Lumbar Spine', view: 'posterior' },
                { slotId: 'lumbopelvic', name: 'Pelvis/Sacrum', view: 'posterior' },
                { slotId: 'hip_trochanter', name: 'Hips', view: 'anterior' },
                { slotId: 'thigh_knee', name: 'Knees', view: 'anterior' },
                { slotId: 'calf_achilles', name: 'Calves', view: 'posterior' },
                { slotId: 'podiatric', name: 'Feet/Ankles', view: 'anterior' },
              ].map((item) => (
                <button
                  key={item.slotId}
                  type="button"
                  onClick={() => {
                    setSelectedPhotoSlotId(item.slotId as PosturePhotoSlotId);
                    setActiveSilhouetteView(item.view as any);
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
                    selectedPhotoSlotId === item.slotId
                      ? 'bg-[#c48943] text-[#121413] font-bold border-[#e9c46a]'
                      : 'bg-[#141615] border-[#222623] text-[#a8a39b] hover:text-[#eae6df] hover:bg-[#1e231f]'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Marked Pain Sites List */}
          <div className="p-3 rounded-xl bg-[#141615] border border-[#2a2f2b] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#f5f2ea] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>Marked Expressed Pain Sites ({markers.length})</span>
              </span>
              <span className="text-[10px] text-[#8a857d]">Corroborates with whole-body photos</span>
            </div>

            {markers.length === 0 ? (
              <p className="text-xs text-[#8a857d] italic">
                Tap on the human form above where the client states they feel pain or stiffness.
              </p>
            ) : (
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {markers.map((marker) => (
                  <div
                    key={marker.id}
                    className="p-1.5 rounded-lg bg-[#181a19] border border-[#222623] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <span className="text-[#f5f2ea] truncate">{marker.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMarker(marker.id)}
                      className="text-[#8a857d] hover:text-red-400 p-1 cursor-pointer"
                      title="Remove pain site"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WHOLE BODY PHOTO OPTIONS & CAPTURE SUITE (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Header & Category Filter Tabs */}
          <div className="flex flex-col space-y-2 pb-2 border-b border-[#2a2f2b]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#c48943]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#f5f2ea]">
                  2. Whole-Body Picture Taking Options ({WHOLE_BODY_PHOTO_SLOTS.length} Available Angles)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                {photosSuppliedCount} / {WHOLE_BODY_PHOTO_SLOTS.length} Supplied
              </span>
            </div>

            {/* Category Filter Pills (Zero-Pill clean buttons) */}
            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  categoryFilter === 'all'
                    ? 'bg-[#2d3d32] border-[#7ea18b] text-[#f5f2ea]'
                    : 'bg-[#141615] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                All 15 Angles
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('recommended')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium flex items-center gap-1 ${
                  categoryFilter === 'recommended'
                    ? 'bg-[#c48943]/20 border-[#c48943] text-[#e9c46a]'
                    : 'bg-[#141615] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                <Star className="w-3 h-3 text-[#c48943]" />
                <span>★ Stated Pain Priority ({recommendedSlotIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('full_body')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  categoryFilter === 'full_body'
                    ? 'bg-[#2d3d32] border-[#7ea18b] text-[#f5f2ea]'
                    : 'bg-[#141615] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                Full Length (4)
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('head_neck')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  categoryFilter === 'head_neck'
                    ? 'bg-[#2d3d32] border-[#7ea18b] text-[#f5f2ea]'
                    : 'bg-[#141615] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                Cervical &amp; Upper (4)
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('torso_spine')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  categoryFilter === 'torso_spine'
                    ? 'bg-[#2d3d32] border-[#7ea18b] text-[#f5f2ea]'
                    : 'bg-[#141615] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                Spine &amp; Pelvis (4)
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('lower_extremity')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  categoryFilter === 'lower_extremity'
                    ? 'bg-[#2d3d32] border-[#7ea18b] text-[#f5f2ea]'
                    : 'bg-[#141615] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                Extremities &amp; Feet (3)
              </button>
            </div>
          </div>

          {/* WHOLE-BODY PHOTO SLOTS GRID (Allows selecting ANY body region) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {visibleSlots.map((slot) => {
              const isSelected = selectedPhotoSlotId === slot.id;
              const hasPhoto = !!clientPhotos[slot.id];
              const isRecommended = recommendedSlotIds.includes(slot.id);

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedPhotoSlotId(slot.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-[#222923] border-[#c48943] ring-1 ring-[#c48943]/40 text-[#f5f2ea]'
                      : hasPhoto
                      ? 'bg-[#18231c] border-emerald-500/40 text-emerald-300'
                      : 'bg-[#141615] border-[#2a2f2b] text-[#a8a39b] hover:text-[#eae6df] hover:bg-[#1a1f1b]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider">
                      {slot.categoryLabel.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-1">
                      {isRecommended && (
                        <span className="text-[9px] text-[#e9c46a] font-bold" title="Stated Pain Focus">
                          ★
                        </span>
                      )}
                      {hasPhoto ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#343e37]" />
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold leading-tight line-clamp-1">
                    {slot.shortLabel}
                  </span>
                  <span className="text-[10px] text-[#8a857d] truncate mt-0.5">
                    {slot.viewAngle.split('(')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE PHOTO SLOT STAGE & CAPTURE CONTROLS */}
          <div className="p-3.5 rounded-xl bg-[#141615] border border-[#2a2f2b] space-y-3 flex-1 flex flex-col justify-between">
            {/* Active Slot Header & Capture Tools */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2a2f2b]">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#f5f2ea]">
                    {activeSlotDef.label}
                  </h4>
                  {clientPhotos[selectedPhotoSlotId] && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      ✓ Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#a8a39b]">{activeSlotDef.viewAngle}</p>
              </div>

              {/* Action Buttons: Live Camera, File Upload, 1-Tap Sample Injector */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPlumbGrid(!showPlumbGrid)}
                  className={`px-2 py-1 rounded-lg text-xs border transition-all cursor-pointer flex items-center gap-1 ${
                    showPlumbGrid
                      ? 'bg-[#c48943]/20 border-[#c48943]/60 text-[#e9c46a]'
                      : 'bg-[#181a19] border-[#2a2f2b] text-[#8a857d]'
                  }`}
                  title="Toggle Kendall Plumb Grid"
                >
                  <Compass className="w-3 h-3" />
                  <span>Plumb</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInjectSamplePhoto(selectedPhotoSlotId)}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#222923] hover:bg-[#2c382e] border border-[#354639] text-[#cbe0d1] cursor-pointer transition-all flex items-center gap-1"
                  title="Load pre-rendered clinical reference photograph"
                >
                  <Sparkles className="w-3 h-3 text-[#c48943]" />
                  <span>Load Sample</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#222923] hover:bg-[#2c382e] border border-[#354639] text-[#cbe0d1] cursor-pointer transition-all flex items-center gap-1"
                  title="Snap photo with live device camera"
                >
                  <Video className="w-3 h-3 text-[#7ea18b]" />
                  <span>Snap</span>
                </button>

                <label className="px-2 py-1 rounded-lg text-xs font-semibold bg-[#222923] hover:bg-[#2c382e] border border-[#354639] text-[#cbe0d1] cursor-pointer transition-all flex items-center gap-1">
                  <Upload className="w-3 h-3 text-[#c48943]" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(selectedPhotoSlotId, e)}
                    className="hidden"
                  />
                </label>

                {clientPhotos[selectedPhotoSlotId] && (
                  <button
                    type="button"
                    onClick={() => handleClearPhoto(selectedPhotoSlotId)}
                    className="p-1 rounded-lg text-[#8a857d] hover:text-red-400 cursor-pointer"
                    title="Remove this photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Display Canvas: Live Camera Viewfinder OR Client Photo OR Clinical Sample */}
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#121413] border border-[#222623] flex items-center justify-center select-none">
              {isCameraActive ? (
                // LIVE CAMERA VIEWFINDER
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {showPlumbGrid && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-0.5 h-full bg-[#c48943]/70 border-r border-dashed border-[#c48943]" />
                      <div className="absolute h-0.5 w-full bg-[#c48943]/40 border-b border-dashed border-[#c48943]" />
                    </div>
                  )}
                  <div className="absolute bottom-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={snapPhoto}
                      className="px-4 py-1.5 rounded-xl font-bold text-xs bg-[#c48943] text-[#121413] shadow-lg cursor-pointer"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={cancelCamera}
                      className="px-3 py-1.5 rounded-xl text-xs bg-[#222623] text-[#eae6df] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : clientPhotos[selectedPhotoSlotId] ? (
                // DISPLAY ACTIVE SUPPLIED PHOTO
                <div className="relative w-full h-full flex items-center justify-center bg-[#0d0f0e]">
                  <img
                    src={clientPhotos[selectedPhotoSlotId].imageBase64}
                    alt={activeSlotDef.label}
                    className="w-full h-full object-contain"
                  />
                  {showPlumbGrid && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-0.5 h-full bg-[#c48943]/60" />
                      <div className="absolute h-0.5 w-full bg-[#c48943]/30" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-[#121413]/90 px-2 py-0.5 rounded text-[10px] text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> Photo Active ({clientPhotos[selectedPhotoSlotId].source})
                  </div>
                </div>
              ) : (
                // GUIDANCE SILHOUETTE & FRAMING INSTRUCTIONS
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  <Camera className="w-7 h-7 text-[#434f46] mb-1.5" />
                  <p className="text-xs font-semibold text-[#eae6df]">
                    Awaiting Capture for {activeSlotDef.label}
                  </p>
                  <p className="text-[11px] text-[#8a857d] max-w-sm mt-1">
                    {activeSlotDef.framingCue}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => handleInjectSamplePhoto(selectedPhotoSlotId)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#222923] hover:bg-[#2d382f] border border-[#3d4d41] text-[#cbe0d1] cursor-pointer transition-all"
                    >
                      Load Sample Reference Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Target Landmarks & Framing Cue Strip */}
            <div className="p-2 rounded-lg bg-[#121413] border border-[#222623] space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7ea18b]">
                  Target Anatomical Landmarks:
                </span>
                <span className="text-[10px] text-[#8a857d]">{activeSlotDef.categoryLabel}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {activeSlotDef.landmarks.map((landmark, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#181a19] border border-[#222623] text-[#a8c5b0]"
                  >
                    • {landmark}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION TRAY: Process Client Photos & Formulate Treatment */}
      <div className="p-4 border-t border-[#2a2f2b] bg-[#141615] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-[#8a857d]">
          <span>
            Client: <strong className="text-[#f5f2ea]">{dossier.name}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Expressed Pain Sites: <strong className="text-[#f5f2ea]">{markers.length}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Photos Supplied: <strong className="text-emerald-400">{photosSuppliedCount} / 15</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasAnalysisResult && onOpenCorroboration && (
            <button
              type="button"
              onClick={onOpenCorroboration}
              className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#222923] hover:bg-[#2b352c] border border-[#38463a] text-[#a8c5b0] hover:text-[#f5f2ea] transition-all cursor-pointer flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-[#7ea18b]" />
              <span>View Corroboration Studio</span>
            </button>
          )}

          <button
            type="button"
            onClick={onProcessClient}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#c48943] to-[#d4a373] hover:from-[#d4a373] hover:to-[#e9c46a] text-[#121413] transition-all shadow-lg shadow-[#c48943]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Client Images &amp; Formulating Dynamics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Process Client Images &amp; Generate Treatment Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
