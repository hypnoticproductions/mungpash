import React, { useState } from 'react';
import { PosturePhotoSlot, PosturePhotoSlotId, PosturalDeviances } from '../types/clinical';
import {
  WHOLE_BODY_PHOTO_SLOTS,
  WholeBodyPhotoSlotDef,
  getPhotoSlotById,
} from '../data/wholeBodyPhotoCatalog';
import { getClinicalSampleDataUrl } from '../utils/clinicalSampleGenerator';
import {
  Camera,
  Upload,
  CheckCircle2,
  Eye,
  Info,
  ChevronRight,
  Maximize2,
  Sparkles,
  Layers,
  Crosshair,
  Compass,
  RotateCcw,
  Sliders,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

interface ErgonomicPhotoMatrixProps {
  posturalDeviances: PosturalDeviances;
  onUpdateDeviances: (deviances: PosturalDeviances) => void;
  onSelectPhotoSlot?: (slotId: PosturePhotoSlotId) => void;
  clientName?: string;
}

export const ErgonomicPhotoMatrix: React.FC<ErgonomicPhotoMatrixProps> = ({
  posturalDeviances,
  onUpdateDeviances,
  onSelectPhotoSlot,
  clientName = 'Active Patient',
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<PosturePhotoSlotId>('lateral_sagittal');
  const [activeVisualMode, setActiveVisualMode] = useState<'clinical_reference' | 'client_photo' | 'plumb_grid'>('clinical_reference');
  const [cameraOrientation, setCameraOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showKendallPlumb, setShowKendallPlumb] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'full_body' | 'head_neck' | 'torso_spine' | 'lower_extremity'>('all');

  // User uploaded or sample loaded images
  const [slotImages, setSlotImages] = useState<Record<string, string | undefined>>({});

  const currentSlot: WholeBodyPhotoSlotDef =
    getPhotoSlotById(selectedSlotId) || WHOLE_BODY_PHOTO_SLOTS[0];

  const filteredSlots =
    activeCategory === 'all'
      ? WHOLE_BODY_PHOTO_SLOTS
      : WHOLE_BODY_PHOTO_SLOTS.filter((s) => s.category === activeCategory);

  const handleFileUpload = (slotId: PosturePhotoSlotId, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSlotImages((prev) => ({
        ...prev,
        [slotId]: reader.result as string,
      }));
      setActiveVisualMode('client_photo');
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSamplePhoto = (slotId: PosturePhotoSlotId) => {
    const dataUrl = getClinicalSampleDataUrl(slotId);
    setSlotImages((prev) => ({
      ...prev,
      [slotId]: dataUrl,
    }));
    setActiveVisualMode('clinical_reference');
  };

  return (
    <div className="flex flex-col space-y-4 text-[#eae6df]">
      {/* Intro Header & Orientation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2a2f2b]">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-[#c48943]" />
            <h3 className="text-sm font-semibold tracking-wide text-[#f5f2ea]">
              Ergonomic Whole-Body Posture Photo Matrix
            </h3>
          </div>
          <p className="text-xs text-[#a8a39b] mt-0.5">
            All 15 whole-body projections calibrated with Kendall plumb lines &amp; pre-rendered anatomical clinical reference visuals.
          </p>
        </div>

        {/* Orientation & Plumb Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-[#181a19] border border-[#2a2f2b] rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setCameraOrientation('portrait')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                cameraOrientation === 'portrait'
                  ? 'bg-[#2d3d32] text-[#cbe0d1] shadow-sm'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              Portrait Plumb
            </button>
            <button
              type="button"
              onClick={() => setCameraOrientation('landscape')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                cameraOrientation === 'landscape'
                  ? 'bg-[#2d3d32] text-[#cbe0d1] shadow-sm'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              Landscape Bilateral
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowKendallPlumb(!showKendallPlumb)}
            className={`px-2.5 py-1 rounded-lg text-xs border transition-all flex items-center gap-1.5 ${
              showKendallPlumb
                ? 'bg-[#c48943]/20 border-[#c48943]/50 text-[#e9c46a]'
                : 'bg-[#181a19] border-[#2a2f2b] text-[#8a857d] hover:text-[#eae6df]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Kendall Plumb</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Navigator / Slot Ribbon (5 cols) + Large Reference Stage (7 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Category Filter & Whole-Body Slot Selector (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-[#181a19] rounded-xl border border-[#2a2f2b]">
            {[
              { id: 'all', label: 'All 15 Angles' },
              { id: 'full_body', label: 'Full Length' },
              { id: 'head_neck', label: 'Cervical' },
              { id: 'torso_spine', label: 'Spine/Pelvis' },
              { id: 'lower_extremity', label: 'Legs/Feet' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#2d3d32] text-[#f5f2ea]'
                    : 'text-[#8a857d] hover:text-[#eae6df]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Whole Body Photo Slots List */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredSlots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const hasUploadedImage = !!slotImages[slot.id];

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    if (onSelectPhotoSlot) onSelectPhotoSlot(slot.id);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#222923] border-[#c48943]/70 text-[#f5f2ea] shadow-sm ring-1 ring-[#c48943]/30'
                      : 'bg-[#181a19] border-[#2a2f2b] text-[#a8a39b] hover:text-[#eae6df] hover:bg-[#1e221f]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                        hasUploadedImage
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isSelected
                          ? 'bg-[#c48943]/20 text-[#e9c46a] border border-[#c48943]/50'
                          : 'bg-[#121413] text-[#8a857d] border border-[#222623]'
                      }`}
                    >
                      {hasUploadedImage ? <CheckCircle2 className="w-4 h-4" /> : <Camera className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold truncate leading-tight">{slot.label}</h4>
                      <p className="text-[10px] text-[#8a857d] truncate mt-0.5">{slot.viewAngle}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#c48943]' : 'text-[#5a5752]'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pre-Rendered High-Fidelity Anatomical Clinical Sample & Photo Canvas (7 cols) */}
        <div className="md:col-span-7 bg-[#181a19] rounded-xl border border-[#2a2f2b] p-4 space-y-3 flex flex-col justify-between">
          {/* Active Landmark View Header & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#2a2f2b]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c48943] block">
                Calibrated Clinical Landmark View
              </span>
              <h4 className="text-sm font-bold text-[#f5f2ea]">{currentSlot.label}</h4>
            </div>

            {/* View Mode & Upload Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadSamplePhoto(selectedSlotId)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#222923] hover:bg-[#28322a] border border-[#343e37] text-[#cbe0d1] cursor-pointer transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c48943]" />
                <span>Load Sample</span>
              </button>

              <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#222923] hover:bg-[#28322a] border border-[#343e37] text-[#f5f2ea] cursor-pointer transition-all shadow-sm">
                <Upload className="w-3.5 h-3.5 text-[#c48943]" />
                <span>{slotImages[selectedSlotId] ? 'Replace' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(selectedSlotId, e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* PRE-RENDERED HIGH-FIDELITY CLINICAL IMAGE STAGE */}
          <div
            className={`relative w-full rounded-xl overflow-hidden bg-[#121413] border border-[#222623] flex items-center justify-center select-none transition-all ${
              cameraOrientation === 'portrait' ? 'aspect-[4/3] sm:aspect-[16/11]' : 'aspect-[16/9]'
            }`}
          >
            {activeVisualMode === 'client_photo' && slotImages[selectedSlotId] ? (
              // Display actual client uploaded photo
              <div className="relative w-full h-full flex items-center justify-center bg-[#0d0f0e]">
                <img
                  src={slotImages[selectedSlotId]}
                  alt={currentSlot.label}
                  className="w-full h-full object-contain"
                />
                {showKendallPlumb && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-0.5 h-full bg-[#ef4444]/60" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-[#121413]/90 px-2 py-0.5 rounded text-[10px] text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Client Capture Loaded
                </div>
              </div>
            ) : (
              // Pre-Rendered High-Fidelity Anatomical Clinical Illustration
              <div className="relative w-full h-full flex items-center justify-center bg-[#0d0f0e]">
                <img
                  src={getClinicalSampleDataUrl(selectedSlotId)}
                  alt={currentSlot.label}
                  className="w-full h-full object-contain"
                />
                {showKendallPlumb && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-0.5 h-full bg-[#ef4444]/60" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-[#121413]/90 px-2 py-0.5 rounded text-[10px] text-[#c48943] border border-[#c48943]/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Calibrated Clinical Landmark View
                </div>
              </div>
            )}
          </div>

          {/* Anatomical Targets & Clinical Rationale */}
          <div className="p-3 bg-[#141615] rounded-xl border border-[#2a2f2b] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#f5f2ea]">Target Biomechanical Structures</span>
              <span className="text-[10px] font-mono text-[#7ea18b]">
                {currentSlot.categoryLabel}
              </span>
            </div>
            <p className="text-[#a8a39b] leading-relaxed">{currentSlot.clinicalRationale}</p>
            <div className="flex flex-wrap gap-1 pt-1 border-t border-[#222623]">
              {currentSlot.landmarks.map((landmark, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#181a19] border border-[#222623] text-[#a8c5b0]"
                >
                  {landmark}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
