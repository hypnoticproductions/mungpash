import React, { useState, useRef } from 'react';
import Body, { ExtendedBodyPart, Slug } from 'react-muscle-highlighter';
import { ThreeBodyModel } from './ThreeBodyModel';
import {
  ViewPerspective,
  LayerType,
  PainPointMarker,
  AnimatedModelPayload,
  TsuboPointInfo,
  SenLineInfo,
  TriggerPointInfo,
} from '../types/clinical';
import {
  TSUDO_POINTS,
  THAI_SEN_LINES,
  TRIGGER_POINTS,
  MUSCLE_ANATOMY_DETAILS,
  MuscleDetail,
} from '../data/anatomicalData';
import {
  Activity,
  Flame,
  Compass,
  Eye,
  ShieldAlert,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  User,
  Layers,
  Bone,
  CheckCircle2,
  Box,
  MapPin,
} from 'lucide-react';

interface BodyMannequinProps {
  view: ViewPerspective;
  onViewChange: (view: ViewPerspective) => void;
  activeLayers: Record<LayerType, boolean>;
  onToggleLayer: (layer: LayerType) => void;
  painMarkers: PainPointMarker[];
  onAddMarker: (marker: Omit<PainPointMarker, 'id'>) => void;
  onRemoveMarker: (id: string) => void;
  aiPayload?: AnimatedModelPayload | null;
  interactiveMode?: 'inspect' | 'add_symptom' | 'add_trigger';
}

