import React, { useState, useEffect, useRef } from 'react';
import { AnimatedModelPayload, TreatmentStep } from '../types/clinical';
import { playPhaseBellChime, playSoftTick } from '../utils/audioChime';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  Wind,
  Hand,
  Flame,
  Activity,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Sparkles,
} from 'lucide-react';

interface TableModeProps {
  payload: AnimatedModelPayload | null;
  onClose: () => void;
}

export const TableMode: React.FC<TableModeProps> = ({ payload, onClose }) => {
  const steps: TreatmentStep[] = payload?.treatment_sequence || [
    {
      step: 1,
      phase_name: 'Phase 1: Warm & Decongest',
      technique_type: 'Swedish_Petrissage',
      floating_icon_id: 'icon_knead',
      target_structure: 'Superficial fascial envelope & Bladder channel',
      duration_minutes: 8,
      pressure_grade: '2-3',
      operator_cue: 'Rhythmic broad palm compressions at 1 Hz to melt fascial gel state.',
    },
    {
      step: 2,
      phase_name: 'Phase 2: Specific Deactivation',
      technique_type: 'Shiatsu_Acupressure',
      floating_icon_id: 'icon_thumb_press',
      target_structure: 'Primary hyperirritable nodule & GB20 tsubo',
      duration_minutes: 12,
      pressure_grade: '3-4',
      operator_cue: 'Perpendicular thumb-press into core nodule; hold 60s as local twitch subsides.',
    },
    {
      step: 3,
      phase_name: 'Phase 3: Mobilization & Energy Flow',
      technique_type: 'Thai_Sen_Mobilization',
      floating_icon_id: 'icon_passive_stretch',
      target_structure: 'Thai Sen Kalathari kinetic diagonal',
      duration_minutes: 10,
      pressure_grade: '3-4',
      operator_cue: 'Anchor distal limb and apply axial traction along Sen line on client exhale.',
    },
    {
      step: 4,
      phase_name: 'Phase 4: Integration & Grounding',
      technique_type: 'Myofascial_Release',
      floating_icon_id: 'icon_elbow_glide',
      target_structure: 'Craniosacral base & sacral still point',
      duration_minutes: 5,
      pressure_grade: '1-2',
      operator_cue: 'Stationary bilateral palm connection at occiput and sacrum to seal autonomic reset.',
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex] || steps[0];

  const [secondsRemaining, setSecondsRemaining] = useState((currentStep.duration_minutes || 8) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [lastVoiceWord, setLastVoiceWord] = useState('');

  // Breath pacing state (Inhale 4s -> Exhale 6s)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');

  // Spoken voice feedback
  const speakCue = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.05;
        u.pitch = 0.95;
        u.volume = 0.65;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
  };

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (soundEnabled) playPhaseBellChime('high');
            if (currentStepIndex < steps.length - 1) {
              const nextIdx = currentStepIndex + 1;
              setCurrentStepIndex(nextIdx);
              speakCue(`Starting ${steps[nextIdx].phase_name}`);
              return (steps[nextIdx]?.duration_minutes || 8) * 60;
            } else {
              setIsRunning(false);
              speakCue('Treatment protocol completed. Autonomic seal achieved.');
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, currentStepIndex, steps, soundEnabled]);

  // Synchronize duration when switching step index
  useEffect(() => {
    setSecondsRemaining((currentStep.duration_minutes || 8) * 60);
  }, [currentStepIndex]);

  // Somatic Breath Pacer loop (4s inhale, 6s exhale)
  useEffect(() => {
    const breathCycle = setInterval(() => {
      setBreathPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 5000);
    return () => clearInterval(breathCycle);
  }, []);

  // Web Speech API Voice listener in Table Mode
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const lastIndex = event.results.length - 1;
      const transcript = (event.results[lastIndex][0].transcript || '').toLowerCase().trim();
      setLastVoiceWord(transcript);

      if (transcript.includes('next') || transcript.includes('advance')) {
        handleNextStep();
      } else if (transcript.includes('back') || transcript.includes('previous')) {
        handlePrevStep();
      } else if (transcript.includes('pause') || transcript.includes('stop')) {
        setIsRunning(false);
        speakCue('Timer paused');
      } else if (transcript.includes('play') || transcript.includes('start') || transcript.includes('resume')) {
        setIsRunning(true);
        speakCue('Timer active');
      }
    };

    if (isVoiceActive) {
      try {
        recognition.start();
      } catch (e) {}
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [isVoiceActive, currentStepIndex, steps.length]);

  const togglePlay = () => {
    if (soundEnabled) playSoftTick(isRunning ? 'pause' : 'start');
    setIsRunning(!isRunning);
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      if (soundEnabled) playPhaseBellChime('mid');
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      speakCue(`Phase ${nextIdx + 1}: ${steps[nextIdx].phase_name}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      speakCue(`Back to Phase ${prevIdx + 1}`);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining((currentStep.duration_minutes || 8) * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalStepSeconds = (currentStep.duration_minutes || 8) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalStepSeconds - secondsRemaining) / totalStepSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-[#121413] text-[#eae6df] flex flex-col overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Table Mode HUD Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2f2b] bg-[#181a19]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm md:text-base font-bold tracking-wider text-[#f5f2ea] uppercase">
            Somatic Table Mode · Sanctuary Protocol
          </h2>
          <span className="text-xs text-[#c48943] font-mono">
            Phase {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Hands-Free Voice Listener */}
          <button
            type="button"
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isVoiceActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                : 'bg-[#1e221f] text-[#8a857d] border-[#2a2f2b] hover:text-[#eae6df]'
            }`}
          >
            {isVoiceActive ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isVoiceActive ? 'Voice Active' : 'Voice'}</span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[#1e221f] text-[#a8a39b] hover:text-[#eae6df] border border-[#2a2f2b] transition-all cursor-pointer"
            title={soundEnabled ? 'Tibetan Singing Bowl Bell On' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#c48943]" /> : <VolumeX className="w-4 h-4 text-[#5a5752]" />}
          </button>

          {/* Close Table Mode */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e221f] border border-[#2a2f2b] text-[#eae6df] hover:bg-[#28322a] transition-all text-xs font-semibold cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Return to Workspace</span>
          </button>
        </div>
      </div>

      {/* Main Table-Side Stage */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-between p-6 md:p-12 gap-8 overflow-y-auto">
        {/* LEFT COLUMN: Large High-Legibility Execution Cue & Target Structure */}
        <div className="flex-1 space-y-6 max-w-2xl">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#c48943]">
              {currentStep.phase_name}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#f5f2ea] tracking-tight leading-tight">
              {currentStep.technique_type ? currentStep.technique_type.replace(/_/g, ' ') : 'Integrative Bodywork'}
            </h1>
            <p className="text-sm md:text-base text-[#a8a39b] flex items-center gap-2">
              <strong className="text-[#eae6df]">Anatomical Focus:</strong> {currentStep.target_structure}
            </p>
          </div>

          {/* 15-WORD OPERATOR EXECUTION CUE (Huge type for 4-foot table viewing) */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#181a19] border border-[#2a2f2b] shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#c48943] flex items-center gap-2">
                <Hand className="w-4 h-4 text-[#c48943]" />
                Table Execution Cue
              </span>
              <span className="text-xs text-[#8a857d] font-mono">15-Word Direct Instruction</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-[#f5f2ea] leading-snug tracking-wide">
              &quot;{currentStep.operator_cue}&quot;
            </p>
          </div>

          {/* Somatic Breath Pacer & Pressure Meter */}
          <div className="grid grid-cols-2 gap-4">
            {/* Breath Visualizer */}
            <div className="p-4 rounded-xl bg-[#181a19] border border-[#2a2f2b] flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ${
                  breathPhase === 'inhale'
                    ? 'border-[#7ea18b] bg-[#2d3d32] scale-110 shadow-lg shadow-emerald-500/20'
                    : 'border-[#c48943] bg-[#222923] scale-90'
                }`}
              >
                <Wind className={`w-5 h-5 ${breathPhase === 'inhale' ? 'text-emerald-300' : 'text-[#c48943]'}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a857d] block">
                  Somatic Breath Rhythm
                </span>
                <span className="text-base font-bold text-[#f5f2ea] uppercase tracking-wide">
                  {breathPhase === 'inhale' ? 'Client Inhale (4s)' : 'Client Exhale (6s)'}
                </span>
                <p className="text-[10px] text-[#8a857d]">Sync pressure depth on exhale release</p>
              </div>
            </div>

            {/* Pressure Grade Meter */}
            <div className="p-4 rounded-xl bg-[#181a19] border border-[#2a2f2b] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#222923] border border-[#2a2f2b] flex items-center justify-center text-[#c48943]">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a857d] block">
                  Depth &amp; Pressure Grade
                </span>
                <span className="text-base font-bold text-[#e9c46a]">
                  Grade {currentStep.pressure_grade || '3'} / 5
                </span>
                <p className="text-[10px] text-[#8a857d]">Respect tissue barrier tolerance</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Giant Hands-Free Countdown Ring & Single-Tap Controls */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Circular SVG Timer Ring */}
          <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className="stroke-[#1e221f]"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                className="stroke-[#c48943] transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Center Time Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-5xl md:text-6xl font-black font-mono tracking-tight text-[#f5f2ea]">
                {formatTime(secondsRemaining)}
              </span>
              <span className="text-xs uppercase tracking-widest font-bold text-[#8a857d] mt-1">
                {isRunning ? 'Hold Phase Active' : 'Paused'}
              </span>
            </div>
          </div>

          {/* ONE-FINGER TACTILE CONTROLS */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="p-4 rounded-2xl bg-[#181a19] hover:bg-[#222923] border border-[#2a2f2b] text-[#eae6df] transition-all disabled:opacity-20 cursor-pointer"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className={`p-5 rounded-2xl font-bold transition-all shadow-xl cursor-pointer ${
                isRunning
                  ? 'bg-[#181a19] text-[#c48943] border border-[#c48943]/60'
                  : 'bg-[#c48943] hover:bg-[#d4a373] text-[#121413]'
              }`}
            >
              {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-4 rounded-2xl bg-[#181a19] hover:bg-[#222923] border border-[#2a2f2b] text-[#eae6df] transition-all cursor-pointer"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={currentStepIndex === steps.length - 1}
              className="p-4 rounded-2xl bg-[#181a19] hover:bg-[#222923] border border-[#2a2f2b] text-[#eae6df] transition-all disabled:opacity-20 cursor-pointer"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
