import React, { useState, useEffect, useRef } from 'react';
import { ClientDossier, PainPointMarker, BiometricsData } from '../types/clinical';
import { CLINICAL_PRESETS } from '../data/clinicalPresets';
import { ErgonomicPhotoMatrix } from './ErgonomicPhotoMatrix';
import { BiometricPdfIngestion } from './BiometricPdfIngestion';
import {
  FileText,
  Activity,
  Flame,
  User,
  Zap,
  Mic,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Stethoscope,
  Crosshair,
  Volume2,
} from 'lucide-react';

interface MultimodalIngestionProps {
  dossier: ClientDossier;
  onChangeDossier: (dossier: ClientDossier) => void;
  onSynthesize: () => void;
  isLoading: boolean;
  interactiveMode: 'inspect' | 'add_symptom' | 'add_trigger';
  onSetInteractiveMode: (mode: 'inspect' | 'add_symptom' | 'add_trigger') => void;
}

export const MultimodalIngestion: React.FC<MultimodalIngestionProps> = ({
  dossier,
  onChangeDossier,
  onSynthesize,
  isLoading,
  interactiveMode,
  onSetInteractiveMode,
}) => {
  const [activeTab, setActiveTab] = useState<'posture' | 'biometrics' | 'lifestyle' | 'pain'>('posture');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const voiceRecognitionRef = useRef<any>(null);

  const handleSelectPreset = (presetId: string) => {
    const selected = CLINICAL_PRESETS.find((p) => p.id === presetId);
    if (selected) {
      onChangeDossier(JSON.parse(JSON.stringify(selected)));
    }
  };

  // Web Speech recognition for lifestyle notes
  const toggleVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    if (isRecordingVoice) {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const lastIdx = event.results.length - 1;
        const transcript = event.results[lastIdx][0].transcript;
        onChangeDossier({
          ...dossier,
          lifestyle: {
            ...dossier.lifestyle,
            voiceTranscript: (dossier.lifestyle.voiceTranscript || '') + ' ' + transcript,
          },
        });
      };

      recognition.onend = () => setIsRecordingVoice(false);
      recognition.onerror = () => setIsRecordingVoice(false);

      voiceRecognitionRef.current = recognition;
      try {
        recognition.start();
        setIsRecordingVoice(true);
      } catch (e) {
        setIsRecordingVoice(false);
      }
    }
  };

  const fascialGlideStatus =
    dossier.biometrics.hydrationPercent < 48
      ? { label: 'Severe Fascial Tacking / Viscous Gel', color: 'text-amber-300 bg-[#261f18] border-[#4a3420]' }
      : dossier.biometrics.hydrationPercent < 54
      ? { label: 'Moderate Fascial Viscosity', color: 'text-[#e9c46a] bg-[#222923] border-[#38433a]' }
      : { label: 'Optimal Fluid Fascial Shear', color: 'text-emerald-300 bg-[#1e2d24] border-[#2e4a38]' };

  const isInflammationHigh = dossier.biometrics.hsCrpMgL >= 3.0;

  return (
    <div className="flex flex-col h-full bg-[#181a19] rounded-2xl border border-[#2a2f2b] shadow-2xl backdrop-blur-md overflow-hidden text-[#eae6df]">
      {/* Dossier Header & Preset Selector */}
      <div className="p-4 border-b border-[#2a2f2b] bg-[#141615]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2d3d32] border border-[#3b5242] flex items-center justify-center text-[#7ea18b]">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f5f2ea] tracking-wide">
                MULTIMODAL CLINICAL INTAKE &amp; CONSULTATION
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#a8a39b]">
                <span>Western Biomechanics</span>
                <span aria-hidden="true">·</span>
                <span>TCM Jingjin</span>
                <span aria-hidden="true">·</span>
                <span>Thai Sib Sen</span>
              </div>
            </div>
          </div>

          {/* Quick Case Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#8a857d] uppercase tracking-wider mr-1">
              Clinical Cases:
            </span>
            {CLINICAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  dossier.id === preset.id
                    ? 'bg-[#2d3d32] border-[#c48943] text-[#f5f2ea] shadow-sm ring-1 ring-[#c48943]/30'
                    : 'bg-[#121413] border-[#222623] text-[#8a857d] hover:text-[#eae6df] hover:bg-[#1e221f]'
                }`}
                title={preset.summary}
              >
                {preset.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Current Active Patient Context Strip (Zero-Pill clean layout) */}
        <div className="p-2.5 rounded-xl bg-[#121413] border border-[#222623] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#c48943]" />
            <span className="font-semibold text-[#f5f2ea]">{dossier.name}</span>
            <span className="text-[#8a857d]">·</span>
            <span className="text-[#c48943]">{dossier.caseTitle}</span>
          </div>
          <div className="text-[11px] text-[#8a857d]">
            <span>{dossier.lifestyle.profession}</span>
            <span className="mx-1.5">·</span>
            <span className="capitalize">{dossier.painPresentation.chronicity.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Multimodal Intake Step Tabs */}
      <div className="flex border-b border-[#2a2f2b] bg-[#121413] text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('posture')}
          className={`flex-1 py-3 px-3 font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'posture'
              ? 'border-[#c48943] text-[#f5f2ea] bg-[#1e221f]'
              : 'border-transparent text-[#8a857d] hover:text-[#eae6df]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-[#c48943]" />
          <span>1. Posture &amp; Photos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('biometrics')}
          className={`flex-1 py-3 px-3 font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'biometrics'
              ? 'border-[#c48943] text-[#f5f2ea] bg-[#1e221f]'
              : 'border-transparent text-[#8a857d] hover:text-[#eae6df]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#7ea18b]" />
          <span>2. Biometrics &amp; PDF</span>
          {isInflammationHigh && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lifestyle')}
          className={`flex-1 py-3 px-3 font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'lifestyle'
              ? 'border-[#c48943] text-[#f5f2ea] bg-[#1e221f]'
              : 'border-transparent text-[#8a857d] hover:text-[#eae6df]'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>3. Voice &amp; RSI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pain')}
          className={`flex-1 py-3 px-3 font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'pain'
              ? 'border-[#c48943] text-[#f5f2ea] bg-[#1e221f]'
              : 'border-transparent text-[#8a857d] hover:text-[#eae6df]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#e76f51]" />
          <span>4. Pain Mapping ({dossier.painPresentation.mannequinMarkers.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5">
        {/* TAB 1: POSTURAL DEVIATIONS & ERGONOMIC PHOTO MATRIX */}
        {activeTab === 'posture' && (
          <div className="space-y-4">
            {/* Guided Ergonomic Photo Capture Matrix with In-App Sample Views */}
            <div className="bg-[#141615] p-4 rounded-xl border border-[#2a2f2b]">
              <ErgonomicPhotoMatrix
                posturalDeviances={dossier.posturalDeviances}
                onUpdateDeviances={(updated) =>
                  onChangeDossier({
                    ...dossier,
                    posturalDeviances: updated,
                  })
                }
                clientName={dossier.name}
              />
            </div>

            {/* Posture Angle Calibration Controls */}
            <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#f5f2ea]">
                  Forward Head Carriage (C1-C7 Gravitational Shear)
                </label>
                <span className="text-xs font-mono font-bold text-[#e9c46a]">
                  +{dossier.posturalDeviances.forwardHeadDegrees}°
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={dossier.posturalDeviances.forwardHeadDegrees}
                onChange={(e) =>
                  onChangeDossier({
                    ...dossier,
                    posturalDeviances: {
                      ...dossier.posturalDeviances,
                      forwardHeadDegrees: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full accent-[#c48943] cursor-pointer"
              />
              <p className="text-[11px] text-[#8a857d] italic">
                {dossier.posturalDeviances.forwardHeadDegrees > 25
                  ? 'Severe anterior shear: creates 42 lbs equivalent gravitational moment arm on suboccipitals and levator scapulae (Kendall & Janda model).'
                  : 'Mild to moderate cervical protrusion.'}
              </p>
            </div>

            {/* Pelvic Tilt Selector */}
            <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-2">
              <label className="text-xs font-semibold text-[#f5f2ea]">Pelvic Tilt &amp; Sacral Base Orientation</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'neutral', label: 'Neutral (Balanced)' },
                  { value: 'anterior', label: 'Anterior (Short Psoas / Lordosis)' },
                  { value: 'posterior', label: 'Posterior (Flat Back / Hamstrings)' },
                  { value: 'lateral_right_high', label: 'Lateral Right High (Torsion)' },
                  { value: 'lateral_left_high', label: 'Lateral Left High (Torsion)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onChangeDossier({
                        ...dossier,
                        posturalDeviances: {
                          ...dossier.posturalDeviances,
                          pelvicTilt: opt.value as any,
                        },
                      })
                    }
                    className={`p-2 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${
                      dossier.posturalDeviances.pelvicTilt === opt.value
                        ? 'bg-[#2d3d32] border-[#c48943] text-[#f5f2ea] shadow-sm'
                        : 'bg-[#121413] border-[#222623] text-[#8a857d] hover:text-[#eae6df] hover:border-[#38433a]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shoulder & Spinal Shift */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#141615] p-3 rounded-xl border border-[#2a2f2b] space-y-1.5">
                <label className="text-xs font-semibold text-[#f5f2ea]">High Shoulder</label>
                <select
                  value={dossier.posturalDeviances.highShoulder}
                  onChange={(e) =>
                    onChangeDossier({
                      ...dossier,
                      posturalDeviances: {
                        ...dossier.posturalDeviances,
                        highShoulder: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df]"
                >
                  <option value="level">Bilateral Level</option>
                  <option value="right_high">Right Shoulder Elevated (+18mm)</option>
                  <option value="left_high">Left Shoulder Elevated</option>
                </select>
              </div>

              <div className="bg-[#141615] p-3 rounded-xl border border-[#2a2f2b] space-y-1.5">
                <label className="text-xs font-semibold text-[#f5f2ea]">Lateral Spinal Shift</label>
                <select
                  value={dossier.posturalDeviances.lateralSpinalShift}
                  onChange={(e) =>
                    onChangeDossier({
                      ...dossier,
                      posturalDeviances: {
                        ...dossier.posturalDeviances,
                        lateralSpinalShift: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df]"
                >
                  <option value="none">None / Straight Axis</option>
                  <option value="cervicothoracic_right">Cervicothoracic Right List</option>
                  <option value="thoracolumbar_left">Thoracolumbar Left List</option>
                  <option value="s_curve">Compensatory S-Curve</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BIOMETRICS & PDF LABS */}
        {activeTab === 'biometrics' && (
          <div className="space-y-4">
            {/* Consultation PDF Reader Component */}
            <div className="bg-[#141615] p-4 rounded-xl border border-[#2a2f2b]">
              <BiometricPdfIngestion
                currentBiometrics={dossier.biometrics}
                onApplyBiometrics={(updatedBio) =>
                  onChangeDossier({
                    ...dossier,
                    biometrics: updatedBio,
                  })
                }
              />
            </div>

            {/* Hydration & Fascial Glide Index */}
            <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#f5f2ea]">
                  Hydration Level (InBody 770 / Total Body Water)
                </label>
                <span className="text-xs font-mono font-bold text-[#e9c46a]">
                  {dossier.biometrics.hydrationPercent}%
                </span>
              </div>
              <input
                type="range"
                min="38"
                max="65"
                step="0.5"
                value={dossier.biometrics.hydrationPercent}
                onChange={(e) =>
                  onChangeDossier({
                    ...dossier,
                    biometrics: {
                      ...dossier.biometrics,
                      hydrationPercent: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-[#c48943] cursor-pointer"
              />
              <div className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${fascialGlideStatus.color}`}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Fascial Glide Index:</strong> {fascialGlideStatus.label}
                </span>
              </div>
            </div>

            {/* Systemic Inflammation & Metabolic Stress */}
            <div className="grid grid-cols-2 gap-3">
              {/* hs-CRP */}
              <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#f5f2ea]">hs-CRP (Inflammation)</label>
                  <span
                    className={`text-xs font-mono font-bold ${
                      isInflammationHigh ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {dossier.biometrics.hsCrpMgL} mg/L
                  </span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={dossier.biometrics.hsCrpMgL}
                  onChange={(e) =>
                    onChangeDossier({
                      ...dossier,
                      biometrics: {
                        ...dossier.biometrics,
                        hsCrpMgL: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df]"
                />
                <span className="text-[10px] text-[#8a857d] block">
                  {isInflammationHigh
                    ? '⚠️ Elevated: Avoid aggressive Grade 5 periosteal friction.'
                    : 'Normal range (< 3.0 mg/L).'}
                </span>
              </div>

              {/* Metabolic Stress Score */}
              <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[#f5f2ea]">Metabolic Stress (1-10)</label>
                  <span className="text-xs font-mono font-bold text-[#e9c46a]">
                    {dossier.biometrics.metabolicStressScore} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={dossier.biometrics.metabolicStressScore}
                  onChange={(e) =>
                    onChangeDossier({
                      ...dossier,
                      biometrics: {
                        ...dossier.biometrics,
                        metabolicStressScore: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-[#c48943] cursor-pointer"
                />
                <span className="text-[10px] text-[#8a857d] block">
                  Sleep: {dossier.biometrics.sleepHours || 6} hrs/night
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIFESTYLE & VOICE RSI */}
        {activeTab === 'lifestyle' && (
          <div className="space-y-4">
            <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-2">
              <label className="text-xs font-semibold text-[#f5f2ea]">Client Profession</label>
              <input
                type="text"
                value={dossier.lifestyle.profession}
                onChange={(e) =>
                  onChangeDossier({
                    ...dossier,
                    lifestyle: {
                      ...dossier.lifestyle,
                      profession: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df] font-medium"
              />
            </div>

            <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-2">
              <label className="text-xs font-semibold text-[#f5f2ea]">Ergonomic Static Loading Patterns</label>
              <textarea
                rows={2}
                value={dossier.lifestyle.ergonomicStaticLoading}
                onChange={(e) =>
                  onChangeDossier({
                    ...dossier,
                    lifestyle: {
                      ...dossier.lifestyle,
                      ergonomicStaticLoading: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df]"
              />
            </div>

            <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-2">
              <label className="text-xs font-semibold text-[#f5f2ea]">Repetitive Strain Injury (RSI) Dynamic</label>
              <input
                type="text"
                value={dossier.lifestyle.repetitiveStrainPattern}
                onChange={(e) =>
                  onChangeDossier({
                    ...dossier,
                    lifestyle: {
                      ...dossier.lifestyle,
                      repetitiveStrainPattern: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df]"
              />
            </div>

            {/* Voice Dictation Box */}
            <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#f5f2ea] flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-[#c48943]" />
                  <span>Therapist Clinical Voice Dictation</span>
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isRecordingVoice
                      ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                      : 'bg-[#1e221f] text-[#a8a39b] border-[#2a2f2b] hover:text-[#eae6df]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isRecordingVoice ? 'bg-red-500' : 'bg-[#8a857d]'}`} />
                  <span>{isRecordingVoice ? 'Dictating...' : 'Start Dictation'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={dossier.lifestyle.voiceTranscript || ''}
                onChange={(e) =>
                  onChangeDossier({
                    ...dossier,
                    lifestyle: {
                      ...dossier.lifestyle,
                      voiceTranscript: e.target.value,
                    },
                  })
                }
                placeholder="Dictate ergonomic quirks, table observations, or subjective sensations..."
                className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df]"
              />
            </div>
          </div>
        )}

        {/* TAB 4: PAIN PRESENTATION & MANNEQUIN MARKERS */}
        {activeTab === 'pain' && (
          <div className="space-y-4">
            <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-2">
              <label className="text-xs font-semibold text-[#f5f2ea]">Primary Symptom Site</label>
              <input
                type="text"
                value={dossier.painPresentation.primarySymptomSite}
                onChange={(e) =>
                  onChangeDossier({
                    ...dossier,
                    painPresentation: {
                      ...dossier.painPresentation,
                      primarySymptomSite: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#141615] p-3 rounded-xl border border-[#2a2f2b] space-y-1.5">
                <label className="text-xs font-semibold text-[#f5f2ea]">Chronicity</label>
                <select
                  value={dossier.painPresentation.chronicity}
                  onChange={(e) =>
                    onChangeDossier({
                      ...dossier,
                      painPresentation: {
                        ...dossier.painPresentation,
                        chronicity: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df]"
                >
                  <option value="acute">Acute (&lt; 6 weeks)</option>
                  <option value="subacute">Subacute (6 - 12 weeks)</option>
                  <option value="chronic_longstanding">Chronic Longstanding (&gt; 3 months)</option>
                </select>
              </div>

              <div className="bg-[#141615] p-3 rounded-xl border border-[#2a2f2b] space-y-1.5">
                <label className="text-xs font-semibold text-[#f5f2ea]">Aggravating Motion</label>
                <input
                  type="text"
                  value={dossier.painPresentation.aggravatingMotion}
                  onChange={(e) =>
                    onChangeDossier({
                      ...dossier,
                      painPresentation: {
                        ...dossier.painPresentation,
                        aggravatingMotion: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#121413] border border-[#222623] rounded-lg p-2 text-xs text-[#eae6df]"
                />
              </div>
            </div>

            {/* Mannequin Interactive Placement Mode Selector */}
            <div className="bg-[#141615] p-3.5 rounded-xl border border-[#2a2f2b] space-y-2">
              <span className="text-xs font-semibold text-[#f5f2ea] block">
                Interactive Mannequin Marker Placement Mode
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSetInteractiveMode('inspect')}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    interactiveMode === 'inspect'
                      ? 'bg-[#2d3d32] border-[#c48943] text-[#f5f2ea]'
                      : 'bg-[#121413] border-[#222623] text-[#8a857d]'
                  }`}
                >
                  Inspect Anatomy
                </button>
                <button
                  type="button"
                  onClick={() => onSetInteractiveMode('add_symptom')}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    interactiveMode === 'add_symptom'
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-[#121413] border-[#222623] text-[#8a857d]'
                  }`}
                >
                  + Add Symptom
                </button>
                <button
                  type="button"
                  onClick={() => onSetInteractiveMode('add_trigger')}
                  className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    interactiveMode === 'add_trigger'
                      ? 'bg-[#c48943]/20 border-[#c48943] text-[#e9c46a]'
                      : 'bg-[#121413] border-[#222623] text-[#8a857d]'
                  }`}
                >
                  + Add Root Trigger
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Bottom Action: Run Clinical Synthesis */}
      <div className="p-4 border-t border-[#2a2f2b] bg-[#141615] flex items-center justify-between gap-3">
        <div className="text-[11px] text-[#8a857d]">
          <span>Western Biomechanics × TCM Jingjin × Thai Sib Sen</span>
        </div>

        <button
          type="button"
          onClick={onSynthesize}
          disabled={isLoading}
          className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#c48943] to-[#d4a373] hover:from-[#d4a373] hover:to-[#e9c46a] text-[#121413] transition-all shadow-lg shadow-[#c48943]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synthesizing Kinetic &amp; Energetic Pathways...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Synthesize Protocol &amp; Glance-Card</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
