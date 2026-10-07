import React, { useState } from 'react';
import {
  AnalysisResult,
  ClientDossier,
  PosturePhotoSlotId,
  PhotoCorroborationItem,
} from '../types/clinical';
import {
  WHOLE_BODY_PHOTO_SLOTS,
  getPhotoSlotById,
  generateCorroborationsForClient,
} from '../data/wholeBodyPhotoCatalog';
import { getClinicalSampleDataUrl } from '../utils/clinicalSampleGenerator';
import { BodyMannequin } from './BodyMannequin';
import {
  Eye,
  CheckCircle2,
  Crosshair,
  Flame,
  Activity,
  Compass,
  ArrowRight,
  Camera,
  Play,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  ChevronRight,
  Check,
} from 'lucide-react';

interface CorroborationStudioProps {
  dossier: ClientDossier;
  analysis: AnalysisResult | null;
  onOpenTableMode: () => void;
  onBackToIntake: () => void;
  onInjectSamplePhotos?: () => void;
}

export const CorroborationStudio: React.FC<CorroborationStudioProps> = ({
  dossier,
  analysis,
  onOpenTableMode,
  onBackToIntake,
}) => {
  const clientPhotos = dossier.clientPhotos || {};
  const photoKeys = Object.keys(clientPhotos) as PosturePhotoSlotId[];

  // Fallback slots if no photos supplied yet
  const availableSlots: PosturePhotoSlotId[] =
    photoKeys.length > 0
      ? photoKeys
      : ['clavicular', 'lateral_sagittal', 'anterior_full', 'craniocervical', 'lumbopelvic'];

  const [activePhotoSlot, setActivePhotoSlot] = useState<PosturePhotoSlotId>(
    availableSlots[0] || 'clavicular'
  );
  const [showPlumbOverlay, setShowPlumbOverlay] = useState(true);

  const payload = analysis?.payloadJson;
  const corroborations: PhotoCorroborationItem[] =
    payload?.diagnostic_summary?.photographic_corroborations &&
    payload.diagnostic_summary.photographic_corroborations.length > 0
      ? payload.diagnostic_summary.photographic_corroborations
      : generateCorroborationsForClient(
          dossier.painPresentation?.mannequinMarkers || [],
          clientPhotos
        );

  const activePhoto = clientPhotos[activePhotoSlot];
  const activeSlotDef = getPhotoSlotById(activePhotoSlot);
  const activeCorroboration =
    corroborations.find((c) => c.photo_slot_id === activePhotoSlot) ||
    corroborations[0] || {
      photo_slot_id: activePhotoSlot,
      photo_name: activeSlotDef?.label || 'Clinical Posture Angle',
      observed_dysfunction: activeSlotDef?.sampleDysfunction || 'Significant asymmetrical kinetic load.',
      corroborated_body_marker: activeSlotDef?.corroboratedMarkerName || 'Target anatomical trigger zone',
      treatment_dynamic: activeSlotDef?.treatmentDynamic || 'Direct manual decompression sequence.',
    };

  return (
    <div className="flex flex-col h-full bg-[#181a19] rounded-2xl border border-[#2a2f2b] shadow-2xl backdrop-blur-md overflow-hidden text-[#eae6df]">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-[#2a2f2b] bg-[#141615] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2d3d32] border border-[#3b5242] flex items-center justify-center text-[#7ea18b]">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#f5f2ea] tracking-wide">
                PATIENT CORROBORATION STUDIO
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-[#121413] px-2 py-0.5 rounded border border-[#222623]">
                Photo Evidence × Body Double Corroboration
              </span>
            </div>
            <p className="text-xs text-[#a8a39b]">
              Corroborates the patient's actual photographs with the digital body double to work out the precise dynamics of the treatment plan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToIntake}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e221f] hover:bg-[#28322a] border border-[#2a2f2b] text-[#eae6df] transition-all cursor-pointer"
          >
            Adjust Intake &amp; Whole-Body Photos
          </button>

          <button
            type="button"
            onClick={onOpenTableMode}
            className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#c48943] to-[#d4a373] hover:from-[#d4a373] hover:to-[#e9c46a] text-[#121413] transition-all shadow-md shadow-[#c48943]/20 cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-[#121413]" />
            <span>Launch Table Mode</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Corroboration Stage */}
      <div className="flex-1 p-4 lg:p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Client Actual Photograph & Observation Findings (6 cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#c48943]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#f5f2ea]">
                Client Photo Evidence ({photoKeys.length} Supplied)
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowPlumbOverlay(!showPlumbOverlay)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                showPlumbOverlay
                  ? 'bg-[#c48943]/20 border-[#c48943] text-[#e9c46a]'
                  : 'bg-[#141615] border-[#2a2f2b] text-[#8a857d]'
              }`}
            >
              Plumb Overlay: {showPlumbOverlay ? 'On' : 'Off'}
            </button>
          </div>

          {/* Whole Body Photo Slot Selection Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {availableSlots.map((slotId) => {
              const def = getPhotoSlotById(slotId);
              const isSelected = activePhotoSlot === slotId;
              const hasPhoto = !!clientPhotos[slotId];

              return (
                <button
                  key={slotId}
                  type="button"
                  onClick={() => setActivePhotoSlot(slotId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#2d3d32] border-[#c48943] text-[#f5f2ea] shadow-sm ring-1 ring-[#c48943]/30'
                      : 'bg-[#141615] border-[#2a2f2b] text-[#8a857d] hover:text-[#eae6df]'
                  }`}
                >
                  {hasPhoto && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  <span>{def?.shortLabel || slotId}</span>
                </button>
              );
            })}
          </div>

          {/* Photo Canvas with Plumb & Anatomical Deviation Markers */}
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#121413] border border-[#222623] flex items-center justify-center select-none">
            {activePhoto?.imageBase64 ? (
              <div className="relative w-full h-full flex items-center justify-center bg-[#0d0f0e]">
                <img
                  src={activePhoto.imageBase64}
                  alt={activePhoto.label}
                  className="w-full h-full object-contain"
                />

                {/* Plumb Line Overlay */}
                {showPlumbOverlay && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                      x1="50%"
                      y1="5%"
                      x2="50%"
                      y2="95%"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="4,3"
                    />
                    <line
                      x1="5%"
                      y1="50%"
                      x2="95%"
                      y2="50%"
                      stroke="#c48943"
                      strokeWidth="1"
                      strokeDasharray="2,4"
                      opacity="0.6"
                    />
                    <circle cx="50%" cy="10%" r="4" fill="#ef4444" />
                    <circle cx="50%" cy="90%" r="4" fill="#ef4444" />
                  </svg>
                )}

                <div className="absolute bottom-2 left-2 bg-[#121413]/90 px-2.5 py-1 rounded text-[10px] text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> Active Client Picture: {activeSlotDef?.label || activePhoto.label}
                </div>
              </div>
            ) : (
              // Pre-Rendered Clinical Reference Visualization for this Angle
              <div className="relative w-full h-full flex items-center justify-center bg-[#0d0f0e]">
                <img
                  src={getClinicalSampleDataUrl(activePhotoSlot)}
                  alt={activeSlotDef?.label || 'Clinical Sample'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 left-2 bg-[#121413]/90 px-2.5 py-1 rounded text-[10px] text-[#c48943] border border-[#c48943]/40 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" /> Reference Sample Active ({activeSlotDef?.shortLabel})
                </div>
              </div>
            )}
          </div>

          {/* Photographic Corroboration Insight Card */}
          {activeCorroboration && (
            <div className="p-3.5 rounded-xl bg-[#141615] border border-[#2a2f2b] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#e9c46a] uppercase tracking-wider flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Observed Physical Deviation</span>
                </span>
                <span className="text-[10px] text-[#8a857d] font-mono">
                  {activeCorroboration.photo_name}
                </span>
              </div>

              <p className="text-xs text-[#eae6df] leading-relaxed">
                {activeCorroboration.observed_dysfunction}
              </p>

              <div className="p-2.5 rounded-lg bg-[#181a19] border border-[#222623] text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7ea18b] block">
                  Corroboration With Treatment Dynamics:
                </span>
                <p className="text-[#a8a39b] leading-relaxed">
                  {activeCorroboration.treatment_dynamic}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Corroborated Body Double Model (6 cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7ea18b]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#f5f2ea]">
                Corroborated Body Double Representation
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#c48943]">
              Root Triggers × Symptom Vectors
            </span>
          </div>

          {/* Body Double Presentation Component */}
          <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-[#2a2f2b]">
            <BodyMannequin
              view={activeSlotDef?.viewPerspective === 'posterior' ? 'posterior' : 'anterior'}
              onViewChange={() => {}}
              activeLayers={{ kinetic: true, meridian: true, sen_line: true }}
              onToggleLayer={() => {}}
              painMarkers={dossier.painPresentation.mannequinMarkers}
              onAddMarker={() => {}}
              onRemoveMarker={() => {}}
              aiPayload={payload}
              interactiveMode="inspect"
            />
          </div>

          {/* Root Cause Synthesis Box */}
          <div className="p-3.5 rounded-xl bg-[#141615] border border-[#c48943]/40 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c48943] block">
              Primary Root Cause Formulation From Pictures:
            </span>
            <p className="text-xs font-medium text-[#f5f2ea] leading-relaxed">
              {payload?.diagnostic_summary?.primary_root_cause ||
                'Biomechanical and fascial torque corroborating stated pain sites with postural photographed vectors.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