export const BodyMannequin: React.FC<BodyMannequinProps> = ({
  view,
  onViewChange,
  activeLayers,
  onToggleLayer,
  painMarkers,
  onAddMarker,
  onRemoveMarker,
  aiPayload,
  interactiveMode = 'inspect',
}) => {
  const [displayMode, setDisplayMode] = useState<'3d_webgl' | '2d_muscle'>('3d_webgl');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Selected item states
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleDetail | null>(null);
  const [selectedTsubo, setSelectedTsubo] = useState<TsuboPointInfo | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerPointInfo | null>(null);
  const [selectedSenLine, setSelectedSenLine] = useState<SenLineInfo | null>(null);
  const [selectedAiVector, setSelectedAiVector] = useState<any | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Derive muscle highlights from AI payload or active case
  const highlightedMuscles: ExtendedBodyPart[] = React.useMemo(() => {
    const list: ExtendedBodyPart[] = [];

    // Default resting tone
    const defaultColor = '#1e293b';

    // If a muscle is actively selected in Muscle Explorer
    if (selectedMuscle) {
      list.push({
        slug: selectedMuscle.slug as Slug,
        color: '#f59e0b',
        intensity: 2,
        styles: {
          fill: '#f59e0b',
          stroke: '#fbbf24',
          strokeWidth: 2,
        },
      });
    }

    // AI diagnostic summary highlights
    const rootCause = aiPayload?.diagnostic_summary?.primary_root_cause?.toLowerCase() || '';
    if (rootCause.includes('suboccipital') || rootCause.includes('head') || rootCause.includes('neck')) {
      if (selectedMuscle?.slug !== 'trapezius') {
        list.push({ slug: 'trapezius', color: '#ef4444', intensity: 2, styles: { fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 1.5 } });
      }
      if (selectedMuscle?.slug !== 'neck') {
        list.push({ slug: 'neck', color: '#f87171', intensity: 1, styles: { fill: '#991b1b', stroke: '#f87171', strokeWidth: 1.5 } });
      }
    }
    if (rootCause.includes('lumbar') || rootCause.includes('psoas') || rootCause.includes('sacro') || rootCause.includes('back')) {
      if (selectedMuscle?.slug !== 'lower-back') {
        list.push({ slug: 'lower-back', color: '#ef4444', intensity: 2, styles: { fill: '#7f1d1d', stroke: '#ef4444', strokeWidth: 1.5 } });
      }
      if (selectedMuscle?.slug !== 'gluteal') {
        list.push({ slug: 'gluteal', color: '#f97316', intensity: 2, styles: { fill: '#7c2d12', stroke: '#f97316', strokeWidth: 1.5 } });
      }
    }
    if (rootCause.includes('itb') || rootCause.includes('knee') || rootCause.includes('runner') || rootCause.includes('glute')) {
      if (selectedMuscle?.slug !== 'quadriceps') {
        list.push({ slug: 'quadriceps', color: '#f97316', intensity: 2, styles: { fill: '#7c2d12', stroke: '#f97316', strokeWidth: 1.5 } });
      }
      if (selectedMuscle?.slug !== 'calves') {
        list.push({ slug: 'calves', color: '#ea580c', intensity: 1, styles: { fill: '#6c2e12', stroke: '#ea580c', strokeWidth: 1.5 } });
      }
    }

    return list;
  }, [selectedMuscle, aiPayload]);

  const handleBodyPartPress = (part: ExtendedBodyPart) => {
    if (part.slug && MUSCLE_ANATOMY_DETAILS[part.slug]) {
      setSelectedMuscle(MUSCLE_ANATOMY_DETAILS[part.slug]);
      setSelectedTsubo(null);
      setSelectedTrigger(null);
      setSelectedSenLine(null);
      setSelectedAiVector(null);
    }
  };

  // Click on SVG overlay to place pain or trigger markers
  const handleOverlayClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (interactiveMode === 'inspect') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.round((clickX / rect.width) * 100);
    const yPercent = Math.round((clickY / rect.height) * 100);

    onAddMarker({
      x: xPercent,
      y: yPercent,
      view,
      type: interactiveMode === 'add_symptom' ? 'symptom' : 'suspected_trigger',
      label: interactiveMode === 'add_symptom' ? `Marked Pain (${xPercent}%, ${yPercent}%)` : `Trigger Knot (${xPercent}%, ${yPercent}%)`,
    });
  };

  // Convert percentage (0-100) to actual SVG coordinates
  // Front viewBox: 0 0 724 1448
  // Back viewBox: 724 0 724 1448
  const toSvgX = (percent: number) => {
    return view === 'anterior' ? (percent / 100) * 724 : 724 + (percent / 100) * 724;
  };

  const toSvgY = (percent: number) => {
    return (percent / 100) * 1448;
  };

  // Filter visible anatomical markers
  const visibleTsubos = TSUDO_POINTS.filter((t) =>
    view === 'anterior' ? !!t.coordinates.anterior : !!t.coordinates.posterior
  );
  const visibleTriggers = TRIGGER_POINTS.filter((tp) => tp.view === view);
  const currentViewPainMarkers = painMarkers.filter((m) => m.view === view);
  const aiReferredVectors = aiPayload?.diagnostic_summary?.referred_pain_vectors || [];

  return (
    <div className="flex flex-col h-full bg-[#181a19] rounded-2xl border border-[#2a2f2b] shadow-2xl backdrop-blur-md overflow-hidden text-[#eae6df]">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-[#2a2f2b] bg-[#141615] gap-3">
        {/* Left: View Mode (3D Spatial vs 2D Precision) & Gender/View */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 3D WebGL vs 2D Muscle Mode Switcher */}
          <div className="flex items-center p-1 bg-[#121413] border border-[#222623] rounded-xl">
            <button
              onClick={() => setDisplayMode('3d_webgl')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                displayMode === '3d_webgl'
                  ? 'bg-[#2d3d32] text-[#cbe0d1] border border-[#3b5242] shadow-sm'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-[#7ea18b]" />
              <span>3D Spatial (WebGL)</span>
            </button>
            <button
              onClick={() => setDisplayMode('2d_muscle')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                displayMode === '2d_muscle'
                  ? 'bg-[#c48943]/20 text-[#e9c46a] border border-[#c48943]/40 shadow-sm'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#c48943]" />
              <span>2D Muscle Map</span>
            </button>
          </div>

          {displayMode === '2d_muscle' && (
            <>
              {/* View Perspective Switcher (Anterior/Posterior for 2D) */}
              <div className="flex items-center p-1 bg-[#121413] border border-[#222623] rounded-xl">
                <button
                  onClick={() => onViewChange('anterior')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
                    view === 'anterior'
                      ? 'bg-[#c48943]/20 text-[#e9c46a] border border-[#c48943]/40 shadow-sm'
                      : 'text-[#8a857d] hover:text-[#eae6df]'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => onViewChange('posterior')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
                    view === 'posterior'
                      ? 'bg-[#c48943]/20 text-[#e9c46a] border border-[#c48943]/40 shadow-sm'
                      : 'text-[#8a857d] hover:text-[#eae6df]'
                  }`}
                >
                  Posterior
                </button>
              </div>

              {/* Gender Morphology Switcher */}
              <div className="flex items-center p-1 bg-[#121413] border border-[#222623] rounded-xl">
                <button
                  onClick={() => setGender('male')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-[#222923] text-[#f5f2ea] font-bold border border-[#2e3a31]'
                      : 'text-[#8a857d] hover:text-[#eae6df]'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-[#222923] text-[#f5f2ea] font-bold border border-[#2e3a31]'
                      : 'text-[#8a857d] hover:text-[#eae6df]'
                  }`}
                >
                  Female
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right: Layer Toggles & Mode Selection */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Skeletal Landmark Toggle */}
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              showSkeleton
                ? 'bg-[#2d3d32] border-[#3b5242] text-[#cbe0d1] shadow-sm'
                : 'bg-[#121413] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
            }`}
            title="Toggle Skeletal Landmarks (Vertebrae, Pelvis, Scapulae)"
          >
            <Bone className="w-3.5 h-3.5" />
            <span>Skeleton</span>
          </button>

          {/* Kinetic Trigger Layer */}
          <button
            onClick={() => onToggleLayer('kinetic')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              activeLayers.kinetic
                ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-sm'
                : 'bg-[#121413] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
            }`}
            title="Travell & Simons Trigger Points & Referred Vectors"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Triggers</span>
          </button>

          {/* TCM Meridians Layer */}
          <button
            onClick={() => onToggleLayer('meridian')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              activeLayers.meridian
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm'
                : 'bg-[#121413] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
            }`}
            title="TCM Meridians & Acupressure Tsubo Points"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Meridians</span>
          </button>

          {/* Thai Sen Line Layer */}
          <button
            onClick={() => onToggleLayer('sen_line')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              activeLayers.sen_line
                ? 'bg-[#c48943]/20 border-[#c48943]/50 text-[#e9c46a] shadow-sm'
                : 'bg-[#121413] border-[#222623] text-[#8a857d] hover:text-[#eae6df]'
            }`}
            title="Thai Sib Sen Lines & Traction Directions"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Sen Lines</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-[#121413] border border-[#222623] rounded-lg p-0.5 ml-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
              className="p-1 text-[#8a857d] hover:text-[#eae6df] cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-[#8a857d]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              className="p-1 text-[#8a857d] hover:text-[#eae6df] cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1.0)}
              className="p-1 text-[#8a857d] hover:text-[#eae6df] border-l border-[#222623] ml-0.5 cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {displayMode === '3d_webgl' ? (
        <ThreeBodyModel
          activeLayers={activeLayers}
          showSkeleton={showSkeleton}
          painMarkers={painMarkers}
          onAddMarker={onAddMarker}
          onRemoveMarker={onRemoveMarker}
          onSelectTsubo={(t) => {
            setSelectedTsubo(t);
            setSelectedMuscle(null);
            setSelectedTrigger(null);
            setSelectedSenLine(null);
            setSelectedAiVector(null);
          }}
          onSelectTrigger={(tp) => {
            setSelectedTrigger(tp);
            setSelectedMuscle(null);
            setSelectedTsubo(null);
            setSelectedSenLine(null);
            setSelectedAiVector(null);
          }}
          onSelectSenLine={(s) => {
            setSelectedSenLine(s);
            setSelectedMuscle(null);
            setSelectedTsubo(null);
            setSelectedTrigger(null);
            setSelectedAiVector(null);
          }}
          onSelectAiVector={(v) => {
            setSelectedAiVector(v);
            setSelectedMuscle(null);
          }}
          aiPayload={aiPayload}
          interactiveMode={interactiveMode}
        />
      ) : (
        <div
          ref={containerRef}
          className="relative flex-1 flex items-center justify-center p-4 min-h-[520px] overflow-hidden select-none bg-slate-950/40"
        >
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Ambient Glow */}
          <div className="absolute inset-10 rounded-full blur-3xl opacity-20 bg-gradient-to-b from-sky-500/30 via-amber-500/20 to-red-500/20 pointer-events-none" />

          {/* Body Container wrapper with scaling */}
          <div
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Discernible Anatomical Muscle Model (SVG vector) */}
            <div className="relative">
              <Body
                data={highlightedMuscles}
                side={view === 'anterior' ? 'front' : 'back'}
                gender={gender}
                scale={1.25}
                border="#64748b"
                defaultFill="#182234"
                defaultStroke="#334155"
                defaultStrokeWidth={1}
                onBodyPartPress={handleBodyPartPress}
              />

              {/* Precision Synchronized Overlay SVG Layer (Directly matching viewBox) */}
              <svg
                viewBox={view === 'anterior' ? '0 0 724 1448' : '724 0 724 1448'}
                className={`absolute inset-0 w-full h-full pointer-events-auto ${
                  interactiveMode !== 'inspect' ? 'cursor-crosshair' : 'cursor-default'
                }`}
                onClick={handleOverlayClick}
              >
                <defs>
                  {/* Radial glow for trigger nodules */}
                  <radialGradient id="highResTriggerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                    <stop offset="60%" stopColor="#dc2626" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
                  </radialGradient>

                  {/* Radial glow for tsubo acupressure points */}
                  <radialGradient id="highResTsuboGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
                    <stop offset="50%" stopColor="#0284c7" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
                  </radialGradient>

                  {/* Radial glow for symptom marker */}
                  <radialGradient id="highResSymptomGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                    <stop offset="60%" stopColor="#d97706" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                  </radialGradient>

                  {/* Linear gradient for referred pain vector dashed path */}
                  <linearGradient id="highResReferredGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* SKELETAL LANDMARK X-RAY OVERLAY */}
                {showSkeleton && (
                  <g className="skeletal-landmarks opacity-80 pointer-events-none transition-opacity duration-300">
                    {view === 'posterior' ? (
                      // Posterior Skeletal Landmarks
                      <g stroke="#cbd5e1" strokeWidth="1.8" fill="none">
                        {/* Vertebral Column C1 to Sacrum */}
                        <path
                          d="M 1086 260 L 1086 780"
                          stroke="#94a3b8"
                          strokeWidth="3.5"
                          strokeDasharray="4,5"
                          strokeLinecap="round"
                        />
                        {/* Cervical C1-C7 */}
                        <circle cx="1086" cy="275" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
                        <circle cx="1086" cy="305" r="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
                        {/* Scapular Spines */}
                        <path d="M 1010 370 Q 1055 350 1080 365" stroke="#94a3b8" strokeWidth="2.5" />
                        <path d="M 1162 370 Q 1117 350 1092 365" stroke="#94a3b8" strokeWidth="2.5" />
                        {/* Lumbar L1-L5 */}
                        <rect x="1080" y="650" width="12" height="8" rx="2" fill="#cbd5e1" stroke="#475569" />
                        <rect x="1079" y="675" width="14" height="9" rx="2" fill="#cbd5e1" stroke="#475569" />
                        <rect x="1078" y="705" width="16" height="10" rx="2" fill="#cbd5e1" stroke="#475569" />
                        {/* Sacrum triangle */}
                        <polygon points="1074,745 1098,745 1086,795" fill="#94a3b8" fillOpacity="0.4" stroke="#e2e8f0" strokeWidth="2" />
                        {/* Posterior Iliac Crest / PSIS */}
                        <path d="M 1010 705 Q 1050 690 1086 740 Q 1122 690 1162 705" stroke="#94a3b8" strokeWidth="2.5" />
                        {/* Greater Trochanter landmarks */}
                        <circle cx="985" cy="800" r="8" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" />
                        <circle cx="1187" cy="800" r="8" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" />
                      </g>
                    ) : (
                      // Anterior Skeletal Landmarks
                      <g stroke="#cbd5e1" strokeWidth="1.8" fill="none">
                        {/* Clavicles (Collar bones) */}
                        <path d="M 362 315 Q 300 305 245 330" stroke="#94a3b8" strokeWidth="3" />
                        <path d="M 362 315 Q 424 305 479 330" stroke="#94a3b8" strokeWidth="3" />
                        {/* Sternum (Manubrium and body) */}
                        <path d="M 362 315 L 362 485" stroke="#cbd5e1" strokeWidth="4.5" strokeLinecap="round" />
                        {/* Rib cage margin */}
                        <path d="M 362 485 Q 310 520 270 560" stroke="#94a3b8" strokeWidth="2" />
                        <path d="M 362 485 Q 414 520 454 560" stroke="#94a3b8" strokeWidth="2" />
                        {/* ASIS (Anterior Superior Iliac Spine) */}
                        <circle cx="285" cy="740" r="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                        <circle cx="439" cy="740" r="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                        {/* Patellae (Kneecaps) */}
                        <circle cx="304" cy="1110" r="14" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                        <circle cx="420" cy="1110" r="14" fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                      </g>
                    )}
                  </g>
                )}

                {/* LAYER 3: THAI SIB SEN LINES OVERLAY */}
                {activeLayers.sen_line && (
                  <g className="thai-sen-lines-layer transition-opacity duration-300">
                    {THAI_SEN_LINES.map((sen) => {
                      const coords = view === 'anterior' ? sen.pathCoordinatesAnterior : sen.pathCoordinatesPosterior;
                      if (!coords || coords.length < 2) return null;

                      const pathD = coords.reduce((acc: string, pt: { x: number; y: number }, idx: number) => {
                        const sx = toSvgX(pt.x);
                        const sy = toSvgY(pt.y);
                        return idx === 0 ? `M ${sx} ${sy}` : `${acc} L ${sx} ${sy}`;
                      }, '');

                      return (
                        <g
                          key={sen.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSenLine(sen);
                            setSelectedMuscle(null);
                            setSelectedTsubo(null);
                            setSelectedTrigger(null);
                          }}
                          className="cursor-pointer group"
                        >
                          {/* Broad invisible stroke for easy tap */}
                          <path d={pathD} stroke="transparent" strokeWidth="24" fill="none" />
                          {/* Glowing Sen Line */}
                          <path
                            d={pathD}
                            stroke={sen.color}
                            strokeWidth="3.5"
                            strokeDasharray="8,6"
                            strokeLinecap="round"
                            fill="none"
                            opacity="0.9"
                            filter="drop-shadow(0 0 6px currentColor)"
                          />
                          {/* Traction nodes */}
                          {coords.map((pt: { x: number; y: number }, i: number) => (
                            <circle
                              key={i}
                              cx={toSvgX(pt.x)}
                              cy={toSvgY(pt.y)}
                              r="5"
                              fill={sen.color}
                              stroke="#0f172a"
                              strokeWidth="1.5"
                            />
                          ))}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* LAYER 2: TCM MERIDIANS & TSUDO ACUPRESSURE POINTS OVERLAY */}
                {activeLayers.meridian && (
                  <g className="tcm-meridian-layer transition-opacity duration-300">
                    {/* Bladder Channel (BL) descending along posterior spine and legs */}
                    {view === 'posterior' && (
                      <g>
                        {/* Left BL Channel */}
                        <path
                          d="M 1056 260 L 1056 460 L 1056 700 L 1045 810 L 1028 1110 L 1025 1280 L 1030 1400"
                          stroke="#38bdf8"
                          strokeWidth="3"
                          strokeDasharray="6,4"
                          fill="none"
                          opacity="0.85"
                          filter="drop-shadow(0 0 4px #38bdf8)"
                        />
                        {/* Right BL Channel */}
                        <path
                          d="M 1116 260 L 1116 460 L 1116 700 L 1127 810 L 1144 1110 L 1147 1280 L 1142 1400"
                          stroke="#38bdf8"
                          strokeWidth="3"
                          strokeDasharray="6,4"
                          fill="none"
                          opacity="0.85"
                          filter="drop-shadow(0 0 4px #38bdf8)"
                        />
                      </g>
                    )}

                    {/* Gallbladder Channel (GB) along temporal, lateral neck, lateral torso, IT band */}
                    {view === 'posterior' && (
                      <g>
                        <path
                          d="M 1035 250 L 980 340 L 940 450 L 970 650 L 985 800 L 965 1050 L 980 1140 L 980 1380"
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                          strokeDasharray="7,4"
                          fill="none"
                          opacity="0.8"
                          filter="drop-shadow(0 0 4px #06b6d4)"
                        />
                      </g>
                    )}

                    {/* Tsubo Acupressure Nodes */}
                    {visibleTsubos.map((tsubo) => {
                      const pt = view === 'anterior' ? tsubo.coordinates.anterior! : tsubo.coordinates.posterior!;
                      const sx = toSvgX(pt.x);
                      const sy = toSvgY(pt.y);
                      const isSelected = selectedTsubo?.code === tsubo.code;

                      return (
                        <g
                          key={tsubo.code}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTsubo(tsubo);
                            setSelectedMuscle(null);
                            setSelectedTrigger(null);
                            setSelectedSenLine(null);
                          }}
                          className="cursor-pointer group"
                        >
                          {/* Invisible tap target */}
                          <circle cx={sx} cy={sy} r="18" fill="transparent" />
                          {/* Outer wave ping */}
                          <circle
                            cx={sx}
                            cy={sy}
                            r="14"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="1.2"
                            opacity={isSelected ? "1" : "0.5"}
                            className="animate-ping"
                          />
                          {/* Core node */}
                          <circle
                            cx={sx}
                            cy={sy}
                            r={isSelected ? "9" : "7"}
                            fill="url(#highResTsuboGlow)"
                            stroke="#ffffff"
                            strokeWidth="1.8"
                          />
                          {/* Text Label */}
                          <text
                            x={sx + 10}
                            y={sy + 4}
                            fontSize="13"
                            fill="#bae6fd"
                            fontWeight="bold"
                            className="pointer-events-none drop-shadow-md font-mono"
                          >
                            {tsubo.code}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* LAYER 1: KINETIC & TRAVELL & SIMONS TRIGGER POINT LAYER OVERLAY */}
                {activeLayers.kinetic && (
                  <g className="kinetic-trigger-layer transition-opacity duration-300">
                    {/* Anatomical Trigger Points */}
                    {visibleTriggers.map((tp, idx) => {
                      const sx = toSvgX(tp.coordinate.x);
                      const sy = toSvgY(tp.coordinate.y);
                      const isSelected = selectedTrigger?.muscle === tp.muscle;

                      return (
                        <g
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrigger(tp);
                            setSelectedMuscle(null);
                            setSelectedTsubo(null);
                            setSelectedSenLine(null);
                          }}
                          className="cursor-pointer group"
                        >
                          {/* Tap target */}
                          <circle cx={sx} cy={sy} r="20" fill="transparent" />

                          {/* Referred Pain Projection Vector (Dashed Arc) */}
                          {tp.referredVector && (
                            <g>
                              <line
                                x1={sx}
                                y1={sy}
                                x2={toSvgX(tp.referredVector.x)}
                                y2={toSvgY(tp.referredVector.y)}
                                stroke="url(#highResReferredGrad)"
                                strokeWidth="3"
                                strokeDasharray="6,4"
                                strokeLinecap="round"
                                opacity="0.9"
                              />
                              {/* Projection target receptor zone */}
                              <circle
                                cx={toSvgX(tp.referredVector.x)}
                                cy={toSvgY(tp.referredVector.y)}
                                r="10"
                                fill="#ef4444"
                                opacity="0.4"
                              stroke="#fca5a5"
                              strokeWidth="1.5"
                              strokeDasharray="3,3"
                            />
                          </g>
                        )}

                        {/* Concentric irritable wave */}
                        <circle
                          cx={sx}
                          cy={sy}
                          r="15"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          opacity={isSelected ? "1" : "0.5"}
                          className="animate-ping"
                        />
                        {/* Core Trigger Knot */}
                        <circle
                          cx={sx}
                          cy={sy}
                          r={isSelected ? "10" : "8"}
                          fill="url(#highResTriggerGlow)"
                          stroke="#fef2f2"
                          strokeWidth="2"
                        />
                        <text
                          x={sx - 12}
                          y={sy - 10}
                          fontSize="12"
                          fill="#fca5a5"
                          fontWeight="bold"
                          className="pointer-events-none drop-shadow font-sans"
                        >
                          ⚡ TP
                        </text>
                      </g>
                    );
                  })}

                  {/* AI Referred Pain Vectors */}
                  {aiReferredVectors.map((v, idx) => {
                    const coords = v.anatomical_coordinates;
                    if (!coords) return null;
                    const sx = toSvgX(coords.x);
                    const sy = toSvgY(coords.y);

                    return (
                      <g
                        key={idx}
                        className="ai-referred-vector group cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAiVector(v);
                          setSelectedMuscle(null);
                        }}
                      >
                        <circle cx={sx} cy={sy} r="18" fill="transparent" />
                        <circle
                          cx={sx}
                          cy={sy}
                          r="11"
                          fill="#ef4444"
                          opacity="0.8"
                          stroke="#fef08a"
                          strokeWidth="2"
                        />
                        <text
                          x={sx + 14}
                          y={sy + 4}
                          fontSize="13"
                          fill="#fef08a"
                          fontWeight="bold"
                          className="font-mono drop-shadow"
                        >
                          ⚡ {v.trigger_origin.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* OPERATOR MARKED PAIN SITES & HYPERIRRITABLE NODULES */}
              {currentViewPainMarkers.map((marker) => {
                const sx = toSvgX(marker.x);
                const sy = toSvgY(marker.y);

                return (
                  <g
                    key={marker.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMarker(marker.id);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle cx={sx} cy={sy} r="22" fill="transparent" />
                    <circle
                      cx={sx}
                      cy={sy}
                      r="16"
                      fill="none"
                      stroke={marker.type === 'symptom' ? '#f59e0b' : '#ef4444'}
                      strokeWidth="1.8"
                      className="animate-ping"
                    />
                    <circle
                      cx={sx}
                      cy={sy}
                      r="9"
                      fill={marker.type === 'symptom' ? 'url(#highResSymptomGlow)' : 'url(#highResTriggerGlow)'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <text
                      x={sx + 12}
                      y={sy + 4}
                      fontSize="13"
                      fill="#ffffff"
                      fontWeight="bold"
                      className="drop-shadow-lg pointer-events-none"
                    >
                      {marker.type === 'symptom' ? '📍' : '⚡'} {marker.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Floating Quick Action Overlay at Bottom Left */}
        <div className="absolute bottom-3 left-4 flex flex-col gap-1 text-[11px] text-slate-300 bg-slate-950/85 p-3 rounded-xl border border-slate-800 backdrop-blur-md shadow-xl pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
            <span>Kinetic Trigger Point / Referred Vector</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
            <span>TCM Meridian / Tsubo Node</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <span>Thai Sib Sen Traction Line</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
            <span>Skeletal Bony Landmark</span>
          </div>
          <span className="text-[10px] text-amber-400/90 mt-1 font-medium">
            💡 Click any muscle group or node on the body to inspect clinical depth.
          </span>
        </div>
      </div>
      )}

      {/* BOTTOM CLINICAL INSPECTOR CARD */}
      {(selectedMuscle || selectedTsubo || selectedTrigger || selectedSenLine || selectedAiVector) && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-4">
            {/* Muscle Explorer Inspector */}
            {selectedMuscle && (
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    MUSCLE ANATOMY
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {selectedMuscle.name} <span className="text-xs text-slate-400 italic font-serif">({selectedMuscle.latinName})</span>
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-100">Functional Action:</strong> {selectedMuscle.action}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <p className="text-amber-200/90">
                    <strong className="text-amber-300">Anatomy Train / Fascial Chain:</strong> {selectedMuscle.fascialLine}
                  </p>
                  <p className="text-sky-200/90">
                    <strong className="text-sky-300">Crossing Meridians:</strong> {selectedMuscle.tcmMeridians.join(', ')}
                  </p>
                </div>
                <p className="text-xs text-red-200/90">
                  <strong className="text-red-300">Trigger Points:</strong> {selectedMuscle.commonTriggerPoints}
                </p>
                <p className="text-xs text-emerald-300 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 font-medium">
                  <strong>Therapist Deactivation Cue:</strong> {selectedMuscle.treatmentCue}
                </p>
              </div>
            )}

            {/* Tsubo Inspector */}
            {selectedTsubo && (
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                    TSUBO {selectedTsubo.code}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {selectedTsubo.pinyin} ({selectedTsubo.english}) — {selectedTsubo.meridian}
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-100">Location:</strong> {selectedTsubo.anatomicalLocation}
                </p>
                <p className="text-xs text-sky-200/90">
                  <strong className="text-sky-300">Clinical Indication:</strong> {selectedTsubo.clinicalIndication}
                </p>
                <p className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  <strong>Therapist Palpation Cue:</strong> {selectedTsubo.palpationCue}
                </p>
              </div>
            )}

            {/* Trigger Point Inspector */}
            {selectedTrigger && (
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                    TRIGGER POINT
                  </span>
                  <h4 className="text-sm font-bold text-white">{selectedTrigger.muscle}</h4>
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-100">Referred Pain Vector:</strong> {selectedTrigger.referredPattern}
                </p>
                <p className="text-xs text-red-200/90">
                  <strong className="text-red-300">Antagonist Inhibition:</strong> {selectedTrigger.antagonistInhibition}
                </p>
                <p className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  <strong>Deactivation Cue:</strong> {selectedTrigger.deactivationTechnique}
                </p>
              </div>
            )}

            {/* Sen Line Inspector */}
            {selectedSenLine && (
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    THAI SEN LINE
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {selectedSenLine.name} ({selectedSenLine.thaiName})
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-100">Pranic Flow:</strong> {selectedSenLine.energyFlow}
                </p>
                <p className="text-xs text-amber-200">
                  <strong className="text-amber-300">Myofascial Chain:</strong> {selectedSenLine.biomechanicalChain}
                </p>
                <p className="text-xs text-emerald-300 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                  <strong>Traction Technique:</strong> {selectedSenLine.tractionTechnique}
                </p>
              </div>
            )}

            {/* AI Vector Inspector */}
            {selectedAiVector && (
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    AI REFERRED VECTOR
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {selectedAiVector.trigger_origin} → {selectedAiVector.referred_target}
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  Upstream hyperirritable nodule projecting to distant symptomatic receptor field.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedMuscle(null);
                setSelectedTsubo(null);
                setSelectedTrigger(null);
                setSelectedSenLine(null);
                setSelectedAiVector(null);
              }}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
